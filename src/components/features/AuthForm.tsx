'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'

interface AuthFormProps {
  mode: 'login' | 'signup'
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name },
            emailRedirectTo: `${window.location.origin}/onboarding`,
          },
        })
        if (error) throw error
        toast.success('Check your email to confirm your account!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/dashboard')
      }
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    setGoogleLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (err: any) {
      toast.error(err.message)
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      {/* Background effect */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent2/6 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-muted hover:text-text text-sm mb-6 transition-colors">
            <ArrowLeft size={14} />
            Back to home
          </Link>
          <div className="font-display text-3xl font-bold text-accent">Cervio</div>
          <p className="text-muted text-sm mt-2">
            {mode === 'signup' ? 'Start your 14-day free trial' : 'Welcome back'}
          </p>
        </div>

        <div className="card">
          {/* Google SSO */}
          <button
            onClick={handleGoogleAuth}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-border bg-surface2 text-text text-sm font-medium hover:border-accent/40 transition-all mb-6 disabled:opacity-50"
          >
            {googleLoading ? (
              <div className="spinner" />
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18">
                <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
                <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z"/>
              </svg>
            )}
            Continue with Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs text-muted bg-surface px-3">
              or continue with email
            </div>
          </div>

          {/* Email form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="label">Full name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="input"
                  placeholder="Freddy Elturk"
                  required
                />
              </div>
            )}

            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input"
                placeholder="you@company.com"
                required
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input pr-12"
                  placeholder="Minimum 8 characters"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {mode === 'login' && (
              <div className="text-right">
                <Link href="/auth/forgot-password" className="text-xs text-muted hover:text-accent transition-colors">
                  Forgot password?
                </Link>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="spinner" />
                  {mode === 'signup' ? 'Creating account...' : 'Signing in...'}
                </span>
              ) : (
                mode === 'signup' ? 'Create free account' : 'Sign in'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-muted mt-6">
            {mode === 'signup' ? (
              <>Already have an account? <Link href="/auth/login" className="text-accent hover:underline">Sign in</Link></>
            ) : (
              <>Don't have an account? <Link href="/auth/signup" className="text-accent hover:underline">Start free trial</Link></>
            )}
          </p>

          {mode === 'signup' && (
            <p className="text-center text-xs text-muted mt-4 leading-relaxed">
              By signing up, you agree to our{' '}
              <Link href="/terms" className="text-accent hover:underline">Terms</Link>
              {' '}and{' '}
              <Link href="/privacy" className="text-accent hover:underline">Privacy Policy</Link>.
              14-day free trial. No credit card required.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
