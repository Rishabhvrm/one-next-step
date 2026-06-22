import {
  createContext,
  useContext,
  useReducer,
  type ReactNode,
} from 'react'
import type { AppState, Goal, Step, Habit, HabitLog, DayLog } from '../types'
import { readStorage, writeStorage } from '../services/storage'
import { todayISO, uid } from '../utils/dateUtils'

// ── Actions ──────────────────────────────────────────────────────────────────

type Action =
  // M1
  | { type: 'SET_FOCUS_GOAL'; goalId: string | null }
  | { type: 'MARK_STEP_DONE'; stepId: string }
  | { type: 'LOG_HABIT'; habitId: string; done: boolean }
  | { type: 'SAVE_DAY_LOG'; payload: Omit<DayLog, 'id' | 'date'> }
  // M2 — Goals
  | { type: 'ADD_GOAL'; goal: Goal }
  | { type: 'UPDATE_GOAL'; goalId: string; changes: Partial<Goal> }
  | { type: 'ADD_STEP'; step: Step }
  | { type: 'UPDATE_STEP'; stepId: string; changes: Partial<Step> }
  | { type: 'REORDER_STEPS'; goalId: string; orderedIds: string[] }
  // M3 — Habits
  | { type: 'ADD_HABIT'; habit: Habit }
  | { type: 'UPDATE_HABIT'; habitId: string; changes: Partial<Habit> }
  // Internal
  | { type: 'RELOAD' }

// ── Reducer ───────────────────────────────────────────────────────────────────

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_FOCUS_GOAL':
      return { ...state, focusGoalId: action.goalId }

    case 'MARK_STEP_DONE': {
      const now = new Date().toISOString()
      return {
        ...state,
        steps: state.steps.map(s =>
          s.id === action.stepId ? { ...s, done: true, doneAt: now } : s
        ),
      }
    }

    case 'LOG_HABIT': {
      const today = todayISO()
      const existing = state.habitLogs.find(
        l => l.habitId === action.habitId && l.date === today
      )
      if (existing) {
        return {
          ...state,
          habitLogs: state.habitLogs.map(l =>
            l.id === existing.id ? { ...l, done: action.done } : l
          ),
        }
      }
      const newLog: HabitLog = {
        id: uid(),
        habitId: action.habitId,
        date: today,
        done: action.done,
      }
      return { ...state, habitLogs: [...state.habitLogs, newLog] }
    }

    case 'SAVE_DAY_LOG': {
      const today = todayISO()
      const existing = state.dayLogs.find(l => l.date === today)
      if (existing) {
        return {
          ...state,
          dayLogs: state.dayLogs.map(l =>
            l.id === existing.id ? { ...l, ...action.payload } : l
          ),
        }
      }
      const newLog: DayLog = { id: uid(), date: today, ...action.payload }
      return { ...state, dayLogs: [...state.dayLogs, newLog] }
    }

    case 'ADD_GOAL': {
      const next = { ...state, goals: [...state.goals, action.goal] }
      // auto-set focus if this is the first active short goal
      if (
        action.goal.horizon === 'short' &&
        action.goal.status === 'active' &&
        !next.focusGoalId
      ) {
        next.focusGoalId = action.goal.id
      }
      return next
    }

    case 'UPDATE_GOAL': {
      const updated = state.goals.map(g =>
        g.id === action.goalId ? { ...g, ...action.changes } : g
      )
      let focusGoalId = state.focusGoalId
      // if the focus goal is no longer active, clear it
      if (focusGoalId) {
        const focusGoal = updated.find(g => g.id === focusGoalId)
        if (!focusGoal || focusGoal.status !== 'active') {
          focusGoalId = updated.find(g => g.horizon === 'short' && g.status === 'active')?.id ?? null
        }
      }
      return { ...state, goals: updated, focusGoalId }
    }

    case 'ADD_STEP':
      return { ...state, steps: [...state.steps, action.step] }

    case 'UPDATE_STEP':
      return {
        ...state,
        steps: state.steps.map(s =>
          s.id === action.stepId ? { ...s, ...action.changes } : s
        ),
      }

    case 'REORDER_STEPS': {
      const orderMap = new Map(action.orderedIds.map((id, i) => [id, i]))
      return {
        ...state,
        steps: state.steps.map(s =>
          orderMap.has(s.id) ? { ...s, order: orderMap.get(s.id)! } : s
        ),
      }
    }

    case 'ADD_HABIT':
      return { ...state, habits: [...state.habits, action.habit] }

    case 'UPDATE_HABIT':
      return {
        ...state,
        habits: state.habits.map(h =>
          h.id === action.habitId ? { ...h, ...action.changes } : h
        ),
      }

    case 'RELOAD':
      return readStorage()

    default:
      return state
  }
}

function persistingReducer(state: AppState, action: Action): AppState {
  const next = reducer(state, action)
  writeStorage(next)
  return next
}

// ── Context ───────────────────────────────────────────────────────────────────

interface AppContextValue {
  state: AppState
  dispatch: React.Dispatch<Action>
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(persistingReducer, undefined, readStorage)

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
