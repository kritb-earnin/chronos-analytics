import { ChronosDevTools } from 'chronos-analytics'
import { Counter } from '@/components/Counter'
import { HardNavigateDemo } from '@/components/HardNavigateDemo'
import { TodoList } from '@/components/TodoList'

export default function App(): React.ReactElement {
  return (
    <>
      <div className="min-h-screen bg-[var(--color-background)] px-6 py-12">
        <div className="mx-auto max-w-2xl space-y-8">
          <header>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--color-foreground)]">
              Chronos Demo (useState only)
            </h1>
            <p className="mt-2 text-[var(--color-muted-foreground)]">
              No ChronosStore — state is managed with{' '}
              <code className="rounded bg-[var(--color-muted)] px-1.5 py-0.5 font-mono text-sm">
                useState
              </code>
              . Events are still emitted via{' '}
              <code className="rounded bg-[var(--color-muted)] px-1.5 py-0.5 font-mono text-sm">
                useChronos
              </code>{' '}
              and{' '}
              <code className="rounded bg-[var(--color-muted)] px-1.5 py-0.5 font-mono text-sm">
                withTracking
              </code>
              .
            </p>
          </header>
          <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
            <Counter />
            <TodoList />
          </div>
          <HardNavigateDemo />
        </div>
      </div>
      <ChronosDevTools />
    </>
  )
}
