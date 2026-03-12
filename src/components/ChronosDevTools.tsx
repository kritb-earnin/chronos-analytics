import { useCallback, useEffect, useState } from 'react'
import type { AnalyticsEvent } from '../types/chronos'
import { getEventBus } from '../lib/EventBus'
import { loadEvents } from '../lib/sinks/LocalStorageSink'
import {
  getSentEventIds,
  subscribeToSent,
} from '../lib/sinks/providerSentStatus'

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
  bubble: {
    position: 'fixed',
    bottom: 16,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: '50%',
    background: 'rgba(30, 30, 30, 0.95)',
    border: '1px solid #555',
    color: '#e0e0e0',
    cursor: 'pointer',
    zIndex: 2147483647,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
  },
  bubbleIcon: {
    width: 24,
    height: 24,
    fill: 'currentColor',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    padding: '0 5px',
    borderRadius: 9,
    background: '#6b8',
    color: '#111',
    fontSize: 11,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #5a7',
  },
  eventCountPill: {
    borderRadius: 9999,
    padding: '4px 10px',
    background: 'rgba(107, 136, 136, 0.35)',
    border: '1px solid #5a7',
    fontWeight: 700,
    fontSize: '12px',
    color: '#e0e0e0',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
  },
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
  collapseButton: {
    width: 28,
    height: 28,
    padding: 0,
    cursor: 'pointer',
    background: '#444',
    border: '1px solid #666',
    borderRadius: '4px',
    color: '#e0e0e0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
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
    cursor: 'pointer',
  },
  rowHover: {
    padding: '6px 8px',
    borderBottom: '1px solid #333',
    fontFamily: 'ui-monospace, monospace',
    cursor: 'pointer',
    background: 'rgba(255,255,255,0.06)',
  },
  rowSent: {
    padding: '6px 8px',
    borderBottom: '1px solid #333',
    borderLeft: '3px solid rgba(107, 136, 107, 0.6)',
    fontFamily: 'ui-monospace, monospace',
    cursor: 'pointer',
    background: 'rgba(107, 136, 107, 0.12)',
  },
  rowSentHover: {
    padding: '6px 8px',
    borderBottom: '1px solid #333',
    borderLeft: '3px solid rgba(107, 136, 107, 0.6)',
    fontFamily: 'ui-monospace, monospace',
    cursor: 'pointer',
    background: 'rgba(107, 136, 107, 0.18)',
  },
  rowPending: {
    padding: '6px 8px',
    borderBottom: '1px solid #333',
    borderLeft: '3px solid rgba(180, 140, 80, 0.6)',
    fontFamily: 'ui-monospace, monospace',
    cursor: 'pointer',
    background: 'rgba(180, 140, 80, 0.1)',
  },
  rowPendingHover: {
    padding: '6px 8px',
    borderBottom: '1px solid #333',
    borderLeft: '3px solid rgba(180, 140, 80, 0.6)',
    fontFamily: 'ui-monospace, monospace',
    cursor: 'pointer',
    background: 'rgba(180, 140, 80, 0.16)',
  },
  locatePill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    marginRight: 8,
    padding: '2px 6px',
    borderRadius: 4,
    background: 'rgba(107, 136, 136, 0.25)',
    border: '1px solid rgba(107, 136, 136, 0.5)',
    fontSize: 10,
    color: '#9ce',
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

const HIGHLIGHT_DURATION_MS = 1500
const HIGHLIGHT_OVERLAY_BG = 'rgba(230, 120, 40, 0.45)'

let currentOverlay: HTMLDivElement | null = null

function removeOverlay(): void {
  if (currentOverlay && currentOverlay.parentNode) {
    currentOverlay.parentNode.removeChild(currentOverlay)
    currentOverlay = null
  }
}

function getChronosSourceId(event: AnalyticsEvent): string | undefined {
  const payloadId =
    typeof event.payload === 'object' &&
    event.payload !== null &&
    '_chronosSourceId' in event.payload &&
    typeof (event.payload as Record<string, unknown>)._chronosSourceId === 'string'
      ? ((event.payload as Record<string, unknown>)._chronosSourceId as string)
      : undefined
  if (payloadId) return payloadId
  return typeof event.metadata?._chronosSourceId === 'string'
    ? event.metadata._chronosSourceId
    : undefined
}

function findElementByChronosSourceId(
  sourceId: string,
  root: Document | ShadowRoot = document
): HTMLElement | null {
  const walk = (container: Document | ShadowRoot): HTMLElement | null => {
    const nodes = container.querySelectorAll('*')
    for (const node of nodes) {
      if (
        node instanceof HTMLElement &&
        node.getAttribute('data-chronos-source-id') === sourceId
      ) {
        return node
      }
      if (node.shadowRoot) {
        const found = walk(node.shadowRoot)
        if (found) return found
      }
    }
    return null
  }
  return walk(root)
}

