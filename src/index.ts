// Types
export type {
  AnalyticsEvent,
  EventSink,
  IAnalyticsProvider,
  StateSnapshotPayload,
} from './types/chronos'

// EventBus
export {
  getEventBus,
  emitEvent,
  emitStateSnapshot,
  STATE_SNAPSHOT,
} from './lib/EventBus'
export type { IEventBus } from './lib/EventBus'

// Hook
export { useChronos } from './hooks/useChronos'
export type { UseChronosReturn } from './hooks/useChronos'

// Sinks
export { init as initConsoleSink } from './lib/sinks/ConsoleSink'
export { init as initLocalStorageSink, loadEvents } from './lib/sinks/LocalStorageSink'
export type { LocalStorageSinkOptions } from './lib/sinks/LocalStorageSink'
export {
  createProviderSink,
} from './lib/sinks/createProviderSink'
export type { CreateProviderSinkOptions } from './lib/sinks/createProviderSink'

// Store (optional, for replay)
export { createChronosStore, STATE_SNAPSHOT as CHRONOS_STORE_STATE_SNAPSHOT } from './lib/ChronosStore'
export type { ChronosStoreContextValue } from './lib/ChronosStore'

// HOC
export { withTracking } from './hoc/withTracking'

// Event log (replay = displaying event logs with timestamps)
export { ReplayEngine } from './lib/ReplayEngine'

// DevTools
export { ChronosDevTools } from './components/ChronosDevTools'
