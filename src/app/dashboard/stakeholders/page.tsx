'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Users, Plus, X, ChevronDown, ChevronUp, Copy, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'

const T = {
  danger: '#c41e1e', dangerBg: 'rgba(196,30,30,0.07)', dangerBorder: 'rgba(196,30,30,0.22)',
  success: '#146c34', successBg: 'rgba(20,108,52,0.07)', successBorder: 'rgba(20,108,52,0.22)',
  accent: '#1d4ed8', accentLight: 'rgba(29,78,216,0.09)', accentMid: 'rgba(29,78,216,0.18)',
  warning: '#a16207', warningBg: 'rgba(161,98,7,0.07)', warningBorder: 'rgba(161,98,7,0.2)',
  shadowSm: '0 2px 6px rgba(10,10,11,0.07)', shadowMd: '0 6px 18px rgba(10,10,11,0.09)',
}

const SENTIMENT_CONFIG: Record<string, { color: string; bg: string; border: string; label: string }> = {
  positive:        { color: T.success, bg: T.successBg, border: T.successBorder, label: 'Positive' },
  neutral:         { color: 'var(--text-tertiary)', bg: 'var(--surface2)', border: 'var(--border)', label: 'Neutral' },
  needs_attention: { color: T.warning, bg: T.warningBg, border: T.warningBorder, label: 'Needs attention' },
  at_risk:         { color: T.danger, bg: T.dangerBg, border: T.dangerBorder, label: 'At risk' },
}

