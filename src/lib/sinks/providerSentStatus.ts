/**
 * Tracks which Chronos event IDs have been sent to the provider (e.g. Segment).
 * Used by ChronosDevTools to show sent vs pending row styling. Provider sinks
 * call markSent() after successfully sending; DevTools subscribes to updates.
 */

const SENT_IDS_STORAGE_KEY = 'chronos-sent-event-ids'

const sentIds = new Set<string>()
const subscribers = new Set<() => void>()

function getStorage(): Storage | null {
  if (typeof sessionStorage === 'undefined') return null
  try {
    return sessionStorage
  } catch {
    return null
  }
}

function loadFromSession(): void {
  const storage = getStorage()
  if (!storage) return
  try {
    const raw = storage.getItem(SENT_IDS_STORAGE_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw) as unknown
    if (Array.isArray(parsed)) {
      for (const id of parsed) {
        if (typeof id === 'string') sentIds.add(id)
      }
    }
  } catch {
    // ignore
  }
}

function saveToSession(): void {
  const storage = getStorage()
  if (!storage) return
  try {
    const arr = Array.from(sentIds)
    storage.setItem(SENT_IDS_STORAGE_KEY, JSON.stringify(arr))
  } catch {
    // ignore
  }
}

/** Load persisted sent IDs on first use (e.g. after refresh). */
loadFromSession()

/**
 * Mark the given event IDs as sent to the provider. Call this from provider sinks after sendToProvider.
 */
export function markSent(eventIds: string[]): void {
  if (eventIds.length === 0) return
  let changed = false
  for (const id of eventIds) {
    if (!sentIds.has(id)) {
      sentIds.add(id)
      changed = true
    }
  }
  if (changed) {
    saveToSession()
    subscribers.forEach((cb) => cb())
  }
}

/**
 * Return a read-only snapshot of the set of sent event IDs.
 */
export function getSentEventIds(): ReadonlySet<string> {
  return new Set(sentIds)
}

/**
 * Subscribe to changes when new event IDs are marked as sent. Returns an unsubscribe function.
 */
export function subscribeToSent(callback: () => void): () => void {
  subscribers.add(callback)
  return () => subscribers.delete(callback)
}
