import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useToast } from '../context/ToastContext'
import { uid } from '../utils/dateUtils'
import type { Goal, GoalHorizon, Step } from '../types'

const MAX_ACTIVE_SHORT = 3

export default function GoalsScreen() {
  const { state, dispatch } = useApp()
  const { showToast } = useToast()
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [goalTitle, setGoalTitle] = useState('')
  const [goalHorizon, setGoalHorizon] = useState<GoalHorizon>('short')
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null)
  const [showAddStep, setShowAddStep] = useState<string | null>(null)
  const [stepTitle, setStepTitle] = useState('')

  const activeShortGoals = state.goals.filter(g => g.horizon === 'short' && g.status === 'active')
  const longGoals = state.goals.filter(g => g.horizon === 'long')
  const shortGoals = state.goals.filter(g => g.horizon === 'short')
  const doneGoals = state.goals.filter(g => g.status === 'done')

  function handleAddGoal() {
    if (!goalTitle.trim()) return
    if (goalHorizon === 'short' && activeShortGoals.length >= MAX_ACTIVE_SHORT) {
      showToast(`Max ${MAX_ACTIVE_SHORT} active goals. Finish or pause one first.`, 'error')
      return
    }
    const goal: Goal = {
      id: uid(),
      title: goalTitle.trim(),
      horizon: goalHorizon,
      status: 'active',
      createdAt: new Date().toISOString(),
    }
    dispatch({ type: 'ADD_GOAL', goal })
    setGoalTitle('')
    setShowAddGoal(false)
    showToast('Goal added.')
  }

  function handleAddStep(goalId: string) {
    if (!stepTitle.trim()) return
    const existingSteps = state.steps.filter(s => s.goalId === goalId)
    const step: Step = {
      id: uid(),
      goalId,
      title: stepTitle.trim(),
      order: existingSteps.length,
      done: false,
    }
    dispatch({ type: 'ADD_STEP', step })
    setStepTitle('')
    setShowAddStep(null)
    showToast('Step added.')
  }

  function handleStatusChange(goalId: string, status: Goal['status']) {
    const changes: Partial<Goal> = { status }
    if (status === 'done') changes.completedAt = new Date().toISOString()
    dispatch({ type: 'UPDATE_GOAL', goalId, changes })
  }

  function handleFocus(goalId: string) {
    dispatch({ type: 'SET_FOCUS_GOAL', goalId })
    showToast('Focus updated.')
  }

  function GoalCard({ goal }: { goal: Goal }) {
    const steps = state.steps
      .filter(s => s.goalId === goal.id)
      .sort((a, b) => a.order - b.order)
    const undone = steps.filter(s => !s.done)
    const isExpanded = expandedGoalId === goal.id
    const isFocus = state.focusGoalId === goal.id

    return (
      <div className={`bg-gray-900 rounded-2xl overflow-hidden ${goal.status === 'done' ? 'opacity-60' : ''}`}>
        <button
          onClick={() => setExpandedGoalId(isExpanded ? null : goal.id)}
          className="w-full flex items-start justify-between gap-3 px-5 py-4 text-left"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base font-semibold text-gray-100 leading-snug">{goal.title}</span>
              {isFocus && goal.status === 'active' && (
                <span className="text-xs bg-indigo-900 text-indigo-300 px-2 py-0.5 rounded-full">focus</span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {undone.length > 0 ? `${undone.length} step${undone.length !== 1 ? 's' : ''} left` : steps.length > 0 ? 'All steps done' : 'No steps yet'}
            </p>
          </div>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
            className={`w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {isExpanded && (
          <div className="px-5 pb-5 flex flex-col gap-3">
            {steps.map(step => (
              <div key={step.id} className="flex items-start gap-3">
                <span className={`mt-1 w-4 h-4 rounded-full border-2 flex-shrink-0 ${
                  step.done ? 'bg-indigo-600 border-indigo-600' : 'border-gray-600'
                }`} />
                <span className={`text-sm ${step.done ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                  {step.title}
                </span>
              </div>
            ))}

            {showAddStep === goal.id ? (
              <div className="flex gap-2 mt-1">
                <input
                  autoFocus
                  value={stepTitle}
                  onChange={e => setStepTitle(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddStep(goal.id)}
                  placeholder="Next step..."
                  className="flex-1 bg-gray-800 text-gray-100 rounded-xl px-3 py-2 text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button onClick={() => handleAddStep(goal.id)} className="text-indigo-400 text-sm font-semibold px-2">Add</button>
                <button onClick={() => setShowAddStep(null)} className="text-gray-500 text-sm px-2">Cancel</button>
              </div>
            ) : (
              <button
                onClick={() => setShowAddStep(goal.id)}
                className="text-indigo-400 text-sm text-left mt-1"
              >
                + Add step
              </button>
            )}

            <div className="flex flex-wrap gap-2 mt-2 pt-3 border-t border-gray-800">
              {goal.horizon === 'short' && goal.status === 'active' && !isFocus && (
                <button onClick={() => handleFocus(goal.id)}
                  className="text-xs bg-indigo-900 text-indigo-300 px-3 py-1.5 rounded-lg">
                  Set as focus
                </button>
              )}
              {goal.status === 'active' && (
                <>
                  <button onClick={() => handleStatusChange(goal.id, 'paused')}
                    className="text-xs bg-gray-800 text-gray-400 px-3 py-1.5 rounded-lg">
                    Pause
                  </button>
                  <button onClick={() => handleStatusChange(goal.id, 'done')}
                    className="text-xs bg-gray-800 text-gray-400 px-3 py-1.5 rounded-lg">
                    Mark done
                  </button>
                </>
              )}
              {goal.status === 'paused' && (
                <button onClick={() => handleStatusChange(goal.id, 'active')}
                  className="text-xs bg-gray-800 text-gray-400 px-3 py-1.5 rounded-lg">
                  Resume
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="px-4 pt-8 pb-4 flex flex-col gap-6 max-w-lg mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Goals</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {activeShortGoals.length}/{MAX_ACTIVE_SHORT} active short-term
          </p>
        </div>
        {!showAddGoal && (
          <button
            onClick={() => setShowAddGoal(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            + Add goal
          </button>
        )}
      </div>

      {showAddGoal && (
        <div className="bg-gray-900 rounded-2xl p-5 flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-gray-300">New goal</h3>
          <input
            autoFocus
            value={goalTitle}
            onChange={e => setGoalTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddGoal()}
            placeholder="Goal title..."
            className="bg-gray-800 text-gray-100 rounded-xl px-4 py-3 text-base placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex gap-2">
            {(['short', 'long'] as GoalHorizon[]).map(h => (
              <button
                key={h}
                onClick={() => setGoalHorizon(h)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                  goalHorizon === h ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400'
                }`}
              >
                {h === 'short' ? 'Short-term' : 'Long-term'}
              </button>
            ))}
          </div>
          {goalHorizon === 'short' && activeShortGoals.length >= MAX_ACTIVE_SHORT && (
            <p className="text-xs text-amber-400">
              You have {MAX_ACTIVE_SHORT} active short-term goals. Finish or pause one to add another.
            </p>
          )}
          <div className="flex gap-2">
            <button onClick={handleAddGoal} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-colors">
              Add
            </button>
            <button onClick={() => { setShowAddGoal(false); setGoalTitle('') }} className="px-4 text-gray-500 text-sm">
              Cancel
            </button>
          </div>
        </div>
      )}

      {shortGoals.filter(g => g.status !== 'done').length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Short-term</h2>
          {shortGoals.filter(g => g.status !== 'done').map(g => <GoalCard key={g.id} goal={g} />)}
        </section>
      )}

      {longGoals.filter(g => g.status !== 'done').length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Long-term</h2>
          {longGoals.filter(g => g.status !== 'done').map(g => <GoalCard key={g.id} goal={g} />)}
        </section>
      )}

      {doneGoals.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Done</h2>
          {doneGoals.map(g => <GoalCard key={g.id} goal={g} />)}
        </section>
      )}

      {state.goals.length === 0 && !showAddGoal && (
        <div className="text-center py-12 text-gray-600">
          <p className="text-lg">No goals yet.</p>
          <p className="text-sm mt-1">Add your first short-term goal to get started.</p>
        </div>
      )}
    </div>
  )
}