function StakeholderCard({ s, onDelete }: { s: any; onDelete: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [updateMsg, setUpdateMsg] = useState<string | null>(null)
  const sentiment = SENTIMENT_CONFIG[s.sentiment] || SENTIMENT_CONFIG.neutral
  const daysSince = s.last_contact_date ? Math.floor((Date.now() - new Date(s.last_contact_date).getTime()) / 86400000) : null
  const isOverdue = s.next_followup_date && new Date(s.next_followup_date) < new Date()

  const generateUpdate = async () => {
    setGenerating(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/stakeholders/update', { method: 'POST', headers: { 'Authorization': `Bearer ${session?.access_token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ stakeholderId: s.id }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setUpdateMsg(data.message)
    } catch (err: any) { toast.error(err.message) }
    finally { setGenerating(false) }
  }

  return (
    <div style={{ background: 'var(--surface)', border: `1.5px solid ${isOverdue ? T.dangerBorder : s.sentiment === 'at_risk' ? T.dangerBorder : 'var(--border)'}`, borderRadius: 16, overflow: 'hidden', boxShadow: T.shadowSm, marginBottom: 10, transition: 'all 0.15s' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLElement).style.boxShadow = T.shadowMd }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = T.shadowSm }}>

      {isOverdue && (
        <div style={{ background: T.danger, padding: '5px 18px', fontSize: 11, fontWeight: 700, color: 'white', letterSpacing: 0.3 }}>
          FOLLOW-UP OVERDUE
        </div>
      )}

      <button onClick={() => setExpanded(!expanded)} style={{ width: '100%', padding: '18px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          {/* Avatar */}
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: T.accentLight, border: `1px solid ${T.accentMid}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 16, fontWeight: 700, color: T.accent }}>
            {s.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5, flexWrap: 'wrap' as const }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', letterSpacing: -0.2 }}>{s.name}</div>
              {s.importance >= 4 && <span style={{ fontSize: 10, fontWeight: 800, padding: '1px 7px', borderRadius: 100, background: T.dangerBg, color: T.danger, border: `1px solid ${T.dangerBorder}` }}>KEY</span>}
              <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 100, background: sentiment.bg, color: sentiment.color, border: `1px solid ${sentiment.border}`, textTransform: 'capitalize' }}>{sentiment.label}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' as const }}>
              {s.role && <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s.role}</span>}
              {s.company && <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>· {s.company}</span>}
              {daysSince !== null && <span style={{ fontSize: 12, color: daysSince > 30 ? T.danger : daysSince > 14 ? T.warning : 'var(--text-tertiary)' }}>Last contact {daysSince === 0 ? 'today' : `${daysSince}d ago`}</span>}
            </div>
          </div>
          <div style={{ flexShrink: 0 }}>
            <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 100, background: 'var(--surface2)', color: 'var(--text-tertiary)', border: '1px solid var(--border)', textTransform: 'capitalize' }}>{s.relationship_type}</span>
          </div>
        </div>
      </button>

      {expanded && (
        <div style={{ padding: '0 20px 18px', borderTop: '1px solid var(--border)' }}>
          <div style={{ paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 13 }}>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' as const }}>
              {s.email && <a href={`mailto:${s.email}`} style={{ fontSize: 12, color: T.accent, padding: '5px 12px', background: T.accentLight, borderRadius: 8, border: `1px solid ${T.accentMid}`, textDecoration: 'none', fontWeight: 600 }}>✉ {s.email}</a>}
              {s.next_followup_date && <span style={{ fontSize: 12, color: isOverdue ? T.danger : 'var(--text-secondary)', padding: '5px 12px', background: isOverdue ? T.dangerBg : 'var(--surface2)', borderRadius: 8, border: `1px solid ${isOverdue ? T.dangerBorder : 'var(--border)'}` }}>Follow-up: {new Date(s.next_followup_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}</span>}
              {s.contact_frequency && <span style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '5px 12px', background: 'var(--surface2)', borderRadius: 8, border: '1px solid var(--border)', textTransform: 'capitalize' }}>📅 {s.contact_frequency}</span>}
            </div>

            {s.notes && (
              <div style={{ padding: '12px 14px', background: 'var(--surface2)', borderRadius: 11, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.9, marginBottom: 6 }}>Notes</div>
                <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.65 }}>{s.notes}</p>
              </div>
            )}

            {s.interactions?.length > 0 && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.9, marginBottom: 9 }}>Recent Interactions</div>
                {s.interactions.slice(0, 3).map((int: any, i: number) => (
                  <div key={i} style={{ padding: '10px 13px', background: 'var(--surface2)', borderRadius: 10, border: '1px solid var(--border)', marginBottom: 7 }}>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{int.date ? new Date(int.date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }) : '—'}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: T.accent, textTransform: 'capitalize' }}>{int.type}</span>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.55 }}>{int.summary}</p>
                  </div>
                ))}
              </div>
            )}

            {updateMsg && (
              <div style={{ padding: '13px 15px', background: T.accentLight, borderRadius: 12, border: `1px solid ${T.accentMid}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: T.accent, textTransform: 'uppercase', letterSpacing: 0.9 }}>Suggested message</div>
                  <button onClick={() => { navigator.clipboard.writeText(updateMsg); toast.success('Copied') }} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 7, fontSize: 11, fontWeight: 600, cursor: 'pointer', color: 'var(--text-secondary)' }}>
                    <Copy size={11} />Copy
                  </button>
                </div>
                <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.65 }}>{updateMsg}</p>
              </div>
            )}

            <div style={{ display: 'flex', gap: 9 }}>
              <button onClick={generateUpdate} disabled={generating} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 0', background: T.accentLight, color: T.accent, border: `1px solid ${T.accentMid}`, borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer', opacity: generating ? 0.6 : 1 }}>
                <MessageSquare size={13} />{generating ? 'Generating...' : 'Draft message'}
              </button>
              <button onClick={() => onDelete(s.id)} style={{ padding: '9px 16px', background: T.dangerBg, color: T.danger, border: `1px solid ${T.dangerBorder}`, borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                <X size={12} />Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function NewStakeholderModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ name: '', role: '', company: '', email: '', relationship_type: 'partner', importance: '3', sentiment: 'neutral', contact_frequency: 'monthly', notes: '' })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Name required'); return }
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { error } = await supabase.from('stakeholders').insert({ user_id: user.id, ...form, importance: Number(form.importance), interactions: [], created_at: new Date().toISOString() })
      if (error) throw error
      toast.success('Stakeholder added')
      onCreated(); onClose()
    } catch (err: any) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  const inp = { width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', fontSize: 15, color: 'var(--text)', fontFamily: 'inherit', outline: 'none' } as React.CSSProperties

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width: 520, maxHeight: '90vh', background: 'var(--surface)', border: '1px solid var(--border-strong)', borderRadius: 20, boxShadow: '0 32px 80px rgba(0,0,0,0.2)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>Add stakeholder</div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--surface2)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}><X size={14} /></button>
        </div>
        <div style={{ padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[['name', 'Name', 'Full name', false], ['role', 'Role', 'e.g. Lead Investor', false], ['company', 'Company', 'Organisation', false], ['email', 'Email', 'email@company.com', false], ['notes', 'Notes', 'Context about this relationship...', true]].map(([k, label, ph, multi]: any) => (
            <div key={k}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.6 }}>{label}</label>
              {multi ? <textarea rows={3} placeholder={ph} value={(form as any)[k]} onChange={e => setForm(f => ({...f, [k]: e.target.value}))} style={{ ...inp, resize: 'vertical' }} /> : <input placeholder={ph} value={(form as any)[k]} onChange={e => setForm(f => ({...f, [k]: e.target.value}))} style={inp} />}
            </div>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[['relationship_type', 'Type', ['investor', 'board', 'client', 'partner', 'advisor', 'team', 'other']], ['sentiment', 'Sentiment', ['positive', 'neutral', 'needs_attention', 'at_risk']], ['contact_frequency', 'Contact frequency', ['weekly', 'biweekly', 'monthly', 'quarterly']]].map(([k, label, opts]: any) => (
              <div key={k}>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.6 }}>{label}</label>
                <select value={(form as any)[k]} onChange={e => setForm(f => ({...f, [k]: e.target.value}))} style={{ ...inp, cursor: 'pointer' }}>
                  {opts.map((o: string) => <option key={o} value={o}>{o.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
                </select>
              </div>
            ))}
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.6 }}>Importance (1–5)</label>
              <select value={form.importance} onChange={e => setForm(f => ({...f, importance: e.target.value}))} style={{ ...inp, cursor: 'pointer' }}>
                {[['5','5 — Critical'],['4','4 — High'],['3','3 — Medium'],['2','2 — Low'],['1','1 — Minimal']].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', flexShrink: 0, display: 'flex', gap: 10 }}>
          <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: '12px 0', background: T.accent, color: 'white', border: 'none', borderRadius: 11, fontSize: 15, fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>{saving ? 'Saving...' : 'Add stakeholder'}</button>
          <button onClick={onClose} style={{ padding: '12px 20px', background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 11, fontSize: 15, cursor: 'pointer' }}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

export default function StakeholdersPage() {
  const [stakeholders, setStakeholders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [filter, setFilter] = useState('all')

  useEffect(() => { loadStakeholders() }, [])

  const loadStakeholders = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('stakeholders').select('*').eq('user_id', user.id).order('importance', { ascending: false })
    setStakeholders(data || [])
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    await supabase.from('stakeholders').delete().eq('id', id)
    setStakeholders(prev => prev.filter(s => s.id !== id))
    toast.success('Removed')
  }

  const filtered = filter === 'all' ? stakeholders : stakeholders.filter(s => s.sentiment === filter || s.relationship_type === filter)
  const atRisk = stakeholders.filter(s => s.sentiment === 'at_risk' || s.sentiment === 'needs_attention').length
  const overdue = stakeholders.filter(s => s.next_followup_date && new Date(s.next_followup_date) < new Date()).length

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '28px 28px 120px' }}>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <Users size={22} style={{ color: T.accent }} />
            <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)', letterSpacing: -0.8 }}>Stakeholders</h1>
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>Relationship intelligence for people who matter</p>
        </div>
        <button onClick={() => setShowNew(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', background: T.accent, color: 'white', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(29,78,216,0.3)' }}>
          <Plus size={15} />Add Stakeholder
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 24 }}>
        {[
          { label: 'Total', value: stakeholders.length, color: 'var(--text)' },
          { label: 'Needs attention', value: atRisk, color: atRisk > 0 ? T.danger : 'var(--text-tertiary)' },
          { label: 'Follow-up overdue', value: overdue, color: overdue > 0 ? T.danger : 'var(--text-tertiary)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--surface)', borderRadius: 14, padding: '16px', border: '1px solid var(--border)', boxShadow: T.shadowSm }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color, letterSpacing: -0.8 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' as const }}>
        {[['all', 'All'], ['investor', 'Investors'], ['client', 'Clients'], ['advisor', 'Advisors'], ['at_risk', 'At risk'], ['needs_attention', 'Needs attention']].map(([k, label]) => (
          <button key={k} onClick={() => setFilter(k)} style={{ padding: '6px 14px', borderRadius: 100, border: `1.5px solid ${filter === k ? T.accent : 'var(--border)'}`, background: filter === k ? T.accentLight : 'var(--surface2)', color: filter === k ? T.accent : 'var(--text-secondary)', fontSize: 13, fontWeight: filter === k ? 700 : 500, cursor: 'pointer', transition: 'all 0.12s' }}>{label}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>Loading stakeholders...</div>
      ) : filtered.length === 0 ? (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 14 }}>◈</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>No stakeholders yet</div>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>Track investors, clients, advisors, and key partners. Cervio will remind you when relationships go cold.</p>
          <button onClick={() => setShowNew(true)} style={{ padding: '10px 22px', background: T.accent, color: 'white', border: 'none', borderRadius: 11, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Add first stakeholder</button>
        </div>
      ) : (
        filtered.map(s => <StakeholderCard key={s.id} s={s} onDelete={handleDelete} />)
      )}

      {showNew && <NewStakeholderModal onClose={() => setShowNew(false)} onCreated={loadStakeholders} />}
    </div>
  )
}
