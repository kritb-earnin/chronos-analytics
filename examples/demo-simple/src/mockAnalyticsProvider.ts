import type { IAnalyticsProvider, TrackPayload } from 'chronos-analytics'

/**
 * Mock async analytics send. The delay simulates network; Chronos marks the event
 * as "sent" in DevTools as soon as it hands off to this provider (not when the
 * promise resolves), so you'll see the row turn green shortly after each event.
 */
const delayAnalyticSend = async (
  eventName: string,
  properties: Record<string, unknown>
): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(() => {
      console.log('[Mock analytics] sent', eventName, properties)
      resolve()
    }, 800)
  })

/**
 * Called by Chronos on pagehide when there are pending events and payload ≤64KB.
 * In production you would POST to your provider (e.g. Segment) via navigator.sendBeacon.
 */
function sendBeacon(payloads: TrackPayload[]): void {
  if (payloads.length === 0) return
  console.log(
    '[Mock analytics] sendBeacon (hard navigate offload)',
    payloads.length,
    'event(s)',
    payloads
  )
  if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
    const url = new URL('/api/analytics/beacon', window.location.origin)
    const body = JSON.stringify({ batch: payloads })
    navigator.sendBeacon(url.toString(), new Blob([body], { type: 'application/json' }))
  }
}

export const mockAnalyticsProvider: IAnalyticsProvider = {
  track: (eventName: string, properties: Record<string, unknown>) =>
    delayAnalyticSend(eventName, properties),
  sendBeacon,
}