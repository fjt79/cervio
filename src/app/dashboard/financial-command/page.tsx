'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { TrendingUp, TrendingDown, AlertTriangle, X, Edit2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface FD { cash: number; monthly_burn: number; monthly_revenue: number; burn_fixed: number; burn_variable: number; updated_at: string }

function fmt(n: number) {
  if (n >= 1000000) return `$${(n/1000000).toFixed(1)}M`
  if (n >= 1000) return `$${(n/1000).toFixed(0)}k`
  return `$${Math.round(n)}`
}

function compute(d: FD) {
  const net = d.monthly_burn - d.monthly_revenue
  const runway = net > 0 ? d.cash / net : 99
  const status: 'stable'|'watch'|'critical' = runway >= 9 ? 'stable' : runway >= 6 ? 'watch' : 'critical'
  const days_to_6mo = net > 0 ? Math.floor(((d.cash - 6 * net) / net) * 30) : 9999
  let insight = ''
  if (runway < 6) insight = `Runway is critical. You have ${Math.round(runway * 10) / 10} months. Act now.`
  else if (runway < 9) insight = `Runway drops below 6 months in ${days_to_6mo} days at current burn.`
  else if (d.monthly_burn > d.monthly_revenue * 1.4) insight = `Burn is running ${Math.round((d.monthly_burn/d.monthly_revenue - 1)*100)}% above revenue. Growth must accelerate.`
  else insight = `You are stable. Monitor burn closely as you scale.`
  return { runway: Math.round(runway * 10) / 10, net, status, insight, days_to_6mo }
}

const SC = {
  stable: { color: '#146c34', bg: 'rgba(20,108,52,0.07)', border: 'rgba(20,108,52,0.2)' },
  watch:  { color: '#a16207', bg: 'rgba(161,98,7,0.07)',  border: 'rgba(161,98,7,0.2)' },
  critical: { color: '#c41e1e', bg: 'rgba(196,30,30,0.07)', border: 'rgba(196,30,30,0.22)' },
}

