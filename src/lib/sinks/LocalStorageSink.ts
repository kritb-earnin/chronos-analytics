import type { AnalyticsEvent, EventSink } from '../../types/chronos'
import type { IEventBus } from '../EventBus'

const DEFAULT_KEY = 'chronos-events'
const DEFAULT_MAX_EVENTS = 1000

/**
 * Options for the LocalStorage sink. Events are appended to an array under the given key and trimmed to maxEvents.
 */
export interface LocalStorageSinkOptions {
  /** localStorage key (default: `'chronos-events'`). */
  key?: string
  /** Maximum number of events to keep (default: 1000). */
  maxEvents?: number
}

/**
 * Subscribe a sink that appends every event to localStorage. Used by ChronosDevTools to show the event log.
 * @param eventBus - The EventBus from getEventBus()
 * @param options - Optional key and maxEvents
 * @returns Unsubscribe function to stop persisting
 */
export function init(
  eventBus: IEventBus,
  options: LocalStorageSinkOptions = {}
): () => void {
  const key = options.key ?? DEFAULT_KEY
  const maxEvents = options.maxEvents ?? DEFAULT_MAX_EVENTS

  const sink: EventSink = (event: AnalyticsEvent) => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null
      const list: AnalyticsEvent[] = raw ? JSON.parse(raw) : []
      list.push(event)
      const trimmed = list.slice(-maxEvents)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(trimmed))
      }
    } catch (err) {
      console.error('[Chronos] LocalStorageSink error:', err)
    }
  }
  return eventBus.subscribe(sink)
}

/**
 * Load persisted events from localStorage (e.g. for ReplayEngine or ChronosDevTools).
 * @param storageKey - localStorage key (default: `'chronos-events'`)
 * @returns Array of events; empty if missing or invalid
 */
export function loadEvents(storageKey: string = DEFAULT_KEY): AnalyticsEvent[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(storageKey)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}
