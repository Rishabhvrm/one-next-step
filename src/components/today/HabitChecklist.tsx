import { useApp } from '../../context/AppContext'
import { todayISO } from '../../utils/dateUtils'
import { useNavigate } from 'react-router-dom'

export default function HabitChecklist() {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const today = todayISO()

  const activeHabits = state.habits.filter(h => h.active)

  function isDone(habitId: string) {
    return state.habitLogs.some(l => l.habitId === habitId && l.date === today && l.done)
  }

  function toggle(habitId: string) {
    dispatch({ type: 'LOG_HABIT', habitId, done: !isDone(habitId) })
  }

  if (activeHabits.length === 0) {
    return (
      <div className="bg-gray-900 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Habits</h2>
        <p className="text-gray-500 text-sm">No habits yet.</p>
        <button
          onClick={() => navigate('/habits')}
          className="mt-3 text-indigo-400 text-sm underline"
        >
          Add habits
        </button>
      </div>
    )
  }

  const doneCount = activeHabits.filter(h => isDone(h.id)).length

  return (
    <div className="bg-gray-900 rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Habits</h2>
        <span className="text-xs text-gray-500">{doneCount}/{activeHabits.length}</span>
      </div>
      <ul className="flex flex-col gap-3">
        {activeHabits.map(habit => {
          const done = isDone(habit.id)
          return (
            <li key={habit.id}>
              <button
                onClick={() => toggle(habit.id)}
                className={`w-full flex items-center gap-3 text-left transition-colors active:scale-[0.98] ${
                  done ? 'text-gray-500' : 'text-gray-100'
                }`}
              >
                <span className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                  done
                    ? 'bg-indigo-600 border-indigo-600'
                    : 'border-gray-600 bg-transparent'
                }`}>
                  {done && (
                    <svg viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth={2} className="w-3 h-3">
                      <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span className={`text-base ${done ? 'line-through' : ''}`}>{habit.name}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
