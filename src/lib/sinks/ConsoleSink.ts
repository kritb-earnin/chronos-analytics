import type { AnalyticsEvent, EventSink } from '../../types/chronos'
import type { IEventBus } from '../EventBus'

/**
 * Subscribe a sink that logs every event to the console (e.g. for development).
 * @param eventBus - The EventBus from getEventBus()
 * @returns Unsubscribe function to stop logging
 */
export function init(eventBus: IEventBus): () => void {
  const sink: EventSink = (event: AnalyticsEvent) => {
    console.log('[Chronos]', event.eventName, event)
  }
  return eventBus.subscribe(sink)
}
