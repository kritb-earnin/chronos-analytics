import type { AnalyticsEvent, EventSink } from '../types/chronos'

const STATE_SNAPSHOT = 'state_snapshot'

function createEventId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `evt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export interface IEventBus {
  emit(event: AnalyticsEvent): void
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

/** Get the singleton EventBus instance. */
export function getEventBus(): IEventBus {
  return eventBusInstance
}

/** Emit a full AnalyticsEvent (e.g. from useChronos). */
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

/** Emit a state_snapshot event (used by ChronosStore). */
export function emitStateSnapshot(state: unknown): void {
  eventBusInstance.emit({
    id: createEventId(),
    timestamp: Date.now(),
    eventName: STATE_SNAPSHOT,
    payload: { state },
  })
}

export { STATE_SNAPSHOT }
