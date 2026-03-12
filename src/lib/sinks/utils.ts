/**
 * Shared utilities for sinks. Keeps scheduling and environment checks in one place.
 */

/** Default localStorage key for persisting unsent provider events (unload/offline replay). */
export const DEFAULT_UNSENT_STORAGE_KEY = 'chronos-unsent-events'

/**
 * sendBeacon has a ~64KB limit per request. When the serialized payload exceeds this,
 * Chronos falls back to persisting to localStorage for replay on next load.
 */
export const SEND_BEACON_MAX_BYTES = 64 * 1024

/** UTF-8 byte length of a string (for sendBeacon size check). */
export function getUtf8ByteLength(s: string): number {
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(s).length
  }
  return s.length
}

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
