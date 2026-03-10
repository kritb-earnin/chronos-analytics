import type { TrackPayload } from '../../types/chronos'

const MAX_UNSENT = 500

function getStorage(): Storage | null {
  if (typeof localStorage === 'undefined') return null
  try {
    return localStorage
  } catch {
    return null
  }
}

/**
 * Read unsent events from localStorage. Returns empty array if key missing or parse error.
 */
export function getUnsentEvents(key: string): TrackPayload[] {
  const storage = getStorage()
  if (!storage) return []
  try {
    const raw = storage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (item): item is TrackPayload =>
        item != null &&
        typeof item === 'object' &&
        typeof (item as TrackPayload).eventName === 'string' &&
        typeof (item as TrackPayload).properties === 'object'
    )
  } catch {
    return []
  }
}

/**
 * Append events to the unsent queue in localStorage. Trims to MAX_UNSENT (keeps newest).
 */
export function appendUnsentEvents(
  key: string,
  events: TrackPayload[]
): void {
  if (events.length === 0) return
  const storage = getStorage()
  if (!storage) return
  try {
    const existing = getUnsentEvents(key)
    const combined = existing.concat(events)
    const trimmed =
      combined.length > MAX_UNSENT
        ? combined.slice(-MAX_UNSENT)
        : combined
    storage.setItem(key, JSON.stringify(trimmed))
  } catch {
    // ignore
  }
}

/**
 * Clear unsent events from localStorage.
 */
export function clearUnsentEvents(key: string): void {
  const storage = getStorage()
  if (!storage) return
  try {
    storage.removeItem(key)
  } catch {
    // ignore
  }
}

export const MAX_UNSENT_EVENTS = MAX_UNSENT
