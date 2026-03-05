import { useCallback, useEffect, useState } from 'react'
import type { AnalyticsEvent } from '../types/chronos'
import { getEventBus } from '../lib/EventBus'
import { loadEvents } from '../lib/sinks/LocalStorageSink'

const STORAGE_KEY = 'chronos-events'

function formatTimestamp(ts: number): string {
  const d = new Date(ts)
  const time = d.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
  const ms = d.getMilliseconds().toString().padStart(3, '0')
  return `${time}.${ms}`
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '40vh',
    background: 'rgba(30, 30, 30, 0.98)',
    color: '#e0e0e0',
    fontFamily: 'system-ui, sans-serif',
    fontSize: '12px',
    zIndex: 2147483647,
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 -2px 10px rgba(0,0,0,0.3)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    borderBottom: '1px solid #444',
    flexShrink: 0,
  },
  label: {
    fontWeight: 600,
  },
  button: {
    padding: '4px 10px',
    cursor: 'pointer',
    background: '#444',
    border: '1px solid #666',
    borderRadius: '4px',
    color: '#e0e0e0',
    fontSize: '12px',
  },
  list: {
    overflow: 'auto',
    flex: 1,
    padding: '8px',
  },
  row: {
    padding: '6px 8px',
    borderBottom: '1px solid #333',
    fontFamily: 'ui-monospace, monospace',
  },
  time: {
    color: '#8af',
    marginRight: '8px',
  },
  name: {
    fontWeight: 600,
    color: '#cfc',
    marginRight: '8px',
  },
  payload: {
    color: '#aaa',
    fontSize: '11px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '100%',
  },
}

function EventRow({ event }: { event: AnalyticsEvent }): React.ReactElement {
  const payloadStr =
    typeof event.payload === 'object' && event.payload !== null
      ? JSON.stringify(event.payload)
      : String(event.payload)
  return (
    <div style={styles.row}>
      <span style={styles.time}>{formatTimestamp(event.timestamp)}</span>
      <span style={styles.name}>{event.eventName}</span>
      <span style={styles.payload} title={payloadStr}>
        {payloadStr}
      </span>
    </div>
  )
}

export function ChronosDevTools(): React.ReactElement {
  const [events, setEvents] = useState<AnalyticsEvent[]>(() => loadEvents(STORAGE_KEY))
  const [minimized, setMinimized] = useState(false)

  const refresh = useCallback(() => {
    setEvents(loadEvents(STORAGE_KEY))
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    const eventBus = getEventBus()
    const unsubscribe = eventBus.subscribe((event) => {
      setEvents((prev) => [...prev, event])
    })
    return unsubscribe
  }, [])

  const handleClear = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY)
      setEvents([])
    }
  }, [])

  const toggleMinimized = useCallback(() => {
    setMinimized((prev) => !prev)
  }, [])

  return (
    <div
      style={{
        ...styles.overlay,
        maxHeight: minimized ? undefined : styles.overlay.maxHeight,
      }}
      data-chronos-devtools
    >
      <div
        style={{
          ...styles.header,
          borderBottom: minimized ? 'none' : styles.header.borderBottom,
        }}
        role="button"
        tabIndex={0}
        onClick={toggleMinimized}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && toggleMinimized()}
        title={minimized ? 'Expand event log' : 'Minimize event log'}
      >
        <span style={{ ...styles.label, cursor: 'pointer', userSelect: 'none' }}>
          {minimized ? '▶' : '▼'} Chronos — Event log
        </span>
        {!minimized && (
          <>
            <button
              type="button"
              style={styles.button}
              onClick={(e) => {
                e.stopPropagation()
                refresh()
              }}
            >
              Refresh
            </button>
            <button
              type="button"
              style={styles.button}
              onClick={(e) => {
                e.stopPropagation()
                handleClear()
              }}
            >
              Clear
            </button>
          </>
        )}
        <span style={{ fontSize: '11px', opacity: 0.9, marginLeft: 'auto' }}>
          {events.length} event{events.length !== 1 ? 's' : ''}
        </span>
      </div>
      {!minimized && (
      <div style={styles.list}>
        {events.length === 0 ? (
          <div style={{ ...styles.row, color: '#666' }}>
            No events yet. Interact with the app to see events here.
          </div>
        ) : (
          [...events].reverse().map((evt) => (
            <EventRow key={evt.id} event={evt} />
          ))
        )}
      </div>
      )}
    </div>
  )
}
