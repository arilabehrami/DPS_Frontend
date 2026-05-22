export function StatCard({ title, value, subtitle, icon, trend }) {
  return (
    <article className="card p-5 transition hover:shadow-md">
      <header className="flex items-start justify-between">
        <section>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {value}
          </p>
          {subtitle && (
            <p className="mt-1 text-xs text-slate-400">{subtitle}</p>
          )}
          {trend && (
            <p className="mt-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              {trend}
            </p>
          )}
        </section>
        {icon && (
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-xl dark:bg-violet-950/50">
            {icon}
          </span>
        )}
      </header>
    </article>
  )
}
