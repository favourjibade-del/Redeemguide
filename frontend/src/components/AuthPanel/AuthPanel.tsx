import { FormEvent, useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

type AuthMode = 'login' | 'register'

export default function AuthPanel() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const register = useAuthStore((state) => state.register)
  const loginWithGoogle = useAuthStore((state) => state.loginWithGoogle)
  const isLoading = useAuthStore((state) => state.isLoading)
  const error = useAuthStore((state) => state.error)
  const clearError = useAuthStore((state) => state.clearError)
  const [mode, setMode] = useState<AuthMode>('login')
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  })
  const [googleError, setGoogleError] = useState<string | null>(null)
  const googleConfigured = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID)

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    clearError()
    setGoogleError(null)

    if (mode === 'login') {
      await login(form.username, form.password)
      navigate('/dashboard')
      return
    }

    await register(form.username, form.email, form.password, form.firstName, form.lastName)
    await login(form.username, form.password)
    navigate('/dashboard')
  }

  return (
    <section className="auth-panel" aria-label="Account access">
      <div className="auth-toggle" role="tablist" aria-label="Choose account action">
        <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')} type="button">
          Login
        </button>
        <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')} type="button">
          Create account
        </button>
      </div>

      {error && <p className="error">{error}</p>}
      {googleError && <p className="error">{googleError}</p>}

      <form className="auth-form" onSubmit={handleSubmit}>
        {mode === 'register' && (
          <div className="auth-form__row">
            <label>
              First name
              <input value={form.firstName} onChange={(event) => updateField('firstName', event.target.value)} required />
            </label>
            <label>
              Last name
              <input value={form.lastName} onChange={(event) => updateField('lastName', event.target.value)} required />
            </label>
          </div>
        )}
        <label>
          Username
          <input value={form.username} onChange={(event) => updateField('username', event.target.value)} required />
        </label>
        {mode === 'register' && (
          <label>
            Email
            <input type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} required />
          </label>
        )}
        <label>
          Password
          <input type="password" value={form.password} onChange={(event) => updateField('password', event.target.value)} required />
        </label>
        <button className="primary-action" type="submit" disabled={isLoading}>
          {isLoading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create account'}
        </button>
      </form>

      <div className="google-login">
        {googleConfigured ? (
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              clearError()
              setGoogleError(null)

              try {
                if (!credentialResponse.credential) {
                  setGoogleError('Google did not return a sign-in credential.')
                  return
                }

                await loginWithGoogle(credentialResponse.credential)
                navigate('/dashboard')
              } catch (err: any) {
                setGoogleError(err.response?.data?.detail || 'Google login failed')
              }
            }}
            onError={() => setGoogleError('Google login was cancelled or failed.')}
          />
        ) : (
          <button className="secondary-action" type="button" disabled>
            Continue with Google
          </button>
        )}
        {!googleConfigured && <span className="auth-note">Set VITE_GOOGLE_CLIENT_ID to enable Google sign-in.</span>}
      </div>
    </section>
  )
}
