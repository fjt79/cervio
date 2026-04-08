'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'

export default function AuthPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        setTimeout(() => { window.location.href = '/dashboard' }, 500)
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setSuccess('Check your email to confirm your account.')
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` }
      })
      if (error) throw error
    } catch (err: any) {
      setError(err.message)
      setGoogleLoading(false)
    }
  }

  return (
    <>
      <style suppressHydrationWarning>{`
        .auth-root {
          min-height: 100vh;
          display: flex; align-items: center; justify-content: center;
          font-family: 'DM Sans', -apple-system, sans-serif;
          -webkit-font-smoothing: antialiased;
          position: relative; overflow: hidden;
          background: #080810;
          padding: 24px;
        }

        /* Layered background */
        .auth-root::before {
          content: '';
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 50% -10%, rgba(29,78,216,0.18) 0%, transparent 65%),
            radial-gradient(ellipse 50% 40% at 80% 80%, rgba(91,33,182,0.1) 0%, transparent 60%),
            radial-gradient(ellipse 40% 30% at 20% 70%, rgba(29,78,216,0.07) 0%, transparent 60%);
          pointer-events: none;
        }

        /* Noise grain */
        .auth-root::after {
          content: '';
          position: absolute; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
          background-size: 256px;
          pointer-events: none; opacity: 0.5;
        }

        .auth-panel {
          width: 100%; max-width: 440px;
          position: relative; z-index: 1;
          background: rgba(12,12,18,0.85);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 22px;
          padding: 44px 44px 40px;
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.03),
            0 32px 80px rgba(0,0,0,0.6),
            0 8px 24px rgba(0,0,0,0.4),
            inset 0 1px 0 rgba(255,255,255,0.06);
          backdrop-filter: blur(24px);
        }

        /* Ambient glow behind panel */
        .auth-glow {
          position: absolute; z-index: 0;
          width: 400px; height: 300px;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          background: radial-gradient(ellipse, rgba(29,78,216,0.12) 0%, transparent 70%);
          filter: blur(40px);
          pointer-events: none;
        }

        /* Back link */
        .auth-back {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 13px; color: rgba(240,239,233,0.35);
          text-decoration: none; margin-bottom: 36px;
          transition: color 0.15s;
          letter-spacing: -0.1px;
        }
        .auth-back:hover { color: rgba(240,239,233,0.65); }

        /* Brand */
        .auth-brand { text-align: center; margin-bottom: 36px; }

        .auth-logo {
          display: inline-flex; align-items: center; gap: 10px;
          margin-bottom: 16px; text-decoration: none;
        }

        .auth-logo-name {
          font-size: 22px; font-weight: 700;
          color: #f0efe9; letter-spacing: -0.5px;
        }

        .auth-tagline {
          font-size: 15px; font-weight: 400;
          color: rgba(240,239,233,0.42);
          letter-spacing: -0.1px;
        }

        /* Google button */
        .auth-google {
          width: 100%; padding: 13px 20px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          font-size: 14px; font-weight: 600;
          color: rgba(240,239,233,0.82);
          cursor: pointer;
          transition: all 0.15s;
          font-family: inherit;
          letter-spacing: -0.1px;
          margin-bottom: 24px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        .auth-google:hover:not(:disabled) {
          background: rgba(255,255,255,0.09);
          border-color: rgba(255,255,255,0.16);
          transform: translateY(-1px);
          box-shadow: 0 4px 14px rgba(0,0,0,0.3);
        }
        .auth-google:disabled { opacity: 0.5; cursor: not-allowed; }

        /* Divider */
        .auth-divider {
          display: flex; align-items: center; gap: 14px;
          margin-bottom: 24px;
        }
        .auth-divider-line {
          flex: 1; height: 1px;
          background: rgba(255,255,255,0.08);
        }
        .auth-divider-text {
          font-size: 12px; color: rgba(240,239,233,0.3);
          font-weight: 500; letter-spacing: 0.3px;
          white-space: nowrap;
        }

        /* Form */
        .auth-form { display: flex; flex-direction: column; gap: 14px; }

        .auth-field { display: flex; flex-direction: column; gap: 7px; }

        .auth-label {
          font-size: 12px; font-weight: 600;
          color: rgba(240,239,233,0.45);
          letter-spacing: 0.3px; text-transform: uppercase;
        }

        .auth-input-wrap { position: relative; }

        .auth-input {
          width: 100%; padding: 13px 16px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 11px;
          font-size: 15px; font-weight: 400;
          color: #f0efe9;
          font-family: inherit;
          transition: all 0.15s;
          outline: none;
          -webkit-appearance: none;
        }
        .auth-input::placeholder { color: rgba(240,239,233,0.22); }
        .auth-input:focus {
          background: rgba(255,255,255,0.07);
          border-color: rgba(29,78,216,0.6);
          box-shadow: 0 0 0 3px rgba(29,78,216,0.12), 0 2px 8px rgba(0,0,0,0.2);
        }
        .auth-input.has-icon { padding-right: 46px; }

        /* Password toggle */
        .auth-eye {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: rgba(240,239,233,0.3); padding: 4px;
          transition: color 0.15s; display: flex; align-items: center;
        }
        .auth-eye:hover { color: rgba(240,239,233,0.6); }

        /* Forgot */
        .auth-forgot {
          text-align: right;
          margin-top: -6px;
        }
        .auth-forgot a {
          font-size: 12px; color: rgba(240,239,233,0.35);
          text-decoration: none; transition: color 0.15s;
          font-weight: 500;
        }
        .auth-forgot a:hover { color: rgba(240,239,233,0.65); }

        /* Submit */
        .auth-submit {
          width: 100%; padding: 14px 0; margin-top: 6px;
          background: #1d4ed8;
          border: none; border-radius: 12px;
          font-size: 15px; font-weight: 700;
          color: white; font-family: inherit;
          cursor: pointer;
          transition: all 0.15s;
          letter-spacing: -0.2px;
          box-shadow: 0 3px 12px rgba(29,78,216,0.35), 0 1px 3px rgba(29,78,216,0.2);
        }
        .auth-submit:hover:not(:disabled) {
          background: #1e40af;
          box-shadow: 0 5px 18px rgba(29,78,216,0.45);
          transform: translateY(-1px);
        }
        .auth-submit:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(29,78,216,0.3);
        }
        .auth-submit:disabled {
          opacity: 0.55; cursor: not-allowed; transform: none;
        }

        /* Error / success */
        .auth-error {
          padding: 11px 14px;
          background: rgba(196,30,30,0.1);
          border: 1px solid rgba(196,30,30,0.25);
          border-radius: 10px;
          font-size: 13px; font-weight: 500;
          color: #fca5a5; line-height: 1.5;
          margin-top: 4px;
        }
        .auth-success {
          padding: 11px 14px;
          background: rgba(20,108,52,0.1);
          border: 1px solid rgba(20,108,52,0.25);
          border-radius: 10px;
          font-size: 13px; font-weight: 500;
          color: #86efac; line-height: 1.5;
          margin-top: 4px;
        }

        /* Mode toggle */
        .auth-toggle {
          text-align: center; margin-top: 28px;
          font-size: 14px; color: rgba(240,239,233,0.35);
          font-weight: 400;
        }
        .auth-toggle button {
          background: none; border: none; cursor: pointer;
          color: #60a5fa; font-size: 14px;
          font-weight: 600; font-family: inherit;
          padding: 0 0 0 5px;
          transition: color 0.15s;
          letter-spacing: -0.1px;
        }
        .auth-toggle button:hover { color: #93c5fd; }

        /* Spinner */
        @keyframes authSpin { to { transform: rotate(360deg); } }
        .auth-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.25);
          border-top-color: white;
          border-radius: 50%;
          animation: authSpin 0.6s linear infinite;
          flex-shrink: 0;
        }

        /* Input autofill fix */
        .auth-input:-webkit-autofill,
        .auth-input:-webkit-autofill:hover,
        .auth-input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px rgba(20,20,32,0.95) inset;
          -webkit-text-fill-color: #f0efe9;
          transition: background-color 5000s ease-in-out 0s;
        }
      `}</style>

      <div className="auth-root">
        <div className="auth-glow" />

        <div className="auth-panel">
          {/* Back */}
          <Link href="/" className="auth-back">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to home
          </Link>

          {/* Brand */}
          <div className="auth-brand">
            <Link href="/" className="auth-logo">
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <circle cx="14" cy="14" r="13" fill="rgba(29,78,216,0.15)"/>
                <circle cx="14" cy="5.5" r="2.2" fill="#60a5fa"/>
                <circle cx="7" cy="20" r="2.2" fill="#60a5fa"/>
                <circle cx="21" cy="20" r="2.2" fill="#60a5fa"/>
                <circle cx="14" cy="14" r="3.4" fill="#3b82f6"/>
                <line x1="14" y1="7.7" x2="14" y2="10.6" stroke="#3b82f6" strokeWidth="1.4" strokeLinecap="round"/>
                <line x1="8.8" y1="18.2" x2="11.5" y2="16.2" stroke="#3b82f6" strokeWidth="1.4" strokeLinecap="round"/>
                <line x1="19.2" y1="18.2" x2="16.5" y2="16.2" stroke="#3b82f6" strokeWidth="1.4" strokeLinecap="round"/>
                <circle cx="14" cy="14" r="1.2" fill="white" fillOpacity="0.95"/>
              </svg>
              <span className="auth-logo-name">Cervio</span>
            </Link>
            <p className="auth-tagline">
              {mode === 'login' ? 'Continue operating.' : 'Start operating.'}
            </p>
          </div>

          {/* Google */}
          <button className="auth-google" onClick={handleGoogle} disabled={googleLoading}>
            {googleLoading ? (
              <div className="auth-spinner" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.01c-.72.48-1.63.76-2.7.76-2.07 0-3.83-1.4-4.46-3.29H1.82v2.07A8 8 0 0 0 8.98 17z"/>
                <path fill="#FBBC05" d="M4.52 10.52A4.8 4.8 0 0 1 4.27 9c0-.52.09-1.02.25-1.52V5.41H1.82A8 8 0 0 0 .98 9c0 1.29.31 2.51.84 3.59l2.7-2.07z"/>
                <path fill="#EA4335" d="M8.98 3.58c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.82 5.4l2.7 2.07c.63-1.89 2.4-3.3 4.46-3.3z"/>
              </svg>
            )}
            {googleLoading ? 'Connecting...' : 'Continue with Google'}
          </button>

          {/* Divider */}
          <div className="auth-divider">
            <div className="auth-divider-line" />
            <span className="auth-divider-text">or with email</span>
            <div className="auth-divider-line" />
          </div>

          {/* Form */}
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label className="auth-label">Email</label>
              <input
                className="auth-input"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="auth-field">
              <label className="auth-label">Password</label>
              <div className="auth-input-wrap">
                <input
                  className="auth-input has-icon"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                />
                <button type="button" className="auth-eye" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {mode === 'login' && (
              <div className="auth-forgot">
                <a href="/auth/forgot-password">Forgot password?</a>
              </div>
            )}

            {error && <div className="auth-error">{error}</div>}
            {success && <div className="auth-success">{success}</div>}

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <div className="auth-spinner" />
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : (
                mode === 'login' ? 'Enter Cervio' : 'Start Operating'
              )}
            </button>
          </form>

          {/* Toggle */}
          <div className="auth-toggle">
            {mode === 'login' ? (
              <>Don't have an account?<button onClick={() => { setMode('signup'); setError(''); setSuccess('') }}>Start free trial</button></>
            ) : (
              <>Already have an account?<button onClick={() => { setMode('login'); setError(''); setSuccess('') }}>Sign in</button></>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