// ── Runway Bar ──────────────────────────────────────────────
function RunwayBar({ months }: { months: number }) {
  const MAX = 24
  const pct = Math.min(100, (months / MAX) * 100)
  const color = months >= 9 ? '#146c34' : months >= 6 ? '#a16207' : '#c41e1e'
  return (
    <div>
      <div style={{ position: 'relative', height: 16, background: 'var(--surface3)', borderRadius: 8, overflow: 'hidden', marginBottom: 10 }}>
        <div style={{ position: 'absolute', inset: 0, left: 0, width: `${(6/MAX)*100}%`, background: 'rgba(196,30,30,0.1)' }} />
        <div style={{ position: 'absolute', inset: 0, left: `${(6/MAX)*100}%`, width: `${(3/MAX)*100}%`, background: 'rgba(161,98,7,0.08)' }} />
        <div style={{ position: 'absolute', inset: 0, left: `${(9/MAX)*100}%`, background: 'rgba(20,108,52,0.07)' }} />
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct}%`, background: color, borderRadius: 8, transition: 'width 1s cubic-bezier(0.34,1.1,0.64,1)', minWidth: 16, opacity: 0.85 }} />
        {[6, 9].map(m => <div key={m} style={{ position: 'absolute', left: `${(m/MAX)*100}%`, top: 0, bottom: 0, width: 2, background: 'var(--surface)', opacity: 0.6 }} />)}
      </div>
      <div style={{ display: 'flex', fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)' }}>
        <span style={{ width: `${(6/MAX)*100}%`, color: '#c41e1e' }}>Danger</span>
        <span style={{ width: `${(3/MAX)*100}%`, color: '#a16207', textAlign: 'center' as const }}>Watch</span>
        <span style={{ flex: 1, color: '#146c34', textAlign: 'right' as const }}>Safe zone</span>
      </div>
    </div>
  )
}

// ── Scenario Modal ──────────────────────────────────────────
interface Scenario { label: string; icon: string; burn_delta: number; revenue_delta: number }
const SCENARIOS: Scenario[] = [
  { label: 'Hire a senior role',    icon: '👤', burn_delta: 12000,  revenue_delta: 0 },
  { label: '10% cost increase',     icon: '📈', burn_delta: 0,      revenue_delta: 0 },  // computed inline
  { label: '15% revenue drop',      icon: '📉', burn_delta: 0,      revenue_delta: 0 },  // computed inline
  { label: 'Delayed collections',   icon: '⏳', burn_delta: 5000,   revenue_delta: -5000 },
]

function ScenarioModal({ s, d, c, onClose }: { s: Scenario; d: FD; c: ReturnType<typeof compute>; onClose: () => void }) {
  const burnDelta  = s.label === '10% cost increase'  ? d.monthly_burn * 0.1  : s.burn_delta
  const revDelta   = s.label === '15% revenue drop'   ? -d.monthly_revenue * 0.15 : s.revenue_delta
  const newBurn    = d.monthly_burn + burnDelta
  const newRev     = d.monthly_revenue + revDelta
  const newNet     = newBurn - newRev
  const newRunway  = newNet > 0 ? Math.round((d.cash / newNet) * 10) / 10 : 99
  const delta      = Math.round((newRunway - c.runway) * 10) / 10
  const newStatus: 'stable'|'watch'|'critical' = newRunway >= 9 ? 'stable' : newRunway >= 6 ? 'watch' : 'critical'
  const impact: 'low'|'medium'|'high' = Math.abs(delta) < 1 ? 'low' : Math.abs(delta) < 2.5 ? 'medium' : 'high'
  const impactColor = { low: '#146c34', medium: '#a16207', high: '#c41e1e' }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width: 420, background: 'var(--surface)', border: '1px solid var(--border-strong)', borderRadius: 20, boxShadow: '0 32px 80px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 2 }}>{s.icon} {s.label}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Impact on runway and burn</div>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--surface2)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}><X size={14} /></button>
        </div>
        <div style={{ padding: '20px 24px 24px' }}>
          {/* Key numbers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
            {[
              { label: 'New runway', value: newRunway >= 99 ? '99+ mo' : `${newRunway} months`, color: SC[newStatus].color },
              { label: 'Change', value: `${delta > 0 ? '+' : ''}${delta} months`, color: delta >= 0 ? '#146c34' : '#c41e1e' },
              { label: 'New burn', value: fmt(newBurn) + '/mo', color: 'var(--text)' },
              { label: 'Impact level', value: impact, color: impactColor[impact] },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--surface2)', borderRadius: 12, padding: '14px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' as const, letterSpacing: 0.7, marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: s.color, letterSpacing: -0.5, textTransform: 'capitalize' as const }}>{s.value}</div>
              </div>
            ))}
          </div>
          {/* Verdict */}
          <div style={{ padding: '13px 16px', background: SC[newStatus].bg, borderRadius: 12, border: `1px solid ${SC[newStatus].border}`, marginBottom: 16 }}>
            <p style={{ fontSize: 13, color: SC[newStatus].color, lineHeight: 1.65, fontWeight: 500 }}>
              {s.label === 'Hire a senior role' && `Adding this role takes runway from ${c.runway} → ${newRunway} months. ${newRunway < 9 ? 'This falls below your safe zone threshold.' : 'You remain above the 9-month safe zone.'}`}
              {s.label === '10% cost increase' && `A 10% cost increase reduces runway by ${Math.abs(delta)} months. ${newRunway < 6 ? 'This is critical — consider deferring.' : newRunway < 9 ? 'You move into the watch zone.' : 'You remain in the safe zone.'}`}
              {s.label === '15% revenue drop' && `A 15% revenue drop shortens runway by ${Math.abs(delta)} months. ${newRunway < 6 ? 'Immediate action required.' : 'Monitor closely and protect gross margin.'}`}
              {s.label === 'Delayed collections' && `Delayed payments increase effective burn and cut runway by ${Math.abs(delta)} months. Chase outstanding invoices immediately.`}
            </p>
          </div>
          <button onClick={onClose} style={{ width: '100%', padding: '11px 0', background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 11, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Close</button>
        </div>
      </div>
    </div>
  )
}

// ── Edit Modal ──────────────────────────────────────────────
function EditModal({ d, onSave, onClose }: { d: FD | null; onSave: (f: Partial<FD>) => Promise<void>; onClose: () => void }) {
  const blank = { cash: '', monthly_burn: '', monthly_revenue: '', burn_fixed: '', burn_variable: '' }
  const [form, setForm] = useState(d ? { cash: String(d.cash), monthly_burn: String(d.monthly_burn), monthly_revenue: String(d.monthly_revenue), burn_fixed: String(d.burn_fixed||''), burn_variable: String(d.burn_variable||'') } : blank)
  const [saving, setSaving] = useState(false)

  const inp = { width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', fontSize: 15, color: 'var(--text)', fontFamily: 'inherit', outline: 'none' } as React.CSSProperties

  const handleSave = async () => {
    if (!form.cash || !form.monthly_burn || !form.monthly_revenue) { toast.error('Cash, burn, and revenue are required'); return }
    setSaving(true)
    await onSave({ cash: Number(form.cash), monthly_burn: Number(form.monthly_burn), monthly_revenue: Number(form.monthly_revenue), burn_fixed: Number(form.burn_fixed)||0, burn_variable: Number(form.burn_variable)||0 })
    setSaving(false)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width: 480, background: 'var(--surface)', border: '1px solid var(--border-strong)', borderRadius: 20, boxShadow: '0 32px 80px rgba(0,0,0,0.25)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)' }}>Update financial data</div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--surface2)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}><X size={14} /></button>
        </div>
        <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            ['cash', 'Current cash balance ($)', 'e.g. 500000'],
            ['monthly_burn', 'Monthly burn ($)', 'e.g. 65000'],
            ['monthly_revenue', 'Monthly revenue ($)', 'e.g. 40000'],
            ['burn_fixed', 'Fixed burn — optional ($)', 'e.g. 35000'],
            ['burn_variable', 'Variable burn — optional ($)', 'e.g. 30000'],
          ].map(([k, label, ph]) => (
            <div key={k}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, textTransform: 'uppercase' as const, letterSpacing: 0.5 }}>{label}</label>
              <input type="number" placeholder={ph} value={(form as any)[k]} onChange={e => setForm(f => ({...f, [k]: e.target.value}))} style={inp} />
            </div>
          ))}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: '12px 0', background: '#1d4ed8', color: 'white', border: 'none', borderRadius: 11, fontSize: 15, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1, boxShadow: '0 2px 8px rgba(29,78,216,0.3)' }}>
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button onClick={onClose} style={{ padding: '12px 20px', background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 11, fontSize: 15, fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Risk Card ───────────────────────────────────────────────
function RiskCard({ severity, title, why, action }: { severity: 'high'|'medium'; title: string; why: string; action: string }) {
  const color = severity === 'high' ? '#c41e1e' : '#a16207'
  const bg = severity === 'high' ? 'rgba(196,30,30,0.05)' : 'rgba(161,98,7,0.05)'
  const border = severity === 'high' ? 'rgba(196,30,30,0.2)' : 'rgba(161,98,7,0.18)'
  return (
    <div style={{ padding: '16px 18px', background: bg, borderRadius: 14, border: `1px solid ${border}`, borderLeft: `3px solid ${color}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <AlertTriangle size={14} style={{ color, flexShrink: 0 }} />
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{title}</div>
      </div>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: 8 }}>{why}</p>
      <div style={{ fontSize: 12, fontWeight: 700, color, display: 'flex', alignItems: 'center', gap: 5 }}>→ {action}</div>
    </div>
  )
}

