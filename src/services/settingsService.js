const SETTINGS_KEY = 'dps_settings'

const defaults = {
  personalityType: 'friendly',
  memoryEnabled: true,
  language: 'en',
}

export function getSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    return raw ? { ...defaults, ...JSON.parse(raw) } : { ...defaults }
  } catch {
    return { ...defaults }
  }
}

export function saveSettings(partial) {
  const next = { ...getSettings(), ...partial }
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(next))
  return next
}
