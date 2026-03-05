/**
 * Core types for Chronos Analytics — Event Sourcing for the Frontend.
 */

/** A single analytics event; all events (including state_snapshot) use this shape. */
export interface AnalyticsEvent {
  id: string
  timestamp: number
  eventName: string
  payload: unknown
  metadata?: Record<string, unknown>
}

/** Payload shape for state_snapshot events; ReplayEngine re-hydrates from payload.state. */
export interface StateSnapshotPayload {
  state: unknown
}

/** Contract for EventBus.subscribe(sink). */
export type EventSink = (event: AnalyticsEvent) => void

/**
 * Optional interface for external analytics (e.g. Segment).
 * App implements this (e.g. adapter around existing Analytics class); Chronos consumes via createProviderSink.
 */
export interface IAnalyticsProvider {
  track(
    eventName: string,
    properties: Record<string, unknown>
  ): void | Promise<void>
  page?(
    screenName: string,
    properties?: Record<string, unknown>
  ): void | Promise<void>
  identify?(
    userId: string,
    traits?: Record<string, unknown>
  ): void | Promise<void>
  group?(
    groupId: string,
    traits?: Record<string, unknown>
  ): void | Promise<void>
}
