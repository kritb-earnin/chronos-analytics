import type { AnalyticsEvent, EventSink, IAnalyticsProvider } from '../../types/chronos'
import { STATE_SNAPSHOT } from '../EventBus'

/**
 * Options for createProviderSink. state_snapshot is always skipped; use filter to skip other events or mapToTrack to reshape.
 */
export interface CreateProviderSinkOptions {
  /** If provided and returns false, the event is not forwarded to the provider. */
  filter?: (event: AnalyticsEvent) => boolean
  /** Map Chronos event to track(eventName, properties); return null to skip this event. */
  mapToTrack?: (
    event: AnalyticsEvent
  ) => { eventName: string; properties: Record<string, unknown> } | null
}

/**
 * Create an EventSink that forwards Chronos events to an external analytics provider (e.g. Segment).
 * state_snapshot events are never forwarded. Subscribe the returned sink: eventBus.subscribe(createProviderSink(provider, options)).
 * @param provider - Implementation of IAnalyticsProvider (e.g. Segment adapter)
 * @param options - Optional filter and mapToTrack
 * @returns EventSink to pass to eventBus.subscribe()
 */
export function createProviderSink(
  provider: IAnalyticsProvider,
  options: CreateProviderSinkOptions = {}
): EventSink {
  const { filter, mapToTrack } = options

  return (event: AnalyticsEvent) => {
    if (event.eventName === STATE_SNAPSHOT) return
    if (filter && !filter(event)) return

    const mapped = mapToTrack
      ? mapToTrack(event)
      : {
          eventName: event.eventName,
          properties: {
            ...(typeof event.payload === 'object' && event.payload !== null
              ? (event.payload as Record<string, unknown>)
              : {}),
            ...(event.metadata ?? {}),
          },
        }
    if (!mapped) return

    const result = provider.track(mapped.eventName, mapped.properties)
    if (result && typeof (result as Promise<unknown>).catch === 'function') {
      (result as Promise<void>).catch((err) =>
        console.error('[Chronos] Provider track error:', err)
      )
    }
  }
}
