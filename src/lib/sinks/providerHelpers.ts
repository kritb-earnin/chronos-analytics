import type {
  AnalyticsEvent,
  IAnalyticsProvider,
  TrackPayload,
} from '../../types/chronos'
import { STATE_SNAPSHOT } from '../EventBus'

/** Options used to map an AnalyticsEvent to a TrackPayload (filter + mapToTrack). */
export interface MapEventToTrackOptions {
  filter?: (event: AnalyticsEvent) => boolean
  mapToTrack?: (
    event: AnalyticsEvent
  ) => { eventName: string; properties: Record<string, unknown> } | null
}

/**
 * Map a Chronos event to a TrackPayload. Skips state_snapshot; applies filter and mapToTrack.
 * Returns null if the event should be skipped.
 */
export function mapEventToTrackPayload(
  event: AnalyticsEvent,
  options: MapEventToTrackOptions
): TrackPayload | null {
  if (event.eventName === STATE_SNAPSHOT) return null
  const { filter, mapToTrack } = options
  if (filter && !filter(event)) return null

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
  return mapped ?? null
}

const LOG_PREFIX = '[Chronos]'

/**
 * Send a list of track payloads to the provider. Uses trackBatch when available,
 * otherwise calls track() for each. Handles promises and logs errors.
 */
export function sendToProvider(
  provider: IAnalyticsProvider,
  payloads: TrackPayload[],
  context?: string
): void {
  if (payloads.length === 0) return
  const suffix = context ? ` (${context})` : ''

  if (provider.trackBatch) {
    const result = provider.trackBatch(payloads)
    if (result && typeof (result as Promise<unknown>).catch === 'function') {
      (result as Promise<void>).catch((err) =>
        console.error(`${LOG_PREFIX} Provider trackBatch error${suffix}:`, err)
      )
    }
  } else {
    for (const { eventName, properties } of payloads) {
      try {
        const result = provider.track(eventName, properties)
        if (result && typeof (result as Promise<unknown>).catch === 'function') {
          (result as Promise<void>).catch((err) =>
            console.error(`${LOG_PREFIX} Provider track error${suffix}:`, err)
          )
        }
      } catch (err) {
        console.error(`${LOG_PREFIX} Provider track error${suffix}:`, err)
      }
    }
  }
}
