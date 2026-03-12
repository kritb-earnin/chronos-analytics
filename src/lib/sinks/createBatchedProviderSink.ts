import type {
  AnalyticsEvent,
  EventSink,
  IAnalyticsProvider,
  TrackPayload,
} from '../../types/chronos'
import type { CreateProviderSinkOptions } from './createProviderSink'
import {
  appendUnsentEvents,
  clearUnsentEvents,
  getUnsentEvents,
} from './unsentEventsStorage'
import { markSent } from './providerSentStatus'
import { mapEventToTrackPayload, sendToProvider } from './providerHelpers'
import {
  DEFAULT_UNSENT_STORAGE_KEY,
  hasWindow,
  isOnline,
  scheduleFlush,
} from './utils'

/** Internal queue item: payload plus Chronos event id for sent-status. */
type QueuedItem = TrackPayload & { eventId: string }

const DEFAULT_BATCH_SIZE = 10
const DEFAULT_FLUSH_INTERVAL_MS = 5000

/**
 * Options for the batched provider sink. Events are queued and sent asynchronously;
 * when the queue reaches batchSize or flushIntervalMs elapses, the batch is sent.
 * On page unload or when offline, unsent events are stored in localStorage and replayed
 * when the app loads or when back online.
 */
export interface BatchedProviderSinkOptions extends CreateProviderSinkOptions {
  /** Max events per batch. Default 10. */
  batchSize?: number
  /** Max ms before flushing the queue even if batchSize not reached. Default 5000. */
  flushIntervalMs?: number
  /**
   * Schedule flush with requestIdleCallback when available (so flushes don't block
   * the main thread). Default true. If false, uses setTimeout(0).
   */
  useIdleCallback?: boolean
}

/**
 * Create an EventSink that queues Chronos events and sends them to the provider
 * asynchronously in batches. On page unload or when offline, unsent events are
 * stored in localStorage and replayed when the app loads or when back online.
 * Subscribe the returned sink: eventBus.subscribe(createBatchedProviderSink(provider, options)).
 */
export function createBatchedProviderSink(
  provider: IAnalyticsProvider,
  options: BatchedProviderSinkOptions = {}
): EventSink {
  const {
    batchSize = DEFAULT_BATCH_SIZE,
    flushIntervalMs = DEFAULT_FLUSH_INTERVAL_MS,
    useIdleCallback = true,
  } = options
  const storageKey = options.unsentEventsStorageKey ?? DEFAULT_UNSENT_STORAGE_KEY

  const queue: QueuedItem[] = []
  let flushTimer: ReturnType<typeof setTimeout> | null = null
  let flushScheduled = false

  function flush(): void {
    flushScheduled = false
    if (flushTimer !== null) {
      clearTimeout(flushTimer)
      flushTimer = null
    }
    if (queue.length === 0) return

    if (!isOnline()) {
      const batch = queue.splice(0, batchSize)
      appendUnsentEvents(
        storageKey,
        batch.map(({ eventId: _id, ...p }) => p)
      )
      if (queue.length > 0) {
        flushScheduled = true
        scheduleFlush(flush, useIdleCallback)
      }
      return
    }

    const batch = queue.splice(0, batchSize)
    const payloads = batch.map(({ eventId: _id, ...p }) => p)
    sendToProvider(provider, payloads)
    markSent(batch.map((b) => b.eventId))

    if (queue.length > 0) {
      flushScheduled = true
      scheduleFlush(flush, useIdleCallback)
    }
  }

  function scheduleNextFlush(): void {
    if (flushScheduled) return
    flushScheduled = true
    if (flushIntervalMs > 0 && queue.length < batchSize) {
      flushTimer = setTimeout(flush, flushIntervalMs)
    } else {
      scheduleFlush(flush, useIdleCallback)
    }
  }

  function persistQueueOnUnload(): void {
    if (queue.length === 0) return
    const items = queue.splice(0, queue.length)
    appendUnsentEvents(
      storageKey,
      items.map(({ eventId: _id, ...p }) => p)
    )
  }

  function replayUnsent(): void {
    if (!isOnline()) return
    const unsent = getUnsentEvents(storageKey)
    if (unsent.length === 0) return
    clearUnsentEvents(storageKey)
    sendToProvider(provider, unsent, 'replay')
  }

  if (hasWindow()) {
    window.addEventListener('pagehide', persistQueueOnUnload)
    window.addEventListener('online', () => scheduleFlush(replayUnsent, useIdleCallback))
    scheduleFlush(replayUnsent, useIdleCallback)
  }

  return (event: AnalyticsEvent) => {
    const payload = mapEventToTrackPayload(event, options)
    if (!payload) return
    queue.push({ ...payload, eventId: event.id })

    if (queue.length >= batchSize) {
      if (flushTimer !== null) {
        clearTimeout(flushTimer)
        flushTimer = null
      }
      if (!flushScheduled) {
        flushScheduled = true
        scheduleFlush(flush, useIdleCallback)
      }
    } else {
      scheduleNextFlush()
    }
  }
}