function highlightSourceElement(sourceId: string): void {
  if (typeof document === 'undefined') return
  const el = findElementByChronosSourceId(sourceId)
  if (!el) return
  removeOverlay()
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  const rect = el.getBoundingClientRect()
  const overlay = document.createElement('div')
  overlay.setAttribute('data-chronos-highlight-overlay', '')
  overlay.style.cssText = [
    'position:fixed',
    'left:' + rect.left + 'px',
    'top:' + rect.top + 'px',
    'width:' + rect.width + 'px',
    'height:' + rect.height + 'px',
    'background:' + HIGHLIGHT_OVERLAY_BG,
    'pointer-events:none',
    'z-index:2147483646',
    'border-radius:2px',
  ].join(';')
  document.body.appendChild(overlay)
  currentOverlay = overlay
  overlay.animate({ opacity: [1, 0] }, { duration: HIGHLIGHT_DURATION_MS, fill: 'forwards', easing: 'ease-out' }).finished.then(() => {
    if (currentOverlay === overlay && overlay.parentNode) {
      overlay.parentNode.removeChild(overlay)
      currentOverlay = null
    }
  })
}

function EventRow({
  event,
  isSent,
}: {
  event: AnalyticsEvent
  isSent: boolean
}): React.ReactElement {
  const payloadStr =
    typeof event.payload === 'object' && event.payload !== null
      ? JSON.stringify(event.payload)
      : String(event.payload)
  const sourceId = getChronosSourceId(event)
  const [hover, setHover] = useState(false)
  const handleClick = useCallback(() => {
    if (sourceId) highlightSourceElement(sourceId)
  }, [sourceId])
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleClick()
      }
    },
    [handleClick]
  )
  const baseStyle = isSent
    ? hover
      ? styles.rowSentHover
      : styles.rowSent
    : hover
      ? styles.rowPendingHover
      : styles.rowPending
  return (
    <div
      style={baseStyle}
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label={
        sourceId
          ? 'Click to highlight the element that emitted this event'
          : 'Event row'
      }
      title={isSent ? 'Sent to provider' : 'Pending (not yet sent to provider)'}
    >
      <span style={styles.time}>{formatTimestamp(event.timestamp)}</span>
      {sourceId && (
        <span style={styles.locatePill} title="Click row to highlight source element">
          Locate
        </span>
      )}
      <span style={styles.name}>{event.eventName}</span>
      <span style={styles.payload} title={payloadStr}>
        {payloadStr}
      </span>
    </div>
  )
}

/**
 * Fixed overlay that shows the Chronos event log (timestamp, eventName, payload).
 * Loads events from localStorage (same key as LocalStorageSink); supports Refresh and Clear.
 * Renders as a minimizable bubble when collapsed. No state scrubber or play/pause.
 * @returns React element (overlay or bubble button)
 */
export function ChronosDevTools(): React.ReactElement {
  const [events, setEvents] = useState<AnalyticsEvent[]>(() => loadEvents(STORAGE_KEY))
  const [minimized, setMinimized] = useState(false)
  const [sentIds, setSentIds] = useState<ReadonlySet<string>>(() => getSentEventIds())

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

  useEffect(() => {
    return subscribeToSent(() => setSentIds(getSentEventIds()))
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

  if (minimized) {
    return (
      <button
        type="button"
        style={styles.bubble}
        onClick={toggleMinimized}
        title={`Chronos — ${events.length} event${events.length !== 1 ? 's' : ''}. Click to expand.`}
        aria-label={`Expand event log, ${events.length} events`}
        data-chronos-devtools
      >
        <svg
          style={styles.bubbleIcon}
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z" />
        </svg>
        {events.length > 0 && (
          <span style={styles.badge}>{events.length > 99 ? '99+' : events.length}</span>
        )}
      </button>
    )
  }

  return (
    <div style={styles.overlay} data-chronos-devtools>
      <div style={styles.header}>
        <span style={styles.label}>Chronos — Event log</span>
        <button
          type="button"
          style={styles.button}
          onClick={refresh}
        >
          Refresh
        </button>
        <button
          type="button"
          style={styles.button}
          onClick={handleClear}
        >
          Clear
        </button>
        <span style={styles.eventCountPill}>
          {events.length} event{events.length !== 1 ? 's' : ''}
        </span>
        <button
          type="button"
          style={styles.collapseButton}
          onClick={toggleMinimized}
          title="Minimize to bubble"
          aria-label="Minimize event log"
        >
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
            <path d="M6 12h12" />
          </svg>
        </button>
      </div>
      <div style={styles.list}>
        {events.length === 0 ? (
          <div style={{ ...styles.row, color: '#666' }}>
            No events yet. Interact with the app to see events here.
          </div>
        ) : (
          [...events].reverse().map((evt) => (
            <EventRow
              key={evt.id}
              event={evt}
              isSent={sentIds.has(evt.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}
