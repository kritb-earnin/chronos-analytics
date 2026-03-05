import { ChronosDevTools } from 'chronos-analytics'
import { Counter } from './components/Counter'
import { TodoList } from './components/TodoList'
import { ChronosStoreProvider } from './store'

export default function App(): React.ReactElement {
  return (
    <ChronosStoreProvider>
      <div style={{ padding: 24, maxWidth: 600 }}>
        <h1>Chronos Demo</h1>
        <p style={{ color: '#666', marginBottom: 24 }}>
          Use the DevTools at the bottom to view event logs with timestamps.
        </p>
        <Counter />
        <TodoList />
      </div>
      <ChronosDevTools />
    </ChronosStoreProvider>
  )
}
