import { createChronosStore } from 'chronos-analytics'

export interface Todo {
  id: string
  text: string
  done: boolean
}

export type AppState = {
  counter: number
  todos: Todo[]
}

export type AppAction =
  | { type: 'INCREMENT' }
  | { type: 'DECREMENT' }
  | { type: 'ADD_TODO'; payload: { id: string; text: string } }
  | { type: 'TOGGLE_TODO'; payload: { id: string } }
  | { type: 'REMOVE_TODO'; payload: { id: string } }

const reducer = (state: AppState, action: AppAction): AppState => {
  switch (action.type) {
    case 'INCREMENT':
      return { ...state, counter: state.counter + 1 }
    case 'DECREMENT':
      return { ...state, counter: state.counter - 1 }
    case 'ADD_TODO':
      return {
        ...state,
        todos: [
          ...state.todos,
          { id: action.payload.id, text: action.payload.text, done: false },
        ],
      }
    case 'TOGGLE_TODO':
      return {
        ...state,
        todos: state.todos.map((t) =>
          t.id === action.payload.id ? { ...t, done: !t.done } : t
        ),
      }
    case 'REMOVE_TODO':
      return {
        ...state,
        todos: state.todos.filter((t) => t.id !== action.payload.id),
      }
    default:
      return state
  }
}

const initialState: AppState = { counter: 0, todos: [] }

export const { ChronosStoreProvider, useChronosStore } =
  createChronosStore(reducer, initialState)
