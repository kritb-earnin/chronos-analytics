import type { AnalyticsEvent } from '../types/chronos'

/**
 * Holds a list of events for display in custom event log UIs.
 * Replay in Chronos means displaying event logs with timestamps, not re-hydrating app state.
 */
export class ReplayEngine {
  private events: AnalyticsEvent[] = []

  /**
   * Replace the internal event list with the given events (e.g. from loadEvents()).
   * @param events - Array of analytics events
   */
  load(events: AnalyticsEvent[]): void {
    this.events = [...events]
  }

  /**
   * Get a copy of all events currently held by the engine.
   * @returns Snapshot of the event array
   */
  getEvents(): AnalyticsEvent[] {
    return [...this.events]
  }

  /**
   * Get the number of events in the engine.
   * @returns Event count
   */
  getEventCount(): number {
    return this.events.length
  }
}
