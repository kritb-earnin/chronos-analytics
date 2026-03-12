import {
  createBatchedProviderSink,
  getEventBus,
  initConsoleSink,
  initLocalStorageSink,
} from 'chronos-analytics'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { mockAnalyticsProvider } from './mockAnalyticsProvider'

const eventBus = getEventBus()
initLocalStorageSink(eventBus, { key: 'chronos-events', maxEvents: 1000 })
initConsoleSink(eventBus)

// Use batchSize: 1 so each event flushes immediately and DevTools row turns "sent" (green) right away.
// With batchSize: 10 you'd need 10 events or wait for flushIntervalMs before rows update.
eventBus.subscribe(createBatchedProviderSink(mockAnalyticsProvider, {
  batchSize: 10,
  flushIntervalMs: 1500,
  useIdleCallback: true,
  unsentEventsStorageKey: 'chronos-unsent-events',
}))

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
