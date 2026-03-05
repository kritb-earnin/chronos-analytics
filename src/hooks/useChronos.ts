import { useCallback } from 'react'
import { getEventBus, emitEvent } from '../lib/EventBus'

export interface UseChronosReturn {
  /** Emit an analytics event to the EventBus; all sinks receive it. */
  emit: (
    eventName: string,
    payload?: unknown,
    metadata?: Record<string, unknown>
  ) => void
}

/**
 * Primary API for basic use. Returns { emit } so any component can send events
 * without setting up a reducer or store.
 */
export function useChronos(): UseChronosReturn {
  const emit = useCallback(
    (
      eventName: string,
      payload?: unknown,
      metadata?: Record<string, unknown>
    ) => {
      emitEvent(eventName, payload, metadata)
    },
    []
  )
  return { emit }
}

/** Expose getEventBus for app bootstrap (registering sinks). */
export { getEventBus }
