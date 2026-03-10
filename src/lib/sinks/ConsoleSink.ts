import type { AnalyticsEvent, EventSink } from '../../types/chronos'
import type { IEventBus } from '../EventBus'
import { runAsync } from './utils'

/**
 * Subscribe a sink that logs every event to the console asynchronously (e.g. for development).
 * EventBus.emit() never blocks on logging.
 * @param eventBus - The EventBus from getEventBus()
 * @returns Unsubscribe function to stop logging
 */
export function init(eventBus: IEventBus): () => void {
  const sink: EventSink = (event: AnalyticsEvent) => {
    runAsync(() => console.log('[Chronos]', event.eventName, event))
  }
  return eventBus.subscribe(sink)
}
