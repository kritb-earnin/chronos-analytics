import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

// Standalone dev: no sink registration. When loaded by the shell, sinks are
// provided by the shell; this app only uses useChronos + ChronosDevTools.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
