import { useChronos, withTracking } from 'chronos-analytics'
import { useState } from 'react'

interface Todo {
  id: string
  text: string
  done: boolean
}

function Button(
  props: React.ButtonHTMLAttributes<HTMLButtonElement>
): React.ReactElement {
  return <button {...props} />
}

const TrackedButton = withTracking(Button, 'todo_click')

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
    <section style={{ marginBottom: 24 }}>
      <h2>Todos</h2>
      <TrackedButton onClick={addTodo}>Add todo</TrackedButton>
      <ul style={{ listStyle: 'none', padding: 0, marginTop: 8 }}>
        {todos.map((todo) => (
          <li
            key={todo.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 4,
            }}
          >
            <input
              type="checkbox"
              checked={todo.done}
              onChange={() => toggleTodo(todo.id)}
            />
            <span
              style={{
                textDecoration: todo.done ? 'line-through' : undefined,
              }}
            >
              {todo.text}
            </span>
            <TrackedButton onClick={() => removeTodo(todo.id)}>
              Remove
            </TrackedButton>
          </li>
        ))}
      </ul>
    </section>
  )
}
