import type {
  AnalyticsEvent,
  EventSink,
  IAnalyticsProvider,
  TrackPayload,
} from '../../types/chronos'
import {
  appendUnsentEvents,
  clearUnsentEvents,
  getUnsentEvents,
} from './unsentEventsStorage'
import { mapEventToTrackPayload, sendToProvider } from './providerHelpers'
import type { MapEventToTrackOptions } from './providerHelpers'
import { DEFAULT_UNSENT_STORAGE_KEY, hasWindow, isOnline, runAsync } from './utils'

/**
 * Options for createProviderSink. state_snapshot is always skipped; use filter to skip other events or mapToTrack to reshape.
 */
export interface CreateProviderSinkOptions extends MapEventToTrackOptions {
  /**
   * localStorage key for persisting unsent events on page unload or when offline.
   * Replayed when the app loads or when the browser goes back online. Default: 'chronos-unsent-events'.
   */
  unsentEventsStorageKey?: string
}

/**
 * Create an EventSink that forwards Chronos events to an external analytics provider (e.g. Segment).
 * Events are always sent asynchronously. On page unload or when offline, unsent events are stored
 * in localStorage and replayed when the app loads or when back online.
 * state_snapshot events are never forwarded.
 * Subscribe the returned sink: eventBus.subscribe(createProviderSink(provider, options)).
 */
export function createProviderSink(
  provider: IAnalyticsProvider,
  options: CreateProviderSinkOptions = {}
): EventSink {
  const storageKey = options.unsentEventsStorageKey ?? DEFAULT_UNSENT_STORAGE_KEY
  const queue: TrackPayload[] = []
  let drainScheduled = false

  function drain(): void {
    if (queue.length === 0) {
      drainScheduled = false
      return
    }
    if (!isOnline()) {
      appendUnsentEvents(storageKey, queue.splice(0, queue.length))
      drainScheduled = false
      return
    }
    const batch = queue.splice(0, queue.length)
    drainScheduled = false
    sendToProvider(provider, batch)
  }

  function scheduleDrain(): void {
    if (drainScheduled) return
    drainScheduled = true
    runAsync(drain)
  }

  function persistQueueOnUnload(): void {
    if (queue.length === 0) return
    appendUnsentEvents(storageKey, queue.splice(0, queue.length))
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
    window.addEventListener('online', () => runAsync(replayUnsent))
    runAsync(replayUnsent)
  }

  return (event: AnalyticsEvent) => {
    const mapped = mapEventToTrackPayload(event, options)
    if (!mapped) return
    queue.push(mapped)
    scheduleDrain()
  }
}
