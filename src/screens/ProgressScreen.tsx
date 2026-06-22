import { useApp } from '../context/AppContext'

interface DoneItem { date: string; label: string; sub?: string }

function groupByWeek(items: DoneItem[]) {
  const weeks: Record<string, DoneItem[]> = {}
  items.forEach(item => {
    const d = new Date(item.date + 'T00:00:00')
    const sunday = new Date(d)
    sunday.setDate(d.getDate() - d.getDay())
    const key = sunday.toISOString().slice(0, 10)
    if (!weeks[key]) weeks[key] = []
    weeks[key].push(item)
  })
  return Object.entries(weeks).sort(([a], [b]) => b.localeCompare(a))
}

function weekLabel(isoSunday: string) {
  const d = new Date(isoSunday + 'T00:00:00')
  const end = new Date(d)
  end.setDate(d.getDate() + 6)
  return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
}

export default function ProgressScreen() {
  const { state } = useApp()

  const completedSteps: DoneItem[] = state.steps
    .filter(s => s.done && s.doneAt)
    .map(s => {
      const goal = state.goals.find(g => g.id === s.goalId)
      return { date: s.doneAt!.slice(0, 10), label: s.title, sub: goal?.title }
    })

  const completedGoals: DoneItem[] = state.goals
    .filter(g => g.status === 'done' && g.completedAt)
    .map(g => ({ date: g.completedAt!.slice(0, 10), label: `Goal: ${g.title}` }))

  const allDone = [...completedSteps, ...completedGoals].sort((a, b) =>
    b.date.localeCompare(a.date)
  )

  const weeks = groupByWeek(allDone)

  const moodPoints = state.dayLogs
    .filter(l => l.mood > 0)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-14)

  return (
    <div className="px-4 pt-8 pb-4 flex flex-col gap-6 max-w-lg mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Progress</h1>
        <p className="text-sm text-gray-500 mt-0.5">Everything you've done. Open this when a day feels like nothing.</p>
      </div>

      {moodPoints.length > 1 && (
        <section>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Mood (last 14 days)</h2>
          <div className="bg-gray-900 rounded-2xl p-4">
            <div className="flex items-end gap-1 h-16">
              {moodPoints.map((l, i) => (
                <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1">
                  <div
                    className="w-full bg-indigo-500 rounded-t"
                    style={{ height: `${(l.mood / 5) * 100}%`, minHeight: 4 }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>{new Date(moodPoints[0].date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              <span>today</span>
            </div>
          </div>
        </section>
      )}

      {weeks.length === 0 ? (
        <div className="text-center py-12 text-gray-600">
          <p className="text-lg">Nothing logged yet.</p>
          <p className="text-sm mt-1">Complete steps and goals — they'll show up here.</p>
        </div>
      ) : (
        <section className="flex flex-col gap-6">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Done ledger</h2>
          {weeks.map(([sunday, items]) => (
            <div key={sunday}>
              <p className="text-xs text-gray-500 mb-2">{weekLabel(sunday)}</p>
              <div className="flex flex-col gap-2">
                {items.map((item, i) => (
                  <div key={i} className="bg-gray-900 rounded-xl px-4 py-3">
                    <p className="text-sm text-gray-100">{item.label}</p>
                    {item.sub && <p className="text-xs text-gray-500 mt-0.5">{item.sub}</p>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  )
}
