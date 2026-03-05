import { withTracking } from 'chronos-analytics'
import { useChronosStore } from '../store'

function Button({
  onClick,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>): React.ReactElement {
  return <button {...rest} onClick={onClick}>{children}</button>
}

const TrackedButton = withTracking(Button, 'counter_click')

export function Counter(): React.ReactElement {
  const [state, dispatch] = useChronosStore()
  return (
    <section style={{ marginBottom: 24 }}>
      <h2>Counter</h2>
      <p style={{ fontSize: 24, fontWeight: 600 }}>{state.counter}</p>
      <div style={{ display: 'flex', gap: 8 }}>
        <TrackedButton onClick={() => dispatch({ type: 'INCREMENT' })}>
          +1
        </TrackedButton>
        <TrackedButton onClick={() => dispatch({ type: 'DECREMENT' })}>
          -1
        </TrackedButton>
      </div>
    </section>
  )
}
