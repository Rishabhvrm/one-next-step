import { useState, useEffect, type ReactNode } from 'react'

const EXPECTED_HASH = import.meta.env.VITE_PASSWORD_HASH as string | undefined
const SESSION_KEY = 'ons_auth'

async function sha256hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input))
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export default function PasswordGate({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    // No hash configured — dev mode, skip gate
    if (!EXPECTED_HASH) {
      setAuthed(true)
      return
    }
    // Already authenticated this session
    if (sessionStorage.getItem(SESSION_KEY) === EXPECTED_HASH) {
      setAuthed(true)
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!password || checking) return
    setChecking(true)
    const hash = await sha256hex(password)
    if (hash === EXPECTED_HASH) {
      sessionStorage.setItem(SESSION_KEY, hash)
      setAuthed(true)
    } else {
      setError(true)
      setShake(true)
      setPassword('')
      setChecking(false)
      setTimeout(() => setShake(false), 500)
    }
  }

  if (authed) return <>{children}</>

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} className="w-6 h-6">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-100">One Next Step</h1>
          <p className="text-sm text-gray-500 mt-1">Enter your password to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className={shake ? 'animate-[shake_0.4s_ease-in-out]' : ''}>
            <input
              autoFocus
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(false) }}
              placeholder="Password"
              className={`w-full bg-gray-900 text-gray-100 rounded-xl px-4 py-3 text-base placeholder-gray-600 focus:outline-none focus:ring-2 transition-colors ${
                error ? 'ring-2 ring-red-500' : 'focus:ring-indigo-500'
              }`}
            />
            {error && (
              <p className="text-xs text-red-400 mt-2 text-center">Incorrect password</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!password || checking}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition-colors active:scale-95"
          >
            {checking ? 'Checking…' : 'Unlock'}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
      `}</style>
    </div>
  )
}
