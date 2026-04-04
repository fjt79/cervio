'use client'
import { useState, useEffect } from 'react'
import { supabase, Profile } from '@/lib/supabase'
import { useTheme } from '@/components/features/ThemeProvider'
import {
  Sun, Moon, Monitor, Download, Trash2, CreditCard,
  User, Bell, Shield, ChevronRight, AlertTriangle,
  CheckCircle, Eye, EyeOff, Loader
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://cervio.ai'

// ─── Delete Account Modal ─────────────────────────────────────

function DeleteAccountModal({ onClose, userEmail }: { onClose: () => void; userEmail: string }) {
  const [step, setStep] = useState(1)
  const [emailInput, setEmailInput] = useState('')
  const [confirmText, setConfirmText] = useState('')
  const [understood1, setUnderstood1] = useState(false)
  const [understood2, setUnderstood2] = useState(false)
  const [understood3, setUnderstood3] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') {
      toast.error('Please type DELETE exactly')
      return
    }
    setDeleting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/account/delete', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          confirmation_text: confirmText,
          email_confirmed: emailInput,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      toast.success('Account deleted. Goodbye.')
      await supabase.auth.signOut()
      window.location.href = '/'
    } catch (err: any) {
      toast.error(err.message)
      setDeleting(false)
    }
  }

  const canProceedStep2 = understood1 && understood2 && understood3
  const canProceedStep3 = emailInput.toLowerCase() === userEmail.toLowerCase()
  const canDelete = confirmText === 'DELETE'

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 16 }}>
      <div style={{ width: 480, background: 'var(--surface)', borderRadius: 20, border: '0.5px solid var(--border)', boxShadow: 'var(--shadow-lg)', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '0.5px solid var(--border)', background: 'var(--danger-bg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={16} style={{ color: 'white' }} />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--danger)' }}>Delete Account</h2>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            This action is permanent and cannot be undone. All your data will be deleted forever.
          </p>
          {/* Step indicator */}
          <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
            {[1, 2, 3].map(s => (
              <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: step >= s ? 'var(--danger)' : 'var(--border-strong)' }} />
            ))}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>Step {step} of 3</div>
        </div>

        <div style={{ padding: '20px 24px 24px' }}>

          {/* Step 1 — Understand consequences */}
          {step === 1 && (
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>
                Before you continue, understand what will be deleted:
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                {[
                  { label: 'All your goals and progress tracking', key: 'understood1', state: understood1, set: setUnderstood1 },
                  { label: 'All briefings, decisions, and meeting preps', key: 'understood2', state: understood2, set: setUnderstood2 },
                  { label: 'All stakeholders, weekly reviews, board updates, and calendar events', key: 'understood3', state: understood3, set: setUnderstood3 },
                ].map(item => (
                  <label key={item.key} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}>
                    <div
                      onClick={() => item.set(!item.state)}
                      style={{ width: 20, height: 20, borderRadius: 6, border: `1.5px solid ${item.state ? 'var(--danger)' : 'var(--border-strong)'}`, background: item.state ? 'var(--danger)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1, cursor: 'pointer', transition: 'all 0.15s' }}
                    >
                      {item.state && <CheckCircle size={12} style={{ color: 'white' }} />}
                    </div>
                    <span style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.5 }}>
                      I understand that <strong>{item.label}</strong> will be permanently deleted
                    </span>
                  </label>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={onClose} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                <button
                  onClick={() => setStep(2)}
                  disabled={!canProceedStep2}
                  style={{ flex: 1, background: canProceedStep2 ? 'var(--danger)' : 'var(--surface3)', color: canProceedStep2 ? 'white' : 'var(--text-tertiary)', border: 'none', borderRadius: 'var(--radius-md)', padding: '10px 0', fontSize: 15, fontWeight: 600, cursor: canProceedStep2 ? 'pointer' : 'not-allowed', transition: 'all 0.15s' }}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 2 — Confirm email */}
          {step === 2 && (
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Confirm your identity</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.5 }}>
                Type your email address to confirm this is your account.
              </p>
              <div style={{ marginBottom: 8 }}>
                <label className="label">Your email address</label>
                <input
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  placeholder={userEmail}
                  className="input"
                  autoComplete="off"
                />
              </div>
              {emailInput && !canProceedStep3 && (
                <p style={{ fontSize: 12, color: 'var(--danger)', marginBottom: 16 }}>Email doesn't match your account</p>
              )}
              {canProceedStep3 && (
                <p style={{ fontSize: 12, color: 'var(--success)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle size={12} />Email confirmed
                </p>
              )}
              <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
                <button onClick={() => setStep(1)} className="btn-secondary" style={{ flex: 1 }}>Back</button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!canProceedStep3}
                  style={{ flex: 1, background: canProceedStep3 ? 'var(--danger)' : 'var(--surface3)', color: canProceedStep3 ? 'white' : 'var(--text-tertiary)', border: 'none', borderRadius: 'var(--radius-md)', padding: '10px 0', fontSize: 15, fontWeight: 600, cursor: canProceedStep3 ? 'pointer' : 'not-allowed', transition: 'all 0.15s' }}
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* Step 3 — Final confirmation */}
          {step === 3 && (
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--danger)', marginBottom: 8 }}>Final confirmation</h3>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.5 }}>
                Type <strong style={{ color: 'var(--text)', fontFamily: 'monospace' }}>DELETE</strong> in capitals to permanently delete your account and all data.
              </p>
              <div style={{ marginBottom: 20 }}>
                <label className="label">Type DELETE to confirm</label>
                <input
                  value={confirmText}
                  onChange={e => setConfirmText(e.target.value)}
                  placeholder="DELETE"
                  className="input"
                  style={{ fontFamily: 'monospace', fontSize: 16, letterSpacing: 2 }}
                  autoComplete="off"
                />
              </div>
              <div style={{ background: 'var(--danger-bg)', borderRadius: 'var(--radius-md)', padding: '12px 14px', marginBottom: 20, border: '0.5px solid var(--danger)' }}>
                <p style={{ fontSize: 13, color: 'var(--danger)', lineHeight: 1.5 }}>
                  ⚠ This will immediately and permanently delete your account. There is no recovery option. This cannot be reversed.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => setStep(2)} className="btn-secondary" style={{ flex: 1 }}>Back</button>
                <button
                  onClick={handleDelete}
                  disabled={!canDelete || deleting}
                  style={{ flex: 1, background: canDelete && !deleting ? 'var(--danger)' : 'var(--surface3)', color: canDelete && !deleting ? 'white' : 'var(--text-tertiary)', border: 'none', borderRadius: 'var(--radius-md)', padding: '10px 0', fontSize: 15, fontWeight: 600, cursor: canDelete && !deleting ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.15s' }}
                >
                  {deleting ? <><Loader size={14} style={{ animation: 'spin 0.7s linear infinite' }} />Deleting...</> : 'Delete My Account'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Settings Page ───────────────────────────────────────

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [saving, setSaving] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [activeSection, setActiveSection] = useState<string | null>(null)

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
    }
    load()
  }, [])

  const saveProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setSaving(true)
    try {
      await supabase.from('profiles').update(form).eq('id', user.id)
      setProfile(p => p ? { ...p, ...form } : null)
      toast.success('Saved')
      setActiveSection(null)
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const exportData = async () => {
    setExporting(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/account/export', {
        headers: { 'Authorization': `Bearer ${session?.access_token}` },
      })
      if (!res.ok) throw new Error('Export failed')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `cervio-data-export-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Data exported successfully')
    } catch (err: any) {
      toast.error(err.message || 'Export failed')
    } finally {
      setExporting(false)
    }
  }

  const s = (key: string) => ({
    background: 'none', border: 'none', cursor: 'pointer',
    width: '100%', textAlign: 'left' as const,
    padding: '14px 16px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  })

  const THEME_OPTIONS = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ]

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '24px 20px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text)', letterSpacing: -0.5, marginBottom: 24 }}>Settings</h1>

      {/* Appearance */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, paddingLeft: 4 }}>Appearance</h2>
        <div className="list-group">
          <div style={{ padding: '16px', borderBottom: '0.5px solid var(--border)' }}>
            <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)', marginBottom: 12 }}>Theme</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {THEME_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value as any)}
                  style={{ flex: 1, padding: '10px 8px', borderRadius: 'var(--radius-md)', border: `1.5px solid ${theme === opt.value ? 'var(--accent)' : 'var(--border)'}`, background: theme === opt.value ? 'var(--accent-light)' : 'var(--surface2)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, transition: 'all 0.15s' }}
                >
                  <opt.icon size={18} style={{ color: theme === opt.value ? 'var(--accent)' : 'var(--text-secondary)' }} />
                  <span style={{ fontSize: 12, fontWeight: theme === opt.value ? 600 : 400, color: theme === opt.value ? 'var(--accent)' : 'var(--text-secondary)' }}>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Profile */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, paddingLeft: 4 }}>Profile</h2>
        <div className="list-group">
          <button style={s('profile')} onClick={() => setActiveSection(activeSection === 'profile' ? null : 'profile')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={15} style={{ color: 'var(--accent)' }} />
              </div>
              <div>
                <div style={{ fontSize: 15, color: 'var(--text)', fontWeight: 400 }}>Personal Information</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{profile?.full_name || '—'}</div>
              </div>
            </div>
            <ChevronRight size={16} style={{ color: 'var(--text-tertiary)', transform: activeSection === 'profile' ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>
          {activeSection === 'profile' && (
            <div style={{ padding: '0 16px 16px', borderTop: '0.5px solid var(--border)' }}>
              <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { key: 'full_name', label: 'Full name' },
                  { key: 'business_name', label: 'Business name' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="label">{label}</label>
                    <input value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className="input" />
                  </div>
                ))}
                <div>
                  <label className="label">Business description</label>
                  <textarea value={form.business_description} onChange={e => setForm(f => ({ ...f, business_description: e.target.value }))} className="textarea" rows={3} />
                </div>
                <button onClick={saveProfile} disabled={saving} className="btn-primary" style={{ marginTop: 4 }}>
                  {saving ? <><div className="spinner" />Saving...</> : 'Save Changes'}
                </button>
              </div>
            </div>
          )}

          <button style={s('prefs')} onClick={() => setActiveSection(activeSection === 'prefs' ? null : 'prefs')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(52, 199, 89, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bell size={15} style={{ color: 'var(--success)' }} />
              </div>
              <div>
                <div style={{ fontSize: 15, color: 'var(--text)', fontWeight: 400 }}>Preferences</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Briefing time & communication style</div>
              </div>
            </div>
            <ChevronRight size={16} style={{ color: 'var(--text-tertiary)', transform: activeSection === 'prefs' ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>
          {activeSection === 'prefs' && (
            <div style={{ padding: '0 16px 16px', borderTop: '0.5px solid var(--border)' }}>
              <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label className="label">Daily briefing time (24h)</label>
                  <input value={form.briefing_time} onChange={e => setForm(f => ({ ...f, briefing_time: e.target.value }))} className="input" placeholder="07:00" />
                </div>
                <div>
                  <label className="label">Communication style</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[{ value: 'direct', label: 'Direct & concise' }, { value: 'detailed', label: 'Detailed & thorough' }].map(opt => (
                      <button key={opt.value} onClick={() => setForm(f => ({ ...f, communication_style: opt.value }))} style={{ flex: 1, padding: '10px 12px', borderRadius: 'var(--radius-md)', border: `1.5px solid ${form.communication_style === opt.value ? 'var(--accent)' : 'var(--border)'}`, background: form.communication_style === opt.value ? 'var(--accent-light)' : 'var(--surface2)', cursor: 'pointer', fontSize: 13, fontWeight: form.communication_style === opt.value ? 600 : 400, color: form.communication_style === opt.value ? 'var(--accent)' : 'var(--text-secondary)', transition: 'all 0.15s' }}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={saveProfile} disabled={saving} className="btn-primary" style={{ marginTop: 4 }}>
                  {saving ? <><div className="spinner" />Saving...</> : 'Save Preferences'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Billing */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, paddingLeft: 4 }}>Billing</h2>
        <div className="list-group">
          <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255, 149, 0, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CreditCard size={15} style={{ color: 'var(--warning)' }} />
              </div>
              <div>
                <div style={{ fontSize: 15, color: 'var(--text)', fontWeight: 400 }}>Current Plan</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
                  {profile?.subscription_plan === 'trial' ? 'Free Trial' : profile?.subscription_plan || 'Trial'}
                </div>
              </div>
            </div>
            {profile?.subscription_plan === 'trial' ? (
              {/* Current Plan */}
<div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,149,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <CreditCard size={15} style={{ color: 'var(--warning)' }} />
    </div>
    <div>
      <div style={{ fontSize: 15, color: 'var(--text)', fontWeight: 400 }}>Current Plan</div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>
        {profile?.subscription_plan === 'trial' ? 'Free Trial' : profile?.subscription_plan || 'Trial'}
      </div>
    </div>
  </div>
  {profile?.subscription_plan === 'trial' ? (
    <button
      onClick={async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession()
          const res = await fetch('/api/billing/checkout', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session?.access_token}`,
            },
            body: JSON.stringify({ plan: 'solo' }),
          })
          const data = await res.json()
          if (!res.ok) throw new Error(data.error)
          window.location.href = data.url
        } catch (err: any) {
          toast.error(err.message || 'Failed to open billing')
        }
      }}
      style={{ fontSize: 13, color: 'var(--accent)', background: 'var(--accent-light)', border: 'none', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontWeight: 500 }}
    >
      Upgrade →
    </button>
  ) : (
    <button
      onClick={async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession()
          const res = await fetch('/api/billing/portal', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${session?.access_token}` },
          })
          const data = await res.json()
          if (!res.ok) throw new Error(data.error)
          window.location.href = data.url
        } catch (err: any) {
          toast.error(err.message || 'Failed to open billing portal')
        }
      }}
      style={{ fontSize: 13, color: 'var(--accent)', background: 'var(--accent-light)', border: 'none', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontWeight: 500 }}
    >
      Manage billing →
    </button>
  )}
</div>
            ) : (
              <button onClick={async () => {
                const { data: { session } } = await supabase.auth.getSession()
                const res = await fetch('/api/billing/portal', { method: 'POST', headers: { Authorization: `Bearer ${session?.access_token}` } })
                const data = await res.json()
                if (data.url) window.location.href = data.url
              }} style={{ fontSize: 13, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
                Manage billing →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Data & Privacy */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, paddingLeft: 4 }}>Data & Privacy</h2>
        <div className="list-group">
          {/* Export */}
          <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '0.5px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Download size={15} style={{ color: 'var(--accent)' }} />
              </div>
              <div>
                <div style={{ fontSize: 15, color: 'var(--text)', fontWeight: 400 }}>Export Your Data</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Download all your data as JSON</div>
              </div>
            </div>
            <button
              onClick={exportData}
              disabled={exporting}
              style={{ fontSize: 13, color: 'var(--accent)', background: 'var(--accent-light)', border: 'none', borderRadius: 8, padding: '6px 14px', cursor: exporting ? 'not-allowed' : 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, opacity: exporting ? 0.6 : 1 }}
            >
              {exporting ? <><div className="spinner" style={{ width: 12, height: 12 }} />Exporting...</> : <><Download size={13} />Export</>}
            </button>
          </div>

          {/* Privacy policy */}
          <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '0.5px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(175, 82, 222, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={15} style={{ color: 'var(--purple)' }} />
              </div>
              <div style={{ fontSize: 15, color: 'var(--text)', fontWeight: 400 }}>Privacy Policy</div>
            </div>
            <Link href="/privacy" style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'none' }}>View →</Link>
          </div>

          {/* Delete account */}
          <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--danger-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trash2 size={15} style={{ color: 'var(--danger)' }} />
              </div>
              <div>
                <div style={{ fontSize: 15, color: 'var(--danger)', fontWeight: 400 }}>Delete Account</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Permanently delete account & all data</div>
              </div>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              style={{ fontSize: 13, color: 'var(--danger)', background: 'var(--danger-bg)', border: 'none', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontWeight: 500 }}
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* App info */}
      <p style={{ fontSize: 12, color: 'var(--text-tertiary)', textAlign: 'center' }}>
        Cervio v1.0 · Built by Morphotech · cervio.ai
      </p>

      {/* Delete modal */}
      {showDeleteModal && (
        <DeleteAccountModal
          onClose={() => setShowDeleteModal(false)}
          userEmail={profile?.email || ''}
        />
      )}
    </div>
  )
}
