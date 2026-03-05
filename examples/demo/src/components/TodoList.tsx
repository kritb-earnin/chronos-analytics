import { withTracking } from 'chronos-analytics'
import type { AppState } from '../store'
import { useChronosStore } from '../store'

function Button({
  onClick,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>): React.ReactElement {
  return <button {...rest} onClick={onClick}>{children}</button>
}

const TrackedButton = withTracking(Button, 'todo_click')

export function TodoList(): React.ReactElement {
  const [state, dispatch] = useChronosStore()

  const addTodo = (): void => {
    const id = `todo_${Date.now()}`
    const text = window.prompt('New todo text') ?? 'New todo'
    dispatch({ type: 'ADD_TODO', payload: { id, text } })
  }

  return (
    <section style={{ marginBottom: 24 }}>
      <h2>Todos</h2>
      <TrackedButton onClick={addTodo}>Add todo</TrackedButton>
      <ul style={{ listStyle: 'none', padding: 0, marginTop: 8 }}>
        {(state as AppState).todos.map((todo) => (
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
              onChange={() => dispatch({ type: 'TOGGLE_TODO', payload: { id: todo.id } })}
            />
            <span style={{ textDecoration: todo.done ? 'line-through' : undefined }}>
              {todo.text}
            </span>
            <TrackedButton
              onClick={() => dispatch({ type: 'REMOVE_TODO', payload: { id: todo.id } })}
            >
              Remove
            </TrackedButton>
          </li>
        ))}
      </ul>
    </section>
  )
}
