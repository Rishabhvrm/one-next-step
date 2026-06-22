import { isoToDisplay, todayISO } from '../utils/dateUtils'
import NextStepCard from '../components/today/NextStepCard'
import HabitChecklist from '../components/today/HabitChecklist'
import EveningCheckIn from '../components/today/EveningCheckIn'

export default function TodayScreen() {
  return (
    <div className="px-4 pt-8 pb-4 flex flex-col gap-5 max-w-lg mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Today</h1>
        <p className="text-sm text-gray-500 mt-0.5">{isoToDisplay(todayISO())}</p>
      </div>

      <section>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          One next step
        </h2>
        <NextStepCard />
      </section>

      <section>
        <HabitChecklist />
      </section>

      <section>
        <EveningCheckIn />
      </section>
    </div>
  )
}
