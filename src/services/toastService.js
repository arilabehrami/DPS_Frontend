let listeners = []

export const toastService = {
  subscribe(fn) {
    listeners.push(fn)
    return () => {
      listeners = listeners.filter((l) => l !== fn)
    }
  },
  show(message, type = 'info') {
    listeners.forEach((fn) => fn({ id: Date.now(), message, type }))
  },
  success(message) {
    this.show(message, 'success')
  },
  error(message) {
    this.show(message, 'error')
  },
}
