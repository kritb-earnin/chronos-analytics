import { withTracking } from 'chronos-analytics'
import { useChronosStore } from '@/store'
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
  const [state, dispatch] = useChronosStore()
  return (
    <Card>
      <CardHeader>
        <CardTitle>Counter</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-4xl font-semibold tabular-nums tracking-tight">
          {state.counter}
        </p>
        <div className="flex gap-2">
          <TrackedButton onClick={() => dispatch({ type: 'INCREMENT' })}>
            +1
          </TrackedButton>
          <TrackedButton
            variant="outline"
            onClick={() => dispatch({ type: 'DECREMENT' })}
          >
            -1
          </TrackedButton>
        </div>
      </CardContent>
    </Card>
  )
}
