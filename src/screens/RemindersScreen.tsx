export default function RemindersScreen() {
  return (
    <div className="h-screen flex flex-col" style={{ paddingBottom: 'calc(64px + env(safe-area-inset-bottom))' }}>
      <iframe
        src={`${import.meta.env.BASE_URL}unstuck.html`}
        className="w-full flex-1 border-0"
        title="Unstuck — your own playbook"
      />
    </div>
  )
}
