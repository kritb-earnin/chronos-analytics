import { withTracking } from 'chronos-analytics'
import type { AppState } from '@/store'
import { useChronosStore } from '@/store'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

function TodoButton(
  props: React.ComponentProps<typeof Button> & {
    onClick?: (e: React.MouseEvent<unknown>) => void
  }
): React.ReactElement {
  return <Button {...(props as React.ComponentProps<typeof Button>)} />
}
const TrackedButton = withTracking(TodoButton, 'todo_click')

export function TodoList(): React.ReactElement {
  const [state, dispatch] = useChronosStore()

  const addTodo = (): void => {
    const id = `todo_${Date.now()}`
    const text = window.prompt('New todo text') ?? 'New todo'
    dispatch({ type: 'ADD_TODO', payload: { id, text } })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Todos</CardTitle>
        <TrackedButton size="sm" onClick={addTodo}>
          Add todo
        </TrackedButton>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {(state as AppState).todos.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center gap-3 rounded-md border border-[var(--color-border)] bg-[var(--color-muted)]/30 px-3 py-2"
            >
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() =>
                  dispatch({ type: 'TOGGLE_TODO', payload: { id: todo.id } })
                }
                className="h-4 w-4 rounded border-[var(--color-border)]"
              />
              <span
                className={cn(
                  'flex-1 text-sm',
                  todo.done && 'text-[var(--color-muted-foreground)] line-through'
                )}
              >
                {todo.text}
              </span>
              <TrackedButton
                variant="destructive"
                size="sm"
                onClick={() =>
                  dispatch({ type: 'REMOVE_TODO', payload: { id: todo.id } })
                }
              >
                Remove
              </TrackedButton>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
