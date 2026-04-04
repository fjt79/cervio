'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { FileText, ArrowLeft, Copy, ChevronDown, ChevronUp, Clock, Sparkles } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface UpdateSection { title: string; content: string }
interface GeneratedUpdate { subject: string; sections: UpdateSection[]; tldr: string; tone_notes: string }
interface SavedUpdate { id: string; period: string; update_type: string; content: GeneratedUpdate; created_at: string }

const UPDATE_TYPES = [
  { value: 'board', label: 'Board Update', desc: 'Formal board update' },
  { value: 'investor', label: 'Investor Update', desc: 'Monthly investor email' },
  { value: 'monthly', label: 'Monthly Update', desc: 'General stakeholder update' },
]
const TONE_OPTIONS = [
  { value: 'confident', label: 'Confident' },
  { value: 'professional', label: 'Professional' },
  { value: 'transparent', label: 'Transparent' },
  { value: 'energetic', label: 'Energetic' },
]

export default function BoardUpdatePage() {
  const [generated, setGenerated] = useState<GeneratedUpdate | null>(null)
  const [past, setPast] = useState<SavedUpdate[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedPast, setExpandedPast] = useState<string | null>(null)
  const [form, setForm] = useState({ period: '', update_type: 'investor', revenue_current: '', revenue_previous: '', revenue_target: '', highlights: '', challenges: '', metrics: '', the_ask: '', next_period_plan: '', tone: 'confident' })

  useEffect(() => { loadPast() }, [])

  const getHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return { 'Authorization': `Bearer ${session?.access_token}`, 'Content-Type': 'application/json' }
  }

  const loadPast = async () => {
    const headers = await getHeaders()
    const res = await fetch('/api/board-update', { headers })
    const data = await res.json()
    if (res.ok) setPast(data.updates)
  }

  const generate = async () => {
    if (!form.highlights || !form.period) { toast.error('Period and highlights are required'); return }
    setLoading(true)
    try {
      const headers = await getHeaders()
      const res = await fetch('/api/board-update', { method: 'POST', headers, body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setGenerated(data.update)
      loadPast()
      toast.success('Update generated!')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const copyAll = () => {
    if (!generated) return
    const text = `${generated.subject}\n\nTL;DR: ${generated.tldr}\n\n${generated.sections.map(s => `${s.title}\n${s.content}`).join('\n\n')}`
    navigator.clipboard.writeText(text)
    toast.success('Copied!')
  }

  const inp = { background: 'var(--surface2)', border: '0.5px solid var(--border)', borderRadius: 10, padding: '10px 12px', color: 'var(--text)', fontSize: 14, width: '100%', fontFamily: 'inherit' } as React.CSSProperties

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '28px 20px' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: 16 }}>
          <ArrowLeft size={13} />Dashboard
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(90,200,250,0.12)', border: '0.5px solid rgba(90,200,250,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={18} style={{ color: 'var(--teal)' }} />
          </div>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)', letterSpacing: -0.5 }}>Board & Investor Updates</h1>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Write a polished update in seconds.</p>
          </div>
        </div>
      </div>

      {!generated ? (
        <div style={{ background: 'var(--surface)', borderRadius: 16, border: '0.5px solid var(--border)', padding: 24, boxShadow: 'var(--shadow-sm)' }}>
          {/* Update type */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' as const, letterSpacing: 0.8, display: 'block', marginBottom: 10 }}>Update Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
              {UPDATE_TYPES.map(t => (
                <button key={t.value} onClick={() => setForm(f => ({...f, update_type: t.value}))} style={{ padding: '12px 14px', borderRadius: 12, border: `1.5px solid ${form.update_type === t.value ? 'var(--accent)' : 'var(--border)'}`, background: form.update_type === t.value ? 'var(--accent-light)' : 'var(--surface2)', cursor: 'pointer', textAlign: 'left' as const }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: form.update_type === t.value ? 'var(--accent)' : 'var(--text)', marginBottom: 2 }}>{t.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Period */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' as const, letterSpacing: 0.8, display: 'block', marginBottom: 6 }}>Period *</label>
            <input value={form.period} onChange={e => setForm(f => ({...f, period: e.target.value}))} placeholder="e.g. Q1 2026 / March 2026" style={inp} />
          </div>

          {/* Revenue */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
            {[['revenue_current','Current MRR/ARR','$12,000 MRR'],['revenue_previous','Previous Period','$9,500 MRR'],['revenue_target','Target','$15,000 MRR']].map(([key, label, ph]) => (
              <div key={key}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' as const, letterSpacing: 0.8, display: 'block', marginBottom: 6 }}>{label}</label>
                <input value={(form as any)[key]} onChange={e => setForm(f => ({...f, [key]: e.target.value}))} placeholder={ph} style={inp} />
              </div>
            ))}
          </div>

          {/* Text areas */}
          {[
            ['highlights','Highlights & Wins *','What went well? Key wins, milestones, traction...', 4],
            ['challenges','Challenges & Risks','What\'s hard right now? What risks are you managing?', 3],
            ['metrics','Key Metrics','Churn, CAC, pipeline, NPS, burn rate...', 3],
            ['next_period_plan','Next Period Plan','What are you focused on next quarter/month?', 3],
          ].map(([key, label, ph, rows]) => (
            <div key={key as string} style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' as const, letterSpacing: 0.8, display: 'block', marginBottom: 6 }}>{label as string}</label>
              <textarea value={(form as any)[key as string]} onChange={e => setForm(f => ({...f, [key as string]: e.target.value}))} placeholder={ph as string} rows={rows as number} style={{ ...inp, resize: 'vertical' as const }} />
            </div>
          ))}

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' as const, letterSpacing: 0.8, display: 'block', marginBottom: 6 }}>The Ask (optional)</label>
            <input value={form.the_ask} onChange={e => setForm(f => ({...f, the_ask: e.target.value}))} placeholder="Introductions needed, advice sought..." style={inp} />
          </div>

          {/* Tone */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' as const, letterSpacing: 0.8, display: 'block', marginBottom: 8 }}>Tone</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {TONE_OPTIONS.map(t => (
                <button key={t.value} onClick={() => setForm(f => ({...f, tone: t.value}))} style={{ padding: '6px 16px', fontSize: 13, borderRadius: 20, border: `1.5px solid ${form.tone === t.value ? 'var(--accent)' : 'var(--border)'}`, background: form.tone === t.value ? 'var(--accent-light)' : 'transparent', color: form.tone === t.value ? 'var(--accent)' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: form.tone === t.value ? 600 : 400 }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <button onClick={generate} disabled={loading} style={{ width: '100%', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 12, padding: '13px 0', fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading ? 0.7 : 1 }}>
            {loading ? <><div className="spinner" style={{ borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }} />Generating your update...</> : <><Sparkles size={15} />Generate Update</>}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* TL;DR */}
          <div style={{ background: 'var(--accent-light)', border: '0.5px solid var(--accent)', borderRadius: 14, padding: '14px 18px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', letterSpacing: 1.5, marginBottom: 6, textTransform: 'uppercase' as const }}>TL;DR</div>
            <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.6 }}>{generated.tldr}</p>
          </div>

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)', letterSpacing: -0.3 }}>{generated.subject}</h2>
            <button onClick={copyAll} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--accent)', background: 'var(--accent-light)', border: 'none', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontWeight: 500 }}>
              <Copy size={13} />Copy all
            </button>
          </div>

          {/* Sections */}
          {generated.sections.map((section, i) => (
            <div key={i} style={{ background: 'var(--surface)', borderRadius: 14, border: '0.5px solid var(--border)', padding: '18px 20px', boxShadow: 'var(--shadow-sm)' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--accent)', marginBottom: 10 }}>{section.title}</h3>
              <div style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{section.content}</div>
            </div>
          ))}

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setGenerated(null)} style={{ flex: 1, background: 'var(--surface2)', color: 'var(--text)', border: '0.5px solid var(--border)', borderRadius: 12, padding: '12px 0', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Edit & Regenerate</button>
            <button onClick={copyAll} style={{ flex: 1, background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 12, padding: '12px 0', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Copy to Clipboard</button>
          </div>
        </div>
      )}

      {/* Past updates */}
      {past.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', marginBottom: 14, letterSpacing: -0.3 }}>Past Updates</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {past.map(p => (
              <div key={p.id} style={{ background: 'var(--surface)', borderRadius: 12, border: '0.5px solid var(--border)', overflow: 'hidden' }}>
                <button onClick={() => setExpandedPast(expandedPast === p.id ? null : p.id)} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <FileText size={14} style={{ color: 'var(--teal)' }} />
                    <div style={{ textAlign: 'left' as const }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)' }}>{p.content.subject}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                        {p.period} · {new Date(p.created_at).toLocaleDateString('en-AU')}
                        <span style={{ background: 'var(--surface2)', border: '0.5px solid var(--border)', borderRadius: 20, padding: '1px 8px' }}>{p.update_type}</span>
                      </div>
                    </div>
                  </div>
                  {expandedPast === p.id ? <ChevronUp size={14} style={{ color: 'var(--text-tertiary)' }} /> : <ChevronDown size={14} style={{ color: 'var(--text-tertiary)' }} />}
                </button>
                {expandedPast === p.id && (
                  <div style={{ padding: '0 16px 14px', borderTop: '0.5px solid var(--border)' }}>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: '12px 0 10px' }}>{p.content.tldr}</p>
                    <button onClick={() => { setGenerated(p.content); window.scrollTo(0,0) }} style={{ fontSize: 13, color: 'var(--accent)', background: 'var(--accent-light)', border: 'none', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontWeight: 500 }}>View full update →</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
