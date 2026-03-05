/**
 * Core types for Chronos Analytics — Event Sourcing for the Frontend.
 */

/**
 * A single analytics event; all events (including state_snapshot) use this shape.
 * Emitted via `useChronos().emit()` or `emitEvent()` and delivered to all subscribed sinks.
 */
export interface AnalyticsEvent {
  /** Unique event id (e.g. UUID). */
  id: string
  /** Unix timestamp (ms). */
  timestamp: number
  /** Event name (e.g. `'button_click'`, `'state_snapshot'`). */
  eventName: string
  /** Event payload; keep serializable for replay and localStorage. */
  payload: unknown
  /** Optional metadata (e.g. source, flags). */
  metadata?: Record<string, unknown>
}

/**
 * Payload shape for state_snapshot events emitted by ChronosStore.
 * ReplayEngine / DevTools can use `payload.state` for display; no state re-hydration by default.
 */
export interface StateSnapshotPayload {
  state: unknown
}

/**
 * Contract for an EventBus sink. Pass a function of this type to `EventBus.subscribe(sink)`.
 * Each sink is invoked synchronously for every emitted event.
 */
export type EventSink = (event: AnalyticsEvent) => void

/**
 * Optional interface for external analytics (e.g. Segment, GTM).
 * The host app implements this (e.g. adapter around `analytics.track()`); Chronos consumes it via `createProviderSink(provider)`.
 */
export interface IAnalyticsProvider {
  /**
   * Send a tracking event to the provider.
   * @param eventName - Name of the event
   * @param properties - Event properties (serializable)
   */
  track(
    eventName: string,
    properties: Record<string, unknown>
  ): void | Promise<void>
  /** Optional: track page/screen view. */
  page?(
    screenName: string,
    properties?: Record<string, unknown>
  ): void | Promise<void>
  /** Optional: identify user. */
  identify?(
    userId: string,
    traits?: Record<string, unknown>
  ): void | Promise<void>
  /** Optional: associate user with group. */
  group?(
    groupId: string,
    traits?: Record<string, unknown>
  ): void | Promise<void>
}
