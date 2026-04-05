'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Target, X, ChevronDown, ChevronUp, RefreshCw, CheckCircle, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'

const T = {
  danger: '#c41e1e', dangerBg: 'rgba(196,30,30,0.07)', dangerBorder: 'rgba(196,30,30,0.22)',
  success: '#146c34', successBg: 'rgba(20,108,52,0.07)', successBorder: 'rgba(20,108,52,0.22)',
  accent: '#1d4ed8', accentLight: 'rgba(29,78,216,0.09)', accentMid: 'rgba(29,78,216,0.18)',
  warning: '#a16207', warningBg: 'rgba(161,98,7,0.07)', warningBorder: 'rgba(161,98,7,0.2)',
  shadowSm: '0 2px 6px rgba(10,10,11,0.07)', shadowMd: '0 6px 18px rgba(10,10,11,0.09)',
}

function progressColor(p: number) { return p >= 70 ? T.success : p >= 40 ? T.warning : T.danger }

function GoalCard({ goal, onUpdate, onDelete }: { goal: any; onUpdate: () => void; onDelete: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false)
  const [checkingIn, setCheckingIn] = useState(false)
  const [checkInNote, setCheckInNote] = useState('')
  const [saving, setSaving] = useState(false)
  const progress = goal.progress || 0
  const color = progressColor(progress)
  const statusColor = goal.status === 'completed' ? T.success : goal.status === 'at_risk' ? T.danger : goal.status === 'on_track' ? T.success : T.warning

  const handleCheckIn = async () => {
    setSaving(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      await fetch('/api/goals/check-in', { method: 'POST', headers: { 'Authorization': `Bearer ${session?.access_token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ goalId: goal.id, note: checkInNote }) })
      toast.success('Check-in saved')
      setCheckingIn(false)
      setCheckInNote('')
      onUpdate()
    } catch (err: any) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  return (
    <div style={{ background: 'var(--surface)', border: `1.5px solid ${goal.status === 'at_risk' ? T.dangerBorder : goal.status === 'completed' ? T.successBorder : 'var(--border)'}`, borderRadius: 16, overflow: 'hidden', boxShadow: T.shadowSm, marginBottom: 10, transition: 'all 0.15s', position: 'relative' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLElement).style.boxShadow = T.shadowMd }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = T.shadowSm }}>

      {/* Priority left bar */}
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: goal.priority === 1 ? T.danger : goal.priority === 2 ? T.warning : T.accent }} />

      <button onClick={() => setExpanded(!expanded)} style={{ width: '100%', padding: '18px 20px 18px 22px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7, flexWrap: 'wrap' as const }}>
              {goal.category && <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 100, background: 'var(--surface2)', color: 'var(--text-secondary)', border: '1px solid var(--border)', textTransform: 'capitalize' }}>{goal.category}</span>}
              {goal.status && <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 100, background: statusColor + '15', color: statusColor, border: `1px solid ${statusColor}25`, textTransform: 'capitalize' }}>{goal.status?.replace('_', ' ')}</span>}
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 8, letterSpacing: -0.2 }}>{goal.title}</div>
            {/* Progress bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Progress</span>
                <span style={{ fontSize: 13, fontWeight: 800, color }}>{progress}%</span>
              </div>
              <div style={{ height: 6, background: 'var(--surface3)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${progress}%`, background: color, borderRadius: 3, transition: 'width 0.5s ease' }} />
              </div>
            </div>
          </div>
          <div style={{ flexShrink: 0 }}>
            {expanded ? <ChevronUp size={14} style={{ color: 'var(--text-tertiary)' }} /> : <ChevronDown size={14} style={{ color: 'var(--text-tertiary)' }} />}
          </div>
        </div>
      </button>

      {expanded && (
        <div style={{ padding: '0 20px 18px 22px', borderTop: '1px solid var(--border)' }}>
          <div style={{ paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>

            {goal.description && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.9, marginBottom: 7 }}>Description</div>
                <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.65 }}>{goal.description}</p>
              </div>
            )}

            {goal.success_criteria && (
              <div style={{ padding: '13px 16px', background: T.accentLight, borderRadius: 12, border: `1px solid ${T.accentMid}` }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: T.accent, textTransform: 'uppercase', letterSpacing: 0.9, marginBottom: 7 }}>Success Criteria</div>
                <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.65 }}>{goal.success_criteria}</p>
              </div>
            )}

            {goal.ai_assessment && (
              <div style={{ padding: '13px 16px', background: 'var(--surface2)', borderRadius: 12, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.9, marginBottom: 7 }}>AI Assessment</div>
                <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.65 }}>{goal.ai_assessment}</p>
              </div>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
              {goal.target_date && <span style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '5px 11px', background: 'var(--surface2)', borderRadius: 8, border: '1px solid var(--border)' }}>🎯 Target: {new Date(goal.target_date).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', padding: '5px 11px', background: 'var(--surface2)', borderRadius: 8, border: '1px solid var(--border)' }}>Priority {goal.priority || 3}</span>
            </div>

            {/* Check-in */}
            {!checkingIn ? (
              <div style={{ display: 'flex', gap: 9 }}>
                <button onClick={() => setCheckingIn(true)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: T.successBg, color: T.success, border: `1px solid ${T.successBorder}`, borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  <RefreshCw size={13} />Check In
                </button>
                <button onClick={() => onDelete(goal.id)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '9px 14px', background: T.dangerBg, color: T.danger, border: `1px solid ${T.dangerBorder}`, borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                  <X size={12} />Delete
                </button>
              </div>
            ) : (
              <div style={{ padding: '14px 16px', background: 'var(--surface2)', borderRadius: 12, border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 10 }}>What's your progress update?</div>
                <textarea value={checkInNote} onChange={e => setCheckInNote(e.target.value)} rows={3} placeholder="Share what moved, what's blocked, and any context..." style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 13px', fontSize: 14, color: 'var(--text)', fontFamily: 'inherit', resize: 'vertical', outline: 'none', marginBottom: 10 }} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={handleCheckIn} disabled={saving} style={{ padding: '9px 18px', background: T.success, color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>{saving ? 'Saving...' : 'Submit'}</button>
                  <button onClick={() => setCheckingIn(false)} style={{ padding: '9px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 14, cursor: 'pointer', color: 'var(--text-secondary)' }}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function NewGoalModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ title: '', description: '', category: 'business', priority: '2', target_date: '', success_criteria: '' })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error('Title required'); return }
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { error } = await supabase.from('goals').insert({ user_id: user.id, ...form, priority: Number(form.priority), progress: 0, status: 'active', created_at: new Date().toISOString() })
      if (error) throw error
      toast.success('Goal created')
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
          <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>New Goal</div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--surface2)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}><X size={14} /></button>
        </div>
        <div style={{ padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[['title', 'Goal title', 'What do you want to achieve?', false], ['description', 'Description', 'More context...', true], ['success_criteria', 'Success criteria', 'How will you know it\'s done?', false]].map(([k, label, ph, multi]: any) => (
            <div key={k}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.6 }}>{label}</label>
              {multi ? <textarea rows={2} placeholder={ph} value={(form as any)[k]} onChange={e => setForm(f => ({...f, [k]: e.target.value}))} style={{ ...inp, resize: 'vertical' }} /> : <input placeholder={ph} value={(form as any)[k]} onChange={e => setForm(f => ({...f, [k]: e.target.value}))} style={inp} />}
            </div>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.6 }}>Category</label>
              <select value={form.category} onChange={e => setForm(f => ({...f, category: e.target.value}))} style={{ ...inp, cursor: 'pointer' }}>
                {['business', 'revenue', 'product', 'team', 'personal', 'operations'].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.6 }}>Priority</label>
              <select value={form.priority} onChange={e => setForm(f => ({...f, priority: e.target.value}))} style={{ ...inp, cursor: 'pointer' }}>
                <option value="1">1 — Critical</option>
                <option value="2">2 — High</option>
                <option value="3">3 — Medium</option>
              </select>
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.6 }}>Target date</label>
            <input type="date" value={form.target_date} onChange={e => setForm(f => ({...f, target_date: e.target.value}))} style={inp} />
          </div>
        </div>
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', flexShrink: 0, display: 'flex', gap: 10 }}>
          <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: '12px 0', background: T.accent, color: 'white', border: 'none', borderRadius: 11, fontSize: 15, fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>{saving ? 'Creating...' : 'Create goal'}</button>
          <button onClick={onClose} style={{ padding: '12px 20px', background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 11, fontSize: 15, cursor: 'pointer' }}>Cancel</button>
        </div>
      </div>
    </div>
  )
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [filter, setFilter] = useState('all')

  useEffect(() => { loadGoals() }, [])

  const loadGoals = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('goals').select('*').eq('user_id', user.id).order('priority')
    setGoals(data || [])
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    await supabase.from('goals').delete().eq('id', id)
    setGoals(prev => prev.filter(g => g.id !== id))
    toast.success('Deleted')
  }

  const filtered = filter === 'all' ? goals : goals.filter(g => g.status === filter || g.category === filter)
  const avgProgress = goals.length > 0 ? Math.round(goals.reduce((sum, g) => sum + (g.progress || 0), 0) / goals.length) : 0
  const atRisk = goals.filter(g => g.status === 'at_risk').length
  const onTrack = goals.filter(g => g.status === 'on_track').length

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '28px 28px 120px' }}>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <Target size={22} style={{ color: T.accent }} />
            <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)', letterSpacing: -0.8 }}>Goals</h1>
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>{goals.length} active goal{goals.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowNew(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', background: T.accent, color: 'white', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(29,78,216,0.3)' }}>
          <Plus size={15} />New Goal
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 24 }}>
        {[
          { label: 'Avg progress', value: `${avgProgress}%`, color: avgProgress >= 60 ? T.success : avgProgress >= 30 ? T.warning : T.danger },
          { label: 'On track', value: onTrack, color: T.success },
          { label: 'At risk', value: atRisk, color: atRisk > 0 ? T.danger : 'var(--text-tertiary)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--surface)', borderRadius: 14, padding: '16px', border: '1px solid var(--border)', boxShadow: T.shadowSm }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color, letterSpacing: -0.8 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' as const }}>
        {[['all', 'All'], ['on_track', 'On track'], ['at_risk', 'At risk'], ['completed', 'Completed']].map(([k, label]) => (
          <button key={k} onClick={() => setFilter(k)} style={{ padding: '6px 14px', borderRadius: 100, border: `1.5px solid ${filter === k ? T.accent : 'var(--border)'}`, background: filter === k ? T.accentLight : 'var(--surface2)', color: filter === k ? T.accent : 'var(--text-secondary)', fontSize: 13, fontWeight: filter === k ? 700 : 500, cursor: 'pointer', transition: 'all 0.12s' }}>{label}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>Loading goals...</div>
      ) : filtered.length === 0 ? (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 14 }}>◎</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>No goals yet</div>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>Set your most important goals and Cervio will track them, surface risks, and keep you accountable.</p>
          <button onClick={() => setShowNew(true)} style={{ padding: '10px 22px', background: T.accent, color: 'white', border: 'none', borderRadius: 11, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Create first goal</button>
        </div>
      ) : (
        filtered.map(g => <GoalCard key={g.id} goal={g} onUpdate={loadGoals} onDelete={handleDelete} />)
      )}

      {showNew && <NewGoalModal onClose={() => setShowNew(false)} onCreated={loadGoals} />}
    </div>
  )
}
