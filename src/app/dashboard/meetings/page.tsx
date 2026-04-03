'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, Meeting } from '@/lib/supabase'
import Link from 'next/link'
import { Plus, Calendar, ChevronRight, Clock, ArrowLeft, CheckCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [activeBrief, setActiveBrief] = useState<any>(null)

  const [form, setForm] = useState({
    title: '',
    meeting_with: '',
    meeting_purpose: '',
    meeting_date: '',
    background: '',
  })

  useEffect(() => {
    loadMeetings()
  }, [])

  const loadMeetings = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('meetings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setMeetings(data || [])
    setLoading(false)
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    setGenerating(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const res = await fetch('/api/meetings/prep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, ...form }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setActiveBrief({ ...data.brief, meeting: form })
      await loadMeetings()
      toast.success('Meeting brief generated!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to generate brief')
    } finally {
      setGenerating(false)
    }
  }

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }))

  if (activeBrief) {
    return (
      <div className="p-6 lg:p-8 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => { setActiveBrief(null); setShowForm(false); setForm({ title: '', meeting_with: '', meeting_purpose: '', meeting_date: '', background: '' }) }} className="btn-ghost p-2">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="font-display text-3xl font-bold">Meeting Brief</h1>
            <p className="text-muted text-sm">Meeting with {activeBrief.meeting.meeting_with}</p>
          </div>
        </div>

        <div className="space-y-6 animate-slide-up">
          {/* Objective */}
          <div className="card border border-accent/30 bg-accent/5">
            <p className="text-xs font-medium text-accent uppercase tracking-wider mb-2">Objective</p>
            <p className="font-semibold">{activeBrief.objective}</p>
          </div>

          {/* Key Points */}
          <div className="card">
            <p className="text-xs font-medium text-accent2 uppercase tracking-wider mb-3">Key Points to Make</p>
            <ul className="space-y-2">
              {activeBrief.key_points?.map((p: string, i: number) => (
                <li key={i} className="flex gap-2 text-sm">
                  <span className="text-accent2 flex-shrink-0">→</span>
                  <span className="text-text/90">{p}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Questions */}
          <div className="card">
            <p className="text-xs font-medium text-success uppercase tracking-wider mb-3">Questions to Ask</p>
            <ul className="space-y-2">
              {activeBrief.questions?.map((q: string, i: number) => (
                <li key={i} className="flex gap-2 text-sm">
                  <span className="text-success flex-shrink-0">?</span>
                  <span className="text-text/90">{q}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Risks */}
          {activeBrief.risks?.length > 0 && (
            <div className="card">
              <p className="text-xs font-medium text-warning uppercase tracking-wider mb-3">Risks & Sensitivities</p>
              <ul className="space-y-2">
                {activeBrief.risks.map((r: string, i: number) => (
                  <li key={i} className="flex gap-2 text-sm">
                    <span className="text-warning flex-shrink-0">⚠</span>
                    <span className="text-text/80">{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommended outcome */}
          <div className="card border border-success/30 bg-success/5">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle size={14} className="text-success" />
              <p className="text-xs font-medium text-success uppercase tracking-wider">Push For This Outcome</p>
            </div>
            <p className="font-semibold text-sm">{activeBrief.recommended_outcome}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1">Meeting Prep</h1>
          <p className="text-muted text-sm">Walk into every meeting sharp and prepared.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Prep a Meeting
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleGenerate} className="card mb-8 space-y-4 animate-slide-up">
          <h3 className="font-display text-lg font-bold">New Meeting Brief</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Meeting title</label>
              <input className="input" placeholder="e.g. Investor pitch — Series A" value={form.title} onChange={e => update('title', e.target.value)} required />
            </div>
            <div>
              <label className="label">Meeting with</label>
              <input className="input" placeholder="e.g. John Smith, Sequoia Capital" value={form.meeting_with} onChange={e => update('meeting_with', e.target.value)} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Purpose</label>
              <input className="input" placeholder="e.g. Pitch for Series A investment" value={form.meeting_purpose} onChange={e => update('meeting_purpose', e.target.value)} required />
            </div>
            <div>
              <label className="label">Meeting date (optional)</label>
              <input type="datetime-local" className="input" value={form.meeting_date} onChange={e => update('meeting_date', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Background & context (optional)</label>
            <textarea className="textarea" placeholder="Any relevant background — previous conversations, their priorities, your relationship, what you know about them..." value={form.background} onChange={e => update('background', e.target.value)} />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={generating} className="btn-primary flex items-center gap-2 flex-1">
              {generating ? <><div className="spinner" /> Generating brief...</> : <><Calendar size={16} /> Generate Meeting Brief</>}
            </button>
          </div>
        </form>
      )}

      {/* List */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="spinner" style={{ width: 32, height: 32 }} />
        </div>
      ) : meetings.length === 0 && !showForm ? (
        <div className="card text-center py-16">
          <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-6">
            <Calendar size={24} className="text-accent" />
          </div>
          <h3 className="font-display text-xl font-bold mb-2">No meeting briefs yet</h3>
          <p className="text-muted text-sm max-w-sm mx-auto mb-8">
            Prep for any meeting in seconds — investor pitch, board update, client negotiation, tough conversation.
          </p>
          <button onClick={() => setShowForm(true)} className="btn-primary inline-flex items-center gap-2">
            <Plus size={16} /> Prep your first meeting
          </button>
        </div>
      ) : meetings.length > 0 && (
        <div className="space-y-4">
          {meetings.map(meeting => (
            <div key={meeting.id} className="card-hover flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                <Calendar size={16} className="text-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm mb-0.5">{meeting.title}</h3>
                <p className="text-muted text-xs mb-2">With {meeting.meeting_with} · {meeting.meeting_purpose}</p>
                {meeting.brief?.objective && (
                  <p className="text-xs text-text/70 line-clamp-1 italic">"{meeting.brief.objective}"</p>
                )}
                <span className="flex items-center gap-1 text-xs text-muted mt-2">
                  <Clock size={10} /> {formatDate(meeting.created_at!)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
