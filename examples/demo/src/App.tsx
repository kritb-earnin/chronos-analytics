import { ChronosDevTools } from 'chronos-analytics'
import { Counter } from '@/components/Counter'
import { TodoList } from '@/components/TodoList'
import { ChronosStoreProvider } from '@/store'

export default function App(): React.ReactElement {
  return (
    <ChronosStoreProvider>
      <div className="min-h-screen bg-[var(--color-background)] px-6 py-12">
        <div className="mx-auto max-w-2xl space-y-8">
          <header>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--color-foreground)]">
              Chronos Demo
            </h1>
            <p className="mt-2 text-[var(--color-muted-foreground)]">
              Use the DevTools at the bottom to view event logs with timestamps.
            </p>
          </header>
          <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
            <Counter />
            <TodoList />
          </div>
        </div>
      </div>
      <ChronosDevTools />
    </ChronosStoreProvider>
  )
}
