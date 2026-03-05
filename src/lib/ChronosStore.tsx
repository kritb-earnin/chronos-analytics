import type { ReactNode } from 'react'
import type { Reducer } from 'react'
import { createContext, useContext, useEffect, useReducer } from 'react'
import { emitStateSnapshot, STATE_SNAPSHOT } from './EventBus'

/**
 * Context value for a Chronos store: current state and dispatch.
 * Use with the store returned by createChronosStore (ChronosStoreProvider, useChronosStore).
 */
export interface ChronosStoreContextValue<S, A> {
  state: S
  dispatch: React.Dispatch<A>
}

function createChronosStoreContext<S, A>() {
  return createContext<ChronosStoreContextValue<S, A> | null>(null)
}

/**
 * Create an optional Chronos store: a React context + reducer that emits a state_snapshot event after every state change.
 * Events appear in the event log like any other; no state re-hydration. Wrap the app (or subtree) with ChronosStoreProvider.
 * @param reducer - React useReducer reducer
 * @param initialState - Initial state
 * @returns Object with ChronosStoreProvider and useChronosStore
 */
export function createChronosStore<S, A>(
  reducer: Reducer<S, A>,
  initialState: S
): {
  ChronosStoreProvider: (props: { children: ReactNode }) => React.ReactElement
  useChronosStore: () => [S, React.Dispatch<A>]
} {
  const Context = createChronosStoreContext<S, A>()

  function ChronosStoreProvider({ children }: { children: ReactNode }): React.ReactElement {
    const [state, dispatch] = useReducer(reducer, initialState)

    useEffect(() => {
      emitStateSnapshot(state)
    }, [state])

    const value: ChronosStoreContextValue<S, A> = {
      state,
      dispatch,
    }

    return <Context.Provider value={value}>{children}</Context.Provider>
  }

  function useChronosStore(): [S, React.Dispatch<A>] {
    const ctx = useContext(Context)
    if (ctx === null) {
      throw new Error('useChronosStore must be used within ChronosStoreProvider')
    }
    return [ctx.state, ctx.dispatch]
  }

  return { ChronosStoreProvider, useChronosStore }
}

/** Event name for state snapshot events (re-exported from EventBus). */
export { STATE_SNAPSHOT }
