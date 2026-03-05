import type { AnalyticsEvent, EventSink } from '../types/chronos'

/** Event name used for state snapshot events emitted by ChronosStore. */
const STATE_SNAPSHOT = 'state_snapshot'

function createEventId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `evt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

/**
 * Event bus contract: emit events and subscribe sinks.
 * All sinks are notified synchronously when an event is emitted.
 */
export interface IEventBus {
  /** Broadcast an event to all subscribed sinks. */
  emit(event: AnalyticsEvent): void
  /** Subscribe a sink; returns an unsubscribe function. */
  subscribe(sink: EventSink): () => void
}

/** Singleton event bus: emit and subscribe. All sinks are notified synchronously. */
class EventBusClass implements IEventBus {
  private sinks: Set<EventSink> = new Set()

  emit(event: AnalyticsEvent): void {
    this.sinks.forEach((sink) => {
      try {
        sink(event)
      } catch (err) {
        console.error('[Chronos] Sink error:', err)
      }
    })
  }

  subscribe(sink: EventSink): () => void {
    this.sinks.add(sink)
    return () => this.sinks.delete(sink)
  }
}

const eventBusInstance = new EventBusClass()

/**
 * Get the singleton EventBus instance. Use this at app bootstrap to register sinks
 * (e.g. initConsoleSink, initLocalStorageSink, createProviderSink).
 * @returns The shared IEventBus instance
 */
export function getEventBus(): IEventBus {
  return eventBusInstance
}

/**
 * Emit an analytics event to the EventBus; all subscribed sinks receive it.
 * Used by `useChronos().emit()` and `withTracking`; can also be called directly.
 * @param eventName - Event name (e.g. 'button_click')
 * @param payload - Optional payload (keep serializable for replay/localStorage)
 * @param metadata - Optional metadata
 */
export function emitEvent(
  eventName: string,
  payload?: unknown,
  metadata?: Record<string, unknown>
): void {
  eventBusInstance.emit({
    id: createEventId(),
    timestamp: Date.now(),
    eventName,
    payload: payload ?? {},
    metadata,
  })
}

/**
 * Emit a state_snapshot event. Used by ChronosStore after each state change;
 * appears in the event log like other events. Provider sinks typically filter these out.
 * @param state - Current store state (serializable)
 */
export function emitStateSnapshot(state: unknown): void {
  eventBusInstance.emit({
    id: createEventId(),
    timestamp: Date.now(),
    eventName: STATE_SNAPSHOT,
    payload: { state },
  })
}

export { STATE_SNAPSHOT }
