import type { ComponentType } from 'react'
import { useCallback, useId } from 'react'
import { emitEvent } from '../lib/EventBus'

type WithOnClick = {
  onClick?: (e: React.MouseEvent<unknown>) => void
  /** Reserved: used only for the event payload (not passed to the wrapped component). */
  elementName?: string
  /** Reserved: used only for the event payload (not passed to the wrapped component). */
  component?: string
  children?: React.ReactNode
  [key: string]: unknown
}

/**
 * HOC that wraps a component and intercepts onClick: emits an analytics event (elementName, component, target, _chronosSourceId), then calls the original onClick.
 * Tracking-only props (elementName, component) are stripped and not passed to the wrapped component.
 * @param Component - React component that accepts onClick (and optionally children, label, etc.)
 * @param eventName - Event name to emit on click (default: `'click'`)
 * @returns Wrapped component with the same props (plus optional elementName, component)
 */
export function withTracking<P extends WithOnClick>(
  Component: ComponentType<P>,
  eventName: string = 'click'
): ComponentType<P> {
  const componentDisplayName =
    (Component as { displayName?: string; name?: string }).displayName ??
    (Component as { displayName?: string; name?: string }).name ??
    'Component'

  function WithTrackingWrapper(props: P) {
    const sourceId = useId()
    const { onClick, elementName, component, ...rest } = props
    const restRecord = typeof rest === 'object' && rest !== null ? (rest as Record<string, unknown>) : {}
    const label = restRecord.label
    const childrenProp = restRecord.children
    const handleClick = useCallback(
      (e: React.MouseEvent<unknown>) => {
        const resolvedElementName =
          elementName ??
          (typeof label === 'string' ? label : undefined) ??
          (typeof childrenProp === 'string' ? childrenProp : undefined) ??
          componentDisplayName ??
          'element'
        const resolvedComponent = component ?? componentDisplayName ?? 'Component'
        emitEvent(eventName, {
          elementName: resolvedElementName,
          component: resolvedComponent,
          target: (e.target as HTMLElement)?.id ?? (e.target as HTMLElement)?.tagName,
          _chronosSourceId: sourceId,
        })
        onClick?.(e as React.MouseEvent<unknown>)
      },
      [onClick, sourceId, eventName, elementName, component, label, childrenProp]
    )
    return (
      <Component
        {...(rest as P)}
        onClick={handleClick}
        data-chronos-source-id={sourceId}
      />
    )
  }
  WithTrackingWrapper.displayName = `WithTracking(${componentDisplayName})`
  return WithTrackingWrapper as ComponentType<P>
}
