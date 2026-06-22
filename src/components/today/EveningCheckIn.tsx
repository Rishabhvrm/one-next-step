import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { useToast } from '../../context/ToastContext'
import { todayISO } from '../../utils/dateUtils'

function RatingRow({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm text-gray-400">{label}</span>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            onClick={() => onChange(n)}
            className={`w-10 h-10 rounded-xl font-bold text-sm transition-colors active:scale-95 ${
              value === n
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function EveningCheckIn() {
  const { state, dispatch } = useApp()
  const { showToast } = useToast()
  const today = todayISO()
  const [open, setOpen] = useState(false)

  const existing = state.dayLogs.find(l => l.date === today)

  const [mood, setMood] = useState(existing?.mood ?? 0)
  const [motivation, setMotivation] = useState(existing?.motivation ?? 0)
  const [didWhat, setDidWhat] = useState(existing?.didWhat ?? '')

  function handleSave() {
    if (!mood || !motivation) {
      showToast('Tap a number for mood and motivation', 'info')
      return
    }
    dispatch({
      type: 'SAVE_DAY_LOG',
      payload: { mood, motivation, didWhat, notes: '' },
    })
    showToast('Evening logged.')
    setOpen(false)
  }

  return (
    <div className="bg-gray-900 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Evening check-in</h2>
          {existing && !open && (
            <p className="text-xs text-indigo-400 mt-0.5">
              Mood {existing.mood} · Motivation {existing.motivation}{existing.didWhat ? ' · logged' : ''}
            </p>
          )}
        </div>
        <svg
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
          className={`w-5 h-5 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="px-5 pb-5 flex flex-col gap-5">
          <RatingRow label="Mood" value={mood} onChange={setMood} />
          <RatingRow label="Motivation" value={motivation} onChange={setMotivation} />
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-400">What did I actually do today?</label>
            <textarea
              value={didWhat}
              onChange={e => setDidWhat(e.target.value)}
              placeholder="Even small things count..."
              rows={3}
              className="bg-gray-800 text-gray-100 rounded-xl px-4 py-3 text-sm resize-none placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={handleSave}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition-colors active:scale-95"
          >
            Save
          </button>
        </div>
      )}
    </div>
  )
}
