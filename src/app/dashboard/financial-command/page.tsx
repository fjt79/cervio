'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { TrendingUp, TrendingDown, AlertTriangle, DollarSign, Zap, Clock, ChevronDown, ChevronUp, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface FinancialData {
  cash: number
  monthly_burn: number
  monthly_revenue: number
  runway_months: number
  burn_fixed: number
  burn_variable: number
  revenue_trend: 'up' | 'down' | 'flat'
  status: 'stable' | 'watch' | 'critical'
}

interface Scenario {
  type: 'hire' | 'cost_increase' | 'revenue_drop'
  label: string
  icon: string
  monthly_impact: number
}

const SCENARIOS: Scenario[] = [
  { type: 'hire', label: 'Simulate hire', icon: '👤', monthly_impact: 8000 },
  { type: 'cost_increase', label: 'Simulate cost increase', icon: '📈', monthly_impact: 5000 },
  { type: 'revenue_drop', label: 'Simulate revenue drop', icon: '📉', monthly_impact: -10000 },
]

function statusColor(s: string) {
  if (s === 'stable') return 'var(--success)'
  if (s === 'watch') return 'var(--warning)'
  return 'var(--danger)'
}

function fmt(n: number) {
  if (n >= 1000000) return `$${(n/1000000).toFixed(1)}M`
  if (n >= 1000) return `$${(n/1000).toFixed(0)}k`
  return `$${n}`
}

