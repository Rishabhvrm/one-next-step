export type GoalHorizon = 'long' | 'short'
export type GoalStatus = 'active' | 'paused' | 'done' | 'someday'

export interface Goal {
  id: string
  title: string
  horizon: GoalHorizon
  parentId?: string
  status: GoalStatus
  createdAt: string
  completedAt?: string
}

export interface Step {
  id: string
  goalId: string
  title: string
  order: number
  done: boolean
  doneAt?: string
}

export interface Habit {
  id: string
  name: string
  active: boolean
  createdAt: string
}

export interface HabitLog {
  id: string
  habitId: string
  date: string
  done: boolean
}

export interface DayLog {
  id: string
  date: string
  mood: number
  motivation: number
  didWhat: string
  notes: string
}

export interface AppState {
  goals: Goal[]
  steps: Step[]
  habits: Habit[]
  habitLogs: HabitLog[]
  dayLogs: DayLog[]
  focusGoalId: string | null
}
