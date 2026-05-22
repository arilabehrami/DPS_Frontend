export const APP_NAME = 'Digital Personality Simulator'
export const APP_SHORT = 'DPS'
export const PERSONALITY_NAME = 'Aura'

export const ROLES = {
  ADMIN: 'admin',
  EMPLOYEE: 'employee',
  GUEST: 'guest',
}

export const PERSONALITY_TYPES = [
  { id: 'friendly', label: 'Friendly & Warm' },
  { id: 'professional', label: 'Professional' },
  { id: 'creative', label: 'Creative & Playful' },
  { id: 'analytical', label: 'Analytical' },
]

export const LANGUAGES = [
  { id: 'en', label: 'English' },
  { id: 'sq', label: 'Albanian' },
  { id: 'es', label: 'Spanish' },
  { id: 'fr', label: 'French' },
  { id: 'de', label: 'German' },
]

/** Filter options for GET /api/employees (persona registry) */
export const DEPARTMENTS = [
  'Conversational',
  'Professional',
  'Creative',
  'Analytical',
  'Support',
  'Custom',
]

export const PERSONA_ROLES = ['admin', 'manager', 'employee', 'intern']
export const PERSONA_STATUSES = ['active', 'inactive', 'on_leave', 'terminated']

export const SORT_OPTIONS = [
  { value: 'name_asc', label: 'Name (A-Z)' },
  { value: 'name_desc', label: 'Name (Z-A)' },
  { value: 'date_asc', label: 'Date (Oldest)' },
  { value: 'date_desc', label: 'Date (Newest)' },
]

export const PAGE_SIZE = 10
