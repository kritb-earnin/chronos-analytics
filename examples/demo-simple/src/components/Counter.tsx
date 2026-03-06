import { useChronos, withTracking } from 'chronos-analytics'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

function CounterButton(
  props: React.ComponentProps<typeof Button> & {
    onClick?: (e: React.MouseEvent<unknown>) => void
  }
): React.ReactElement {
  return <Button {...(props as React.ComponentProps<typeof Button>)} />
}
const TrackedButton = withTracking(CounterButton, 'counter_click')

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
    <Card>
      <CardHeader>
        <CardTitle>Counter</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-4xl font-semibold tabular-nums tracking-tight">
          {count}
        </p>
        <div className="flex gap-2">
          <TrackedButton onClick={increment}>+1</TrackedButton>
          <TrackedButton variant="outline" onClick={decrement}>
            -1
          </TrackedButton>
        </div>
      </CardContent>
    </Card>
  )
}
