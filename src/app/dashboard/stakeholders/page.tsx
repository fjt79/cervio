'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Users, Plus, X, MessageSquare, ArrowLeft, Clock, Star, AlertCircle, CheckCircle, ChevronDown, ChevronUp, Copy } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Stakeholder {
  id: string
  name: string
  role?: string
  company?: string
  email?: string
  phone?: string
  relationship_type: string
  importance: number
  sentiment: string
  last_contact_date?: string
  next_followup_date?: string
  contact_frequency: string
  notes?: string
  interactions: Array<{ date: string; type: string; summary: string; outcome?: string }>
}

const RELATIONSHIP_TYPES = ['investor', 'board', 'client', 'partner', 'advisor', 'team', 'other']
const SENTIMENTS = [
  { value: 'positive', label: 'Positive', color: '#4ade80' },
  { value: 'neutral', label: 'Neutral', color: '#6b6b80' },
  { value: 'needs_attention', label: 'Needs attention', color: '#fbbf24' },
  { value: 'at_risk', label: 'At risk', color: '#f87171' },
]
const MESSAGE_TYPES = ['check-in', 'update', 'intro request', 'thank you', 'follow-up', 'meeting request']

function daysAgo(date?: string) {
  if (!date) return null
  const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return `${days}d ago`
}

function daysUntil(date?: string) {
  if (!date) return null
  const days = Math.ceil((new Date(date).getTime() - Date.now()) / 86400000)
  if (days < 0) return `${Math.abs(days)}d overdue`
  if (days === 0) return 'Today'
  return `In ${days}d`
}

