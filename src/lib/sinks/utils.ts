/**
 * Shared utilities for sinks. Keeps scheduling and environment checks in one place.
 */

/** Default localStorage key for persisting unsent provider events (unload/offline replay). */
export const DEFAULT_UNSENT_STORAGE_KEY = 'chronos-unsent-events'

/**
 * Run a function in the next tick (requestIdleCallback when available, else setTimeout(0)).
 * Use so EventBus.emit() does not block on sink work.
 */
export function runAsync(fn: () => void): void {
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(fn, { timeout: 50 })
  } else {
    setTimeout(fn, 0)
  }
}

/**
 * Schedule a flush callback. When useIdleCallback is true, uses requestIdleCallback;
 * otherwise setTimeout(0).
 */
export function scheduleFlush(
  flush: () => void,
  useIdleCallback: boolean
): void {
  if (useIdleCallback && typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(flush, { timeout: 50 })
  } else {
    setTimeout(flush, 0)
  }
}

/** True when the environment has navigator.onLine and it is true; safe for SSR (returns true when unknown). */
export function isOnline(): boolean {
  if (typeof navigator === 'undefined' || navigator.onLine == null) return true
  return navigator.onLine
}

/** True when we can register window events (browser). */
export function hasWindow(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.addEventListener === 'function'
  )
}
