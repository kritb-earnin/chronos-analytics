import type { ComponentType } from 'react'
import { useCallback, useId } from 'react'
import { emitEvent } from '../lib/EventBus'

type WithOnClick = {
  onClick?: (e: React.MouseEvent<unknown>) => void
  children?: React.ReactNode
  [key: string]: unknown
}

/**
 * HOC that wraps a component and intercepts onClick: emits an analytics event (with target and rest props in payload), then calls the original onClick.
 * @param Component - React component that accepts onClick (and optionally children)
 * @param eventName - Event name to emit on click (default: `'click'`)
 * @returns Wrapped component with the same props
 */
export function withTracking<P extends WithOnClick>(
  Component: ComponentType<P>,
  eventName: string = 'click'
): ComponentType<P> {
  function WithTrackingWrapper(props: P) {
    const sourceId = useId()
    const { onClick, ...rest } = props
    const handleClick = useCallback(
      (e: React.MouseEvent<unknown>) => {
        emitEvent(eventName, {
          target: (e.target as HTMLElement)?.id ?? (e.target as HTMLElement)?.tagName,
          _chronosSourceId: sourceId,
          ...(typeof rest === 'object' && rest !== null ? (rest as Record<string, unknown>) : {}),
        })
        onClick?.(e as React.MouseEvent<unknown>)
      },
      [onClick, sourceId]
    )
    return (
      <Component
        {...(rest as P)}
        onClick={handleClick}
        data-chronos-source-id={sourceId}
      />
    )
  }
  WithTrackingWrapper.displayName = `WithTracking(${Component.displayName ?? Component.name ?? 'Component'})`
  return WithTrackingWrapper as ComponentType<P>
}
