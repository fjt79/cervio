'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { FileText, ArrowLeft, Copy, ChevronDown, ChevronUp, Clock } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface UpdateSection { title: string; content: string }
interface GeneratedUpdate {
  subject: string
  sections: UpdateSection[]
  tldr: string
  tone_notes: string
}
interface SavedUpdate {
  id: string
  period: string
  update_type: string
  content: GeneratedUpdate
  created_at: string
}

const UPDATE_TYPES = [
  { value: 'board', label: 'Board Update', desc: 'Formal board/directors update' },
  { value: 'investor', label: 'Investor Update', desc: 'Monthly investor email' },
  { value: 'monthly', label: 'Monthly Update', desc: 'General stakeholder update' },
]

const TONE_OPTIONS = [
  { value: 'confident', label: 'Confident & direct' },
  { value: 'professional', label: 'Professional & formal' },
  { value: 'transparent', label: 'Transparent & honest' },
  { value: 'energetic', label: 'Energetic & exciting' },
]

export default function BoardUpdatePage() {
  const [generated, setGenerated] = useState<GeneratedUpdate | null>(null)
  const [past, setPast] = useState<SavedUpdate[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedPast, setExpandedPast] = useState<string | null>(null)
  const [form, setForm] = useState({
    period: '',
    update_type: 'investor',
    revenue_current: '',
    revenue_previous: '',
    revenue_target: '',
    highlights: '',
    challenges: '',
    metrics: '',
    the_ask: '',
    next_period_plan: '',
    tone: 'confident',
  })

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
    if (!form.highlights || !form.period) {
      toast.error('Period and highlights are required')
      return
    }
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
    toast.success('Copied to clipboard!')
  }

  const update = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }))

  const inputStyle = { width: '100%', background: '#1a1a24', border: '1px solid #2a2a3a', borderRadius: 10, padding: '10px 14px', color: '#e8e8f0', fontSize: 14, fontFamily: 'inherit', resize: 'vertical' as const }
  const labelStyle = { fontSize: 11, color: '#6b6b80', marginBottom: 6, display: 'block', textTransform: 'uppercase' as const, letterSpacing: '1px', fontWeight: 600 }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-muted hover:text-text text-sm mb-6 transition-colors">
          <ArrowLeft size={14} />Back to Dashboard
        </Link>
        <h1 className="font-display text-3xl font-bold text-text mb-2">Board & Investor Updates</h1>
        <p className="text-muted text-sm">Write a polished update in seconds. Fill in the details, Cervio writes it.</p>
      </div>

      {!generated ? (
        <div className="card space-y-5">
          {/* Update type */}
          <div>
            <label style={labelStyle}>Update type</label>
            <div className="grid grid-cols-3 gap-3">
              {UPDATE_TYPES.map(t => (
                <button key={t.value} onClick={() => update('update_type', t.value)} style={{ padding: '10px 12px', borderRadius: 10, border: '1px solid', background: form.update_type === t.value ? 'rgba(201,169,110,0.12)' : '#1a1a24', borderColor: form.update_type === t.value ? 'rgba(201,169,110,0.4)' : '#2a2a3a', cursor: 'pointer', textAlign: 'left' as const }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: form.update_type === t.value ? '#c9a96e' : '#e8e8f0', marginBottom: 2 }}>{t.label}</div>
                  <div style={{ fontSize: 11, color: '#6b6b80' }}>{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Period */}
          <div>
            <label style={labelStyle}>Period *</label>
            <input value={form.period} onChange={e => update('period', e.target.value)} placeholder="e.g. Q1 2026 / March 2026" style={inputStyle} />
          </div>

          {/* Revenue */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <label style={labelStyle}>Current MRR/ARR</label>
              <input value={form.revenue_current} onChange={e => update('revenue_current', e.target.value)} placeholder="e.g. $12,000 MRR" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Previous period</label>
              <input value={form.revenue_previous} onChange={e => update('revenue_previous', e.target.value)} placeholder="e.g. $9,500 MRR" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Target</label>
              <input value={form.revenue_target} onChange={e => update('revenue_target', e.target.value)} placeholder="e.g. $15,000 MRR" style={inputStyle} />
            </div>
          </div>

          {/* Highlights */}
          <div>
            <label style={labelStyle}>Highlights & wins *</label>
            <textarea value={form.highlights} onChange={e => update('highlights', e.target.value)} placeholder="What went well? Key wins, milestones, traction signals..." rows={4} style={inputStyle} />
          </div>

          {/* Challenges */}
          <div>
            <label style={labelStyle}>Challenges & risks</label>
            <textarea value={form.challenges} onChange={e => update('challenges', e.target.value)} placeholder="What's hard right now? What risks are you managing?" rows={3} style={inputStyle} />
          </div>

          {/* Key metrics */}
          <div>
            <label style={labelStyle}>Key metrics</label>
            <textarea value={form.metrics} onChange={e => update('metrics', e.target.value)} placeholder="Churn rate, CAC, pipeline, users, NPS, burn rate — whatever's relevant..." rows={3} style={inputStyle} />
          </div>

          {/* Next period */}
          <div>
            <label style={labelStyle}>Next period plan</label>
            <textarea value={form.next_period_plan} onChange={e => update('next_period_plan', e.target.value)} placeholder="What are you focused on next quarter/month?" rows={3} style={inputStyle} />
          </div>

          {/* The ask */}
          <div>
            <label style={labelStyle}>The ask (optional)</label>
            <input value={form.the_ask} onChange={e => update('the_ask', e.target.value)} placeholder="Introductions needed, advice sought, specific help required..." style={inputStyle} />
          </div>

          {/* Tone */}
          <div>
            <label style={labelStyle}>Tone</label>
            <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 8 }}>
              {TONE_OPTIONS.map(t => (
                <button key={t.value} onClick={() => update('tone', t.value)} style={{ padding: '6px 14px', fontSize: 12, borderRadius: 20, border: '1px solid', background: form.tone === t.value ? 'rgba(201,169,110,0.12)' : 'transparent', borderColor: form.tone === t.value ? 'rgba(201,169,110,0.4)' : '#2a2a3a', color: form.tone === t.value ? '#c9a96e' : '#6b6b80', cursor: 'pointer' }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <button onClick={generate} disabled={loading} className="btn-primary" style={{ marginTop: 8 }}>
            {loading ? <span className="flex items-center justify-center gap-2"><div className="spinner" />Generating your update...</span> : 'Generate Update'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* TL;DR */}
          <div className="card" style={{ borderColor: 'rgba(201,169,110,0.3)', background: 'rgba(201,169,110,0.06)' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#c9a96e', letterSpacing: 1.5, marginBottom: 8 }}>TL;DR</div>
            <p style={{ fontSize: 14, color: '#e8e8f0', lineHeight: 1.6 }}>{generated.tldr}</p>
          </div>

          {/* Subject */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 20, color: '#e8e8f0', fontWeight: 700 }}>{generated.subject}</h2>
            <button onClick={copyAll} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#c9a96e', background: 'rgba(201,169,110,0.1)', border: '1px solid rgba(201,169,110,0.2)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer' }}>
              <Copy size={12} />Copy all
            </button>
          </div>

          {/* Sections */}
          {generated.sections.map((section, i) => (
            <div key={i} className="card">
              <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 16, color: '#c9a96e', fontWeight: 700, marginBottom: 10 }}>{section.title}</h3>
              <div style={{ fontSize: 14, color: '#c0c0cc', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{section.content}</div>
            </div>
          ))}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setGenerated(null)} className="btn-secondary" style={{ flex: 1 }}>
              Edit & Regenerate
            </button>
            <button onClick={copyAll} className="btn-primary" style={{ flex: 1 }}>
              Copy to Clipboard
            </button>
          </div>
        </div>
      )}

      {/* Past updates */}
      {past.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display text-xl font-bold text-text mb-4">Past Updates</h2>
          <div className="space-y-3">
            {past.map(p => (
              <div key={p.id} className="card">
                <button onClick={() => setExpandedPast(expandedPast === p.id ? null : p.id)} className="w-full flex items-center justify-between">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <FileText size={14} style={{ color: '#c9a96e' }} />
                    <div style={{ textAlign: 'left' as const }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: '#e8e8f0' }}>{p.content.subject}</div>
                      <div style={{ fontSize: 11, color: '#6b6b80', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <Clock size={10} />
                        {p.period} · {new Date(p.created_at).toLocaleDateString('en-AU')}
                        <span style={{ background: '#1a1a24', border: '1px solid #2a2a3a', borderRadius: 20, padding: '1px 8px', marginLeft: 4 }}>{p.update_type}</span>
                      </div>
                    </div>
                  </div>
                  {expandedPast === p.id ? <ChevronUp size={14} style={{ color: '#6b6b80' }} /> : <ChevronDown size={14} style={{ color: '#6b6b80' }} />}
                </button>
                {expandedPast === p.id && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #2a2a3a' }}>
                    <p style={{ fontSize: 13, color: '#6b6b80', marginBottom: 10 }}>{p.content.tldr}</p>
                    <button onClick={() => { setGenerated(p.content); window.scrollTo(0, 0) }} style={{ fontSize: 12, color: '#c9a96e', background: 'rgba(201,169,110,0.1)', border: '1px solid rgba(201,169,110,0.2)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer' }}>
                      View full update →
                    </button>
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
