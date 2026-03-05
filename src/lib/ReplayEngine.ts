import type { AnalyticsEvent } from '../types/chronos'

/**
 * Holds a list of events for display in the DevTools event log.
 * Replay = displaying event logs with timestamps, not re-hydrating app state.
 */
export class ReplayEngine {
  private events: AnalyticsEvent[] = []

  load(events: AnalyticsEvent[]): void {
    this.events = [...events]
  }

  getEvents(): AnalyticsEvent[] {
    return [...this.events]
  }

  getEventCount(): number {
    return this.events.length
  }
}
