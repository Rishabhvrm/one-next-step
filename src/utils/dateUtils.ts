export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

export function isoToDisplay(date: string): string {
  return new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

export function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}
