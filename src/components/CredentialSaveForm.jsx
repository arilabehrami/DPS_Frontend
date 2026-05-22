import { useRef } from 'react'
import { consumePendingCredentials } from '../utils/credentials'

/**
 * Hidden form shown once on dashboard after successful login
 * so the browser can offer to save credentials (not on failed login).
 */
export function CredentialSaveForm() {
  const formRef = useRef(null)
  const credentials = consumePendingCredentials()

  if (!credentials) return null

  return (
    <form
      ref={formRef}
      onSubmit={(e) => e.preventDefault()}
      autoComplete="on"
      className="credential-save-form"
      aria-hidden="true"
      tabIndex={-1}
    >
      <input
        type="text"
        name="username"
        autoComplete="username"
        defaultValue={credentials.email}
        readOnly
      />
      <input
        type="password"
        name="password"
        autoComplete="current-password"
        defaultValue={credentials.password}
        readOnly
      />
    </form>
  )
}
