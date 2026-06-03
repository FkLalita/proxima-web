import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ThemeToggle } from '../components/ThemeToggle'
import { ArrowLeft, Loader2, Mail } from 'lucide-react'
import { validate } from '../utils/validate'

function FieldError({ error }) {
  if (!error) return null
  return <p style={{ fontSize: 11, color: '#cc3333', marginTop: 3 }}>{error}</p>
}

export function Auth() {
  const navigate = useNavigate()
  const { signIn, signUp, signInWithGoogle, supabase } = useAuth()
  const [mode, setMode] = useState('signin') // 'signin' | 'signup' | 'magic' | 'verify' | 'magic_sent'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [globalError, setGlobalError] = useState(null)

  function validateForm() {
    const e = {}
    const emailErr = validate.email(email)
    if (emailErr) e.email = emailErr
    if (mode !== 'magic') {
      const passErr = validate.password(password)
      if (passErr) e.password = passErr
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    if (!validateForm()) return
    setLoading(true)
    setGlobalError(null)
    try {
      if (mode === 'magic') {
        await supabase.auth.signInWithOtp({ email: email.trim() })
        setMode('magic_sent')
      } else if (mode === 'signup') {
        await signUp(email.trim(), password)
        setMode('verify')
      } else {
        await signIn(email.trim(), password)
        navigate(-1)
      }
    } catch (e) {
      setGlobalError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setGlobalError(null)
    try {
      await signInWithGoogle()
    } catch (e) {
      setGlobalError(e.message)
    }
  }

  if (mode === 'verify') return (
    <div className="auth-page">
      <div className="auth-topbar">
        <button onClick={() => navigate('/')} className="detail-back"><ArrowLeft size={18} /></button>
        <div className="detail-topbar-logo">
          <div className="logo-mark" style={{ width: 24, height: 24, fontSize: 12 }}>P</div>
          <span className="logo-text" style={{ fontSize: 15 }}>Proxima</span>
        </div>
        <ThemeToggle />
      </div>
      <div className="auth-body">
        <div className="success-icon"><Mail size={28} color="white" /></div>
        <h2 className="add-title">Check your email</h2>
        <p className="add-sub">We sent a verification link to <strong>{email}</strong>. Click it to activate your account then sign in.</p>
        <button onClick={() => setMode('signin')} className="btn-wa" style={{ marginTop: 16, padding: '12px 28px' }}>
          Go to Sign In
        </button>
      </div>
    </div>
  )

  if (mode === 'magic_sent') return (
    <div className="auth-page">
      <div className="auth-topbar">
        <button onClick={() => navigate('/')} className="detail-back"><ArrowLeft size={18} /></button>
        <div className="detail-topbar-logo">
          <div className="logo-mark" style={{ width: 24, height: 24, fontSize: 12 }}>P</div>
          <span className="logo-text" style={{ fontSize: 15 }}>Proxima</span>
        </div>
        <ThemeToggle />
      </div>
      <div className="auth-body">
        <div className="success-icon"><Mail size={28} color="white" /></div>
        <h2 className="add-title">Magic link sent!</h2>
        <p className="add-sub">Check <strong>{email}</strong> for a sign-in link. Click it and you'll be logged in automatically — no password needed.</p>
        <button onClick={() => setMode('signin')} className="btn-call" style={{ marginTop: 16, padding: '12px 28px' }}>
          Use password instead
        </button>
      </div>
    </div>
  )

  return (
    <div className="auth-page">
      <div className="auth-topbar">
        <button onClick={() => navigate(-1)} className="detail-back"><ArrowLeft size={18} /></button>
        <div className="detail-topbar-logo">
          <div className="logo-mark" style={{ width: 24, height: 24, fontSize: 12 }}>P</div>
          <span className="logo-text" style={{ fontSize: 15 }}>Proxima</span>
        </div>
        <ThemeToggle />
      </div>

      <div className="auth-body">
        <div style={{ width: '100%', textAlign: 'left' }}>
          <h2 className="add-title">
            {mode === 'signin' ? 'Welcome back' : mode === 'magic' ? 'Sign in with email' : 'Create account'}
          </h2>
          <p className="add-sub">
            {mode === 'signin' ? 'Sign in to manage your business listing'
              : mode === 'magic' ? 'We\'ll send a magic link to your email'
                : 'List your business on Proxima for free'}
          </p>
        </div>

        <button onClick={handleGoogle} className="auth-google-btn">
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>

        <div className="auth-divider"><span>or</span></div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className={`form-input ${errors.email ? 'form-input--error' : ''}`}
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setErrors(ev => ({ ...ev, email: null })) }}
              placeholder="you@example.com"
              autoComplete="email"
            />
            <FieldError error={errors.email} />
          </div>

          {mode !== 'magic' && (
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className={`form-input ${errors.password ? 'form-input--error' : ''}`}
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setErrors(ev => ({ ...ev, password: null })) }}
                placeholder="••••••••"
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                minLength={6}
              />
              <FieldError error={errors.password} />
              {mode === 'signin' && (
                <button
                  type="button"
                  onClick={() => { setMode('magic'); setErrors({}) }}
                  style={{ fontSize: 11, color: 'var(--accent)', marginTop: 4, textAlign: 'right', width: '100%' }}
                >
                  Forgot password? Send magic link instead
                </button>
              )}
            </div>
          )}

          {globalError && <p className="auth-error">{globalError}</p>}

          <button
            type="submit"
            className="btn-wa"
            style={{ width: '100%', justifyContent: 'center', padding: '13px' }}
            disabled={loading}
          >
            {loading
              ? <><Loader2 size={16} className="spin" /> Please wait…</>
              : mode === 'signin' ? 'Sign In'
                : mode === 'magic' ? 'Send Magic Link'
                  : 'Create Account'
            }
          </button>
        </form>

        {mode === 'magic' ? (
          <p className="auth-switch">
            <button onClick={() => { setMode('signin'); setErrors({}) }} style={{ color: 'var(--accent)', fontWeight: 600 }}>
              ← Back to sign in
            </button>
          </p>
        ) : (
          <p className="auth-switch">
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setErrors({}); setGlobalError(null) }}
              style={{ color: 'var(--accent)', fontWeight: 600 }}
            >
              {mode === 'signin' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        )}
      </div>
    </div>
  )
}
