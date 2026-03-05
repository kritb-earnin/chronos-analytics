import type { ComponentType } from 'react'
import { useCallback } from 'react'
import { emitEvent } from '../lib/EventBus'

type WithOnClick = {
  onClick?: (e: React.MouseEvent<unknown>) => void
  children?: React.ReactNode
  [key: string]: unknown
}

/**
 * HOC that intercepts onClick: emits an analytics event, then calls the original onClick.
 */
export function withTracking<P extends WithOnClick>(
  Component: ComponentType<P>,
  eventName: string = 'click'
): ComponentType<P> {
  function WithTrackingWrapper(props: P) {
    const { onClick, ...rest } = props
    const handleClick = useCallback(
      (e: React.MouseEvent<unknown>) => {
        emitEvent(eventName, {
          target: (e.target as HTMLElement)?.id ?? (e.target as HTMLElement)?.tagName,
          ...(typeof rest === 'object' && rest !== null ? (rest as Record<string, unknown>) : {}),
        })
        onClick?.(e as React.MouseEvent<unknown>)
      },
      [onClick]
    )
    return <Component {...(rest as P)} onClick={handleClick} />
  }
  WithTrackingWrapper.displayName = `WithTracking(${Component.displayName ?? Component.name ?? 'Component'})`
  return WithTrackingWrapper as ComponentType<P>
}
