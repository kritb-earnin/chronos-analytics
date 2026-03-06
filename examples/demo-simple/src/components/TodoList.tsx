import { useChronos, withTracking } from 'chronos-analytics'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface Todo {
  id: string
  text: string
  done: boolean
}

function TodoButton(
  props: React.ComponentProps<typeof Button> & {
    onClick?: (e: React.MouseEvent<unknown>) => void
  }
): React.ReactElement {
  return <Button {...(props as React.ComponentProps<typeof Button>)} />
}
const TrackedButton = withTracking(TodoButton, 'todo_click')

export function TodoList(): React.ReactElement {
  const [todos, setTodos] = useState<Todo[]>([])
  const { emit } = useChronos()

  const addTodo = () => {
    const id = `todo_${Date.now()}`
    const text = window.prompt('New todo text') ?? 'New todo'
    setTodos((prev) => [...prev, { id, text, done: false }])
    emit('todo_add', { id, text })
  }

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    )
    emit('todo_toggle', { id })
  }

  const removeTodo = (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id))
    emit('todo_remove', { id })
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
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="flex items-center gap-3 rounded-md border border-[var(--color-border)] bg-[var(--color-muted)]/30 px-3 py-2"
            >
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => toggleTodo(todo.id)}
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
                onClick={() => removeTodo(todo.id)}
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
