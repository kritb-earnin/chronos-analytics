/**
 * Sinks: subscribe to the EventBus to log, persist, or forward events.
 * Public API re-exported from the package root; this barrel keeps the folder structural.
 */

export { init as initConsoleSink } from './ConsoleSink'
export { init as initLocalStorageSink, loadEvents } from './LocalStorageSink'
export type { LocalStorageSinkOptions } from './LocalStorageSink'
export { createProviderSink } from './createProviderSink'
export type { CreateProviderSinkOptions } from './createProviderSink'
export { createBatchedProviderSink } from './createBatchedProviderSink'
export type { BatchedProviderSinkOptions } from './createBatchedProviderSink'
