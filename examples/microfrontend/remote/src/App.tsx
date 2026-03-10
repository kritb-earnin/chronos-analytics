import type React from 'react'
import { ChronosDevTools, useChronos } from 'chronos-analytics'

/**
 * Microfrontend app: only uses useChronos to emit events and ChronosDevTools to display the log.
 * No sink registration here — the shell app owns EventBus and sinks.
 */
export default function App(): React.ReactElement {
  const { emit } = useChronos()

  return (
    <div style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h2 style={{ marginTop: 0, marginBottom: 16, fontSize: 18 }}>
        Microfrontend (remote)
      </h2>
      <p style={{ color: '#666', marginBottom: 16, fontSize: 14 }}>
        This app only uses <code>useChronos()</code> to emit events. Sinks are
        registered in the shell. DevTools below show the shared event log.
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() =>
            emit('mf_button_click', { id: 'action-a', source: 'remote' })
          }
          style={{
            padding: '8px 16px',
            cursor: 'pointer',
            background: '#333',
            color: '#eee',
            border: '1px solid #555',
            borderRadius: 6,
          }}
        >
          Emit action A
        </button>
        <button
          type="button"
          onClick={() =>
            emit('mf_button_click', { id: 'action-b', source: 'remote' })
          }
          style={{
            padding: '8px 16px',
            cursor: 'pointer',
            background: '#333',
            color: '#eee',
            border: '1px solid #555',
            borderRadius: 6,
          }}
        >
          Emit action B
        </button>
        <button
          type="button"
          onClick={() =>
            emit('mf_custom', { name: 'custom', value: Date.now() })
          }
          style={{
            padding: '8px 16px',
            cursor: 'pointer',
            background: '#333',
            color: '#eee',
            border: '1px solid #555',
            borderRadius: 6,
          }}
        >
          Emit custom event
        </button>
      </div>
      <ChronosDevTools />
    </div>
  )
}