// ── Main Page ───────────────────────────────────────────────
export default function FinancialCommandPage() {
  const [raw, setRaw] = useState<FD | null>(null)
  const [loading, setLoading] = useState(true)
  const [showEdit, setShowEdit] = useState(false)
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null)

  useEffect(() => { load() }, [])

  const load = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('financial_data').select('*').eq('user_id', user.id).single()
      if (data) setRaw(data as FD)
    } catch {}
    finally { setLoading(false) }
  }

  const handleSave = async (f: Partial<FD>) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const payload = { ...f, user_id: user.id, updated_at: new Date().toISOString() }
    const { error } = await supabase.from('financial_data').upsert(payload, { onConflict: 'user_id' })
    if (error) { toast.error('Failed to save'); return }
    setRaw(payload as FD)
    setShowEdit(false)
    toast.success('Financial data saved')
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 12 }}>
      <div className="spinner" style={{ width: 24, height: 24 }} />
      <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Loading...</p>
    </div>
  )

  // No data state
  if (!raw) return (
    <div style={{ maxWidth: 580, margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>💰</div>
      <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', letterSpacing: -0.6, marginBottom: 10 }}>Financial Command</h1>
      <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: 32 }}>Add your financials to track runway, understand burn, and simulate decisions before they happen.</p>
      <button onClick={() => setShowEdit(true)} style={{ padding: '13px 32px', background: '#1d4ed8', color: 'white', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 12px rgba(29,78,216,0.3)' }}>Add Financial Data</button>
      {showEdit && <EditModal d={null} onSave={handleSave} onClose={() => setShowEdit(false)} />}
    </div>
  )

  const c = compute(raw)
  const sc = SC[c.status]

  // Auto-generate risks
  const risks = []
  if (c.runway < 6) risks.push({ severity: 'high' as const, title: 'Runway below 6 months', why: `At current burn you have ${c.runway} months. This is below minimum operating threshold.`, action: 'Cut variable costs or accelerate revenue this week' })
  if (c.runway >= 6 && c.runway < 9) risks.push({ severity: 'medium' as const, title: `Runway approaching watch zone`, why: `You drop below 9 months in ${Math.round((c.runway - 9) * 30)} days. Plan now while you still have options.`, action: 'Review hiring plan and discretionary spend' })
  if (raw.monthly_burn > raw.monthly_revenue * 1.5) risks.push({ severity: 'medium' as const, title: 'Burn significantly outpacing revenue', why: `Burn is ${Math.round((raw.monthly_burn / raw.monthly_revenue - 1) * 100)}% higher than revenue. This ratio needs to improve.`, action: 'Identify top 3 burn contributors and reduce variable costs' })
  if (raw.monthly_burn > 0 && raw.burn_variable > raw.burn_fixed) risks.push({ severity: 'medium' as const, title: 'High variable burn concentration', why: 'More than half your burn is variable. While flexible, this can spike unexpectedly.', action: 'Track variable spend weekly, not monthly' })

  const lastUpdated = raw.updated_at ? new Date(raw.updated_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }) : 'Unknown'

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 28px 140px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)', letterSpacing: -0.8, marginBottom: 4 }}>Financial Command</h1>
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>Last updated {lastUpdated}</p>
        </div>
        <button onClick={() => setShowEdit(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 11, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.15s' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'}>
          <Edit2 size={13} />Update data
        </button>
      </div>

      {/* ── SECTION 1: RUNWAY COMMAND ── */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '28px 30px', marginBottom: 16, boxShadow: '0 4px 16px rgba(10,10,11,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Runway</div>
            <div style={{ fontSize: 60, fontWeight: 800, color: sc.color, letterSpacing: -3, lineHeight: 1 }}>{c.runway >= 99 ? '99+' : c.runway}</div>
            <div style={{ fontSize: 16, color: 'var(--text-tertiary)', fontWeight: 500, marginTop: 4 }}>months remaining</div>
          </div>
          <div style={{ textAlign: 'right' as const }}>
            <div style={{ padding: '8px 18px', background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, borderRadius: 100, fontSize: 13, fontWeight: 700, textTransform: 'capitalize' as const, marginBottom: 10 }}>{c.status}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 220, lineHeight: 1.55, textAlign: 'right' as const }}>{c.insight}</div>
          </div>
        </div>
        <RunwayBar months={c.runway} />

        {/* Runway drivers */}
        <div style={{ marginTop: 22, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14 }}>Runway Drivers</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {[
              { label: 'Monthly net burn', value: fmt(c.net), note: c.net > 0 ? 'Burning cash' : 'Cash positive', color: c.net > 0 ? '#c41e1e' : '#146c34' },
              { label: 'Cash remaining', value: fmt(raw.cash), note: `at ${fmt(c.net)}/mo burn`, color: 'var(--text)' },
              { label: 'Break-even gap', value: fmt(Math.abs(raw.monthly_burn - raw.monthly_revenue)), note: raw.monthly_revenue < raw.monthly_burn ? 'to cover burn' : 'above break-even', color: raw.monthly_revenue >= raw.monthly_burn ? '#146c34' : '#a16207' },
            ].map(d => (
              <div key={d.label} style={{ background: 'var(--surface2)', borderRadius: 12, padding: '14px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 7, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: 0.5 }}>{d.label}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: d.color, letterSpacing: -0.8, marginBottom: 3 }}>{d.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{d.note}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SECTION 2: BURN & REVENUE ── */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '24px 28px', marginBottom: 16, boxShadow: '0 2px 8px rgba(10,10,11,0.05)' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 18 }}>Burn & Revenue</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 18 }}>
          {[
            { label: 'Monthly burn', value: fmt(raw.monthly_burn), color: '#c41e1e', note: 'going out' },
            { label: 'Monthly revenue', value: fmt(raw.monthly_revenue), color: '#146c34', note: 'coming in' },
            { label: 'Net position', value: (c.net > 0 ? '-' : '+') + fmt(Math.abs(c.net)), color: c.net > 0 ? '#c41e1e' : '#146c34', note: c.net > 0 ? 'monthly deficit' : 'monthly surplus' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--surface2)', borderRadius: 14, padding: '18px', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 9, fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: 0.7 }}>{s.label}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.color, letterSpacing: -1, marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{s.note}</div>
            </div>
          ))}
        </div>

        {/* Burn breakdown if available */}
        {(raw.burn_fixed > 0 || raw.burn_variable > 0) && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
            {[{ label: 'Fixed burn', v: raw.burn_fixed, color: '#c41e1e' }, { label: 'Variable burn', v: raw.burn_variable, color: '#a16207' }].map(b => (
              <div key={b.label} style={{ background: 'var(--surface2)', borderRadius: 12, padding: '14px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 600 }}>{b.label}</span>
                  <span style={{ fontSize: 15, fontWeight: 800, color: b.color }}>{fmt(b.v)}</span>
                </div>
                <div style={{ height: 4, background: 'var(--surface3)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(b.v / raw.monthly_burn) * 100}%`, background: b.color, borderRadius: 3 }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 6 }}>{Math.round((b.v / raw.monthly_burn) * 100)}% of total burn</div>
              </div>
            ))}
          </div>
        )}

        {/* Momentum indicator */}
        <div style={{ padding: '13px 16px', background: raw.monthly_burn > raw.monthly_revenue * 1.3 ? 'rgba(161,98,7,0.07)' : 'rgba(20,108,52,0.06)', borderRadius: 12, border: `1px solid ${raw.monthly_burn > raw.monthly_revenue * 1.3 ? 'rgba(161,98,7,0.2)' : 'rgba(20,108,52,0.18)'}` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' as const, letterSpacing: 0.9, marginBottom: 5 }}>Momentum</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: raw.monthly_burn > raw.monthly_revenue * 1.3 ? '#a16207' : '#146c34' }}>
            {raw.monthly_burn > raw.monthly_revenue * 1.5 ? 'Burn is significantly outpacing revenue. Growth must accelerate.' : raw.monthly_burn > raw.monthly_revenue * 1.2 ? 'Burn is running ahead of revenue. Monitor closely.' : raw.monthly_revenue > raw.monthly_burn ? 'Revenue is outpacing burn. Strong position.' : 'Revenue and burn are roughly balanced.'}
          </div>
        </div>
      </div>

      {/* ── SECTION 3: SCENARIOS ── */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '24px 28px', marginBottom: 16, boxShadow: '0 2px 8px rgba(10,10,11,0.05)' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>Scenario Simulation</div>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 18 }}>Simulate a decision before committing. See runway impact instantly.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
          {SCENARIOS.map(s => (
            <button key={s.label} onClick={() => setActiveScenario(s)} style={{ padding: '16px 18px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 14, cursor: 'pointer', textAlign: 'left' as const, transition: 'all 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}>
              <div style={{ fontSize: 22, marginBottom: 10 }}>{s.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                {s.label === '10% cost increase' ? `+${fmt(raw.monthly_burn * 0.1)}/mo impact` : s.label === '15% revenue drop' ? `-${fmt(raw.monthly_revenue * 0.15)}/mo impact` : s.burn_delta > 0 ? `+${fmt(s.burn_delta)}/mo impact` : 'See impact →'}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ── SECTION 4: RISKS ── */}
      {risks.length > 0 && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '24px 28px', boxShadow: '0 2px 8px rgba(10,10,11,0.05)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 18 }}>Financial Risks</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {risks.map((r, i) => <RiskCard key={i} {...r} />)}
          </div>
        </div>
      )}

      {/* Modals */}
      {showEdit && <EditModal d={raw} onSave={handleSave} onClose={() => setShowEdit(false)} />}
      {activeScenario && <ScenarioModal s={activeScenario} d={raw} c={c} onClose={() => setActiveScenario(null)} />}
    </div>
  )
}
