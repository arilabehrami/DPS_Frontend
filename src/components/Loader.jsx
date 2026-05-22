export function Loader({ label = 'Loading...', fullScreen = false }) {
  const wrapper = fullScreen
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-white/70 dark:bg-slate-900/70'
    : 'flex items-center justify-center py-12'

  return (
    <div className={wrapper} role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
        <p className="text-sm text-slate-600 dark:text-slate-300">{label}</p>
      </div>
    </div>
  )
}
