import type { AnalyticsEvent, EventSink, IAnalyticsProvider } from '../../types/chronos'
import { STATE_SNAPSHOT } from '../EventBus'

export interface CreateProviderSinkOptions {
  /** If false, event is not forwarded to the provider. */
  filter?: (event: AnalyticsEvent) => boolean
  /** Map event to track call; return null to skip. */
  mapToTrack?: (
    event: AnalyticsEvent
  ) => { eventName: string; properties: Record<string, unknown> } | null
}

/**
 * Returns an EventSink that forwards non–state_snapshot Chronos events to the provider.
 * Use: eventBus.subscribe(createProviderSink(segmentAdapter, { filter: (e) => e.eventName !== 'state_snapshot' }))
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
