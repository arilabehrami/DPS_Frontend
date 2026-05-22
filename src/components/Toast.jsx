import { useEffect, useState } from 'react'
import { toastService } from '../services/toastService'

const styles = {
  info: 'bg-slate-800 text-white',
  success: 'bg-emerald-600 text-white',
  error: 'bg-red-600 text-white',
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    return toastService.subscribe((toast) => {
      setToasts((prev) => [...prev, toast])
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id))
      }, 3500)
    })
  }, [])

  if (!toasts.length) return null

  return (
    <section className="fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((t) => (
        <article
          key={t.id}
          className={`rounded-lg px-4 py-3 text-sm shadow-lg ${styles[t.type] || styles.info}`}
          role="alert"
        >
          {t.message}
        </article>
      ))}
    </section>
  )
}
