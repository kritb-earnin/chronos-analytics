import { useChronos, withTracking } from 'chronos-analytics'
import { useState } from 'react'

function Button(
  props: React.ButtonHTMLAttributes<HTMLButtonElement>
): React.ReactElement {
  return <button {...props} />
}

const TrackedButton = withTracking(Button, 'counter_click')

export function Counter(): React.ReactElement {
  const [count, setCount] = useState(0)
  const { emit } = useChronos()

  const increment = () => {
    setCount((c) => c + 1)
    emit('counter_change', { action: 'increment', value: count + 1 })
  }

  const decrement = () => {
    setCount((c) => c - 1)
    emit('counter_change', { action: 'decrement', value: count - 1 })
  }

  return (
    <section style={{ marginBottom: 24 }}>
      <h2>Counter</h2>
      <p style={{ fontSize: 24, fontWeight: 600 }}>{count}</p>
      <div style={{ display: 'flex', gap: 8 }}>
        <TrackedButton onClick={increment}>+1</TrackedButton>
        <TrackedButton onClick={decrement}>-1</TrackedButton>
      </div>
    </section>
  )
}
