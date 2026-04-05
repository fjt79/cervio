'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Calendar, X, ChevronDown, ChevronUp, Clock, Zap, Copy, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const T = {
  danger: '#c41e1e', dangerBg: 'rgba(196,30,30,0.07)', dangerBorder: 'rgba(196,30,30,0.22)',
  success: '#146c34', successBg: 'rgba(20,108,52,0.07)', successBorder: 'rgba(20,108,52,0.22)',
  accent: '#1d4ed8', accentLight: 'rgba(29,78,216,0.09)', accentMid: 'rgba(29,78,216,0.18)',
  warning: '#a16207', warningBg: 'rgba(161,98,7,0.07)', warningBorder: 'rgba(161,98,7,0.2)',
  purple: '#5b21b6', purpleBg: 'rgba(91,33,182,0.07)', purpleBorder: 'rgba(91,33,182,0.18)',
  shadowSm: '0 2px 6px rgba(10,10,11,0.07)', shadowMd: '0 6px 18px rgba(10,10,11,0.09)',
}

function MeetingCard({ meeting, onDelete }: { meeting: any; onDelete: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)
  const brief = meeting.ai_brief

  const copyBrief = () => {
    if (!brief) return
    const text = [brief.summary, brief.talking_points?.join('\n'), brief.questions?.join('\n')].filter(Boolean).join('\n\n')
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Brief copied')
  }

  const isPast = meeting.meeting_date && new Date(meeting.meeting_date) < new Date()

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', boxShadow: T.shadowSm, marginBottom: 10, transition: 'all 0.15s' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; (e.currentTarget as HTMLElement).style.boxShadow = T.shadowMd }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = T.shadowSm }}>

      <button onClick={() => setExpanded(!expanded)} style={{ width: '100%', padding: '18px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7, flexWrap: 'wrap' as const }}>
              {brief && <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 100, background: T.successBg, color: T.success, border: `1px solid ${T.successBorder}` }}>Brief ready</span>}
              {isPast && <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 100, background: 'var(--surface2)', color: 'var(--text-tertiary)', border: '1px solid var(--border)' }}>Past</span>}
              {!isPast && meeting.meeting_date && <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 9px', borderRadius: 100, background: T.accentLight, color: T.accent, border: `1px solid ${T.accentMid}` }}>Upcoming</span>}
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 4, letterSpacing: -0.2 }}>{meeting.title}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' as const }}>
              {meeting.meeting_with && <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>👤 {meeting.meeting_with}</span>}
              {meeting.meeting_date && <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>📅 {new Date(meeting.meeting_date).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })}</span>}
            </div>
          </div>
          <div style={{ flexShrink: 0 }}>
            {expanded ? <ChevronUp size={14} style={{ color: 'var(--text-tertiary)' }} /> : <ChevronDown size={14} style={{ color: 'var(--text-tertiary)' }} />}
          </div>
        </div>
      </button>

      {expanded && (
        <div style={{ padding: '0 20px 18px', borderTop: '1px solid var(--border)' }}>
          <div style={{ paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>

            {meeting.meeting_purpose && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.9, marginBottom: 7 }}>Purpose</div>
                <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.65 }}>{meeting.meeting_purpose}</p>
              </div>
            )}

            {brief && (
              <>
                {brief.summary && (
                  <div style={{ padding: '14px 16px', background: T.accentLight, borderRadius: 12, border: `1px solid ${T.accentMid}` }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: T.accent, textTransform: 'uppercase', letterSpacing: 0.9, marginBottom: 7 }}>AI Summary</div>
                    <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.68 }}>{brief.summary}</p>
                  </div>
                )}

                {brief.talking_points?.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.9, marginBottom: 10 }}>Talking Points</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                      {brief.talking_points.map((pt: string, i: number) => (
                        <div key={i} style={{ padding: '10px 14px', background: 'var(--surface2)', borderRadius: 10, border: '1px solid var(--border)', borderLeft: `3px solid ${T.accent}`, fontSize: 14, color: 'var(--text)', lineHeight: 1.6 }}>
                          {pt}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {brief.questions?.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.9, marginBottom: 10 }}>Questions to Ask</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                      {brief.questions.map((q: string, i: number) => (
                        <div key={i} style={{ padding: '10px 14px', background: T.purpleBg, borderRadius: 10, border: `1px solid ${T.purpleBorder}`, fontSize: 14, color: 'var(--text)', lineHeight: 1.6 }}>
                          {q}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {brief.context && (
                  <div style={{ padding: '12px 14px', background: 'var(--surface2)', borderRadius: 11, border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.9, marginBottom: 6 }}>Context</div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{brief.context}</p>
                  </div>
                )}
              </>
            )}

            <div style={{ display: 'flex', gap: 9 }}>
              {brief && (
                <button onClick={copyBrief} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: copied ? T.successBg : 'var(--surface2)', color: copied ? T.success : 'var(--text-secondary)', border: `1px solid ${copied ? T.successBorder : 'var(--border)'}`, borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s' }}>
                  {copied ? <CheckCircle size={13} /> : <Copy size={13} />}{copied ? 'Copied' : 'Copy brief'}
                </button>
              )}
              <button onClick={() => onDelete(meeting.id)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', background: T.dangerBg, color: T.danger, border: `1px solid ${T.dangerBorder}`, borderRadius: 9, fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                <X size={12} />Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function NewMeetingModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ title: '', meeting_with: '', meeting_purpose: '', meeting_date: '', background: '' })
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)

  const handleSave = async (generate = false) => {
    if (!form.title.trim()) { toast.error('Title is required'); return }
    generate ? setGenerating(true) : setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: meeting, error } = await supabase.from('meetings').insert({ user_id: user.id, ...form, created_at: new Date().toISOString() }).select().single()
      if (error) throw error
      if (generate && meeting) {
        const { data: { session } } = await supabase.auth.getSession()
        await fetch('/api/meetings/brief', { method: 'POST', headers: { 'Authorization': `Bearer ${session?.access_token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ meetingId: meeting.id }) })
        toast.success('Brief generated')
      } else { toast.success('Meeting saved') }
      onCreated(); onClose()
    } catch (err: any) { toast.error(err.message) }
    finally { setSaving(false); setGenerating(false) }
  }

  const inp = { width: '100%', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', fontSize: 15, color: 'var(--text)', fontFamily: 'inherit', outline: 'none' } as React.CSSProperties

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ width: 520, maxHeight: '90vh', background: 'var(--surface)', border: '1px solid var(--border-strong)', borderRadius: 20, boxShadow: '0 32px 80px rgba(0,0,0,0.2)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>New Meeting Prep</div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--surface2)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}><X size={14} /></button>
        </div>
        <div style={{ padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[['title', 'Meeting title', 'e.g. Q2 review with Sarah', false], ['meeting_with', 'Meeting with', 'Name or role', false], ['meeting_purpose', 'Purpose', 'What is this meeting for?', false], ['background', 'Background / context', 'Anything Cervio should know...', true]].map(([k, label, ph, multi]: any) => (
            <div key={k}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.6 }}>{label}</label>
              {multi
                ? <textarea rows={3} placeholder={ph} value={(form as any)[k]} onChange={e => setForm(f => ({...f, [k]: e.target.value}))} style={{ ...inp, resize: 'vertical' }} />
                : <input placeholder={ph} value={(form as any)[k]} onChange={e => setForm(f => ({...f, [k]: e.target.value}))} style={inp} />
              }
            </div>
          ))}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.6 }}>Date</label>
            <input type="date" value={form.meeting_date} onChange={e => setForm(f => ({...f, meeting_date: e.target.value}))} style={inp} />
          </div>
        </div>
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, flexShrink: 0 }}>
          <button onClick={() => handleSave(true)} disabled={generating || saving} style={{ flex: 1, padding: '12px 0', background: T.accent, color: 'white', border: 'none', borderRadius: 11, fontSize: 14, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, boxShadow: '0 2px 8px rgba(29,78,216,0.3)', opacity: generating ? 0.7 : 1 }}>
            <Zap size={14} />{generating ? 'Generating...' : 'Save & Generate Brief'}
          </button>
          <button onClick={() => handleSave(false)} disabled={saving || generating} style={{ padding: '12px 18px', background: 'var(--surface2)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 11, fontSize: 14, cursor: 'pointer', fontWeight: 500 }}>Save only</button>
        </div>
      </div>
    </div>
  )
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)

  useEffect(() => { loadMeetings() }, [])

  const loadMeetings = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('meetings').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setMeetings(data || [])
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    await supabase.from('meetings').delete().eq('id', id)
    setMeetings(prev => prev.filter(m => m.id !== id))
    toast.success('Deleted')
  }

  const upcoming = meetings.filter(m => m.meeting_date && new Date(m.meeting_date) >= new Date())
  const past = meetings.filter(m => !m.meeting_date || new Date(m.meeting_date) < new Date())

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '28px 28px 120px' }}>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <Calendar size={22} style={{ color: T.accent }} />
            <h1 style={{ fontSize: 32, fontWeight: 800, color: 'var(--text)', letterSpacing: -0.8 }}>Meeting Prep</h1>
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>AI-prepared briefs before every meeting</p>
        </div>
        <button onClick={() => setShowNew(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 18px', background: T.accent, color: 'white', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(29,78,216,0.3)' }}>
          <Plus size={15} />New Meeting
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 28 }}>
        {[
          { label: 'Total meetings', value: meetings.length, color: 'var(--text)' },
          { label: 'Upcoming', value: upcoming.length, color: T.accent },
          { label: 'Briefs ready', value: meetings.filter(m => m.ai_brief).length, color: T.success },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--surface)', borderRadius: 14, padding: '16px', border: '1px solid var(--border)', boxShadow: T.shadowSm }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 8 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color, letterSpacing: -0.8 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>Loading...</div>
      ) : meetings.length === 0 ? (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 18, padding: '48px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 36, marginBottom: 14 }}>📅</div>
          <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>No meetings yet</div>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>Add an upcoming meeting and Cervio will prepare your brief automatically.</p>
          <button onClick={() => setShowNew(true)} style={{ padding: '10px 22px', background: T.accent, color: 'white', border: 'none', borderRadius: 11, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Add first meeting</button>
        </div>
      ) : (
        <>
          {upcoming.length > 0 && (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Upcoming</div>
              {upcoming.map(m => <MeetingCard key={m.id} meeting={m} onDelete={handleDelete} />)}
            </>
          )}
          {past.length > 0 && (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12, marginTop: upcoming.length > 0 ? 24 : 0 }}>Past</div>
              {past.map(m => <MeetingCard key={m.id} meeting={m} onDelete={handleDelete} />)}
            </>
          )}
        </>
      )}

      {showNew && <NewMeetingModal onClose={() => setShowNew(false)} onCreated={loadMeetings} />}
    </div>
  )
}