export default function StakeholdersPage() {
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [selected, setSelected] = useState<Stakeholder | null>(null)
  const [draftMessage, setDraftMessage] = useState('')
  const [draftingFor, setDraftingFor] = useState<string | null>(null)
  const [messageType, setMessageType] = useState('check-in')
  const [messageContext, setMessageContext] = useState('')
  const [filter, setFilter] = useState('all')
  const [newInteraction, setNewInteraction] = useState({ type: 'call', summary: '', outcome: '' })
  const [showAddInteraction, setShowAddInteraction] = useState(false)

  const [form, setForm] = useState({
    name: '', role: '', company: '', email: '', phone: '',
    relationship_type: 'investor', importance: 3, sentiment: 'neutral',
    contact_frequency: 'monthly', notes: '', last_contact_date: '', next_followup_date: '',
  })

  useEffect(() => { load() }, [])

  const getHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return { 'Authorization': `Bearer ${session?.access_token}`, 'Content-Type': 'application/json' }
  }

  const load = async () => {
    const headers = await getHeaders()
    const res = await fetch('/api/stakeholders', { headers })
    const data = await res.json()
    if (res.ok) setStakeholders(data.stakeholders)
    setLoading(false)
  }

  const create = async () => {
    if (!form.name) { toast.error('Name is required'); return }
    const headers = await getHeaders()
    const res = await fetch('/api/stakeholders', { method: 'POST', headers, body: JSON.stringify(form) })
    const data = await res.json()
    if (!res.ok) { toast.error(data.error); return }
    setStakeholders(prev => [...prev, data.stakeholder])
    setShowCreate(false)
    setForm({ name: '', role: '', company: '', email: '', phone: '', relationship_type: 'investor', importance: 3, sentiment: 'neutral', contact_frequency: 'monthly', notes: '', last_contact_date: '', next_followup_date: '' })
    toast.success('Stakeholder added!')
  }

  const draftMsg = async (s: Stakeholder) => {
    setDraftingFor(s.id)
    setDraftMessage('')
    const headers = await getHeaders()
    const res = await fetch('/api/stakeholders', {
      method: 'POST', headers,
      body: JSON.stringify({ action: 'draft_message', stakeholder: s, message_type: messageType, context: messageContext }),
    })
    const data = await res.json()
    if (res.ok) setDraftMessage(data.message)
    else toast.error(data.error)
    setDraftingFor(null)
  }

  const logInteraction = async () => {
    if (!selected || !newInteraction.summary) return
    const updated = [...(selected.interactions || []), { date: new Date().toISOString(), ...newInteraction }]
    const headers = await getHeaders()
    const res = await fetch('/api/stakeholders', { method: 'PATCH', headers, body: JSON.stringify({ id: selected.id, interactions: updated, last_contact_date: new Date().toISOString().split('T')[0] }) })
    const data = await res.json()
    if (res.ok) {
      setSelected(data.stakeholder)
      setStakeholders(prev => prev.map(s => s.id === data.stakeholder.id ? data.stakeholder : s))
      setNewInteraction({ type: 'call', summary: '', outcome: '' })
      setShowAddInteraction(false)
      toast.success('Interaction logged!')
    }
  }

  const filtered = stakeholders.filter(s => filter === 'all' || s.relationship_type === filter)
  const overdue = stakeholders.filter(s => s.next_followup_date && new Date(s.next_followup_date) < new Date())
  const inputStyle = { width: '100%', background: '#1a1a24', border: '1px solid #2a2a3a', borderRadius: 8, padding: '8px 12px', color: '#e8e8f0', fontSize: 13, fontFamily: 'inherit' }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-muted hover:text-text text-sm mb-6 transition-colors">
          <ArrowLeft size={14} />Back to Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-text mb-2">Stakeholders</h1>
            <p className="text-muted text-sm">Track your key relationships. Never let one go cold.</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="btn-primary" style={{ width: 'auto', padding: '8px 20px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={14} />Add Stakeholder
          </button>
        </div>
      </div>

      {/* Overdue alerts */}
      {overdue.length > 0 && (
        <div style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertCircle size={14} style={{ color: '#fbbf24', flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: '#e8e8f0' }}>
            <strong style={{ color: '#fbbf24' }}>{overdue.length} relationship{overdue.length > 1 ? 's' : ''}</strong> overdue for follow-up: {overdue.map(s => s.name).join(', ')}
          </span>
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['all', ...RELATIONSHIP_TYPES].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: '5px 14px', fontSize: 12, borderRadius: 20, border: '1px solid', background: filter === f ? 'rgba(201,169,110,0.12)' : 'transparent', borderColor: filter === f ? 'rgba(201,169,110,0.4)' : '#2a2a3a', color: filter === f ? '#c9a96e' : '#6b6b80', cursor: 'pointer', textTransform: 'capitalize' }}>
            {f}
          </button>
        ))}
      </div>

      {loading ? null : (
        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: 16 }}>
          {/* Stakeholder list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.length === 0 ? (
              <div className="card text-center py-12">
                <Users size={28} style={{ color: '#6b6b80', margin: '0 auto 12px' }} />
                <p className="text-muted text-sm mb-4">No stakeholders yet</p>
                <button onClick={() => setShowCreate(true)} className="btn-primary mx-auto" style={{ width: 'auto', padding: '8px 20px' }}>Add your first stakeholder</button>
              </div>
            ) : filtered.map(s => {
              const sentiment = SENTIMENTS.find(x => x.value === s.sentiment)
              const isOverdue = s.next_followup_date && new Date(s.next_followup_date) < new Date()
              return (
                <div key={s.id} onClick={() => setSelected(selected?.id === s.id ? null : s)} style={{ background: '#111118', border: `1px solid ${selected?.id === s.id ? 'rgba(201,169,110,0.3)' : '#2a2a3a'}`, borderRadius: 12, padding: '14px 16px', cursor: 'pointer', transition: 'all 0.15s' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(201,169,110,0.12)', border: '1px solid rgba(201,169,110,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#c9a96e', flexShrink: 0 }}>
                      {s.name[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#e8e8f0' }}>{s.name}</span>
                        <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: sentiment?.color + '20', color: sentiment?.color, fontWeight: 500 }}>{sentiment?.label}</span>
                        {isOverdue && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}>Follow-up overdue</span>}
                      </div>
                      <div style={{ fontSize: 12, color: '#6b6b80' }}>
                        {s.role}{s.company ? ` · ${s.company}` : ''} · <span style={{ textTransform: 'capitalize' }}>{s.relationship_type}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ display: 'flex', gap: 2, justifyContent: 'flex-end', marginBottom: 4 }}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={10} style={{ color: i < s.importance ? '#c9a96e' : '#2a2a3a', fill: i < s.importance ? '#c9a96e' : 'transparent' }} />
                        ))}
                      </div>
                      {s.last_contact_date && <div style={{ fontSize: 11, color: '#6b6b80' }}>{daysAgo(s.last_contact_date)}</div>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Detail panel */}
          {selected && (
            <div style={{ background: '#111118', border: '1px solid #2a2a3a', borderRadius: 14, padding: 20, height: 'fit-content', position: 'sticky', top: 16 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 20, color: '#e8e8f0', fontWeight: 700 }}>{selected.name}</h2>
                  <p style={{ fontSize: 13, color: '#6b6b80' }}>{selected.role}{selected.company ? ` · ${selected.company}` : ''}</p>
                </div>
                <button onClick={() => setSelected(null)} style={{ width: 28, height: 28, borderRadius: 8, background: '#1a1a24', border: '1px solid #2a2a3a', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6b6b80' }}>
                  <X size={13} />
                </button>
              </div>

              {/* Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #2a2a3a' }}>
                {selected.email && <div style={{ fontSize: 12, color: '#c0c0cc' }}>✉ {selected.email}</div>}
                {selected.phone && <div style={{ fontSize: 12, color: '#c0c0cc' }}>📞 {selected.phone}</div>}
                <div style={{ fontSize: 12, color: '#6b6b80' }}>Last contact: {selected.last_contact_date ? daysAgo(selected.last_contact_date) : 'Never logged'}</div>
                <div style={{ fontSize: 12, color: selected.next_followup_date && new Date(selected.next_followup_date) < new Date() ? '#fbbf24' : '#6b6b80' }}>
                  Next follow-up: {selected.next_followup_date ? daysUntil(selected.next_followup_date) : 'Not set'}
                </div>
                {selected.notes && <p style={{ fontSize: 12, color: '#6b6b80', lineHeight: 1.6, marginTop: 4 }}>{selected.notes}</p>}
              </div>

              {/* Draft message */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#6b6b80', letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>Draft a message</div>
                <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                  {MESSAGE_TYPES.map(t => (
                    <button key={t} onClick={() => setMessageType(t)} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, border: '1px solid', background: messageType === t ? 'rgba(201,169,110,0.12)' : 'transparent', borderColor: messageType === t ? 'rgba(201,169,110,0.3)' : '#2a2a3a', color: messageType === t ? '#c9a96e' : '#6b6b80', cursor: 'pointer' }}>
                      {t}
                    </button>
                  ))}
                </div>
                <input value={messageContext} onChange={e => setMessageContext(e.target.value)} placeholder="Any context for this message..." style={{ ...inputStyle, marginBottom: 8 }} />
                <button onClick={() => draftMsg(selected)} disabled={draftingFor === selected.id} style={{ width: '100%', background: '#1a1a24', border: '1px solid #2a2a3a', borderRadius: 8, padding: '7px 0', fontSize: 12, color: '#c9a96e', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <MessageSquare size={12} />
                  {draftingFor === selected.id ? 'Drafting...' : 'Draft message with AI'}
                </button>
                {draftMessage && draftingFor === null && (
                  <div style={{ marginTop: 10, background: 'rgba(201,169,110,0.06)', border: '1px solid rgba(201,169,110,0.2)', borderRadius: 8, padding: 12 }}>
                    <p style={{ fontSize: 13, color: '#e8e8f0', lineHeight: 1.6, marginBottom: 8 }}>{draftMessage}</p>
                    <button onClick={() => { navigator.clipboard.writeText(draftMessage); toast.success('Copied!') }} style={{ fontSize: 11, color: '#c9a96e', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Copy size={11} />Copy message
                    </button>
                  </div>
                )}
              </div>

              {/* Interactions */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: '#6b6b80', letterSpacing: 1, textTransform: 'uppercase' }}>Interaction history</div>
                  <button onClick={() => setShowAddInteraction(!showAddInteraction)} style={{ fontSize: 11, color: '#c9a96e', background: 'none', border: 'none', cursor: 'pointer' }}>
                    {showAddInteraction ? 'Cancel' : '+ Log interaction'}
                  </button>
                </div>

                {showAddInteraction && (
                  <div style={{ background: '#1a1a24', borderRadius: 8, padding: 10, marginBottom: 10 }}>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                      {['call', 'email', 'meeting', 'message', 'other'].map(t => (
                        <button key={t} onClick={() => setNewInteraction(i => ({ ...i, type: t }))} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, border: '1px solid', background: newInteraction.type === t ? 'rgba(201,169,110,0.12)' : 'transparent', borderColor: newInteraction.type === t ? 'rgba(201,169,110,0.3)' : '#2a2a3a', color: newInteraction.type === t ? '#c9a96e' : '#6b6b80', cursor: 'pointer' }}>
                          {t}
                        </button>
                      ))}
                    </div>
                    <input value={newInteraction.summary} onChange={e => setNewInteraction(i => ({ ...i, summary: e.target.value }))} placeholder="What was discussed?" style={{ ...inputStyle, marginBottom: 6 }} />
                    <input value={newInteraction.outcome} onChange={e => setNewInteraction(i => ({ ...i, outcome: e.target.value }))} placeholder="Outcome / next steps..." style={{ ...inputStyle, marginBottom: 8 }} />
                    <button onClick={logInteraction} style={{ width: '100%', background: '#c9a96e', border: 'none', borderRadius: 8, padding: '7px 0', fontSize: 12, fontWeight: 600, color: '#0a0a0f', cursor: 'pointer' }}>
                      Log Interaction
                    </button>
                  </div>
                )}

                {(selected.interactions || []).slice().reverse().map((interaction, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <CheckCircle size={12} style={{ color: '#4ade80', flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <div style={{ fontSize: 12, color: '#e8e8f0' }}>{interaction.summary}</div>
                      {interaction.outcome && <div style={{ fontSize: 11, color: '#6b6b80' }}>→ {interaction.outcome}</div>}
                      <div style={{ fontSize: 10, color: '#6b6b80', marginTop: 2 }}>{new Date(interaction.date).toLocaleDateString('en-AU')} · {interaction.type}</div>
                    </div>
                  </div>
                ))}
                {(!selected.interactions || selected.interactions.length === 0) && !showAddInteraction && (
                  <p style={{ fontSize: 12, color: '#6b6b80', fontStyle: 'italic' }}>No interactions logged yet</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,10,15,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
          <div style={{ width: 500, background: '#111118', borderRadius: 16, border: '1px solid #2a2a3a', maxHeight: 'calc(100vh - 32px)', overflow: 'auto' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #2a2a3a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 18, color: '#e8e8f0', fontWeight: 700 }}>Add Stakeholder</h2>
              <button onClick={() => setShowCreate(false)} style={{ width: 28, height: 28, borderRadius: 8, background: '#1a1a24', border: '1px solid #2a2a3a', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6b6b80' }}>
                <X size={13} />
              </button>
            </div>
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[['name', 'Full Name *'], ['role', 'Role / Title'], ['company', 'Company'], ['email', 'Email'], ['phone', 'Phone']].map(([key, label]) => (
                <div key={key}>
                  <label style={{ fontSize: 11, color: '#6b6b80', marginBottom: 4, display: 'block', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>{label}</label>
                  <input value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} style={inputStyle} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 11, color: '#6b6b80', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Relationship type</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {RELATIONSHIP_TYPES.map(t => (
                    <button key={t} onClick={() => setForm(f => ({ ...f, relationship_type: t }))} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 20, border: '1px solid', background: form.relationship_type === t ? 'rgba(201,169,110,0.12)' : 'transparent', borderColor: form.relationship_type === t ? 'rgba(201,169,110,0.4)' : '#2a2a3a', color: form.relationship_type === t ? '#c9a96e' : '#6b6b80', cursor: 'pointer', textTransform: 'capitalize' }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, color: '#6b6b80', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Importance (1-5)</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => setForm(f => ({ ...f, importance: n }))} style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid', background: form.importance >= n ? 'rgba(201,169,110,0.15)' : 'transparent', borderColor: form.importance >= n ? 'rgba(201,169,110,0.4)' : '#2a2a3a', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Star size={14} style={{ color: form.importance >= n ? '#c9a96e' : '#6b6b80', fill: form.importance >= n ? '#c9a96e' : 'transparent' }} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, color: '#6b6b80', marginBottom: 4, display: 'block', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Notes</label>
                <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="What should Cervio know about this person?" rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, color: '#6b6b80', marginBottom: 4, display: 'block', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Last contact</label>
                  <input type="date" value={form.last_contact_date} onChange={e => setForm(f => ({ ...f, last_contact_date: e.target.value }))} style={{ ...inputStyle, colorScheme: 'dark' }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: '#6b6b80', marginBottom: 4, display: 'block', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>Next follow-up</label>
                  <input type="date" value={form.next_followup_date} onChange={e => setForm(f => ({ ...f, next_followup_date: e.target.value }))} style={{ ...inputStyle, colorScheme: 'dark' }} />
                </div>
              </div>
              <button onClick={create} style={{ background: '#c9a96e', color: '#0a0a0f', border: 'none', borderRadius: 10, padding: '11px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 4 }}>
                Add Stakeholder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
