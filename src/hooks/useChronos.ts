import { useCallback } from 'react'
import { getEventBus, emitEvent } from '../lib/EventBus'

/**
 * Return type of `useChronos()`. Use `emit` to send events to the EventBus.
 */
export interface UseChronosReturn {
  /** Emit an analytics event to the EventBus; all sinks receive it. */
  emit: (
    eventName: string,
    payload?: unknown,
    metadata?: Record<string, unknown>
  ) => void
}

/**
 * Primary API for basic tracking. Returns `{ emit }` so any component can send events
 * without setting up a reducer or store. Call `emit(eventName, payload?, metadata?)` to log events.
 * @returns Object with `emit` function
 * @example
 * const { emit } = useChronos()
 * emit('button_click', { id: 'submit' })
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
