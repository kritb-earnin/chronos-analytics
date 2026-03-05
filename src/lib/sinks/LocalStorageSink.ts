import type { AnalyticsEvent, EventSink } from '../../types/chronos'
import type { IEventBus } from '../EventBus'

const DEFAULT_KEY = 'chronos-events'
const DEFAULT_MAX_EVENTS = 1000

export interface LocalStorageSinkOptions {
  key?: string
  maxEvents?: number
}

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

/** Load events from localStorage (e.g. for ReplayEngine / DevTools). */
export function loadEvents(storageKey: string = DEFAULT_KEY): AnalyticsEvent[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(storageKey)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}
