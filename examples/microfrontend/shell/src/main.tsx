import {
  getEventBus,
  initConsoleSink,
  initLocalStorageSink,
} from 'chronos-analytics'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

// Shell owns sink registration: all events (shell + remote) flow through this EventBus.
const eventBus = getEventBus()
initLocalStorageSink(eventBus, { key: 'chronos-events', maxEvents: 1000 })
initConsoleSink(eventBus)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
