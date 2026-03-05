import type { AnalyticsEvent, EventSink } from '../../types/chronos'
import type { IEventBus } from '../EventBus'

export function init(eventBus: IEventBus): () => void {
  const sink: EventSink = (event: AnalyticsEvent) => {
    console.log('[Chronos]', event.eventName, event)
  }
  return eventBus.subscribe(sink)
}
