import type { AppState } from '../types'

const STORAGE_KEY = 'ons_v1'
const SCHEMA_VERSION = 1

const DEFAULT_STATE: AppState = {
  goals: [],
  steps: [],
  habits: [],
  habitLogs: [],
  dayLogs: [],
  focusGoalId: null,
}

function migrateStorage(raw: Record<string, unknown>): AppState {
  // Hook for future schema migrations — currently a no-op
  return raw as unknown as AppState
}

export function readStorage(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_STATE }
    const parsed = JSON.parse(raw) as Record<string, unknown>
    if (!parsed.version) return migrateStorage(parsed)
    return parsed as unknown as AppState
  } catch {
    return { ...DEFAULT_STATE }
  }
}

export function writeStorage(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: SCHEMA_VERSION, ...state }))
  } catch {
    // storage quota exceeded — silently fail
  }
}
