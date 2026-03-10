import type React from 'react'
import { lazy, Suspense } from 'react'

const RemoteApp = lazy(() => import('chronos_mf_remote/App'))

export default function App(): React.ReactElement {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', minHeight: '100vh' }}>
      <header
        style={{
          padding: '16px 24px',
          borderBottom: '1px solid #ddd',
          background: '#f5f5f5',
        }}
      >
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>
          Chronos Shell — Sinks registered here
        </h1>
        <p style={{ margin: '8px 0 0', color: '#666', fontSize: 14 }}>
          EventBus, ConsoleSink, and LocalStorageSink are initialized in this app.
          The remote microfrontend below only uses useChronos and ChronosDevTools.
        </p>
      </header>
      <main style={{ padding: 24 }}>
        <Suspense
          fallback={
            <div style={{ padding: 24, color: '#666' }}>
              Loading remote microfrontend…
            </div>
          }
        >
          <RemoteApp />
        </Suspense>
      </main>
    </div>
  )
}
