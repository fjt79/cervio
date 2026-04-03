'use client'
import { useState, useEffect } from 'react'
import { supabase, Profile } from '@/lib/supabase'
import { PLANS } from '@/lib/stripe'
import { CheckCircle, CreditCard, User, Bell } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [upgradingPlan, setUpgradingPlan] = useState<string | null>(null)

  const [form, setForm] = useState({
    full_name: '',
    business_name: '',
    business_description: '',
    briefing_time: '07:00',
    communication_style: 'direct',
  })

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setProfile(data)
        setForm({
          full_name: data.full_name || '',
          business_name: data.business_name || '',
          business_description: data.business_description || '',
          briefing_time: data.briefing_time?.substring(0, 5) || '07:00',
          communication_style: data.communication_style || 'direct',
        })
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { error } = await supabase.from('profiles').update(form).eq('id', user.id)
      if (error) throw error
      setProfile(p => p ? { ...p, ...form } : null)
      toast.success('Settings saved!')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleUpgrade = async (plan: string) => {
    setUpgradingPlan(plan)
    try {
      const res = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      window.location.href = data.url
    } catch (err: any) {
      toast.error(err.message)
      setUpgradingPlan(null)
    }
  }

  const handleManageBilling = async () => {
    try {
      const res = await fetch('/api/billing/portal', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      window.location.href = data.url
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const trialDaysLeft = profile?.trial_ends_at
    ? Math.max(0, Math.ceil((new Date(profile.trial_ends_at).getTime() - Date.now()) / 86400000))
    : 0

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"><div className="spinner" style={{ width: 32, height: 32 }} /></div>
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold mb-1">Settings</h1>
        <p className="text-muted text-sm">Manage your account, preferences, and billing.</p>
      </div>

      <div className="space-y-8">
        {/* Profile */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <User size={16} className="text-accent" />
            <h2 className="font-display text-xl font-bold">Profile</h2>
          </div>
          <form onSubmit={handleSave} className="card space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Full name</label>
                <input className="input" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
              </div>
              <div>
                <label className="label">Business name</label>
                <input className="input" value={form.business_name} onChange={e => setForm(f => ({ ...f, business_name: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="label">Business description</label>
              <textarea className="textarea min-h-[80px]" value={form.business_description} onChange={e => setForm(f => ({ ...f, business_description: e.target.value }))} />
            </div>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </section>

        {/* Preferences */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Bell size={16} className="text-accent" />
            <h2 className="font-display text-xl font-bold">Preferences</h2>
          </div>
          <div className="card space-y-4">
            <div>
              <label className="label">Daily briefing time</label>
              <input type="time" className="input max-w-xs" value={form.briefing_time} onChange={e => setForm(f => ({ ...f, briefing_time: e.target.value }))} />
              <p className="text-xs text-muted mt-1">Cervio generates your daily briefing at this time.</p>
            </div>
            <div>
              <label className="label">Communication style</label>
              <div className="grid grid-cols-2 gap-3 max-w-sm">
                {[
                  { value: 'direct', label: 'Direct & concise' },
                  { value: 'detailed', label: 'Detailed & thorough' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, communication_style: opt.value }))}
                    className={`p-3 rounded-xl border text-sm transition-all ${
                      form.communication_style === opt.value
                        ? 'border-accent bg-accent/5 text-text'
                        : 'border-border bg-surface2 text-muted hover:border-accent/40'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={handleSave} disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </section>

        {/* Billing */}
        <section id="billing">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard size={16} className="text-accent" />
            <h2 className="font-display text-xl font-bold">Billing</h2>
          </div>

          {/* Current plan */}
          <div className="card mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Current Plan</span>
              <span className="badge border-accent/30 text-accent bg-accent/10 capitalize">
                {profile?.subscription_plan || 'Trial'}
              </span>
            </div>
            {profile?.subscription_plan === 'trial' && (
              <p className="text-muted text-sm">
                {trialDaysLeft > 0
                  ? `${trialDaysLeft} days remaining in your free trial.`
                  : 'Your free trial has expired. Upgrade to continue.'}
              </p>
            )}
            {profile?.subscription_status === 'active' && (
              <button onClick={handleManageBilling} className="btn-ghost text-sm mt-2 px-0 hover:text-accent">
                Manage billing →
              </button>
            )}
          </div>

          {/* Plan options */}
          {profile?.subscription_plan === 'trial' && (
            <div className="grid md:grid-cols-3 gap-4">
              {Object.entries(PLANS).map(([key, plan]) => (
                <div key={key} className={`card relative ${key === 'pro' ? 'border-accent glow-accent' : ''}`}>
                  {key === 'pro' && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-bg text-xs font-bold px-3 py-1 rounded-full">
                      Popular
                    </div>
                  )}
                  <div className="text-center mb-4">
                    <p className="text-xs text-muted uppercase tracking-wider mb-2">{plan.name}</p>
                    <div className="font-display text-3xl font-bold">${plan.price}</div>
                    <div className="text-muted text-xs">/month</div>
                  </div>
                  <ul className="space-y-2 mb-4">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-xs text-muted">
                        <CheckCircle size={12} className="text-success flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => handleUpgrade(key)}
                    disabled={upgradingPlan === key}
                    className={`w-full py-2 rounded-xl text-sm font-semibold transition-all ${
                      key === 'pro'
                        ? 'bg-accent text-bg hover:bg-accent/90'
                        : 'bg-surface2 text-text border border-border hover:border-accent/40'
                    }`}
                  >
                    {upgradingPlan === key ? 'Loading...' : `Upgrade to ${plan.name}`}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
