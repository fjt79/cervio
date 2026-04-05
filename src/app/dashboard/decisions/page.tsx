'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Zap, ChevronDown, ChevronUp, X, CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

const T = {
  danger: '#c41e1e', dangerBg: 'rgba(196,30,30,0.07)', dangerBorder: 'rgba(196,30,30,0.22)',
  success: '#146c34', successBg: 'rgba(20,108,52,0.07)', successBorder: 'rgba(20,108,52,0.22)',
  accent: '#1d4ed8', accentLight: 'rgba(29,78,216,0.09)', accentMid: 'rgba(29,78,216,0.18)',
  warning: '#a16207', warningBg: 'rgba(161,98,7,0.07)', warningBorder: 'rgba(161,98,7,0.2)',
  shadowSm: '0 2px 6px rgba(10,10,11,0.07)', shadowMd: '0 6px 18px rgba(10,10,11,0.09)',
}

const RISK_COLORS: Record<string, any> = {
  low:    { color: T.success, bg: T.successBg, border: T.successBorder },
  medium: { color: T.warning, bg: T.warningBg, border: T.warningBorder },
  high:   { color: T.danger,  bg: T.dangerBg,  border: T.dangerBorder },
}

function DecisionCard({ decision, onDelete }: { decision: any; onDelete: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false)
  const risk = RISK_COLORS[decision.risk_level] || RISK_COLORS.low
  const statusColor = decision.status === 'approved' ? T.success : decision.status === 'rejected' ? T.danger : decision.status === 'pending' ? T.warning : T.accent

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', boxShadow: T.shadowSm, marginBottom: 10, transition: 'all 0.15s' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLElement).style.boxShadow = T.shadowMd }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = T.shadowSm }}>

      <button onClick={() => setExpanded(!expanded)} style={{ width: '100%', padding: '18px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7, flexWrap: 'wrap' as const }}>
              {decision.risk_level && (
                <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 100, background: risk.bg, color: risk.color, border: `1px solid ${risk.border}`, textTransform: 'capitalize' as const }}>{decision.risk_level} risk</span>
              )}
              <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 100, background: statusColor + '15', color: statusColor, border: `1px solid ${statusColor}25`, textTransform: 'capitalize' as const }}>{decision.status || 'pending'}</span>
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', lineHeight: 1.35, marginBottom: 5, letterSpacing: -0.2 }}>{decision.title}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.55 }}>{decision.context || decision.description}</div>
          </div>
          <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column' as const, alignItems: 'flex-end', gap: 6 }}>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', whiteSpace: 'nowrap' as const }}>
              <Clock size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
              {decision.created_at ? new Date(decision.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }) : '—'}
            </div>
            {expanded ? <ChevronUp size={14} style={{ color: 'var(--text-tertiary)' }} /> : <ChevronDown size={14} style={{ color: 'var(--text-tertiary)' }} />}
          </div>
        </div>
      </button>

      {expanded && (
        <div style={{ padding: '0 20px 18px', borderTop: '1px solid var(--border)' }}>
          <div style={{ paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {decision.options && decision.options.length > 0 && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.9, marginBottom: 10 }}>Options Considered</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {decision.options.map((opt: any, i: number) => (
                    <div key={i} style={{ padding: '11px 14px', background: 'var(--surface2)', borderRadius: 11, border: '1px solid var(--border)', fontSize: 13, color: 'var(--text)', lineHeight: 1.6 }}>
                      <span style={{ fontWeight: 700 }}>{opt.label || `Option ${i + 1}`}:</span> {opt.description || opt}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {decision.recommendation && (
              <div style={{ padding: '13px 16px', background: T.accentLight, borderRadius: 12, border: `1px solid ${T.accentMid}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.accent, textTransform: 'uppercase', letterSpacing: 0.9, marginBottom: 6 }}>Recommendation</div>
                <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.65, fontWeight: 500 }}>{decision.recommendation}</div>
              </div>
            )}

            {decision.outcome && (
              <div style={{ padding: '13px 16px', background: T.successBg, borderRadius: 12, border: `1px solid ${T.successBorder}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.success, textTransform: 'uppercase', letterSpacing: 0.9, marginBottom: 6 }}>Outcome</div>
                <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.65 }}>{decision.outcome}</div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => onDelete(decision.id)} style={{ fontSize: 12, color: T.danger, background: T.dangerBg, border: `1px solid ${T.dangerBorder}`, borderRadius: 8, padding: '5px 12px', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5 }}>
                <X size={12} />Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function NewDecisionModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ title: '', context: '', options: '', risk_level: 'medium', deadline: '' })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title is required'); return }
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { error } = await supabase.from('decisions').insert({
        user_id: user.id, title: form.title, context: form.context,
        risk_level: form.risk_level, status: 'pending',
        deadline: form.deadline || null, created_at: new Date().toISOString(),
      })
      if (error) throw error
      toast.success('Decision logged')
      onCreated()
      onClose()
    } catch (err: any) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  const inp = { width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', fontSize: 15, color: 'var(--text)', fontFamily: 'inherit', outline: 'none' } as React.CSSProperties

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width: 500, background: 'var(--surface)', border: '1px solid var(--border-strong)', borderRadius: 20, boxShadow: '0 32px 80px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>Log a decision</div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--surface2)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}><X size={14} /></button>
        </div>
        <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[['title', 'Decision title', 'What are you deciding?', false], ['context', 'Context', 'What led to this decision?', true]].map(([k, label, ph, multi]: any) => (
            <div key={k}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.6 }}>{label}</label>
              {multi
                ? <textarea rows={3} placeholder={ph} value={(form as any)[k]} onChange={e => setForm(f => ({...f, [k]: e.target.value}))} style={{ ...inp, resize: 'vertical' }} />
                : <input placeholder={ph} value={(form as any)[k]} onChange={e => setForm(f => ({...f, [k]: e.target.value}))} style={inp} />
              }
            </div>
          ))}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.6 }}>Risk level</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['low', 'medium', 'high'].map(r => (
                <button key={r} onClick={() => setForm(f => ({...f, risk_level: r}))} style={{ flex: 1, padding: '9px 0', borderRadius: 10, border: `1.5px solid ${form.risk_level === r ? RISK_COLORS[r].color : 'var(--border)'}`, background: form.risk_level === r ? RISK_COLORS[r].bg : 'var(--surface2)', color: form.risk_level === r ? RISK_COLORS[r].color : 'var(--text-secondary)', fontSize: 13, fontWeight: form.risk_level === r ? 700 : 500, cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.12s' }}>
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: '12px 0', background: T.accent, color: 'white', border: 'none', borderRadius: 11, fontSize: 15, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1, boxShadow: '0 2px 8px rgba(29,78,216,0.3)' }}>
              {saving ? 'Saving...' : 'Log decision'}
            </button>
            <button onClick={onClose} style={{ padding: '12px 20px', background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 11, fontSize: 15, cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DecisionsPage() {
  const [decisions, setDecisions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => { loadDecisions() }, [])

  const loadDecisions = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('decisions').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setDecisions(data || [])
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    await supabase.from('decisions').delete().eq('id', id)
    setDecisions(prev => prev.filter(d => d.id !== id))
    toast.success('Deleted')
  }

  const filtered = filter === 'all' ? decisions : decisions.filter(d => d.status === filter)
  const counts = { all: decisions.length, pending: decisions.filter(d => d.status === 'pending').length, approved: decisions.filter(d => d.status === 'approved').length, rejected: decisions.filter(d => d.status === 'rejected').length }

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '28px 28px 120px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <Zap size={22} style={{ color: T.accent }} />
            <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)', letterSpacing: -0.8 }}>Decisions</h1>
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>{decisions.length} decision{decisions.length !== 1 ? 's' : ''} logged</p>
        </div>
        <button onClick={() => setShowNew(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', background: T.accent, color: 'white', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(29,78,216,0.3)' }}>
          <Plus size={15} />Log Decision
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24, background: 'var(--surface2)', borderRadius: 12, padding: 4 }}>
        {[['all', 'All'], ['pending', 'Pending'], ['approved', 'Approved'], ['rejected', 'Rejected']].map(([k, label]) => (
          <button key={k} onClick={() => setFilter(k)} style={{ flex: 1, padding: '8px 0', borderRadius: 9, background: filter === k ? 'var(--surface)' : 'transparent', color: filter === k ? 'var(--text)' : 'var(--text-secondary)', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: filter === k ? 700 : 500, boxShadow: filter === k ? '0 1px 4px rgba(0,0,0,0.06)' : 'none', transition: 'all 0.12s' }}>
            {label} {(counts as any)[k] > 0 ? `(${(counts as any)[k]})` : ''}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 24 }}>
        {[
          { label: 'Pending review', value: counts.pending, color: T.warning },
          { label: 'Approved', value: counts.approved, color: T.success },
          { label: 'Rejected', value: counts.rejected, color: T.danger },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--surface)', borderRadius: 14, padding: '16px', border: '1px solid var(--border)', boxShadow: T.shadowSm }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color, letterSpacing: -0.8 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>Loading decisions...</div>
      ) : filtered.length === 0 ? (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 14 }}>⚡</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>No decisions {filter !== 'all' ? `with status "${filter}"` : 'logged yet'}</div>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>Log important decisions to track your reasoning and outcomes over time.</p>
          <button onClick={() => setShowNew(true)} style={{ padding: '10px 22px', background: T.accent, color: 'white', border: 'none', borderRadius: 11, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Log first decision</button>
        </div>
      ) : (
        filtered.map(d => <DecisionCard key={d.id} decision={d} onDelete={handleDelete} />)
      )}

      {showNew && <NewDecisionModal onClose={() => setShowNew(false)} onCreated={loadDecisions} />}
    </div>
  )
}
