import { ChronosDevTools } from 'chronos-analytics'
import { Counter } from './components/Counter'
import { TodoList } from './components/TodoList'

export default function App(): React.ReactElement {
  return (
    <>
      <div style={{ padding: 24, maxWidth: 600 }}>
        <h1>Chronos Demo (useState only)</h1>
        <p style={{ color: '#666', marginBottom: 24 }}>
          No ChronosStore — state is managed with <code>useState</code>. Events
          are still emitted via <code>useChronos</code> and <code>withTracking</code>.
        </p>
        <Counter />
        <TodoList />
      </div>
      <ChronosDevTools />
    </>
  )
}
