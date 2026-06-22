import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { ToastProvider } from './context/ToastContext'
import AppShell from './components/layout/AppShell'
import PasswordGate from './components/PasswordGate'
import TodayScreen from './screens/TodayScreen'
import GoalsScreen from './screens/GoalsScreen'
import HabitsScreen from './screens/HabitsScreen'
import RemindersScreen from './screens/RemindersScreen'
import ProgressScreen from './screens/ProgressScreen'

export default function App() {
  return (
    <PasswordGate>
      <ToastProvider>
        <AppProvider>
          <HashRouter>
            <Routes>
              <Route element={<AppShell />}>
                <Route index element={<Navigate to="/today" replace />} />
                <Route path="/today" element={<TodayScreen />} />
                <Route path="/goals" element={<GoalsScreen />} />
                <Route path="/habits" element={<HabitsScreen />} />
                <Route path="/reminders" element={<RemindersScreen />} />
                <Route path="/progress" element={<ProgressScreen />} />
              </Route>
            </Routes>
          </HashRouter>
        </AppProvider>
      </ToastProvider>
    </PasswordGate>
  )
}
