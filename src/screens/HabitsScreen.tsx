import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import { uid } from '../utils/dateUtils'
import type { Habit } from '../types'

const MAX_ACTIVE_HABITS = 5

export default function HabitsScreen() {
  const { state, dispatch } = useApp()
  const { showToast } = useToast()
  const [showAdd, setShowAdd] = useState(false)
  const [name, setName] = useState('')

  const activeHabits = state.habits.filter(h => h.active)
  const archivedHabits = state.habits.filter(h => !h.active)

  function handleAdd() {
    if (!name.trim()) return
    if (activeHabits.length >= MAX_ACTIVE_HABITS) {
      showToast(`Max ${MAX_ACTIVE_HABITS} active habits. Archive one first.`, 'error')
      return
    }
    const habit: Habit = { id: uid(), name: name.trim(), active: true, createdAt: new Date().toISOString() }
    dispatch({ type: 'ADD_HABIT', habit })
    setName('')
    setShowAdd(false)
    showToast('Habit added.')
  }

  function get14DayPercent(habitId: string): number {
    const days: string[] = []
    for (let i = 13; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      days.push(d.toISOString().slice(0, 10))
    }
    const done = days.filter(date =>
      state.habitLogs.some(l => l.habitId === habitId && l.date === date && l.done)
    )
    return Math.round((done.length / 14) * 100)
  }

  function get14DayDots(habitId: string): boolean[] {
    const dots: boolean[] = []
    for (let i = 13; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const date = d.toISOString().slice(0, 10)
      dots.push(state.habitLogs.some(l => l.habitId === habitId && l.date === date && l.done))
    }
    return dots
  }

  function HabitCard({ habit }: { habit: Habit }) {
    const pct = get14DayPercent(habit.id)
    const dots = get14DayDots(habit.id)

    return (
      <div className="bg-gray-900 rounded-2xl p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-base font-semibold text-gray-100">{habit.name}</span>
          <span className="text-sm font-bold text-indigo-400">{pct}%</span>
        </div>
        <div className="flex gap-1">
          {dots.map((done, i) => (
            <div
              key={i}
              className={`flex-1 h-2 rounded-full ${done ? 'bg-indigo-500' : 'bg-gray-800'}`}
            />
          ))}
        </div>
        <p className="text-xs text-gray-500">14-day completion</p>
        <button
          onClick={() => dispatch({ type: 'UPDATE_HABIT', habitId: habit.id, changes: { active: !habit.active } })}
          className="text-xs text-gray-500 underline text-left"
        >
          {habit.active ? 'Archive' : 'Restore'}
        </button>
      </div>
    )
  }

  return (
    <div className="px-4 pt-8 pb-4 flex flex-col gap-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Habits</h1>
          <p className="text-sm text-gray-500 mt-0.5">{activeHabits.length}/{MAX_ACTIVE_HABITS} active</p>
        </div>
        {!showAdd && (
          <button
            onClick={() => setShowAdd(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            + Add
          </button>
        )}
      </div>

      {showAdd && (
        <div className="bg-gray-900 rounded-2xl p-5 flex flex-col gap-4">
          <input
            autoFocus
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="Habit name..."
            className="bg-gray-800 text-gray-100 rounded-xl px-4 py-3 text-base placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex gap-2">
            <button onClick={handleAdd} className="flex-1 bg-indigo-600 text-white font-semibold py-3 rounded-xl">Add</button>
            <button onClick={() => { setShowAdd(false); setName('') }} className="px-4 text-gray-500 text-sm">Cancel</button>
          </div>
        </div>
      )}

      {activeHabits.length > 0 && (
        <section className="flex flex-col gap-3">
          {activeHabits.map(h => <HabitCard key={h.id} habit={h} />)}
        </section>
      )}

      {archivedHabits.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Archived</h2>
          {archivedHabits.map(h => <HabitCard key={h.id} habit={h} />)}
        </section>
      )}

      {state.habits.length === 0 && !showAdd && (
        <div className="text-center py-12 text-gray-600">
          <p className="text-lg">No habits yet.</p>
          <p className="text-sm mt-1">Add up to 5 habits to track daily.</p>
        </div>
      )}
    </div>
  )
}
