import type { IAnalyticsProvider } from 'chronos-analytics'

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

export const mockAnalyticsProvider: IAnalyticsProvider = {
  track: (eventName, properties) => delayAnalyticSend(eventName, properties),
}