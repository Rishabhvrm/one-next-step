import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../context/ToastContext'
import { uid } from '../../utils/dateUtils'

export default function NextStepCard() {
  const { state, dispatch } = useApp()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const activeShortGoals = state.goals.filter(
    g => g.horizon === 'short' && g.status === 'active'
  )

  const focusGoal = state.focusGoalId
    ? state.goals.find(g => g.id === state.focusGoalId)
    : activeShortGoals.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0]

  const nextStep = focusGoal
    ? state.steps
        .filter(s => s.goalId === focusGoal.id && !s.done)
        .sort((a, b) => a.order - b.order)[0]
    : null

  function handleDone() {
    if (!nextStep) return
    dispatch({ type: 'MARK_STEP_DONE', stepId: nextStep.id })
    showToast('Step done. Keep going.')
  }

  function handleFinishGoal() {
    if (!focusGoal) return
    dispatch({
      type: 'UPDATE_GOAL',
      goalId: focusGoal.id,
      changes: { status: 'done', completedAt: new Date().toISOString() },
    })
    showToast('Goal complete!')
  }

  function handleChangeFocus(goalId: string) {
    dispatch({ type: 'SET_FOCUS_GOAL', goalId })
  }

  // Seed demo data for first-time users
  function handleSeedDemo() {
    const goalId = uid()
    const stepId1 = uid()
    const stepId2 = uid()
    const habitId = uid()
    dispatch({
      type: 'ADD_GOAL',
      goal: {
        id: goalId,
        title: 'Ship One Next Step app',
        horizon: 'short',
        status: 'active',
        createdAt: new Date().toISOString(),
      },
    })
    dispatch({
      type: 'ADD_STEP',
      step: { id: stepId1, goalId, title: 'Set up project and deploy to GitHub Pages', order: 0, done: false },
    })
    dispatch({
      type: 'ADD_STEP',
      step: { id: stepId2, goalId, title: 'Add first real goal and step', order: 1, done: false },
    })
    dispatch({
      type: 'ADD_HABIT',
      habit: { id: habitId, name: 'Morning journal', active: true, createdAt: new Date().toISOString() },
    })
    dispatch({ type: 'SET_FOCUS_GOAL', goalId })
  }

  // No active short goals at all
  if (activeShortGoals.length === 0) {
    return (
      <div className="bg-gray-900 rounded-2xl p-6 flex flex-col gap-4">
        <p className="text-gray-400 text-sm">No active goal yet.</p>
        <button
          onClick={() => navigate('/goals')}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
        >
          Add a goal
        </button>
        <button
          onClick={handleSeedDemo}
          className="text-gray-500 text-sm underline"
        >
          Or load demo data
        </button>
      </div>
    )
  }

  // Focus goal has no undone steps
  if (focusGoal && !nextStep) {
    return (
      <div className="bg-gray-900 rounded-2xl p-6 flex flex-col gap-4">
        <p className="text-xs text-indigo-400 uppercase tracking-wider font-medium">{focusGoal.title}</p>
        <p className="text-gray-100 text-lg font-semibold">All steps done for this goal.</p>
        <button
          onClick={handleFinishGoal}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
        >
          Mark goal complete
        </button>
        <button
          onClick={() => navigate('/goals')}
          className="text-gray-500 text-sm underline"
        >
          Add more steps
        </button>
      </div>
    )
  }

  return (
    <div className="bg-gray-900 rounded-2xl p-6 flex flex-col gap-5">
      {focusGoal && (
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-indigo-400 uppercase tracking-wider font-medium truncate">
            {focusGoal.title}
          </p>
          {activeShortGoals.length > 1 && (
            <select
              value={focusGoal.id}
              onChange={e => handleChangeFocus(e.target.value)}
              className="text-xs bg-gray-800 text-gray-400 border border-gray-700 rounded-lg px-2 py-1 cursor-pointer"
            >
              {activeShortGoals.map(g => (
                <option key={g.id} value={g.id}>{g.title}</option>
              ))}
            </select>
          )}
        </div>
      )}

      {nextStep && (
        <p className="text-gray-100 text-xl font-semibold leading-snug">
          {nextStep.title}
        </p>
      )}

      <button
        onClick={handleDone}
        disabled={!nextStep}
        className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold py-4 px-6 rounded-xl text-lg transition-colors active:scale-95"
      >
        Done
      </button>
    </div>
  )
}