function RunwayBar({ months }: { months: number }) {
  const pct = Math.min(100, (months / 24) * 100)
  const color = months >= 12 ? 'var(--success)' : months >= 6 ? 'var(--warning)' : 'var(--danger)'
  const milestones = [3, 6, 12, 18, 24]
  return (
    <div>
      <div style={{ position: 'relative', height: 12, background: 'var(--surface3)', borderRadius: 6, overflow: 'hidden', marginBottom: 8 }}>
        <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}99)`, borderRadius: 6, transition: 'width 1s cubic-bezier(0.34,1.1,0.64,1)' }} />
        {milestones.map(m => (
          <div key={m} style={{ position: 'absolute', left: `${(m/24)*100}%`, top: 0, bottom: 0, width: 1, background: 'rgba(255,255,255,0.15)' }} />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-tertiary)' }}>
        {milestones.map(m => <span key={m}>{m}mo</span>)}
      </div>
    </div>
  )
}

function ScenarioModal({ scenario, data, onClose }: { scenario: Scenario; data: FinancialData; onClose: () => void }) {
  const newBurn = data.monthly_burn + (scenario.type !== 'revenue_drop' ? scenario.monthly_impact : 0)
  const newRevenue = data.monthly_revenue + (scenario.type === 'revenue_drop' ? scenario.monthly_impact : 0)
  const newNet = newBurn - newRevenue
  const newRunway = newNet > 0 ? Math.floor(data.cash / newNet) : 99
  const runwayDelta = newRunway - data.runway_months
  const riskChange = runwayDelta < -3 ? 'increased' : runwayDelta > 3 ? 'decreased' : 'unchanged'

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}>
      <div style={{ width: 440, background: 'var(--surface)', border: '1px solid var(--border-strong)', borderRadius: 20, boxShadow: 'var(--shadow-xl)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 3 }}>{scenario.icon} {scenario.label}</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Impact analysis based on current financials</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 4, borderRadius: 8 }}><X size={18} /></button>
        </div>
        <div style={{ padding: '20px 24px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Monthly impact', value: `+${fmt(Math.abs(scenario.monthly_impact))}/mo`, color: scenario.type === 'revenue_drop' ? 'var(--success)' : 'var(--danger)' },
              { label: 'New runway', value: `${newRunway} months`, color: statusColor(newRunway >= 12 ? 'stable' : newRunway >= 6 ? 'watch' : 'critical') },
              { label: 'Runway change', value: `${runwayDelta > 0 ? '+' : ''}${runwayDelta} months`, color: runwayDelta >= 0 ? 'var(--success)' : 'var(--danger)' },
              { label: 'Risk level', value: riskChange, color: riskChange === 'increased' ? 'var(--danger)' : riskChange === 'decreased' ? 'var(--success)' : 'var(--warning)' },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--surface2)', borderRadius: 12, padding: '14px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6 }}>{s.label}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: s.color, letterSpacing: -0.5 }}>{s.value}</div>
              </div>
            ))}
          </div>
          <div style={{ padding: '14px 16px', background: runwayDelta < -3 ? 'var(--danger-bg)' : 'var(--surface2)', borderRadius: 12, border: `1px solid ${runwayDelta < -3 ? 'var(--danger-border)' : 'var(--border)'}`, marginBottom: 16 }}>
            <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.65 }}>
              {scenario.type === 'hire' && `Adding this hire increases monthly burn by ${fmt(scenario.monthly_impact)}. Runway drops from ${data.runway_months} to ${newRunway} months. ${newRunway < 9 ? 'This puts you below safe operating threshold.' : 'You remain above 9-month minimum.'}`}
              {scenario.type === 'cost_increase' && `This cost increase reduces runway by ${Math.abs(runwayDelta)} months. ${newRunway < 6 ? 'Critical — consider deferring.' : 'Manageable if revenue trend holds.'}`}
              {scenario.type === 'revenue_drop' && `A ${fmt(Math.abs(scenario.monthly_impact))} revenue drop extends effective burn and shortens runway by ${Math.abs(runwayDelta)} months. ${newRunway < 6 ? 'Requires immediate action.' : 'Monitor closely.'}`}
            </div>
          </div>
          <button onClick={onClose} style={{ width: '100%', padding: '11px 0', background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 11, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Close scenario</button>
        </div>
      </div>
    </div>
  )
}

export default function FinancialCommandPage() {
  const [data, setData] = useState<FinancialData | null>(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeScenario, setActiveScenario] = useState<Scenario | null>(null)
  const [form, setForm] = useState({ cash: '', monthly_burn: '', monthly_revenue: '', burn_fixed: '', burn_variable: '' })
  const [pageLoading, setPageLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: fd } = await supabase.from('financial_data').select('*').eq('user_id', user.id).single()
      if (fd) {
        const net = fd.monthly_burn - fd.monthly_revenue
        const runway = net > 0 ? Math.floor(fd.cash / net) : 99
        const status = runway >= 12 ? 'stable' : runway >= 6 ? 'watch' : 'critical'
        setData({ ...fd, runway_months: runway, status })
        setForm({ cash: fd.cash, monthly_burn: fd.monthly_burn, monthly_revenue: fd.monthly_revenue, burn_fixed: fd.burn_fixed || '', burn_variable: fd.burn_variable || '' })
      }
    } catch (err) { console.error(err) }
    finally { setPageLoading(false) }
  }

  const saveData = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const payload = { user_id: user.id, cash: Number(form.cash), monthly_burn: Number(form.monthly_burn), monthly_revenue: Number(form.monthly_revenue), burn_fixed: Number(form.burn_fixed) || 0, burn_variable: Number(form.burn_variable) || 0, updated_at: new Date().toISOString() }
      await supabase.from('financial_data').upsert(payload, { onConflict: 'user_id' })
      const net = payload.monthly_burn - payload.monthly_revenue
      const runway = net > 0 ? Math.floor(payload.cash / net) : 99
      setData({ ...payload, runway_months: runway, revenue_trend: 'flat', status: runway >= 12 ? 'stable' : runway >= 6 ? 'watch' : 'critical' })
      setEditing(false)
      toast.success('Financial data saved')
    } catch (err: any) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  const inpStyle = { width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', fontSize: 15, color: 'var(--text)', fontFamily: 'inherit' } as React.CSSProperties

  if (pageLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 12 }}>
        <div className="spinner" style={{ width: 24, height: 24 }} />
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Loading financial data...</p>
      </div>
    )
  }

  if (!data && !editing) {
    return (
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)', letterSpacing: -0.8, marginBottom: 8 }}>Financial Command</h1>
        <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 40, lineHeight: 1.65 }}>Add your financial data to track runway, burn, and get scenario analysis.</p>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: '36px', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
          <DollarSign size={32} style={{ color: 'var(--accent)', margin: '0 auto 16px' }} />
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>No financial data yet</div>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24 }}>Add your cash, burn, and revenue to unlock runway tracking, scenario analysis, and financial insights.</p>
          <button onClick={() => setEditing(true)} style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 12, padding: '12px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(29,78,216,0.3)' }}>Add Financial Data</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '28px 24px 120px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)', letterSpacing: -0.8, marginBottom: 4 }}>Financial Command</h1>
          <p style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>Runway, burn, and scenario analysis</p>
        </div>
        <button onClick={() => setEditing(!editing)} style={{ background: editing ? 'var(--surface2)' : 'var(--accent)', color: editing ? 'var(--text)' : 'white', border: editing ? '1px solid var(--border)' : 'none', borderRadius: 11, padding: '9px 18px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          {editing ? 'Cancel' : 'Update data'}
        </button>
      </div>

      {editing && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: '24px', marginBottom: 28, boxShadow: 'var(--shadow-md)' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 18 }}>Update Financial Data</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            {[['cash','Current cash ($)'],['monthly_burn','Monthly burn ($)'],['monthly_revenue','Monthly revenue ($)'],['burn_fixed','Fixed burn ($)'],['burn_variable','Variable burn ($)']].map(([k,l]) => (
              <div key={k}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: 0.6 }}>{l}</label>
                <input type="number" value={(form as any)[k]} onChange={e => setForm(f => ({...f, [k]: e.target.value}))} style={inpStyle} placeholder="0" />
              </div>
            ))}
          </div>
          <button onClick={saveData} disabled={saving} style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 11, padding: '11px 24px', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      )}

      {data && (
        <>
          {/* Status bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Cash', value: fmt(data.cash), icon: '💰', color: 'var(--text)' },
              { label: 'Monthly burn', value: fmt(data.monthly_burn), icon: '🔥', color: 'var(--danger)' },
              { label: 'Revenue', value: fmt(data.monthly_revenue), icon: '📈', color: 'var(--success)' },
              { label: 'Runway', value: `${data.runway_months} mo`, icon: '⏱', color: statusColor(data.status) },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '18px 20px', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.7 }}>{s.icon} {s.label}</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: s.color, letterSpacing: -0.8 }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Runway tracker */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: '22px 24px', marginBottom: 16, boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.9, marginBottom: 4 }}>Runway</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: statusColor(data.status), letterSpacing: -0.8 }}>{data.runway_months} months</div>
              </div>
              <div style={{ padding: '7px 16px', background: statusColor(data.status) + '15', color: statusColor(data.status), borderRadius: 100, fontSize: 13, fontWeight: 700, border: `1px solid ${statusColor(data.status)}30`, textTransform: 'capitalize' as const }}>
                {data.status}
              </div>
            </div>
            <RunwayBar months={data.runway_months} />
          </div>

          {/* Burn breakdown */}
          {(data.burn_fixed > 0 || data.burn_variable > 0) && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: '22px 24px', marginBottom: 16, boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.9, marginBottom: 16 }}>Burn Breakdown</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                {[{ label: 'Fixed', value: data.burn_fixed, color: 'var(--danger)' }, { label: 'Variable', value: data.burn_variable, color: 'var(--warning)' }].map(b => (
                  <div key={b.label} style={{ background: 'var(--surface2)', borderRadius: 12, padding: '14px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 6, fontWeight: 600 }}>{b.label}</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: b.color, marginBottom: 6, letterSpacing: -0.5 }}>{fmt(b.value)}</div>
                    <div style={{ height: 4, background: 'var(--surface3)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(b.value / data.monthly_burn) * 100}%`, background: b.color, borderRadius: 3 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Forecast */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: '22px 24px', marginBottom: 16, boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.9, marginBottom: 16 }}>30 / 60 / 90 Day Forecast</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
              {[30, 60, 90].map(days => {
                const cashLeft = data.cash - ((data.monthly_burn - data.monthly_revenue) * (days / 30))
                const runwayLeft = data.runway_months - (days / 30)
                const ok = cashLeft > 0
                return (
                  <div key={days} style={{ background: 'var(--surface2)', borderRadius: 12, padding: '16px', border: `1px solid ${ok ? 'var(--border)' : 'var(--danger-border)'}` }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.7 }}>{days} days</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: ok ? 'var(--text)' : 'var(--danger)', letterSpacing: -0.5, marginBottom: 4 }}>{ok ? fmt(cashLeft) : 'Depleted'}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{ok ? `${Math.max(0, Math.floor(runwayLeft))} months runway left` : 'Cash depleted'}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Scenarios */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: '22px 24px', marginBottom: 16, boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.9, marginBottom: 16 }}>Scenario Analysis</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
              {SCENARIOS.map(s => (
                <button key={s.type} onClick={() => setActiveScenario(s)} style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 14px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-strong)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)' }}>
                  <div style={{ fontSize: 22, marginBottom: 10 }}>{s.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{s.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>+{fmt(s.monthly_impact)}/mo impact</div>
                </button>
              ))}
            </div>
          </div>

          {/* Insights */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: '22px 24px', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.9, marginBottom: 16 }}>Smart Insights</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                data.runway_months < 6 && { severity: 'critical', text: `Runway is below 6 months. Requires immediate action — prioritise revenue or reduce burn.` },
                data.runway_months < 12 && data.runway_months >= 6 && { severity: 'warning', text: `Runway drops below 6 months in ${Math.round((data.runway_months - 6) * 30)} days at current burn rate.` },
                data.monthly_revenue < data.monthly_burn * 0.5 && { severity: 'warning', text: `Revenue covers only ${Math.round((data.monthly_revenue / data.monthly_burn) * 100)}% of burn. Growth must accelerate to extend runway.` },
                data.burn_variable > data.burn_fixed && { severity: 'info', text: `Variable burn (${fmt(data.burn_variable)}) exceeds fixed burn. You have more cost flexibility than average.` },
                data.runway_months >= 18 && { severity: 'stable', text: `Runway is strong at ${data.runway_months} months. Focus on growth over cost optimisation.` },
              ].filter(Boolean).slice(0, 3).map((insight: any, i) => (
                <div key={i} style={{ padding: '12px 14px', background: insight.severity === 'critical' ? 'var(--danger-bg)' : insight.severity === 'warning' ? 'var(--warning-bg)' : insight.severity === 'stable' ? 'var(--success-bg)' : 'var(--surface2)', borderRadius: 11, border: `1px solid ${insight.severity === 'critical' ? 'var(--danger-border)' : insight.severity === 'warning' ? 'var(--warning-border)' : insight.severity === 'stable' ? 'var(--success-border)' : 'var(--border)'}` }}>
                  <p style={{ fontSize: 13, color: insight.severity === 'critical' ? 'var(--danger)' : insight.severity === 'warning' ? 'var(--warning)' : insight.severity === 'stable' ? 'var(--success)' : 'var(--text)', lineHeight: 1.6, fontWeight: 500 }}>{insight.text}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeScenario && data && <ScenarioModal scenario={activeScenario} data={data} onClose={() => setActiveScenario(null)} />}
    </div>
  )
}
