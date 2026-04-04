'use client'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { ChevronLeft, ChevronRight, Plus, X, Clock, MapPin, Users, Target, Edit3, Trash2, CheckCircle, Circle } from 'lucide-react'
import toast from 'react-hot-toast'

interface CalendarEvent {
  id: string; title: string; description?: string; location?: string
  event_type: string; color: string; start_time: string; end_time: string
  all_day: boolean; attendees: Array<{ name: string; email?: string }>
  goal_id?: string; has_brief: boolean; prep_status: string
  notes?: string; action_items: Array<{ text: string; done: boolean }>
  goals?: { id: string; title: string }
}
interface Goal { id: string; title: string }

const COLORS: Record<string, { bg: string; border: string; dot: string; text: string }> = {
  blue:   { bg: 'rgba(0,122,255,0.1)',  border: 'rgba(0,122,255,0.3)',  dot: '#007AFF', text: '#007AFF' },
  green:  { bg: 'rgba(52,199,89,0.1)',  border: 'rgba(52,199,89,0.3)',  dot: '#34C759', text: '#34C759' },
  red:    { bg: 'rgba(255,59,48,0.1)',  border: 'rgba(255,59,48,0.3)',  dot: '#FF3B30', text: '#FF3B30' },
  orange: { bg: 'rgba(255,149,0,0.1)',  border: 'rgba(255,149,0,0.3)',  dot: '#FF9500', text: '#FF9500' },
  purple: { bg: 'rgba(175,82,222,0.1)', border: 'rgba(175,82,222,0.3)', dot: '#AF52DE', text: '#AF52DE' },
  teal:   { bg: 'rgba(90,200,250,0.1)', border: 'rgba(90,200,250,0.3)', dot: '#5AC8FA', text: '#5AC8FA' },
}
const EVENT_TYPES = ['meeting','call','focus','review','deadline','personal']
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

function fmtTime(d: Date) { return d.toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit', hour12: true }) }
function fmtShort(d: Date) { return d.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' }) }
function getWeek(d: Date) {
  const day = d.getDay()
  return Array.from({ length: 7 }, (_, i) => { const dd = new Date(d); dd.setDate(d.getDate() - day + i); dd.setHours(0,0,0,0); return dd })
}
function isToday(d: Date) { return d.toDateString() === new Date().toDateString() }
const HOURS = Array.from({ length: 24 }, (_, i) => i)

export default function CalendarPage() {
  const [view, setView] = useState<'week'|'day'>('week')
  const [current, setCurrent] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [selected, setSelected] = useState<CalendarEvent | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [editingNotes, setEditingNotes] = useState(false)
  const [notes, setNotes] = useState('')
  const [newAction, setNewAction] = useState('')
  const weekDates = getWeek(current)

  const [form, setForm] = useState({ title:'',description:'',location:'',event_type:'meeting',color:'blue',start_time:'',end_time:'',attendees_text:'',goal_id:'' })

  const auth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return { 'Authorization': `Bearer ${session?.access_token}`, 'Content-Type': 'application/json' }
  }

  const load = useCallback(async () => {
    const h = await auth()
    const start = weekDates[0].toISOString()
    const end = new Date(weekDates[6].getTime() + 86400000).toISOString()
    const res = await fetch(`/api/calendar/events?start=${start}&end=${end}`, { headers: h })
    const d = await res.json()
    if (res.ok) setEvents(d.events)
  }, [current])

  useEffect(() => { load() }, [load])
  useEffect(() => { supabase.from('goals').select('id,title').eq('status','active').then(({data}) => { if(data) setGoals(data) }) }, [])

  const create = async () => {
    if (!form.title || !form.start_time) { toast.error('Title and start time required'); return }
    const h = await auth()
    const attendees = form.attendees_text ? form.attendees_text.split(',').map(a => ({ name: a.trim() })) : []
    const res = await fetch('/api/calendar/events', { method: 'POST', headers: h, body: JSON.stringify({ ...form, attendees, attendees_text: undefined }) })
    if (res.ok) { toast.success('Event created'); setShowCreate(false); setForm({ title:'',description:'',location:'',event_type:'meeting',color:'blue',start_time:'',end_time:'',attendees_text:'',goal_id:'' }); load() }
  }

  const update = async (id: string, updates: any) => {
    const h = await auth()
    const res = await fetch(`/api/calendar/events/${id}`, { method: 'PATCH', headers: h, body: JSON.stringify(updates) })
    const d = await res.json()
    if (res.ok) { setEvents(prev => prev.map(e => e.id === id ? { ...e, ...d.event } : e)); if (selected?.id === id) setSelected({ ...selected, ...d.event }) }
  }

  const del = async (id: string) => {
    if (!confirm('Delete this event?')) return
    const h = await auth()
    await fetch(`/api/calendar/events/${id}`, { method: 'DELETE', headers: h })
    setEvents(prev => prev.filter(e => e.id !== id)); setSelected(null); toast.success('Deleted')
  }

  const openCreate = (date?: Date, hour?: number) => {
    const d = new Date(date || new Date()); if (hour !== undefined) d.setHours(hour, 0, 0, 0)
    const end = new Date(d); end.setHours(end.getHours() + 1)
    const toLocal = (dt: Date) => new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
    setForm(f => ({ ...f, start_time: toLocal(d), end_time: toLocal(end) })); setShowCreate(true)
  }

  const eventsAt = (date: Date, hour: number) => events.filter(e => { const s = new Date(e.start_time); return s.toDateString() === date.toDateString() && s.getHours() === hour })
  const eventsOn = (date: Date) => events.filter(e => new Date(e.start_time).toDateString() === date.toDateString())

  const inp = { background: 'var(--surface2)', border: '0.5px solid var(--border)', borderRadius: 10, padding: '9px 12px', fontSize: 14, color: 'var(--text)', width: '100%', fontFamily: 'inherit' } as React.CSSProperties

  return (
    <div style={{ height: 'calc(100vh - 72px)', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{ padding: '14px 20px', borderBottom: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {[{dir:-1,Icon:ChevronLeft},{dir:1,Icon:ChevronRight}].map(({dir,Icon}) => (
              <button key={dir} onClick={() => { const d = new Date(current); d.setDate(d.getDate() + dir * (view === 'week' ? 7 : 1)); setCurrent(d) }} style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--surface2)', border: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text)' }}>
                <Icon size={15} />
              </button>
            ))}
          </div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', letterSpacing: -0.3 }}>
            {view === 'week' ? `${fmtShort(weekDates[0])} – ${fmtShort(weekDates[6])}, ${weekDates[0].getFullYear()}` : current.toLocaleDateString('en-AU', { weekday: 'long', month: 'long', day: 'numeric' })}
          </h1>
          <button onClick={() => setCurrent(new Date())} style={{ fontSize: 12, fontWeight: 500, color: 'var(--accent)', background: 'var(--accent-light)', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}>Today</button>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ display: 'flex', background: 'var(--surface2)', border: '0.5px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
            {(['week','day'] as const).map(v => (
              <button key={v} onClick={() => setView(v)} style={{ padding: '6px 14px', fontSize: 13, fontWeight: 500, background: view === v ? 'var(--accent)' : 'transparent', color: view === v ? 'white' : 'var(--text-secondary)', border: 'none', cursor: 'pointer', textTransform: 'capitalize' }}>{v}</button>
            ))}
          </div>
          <button onClick={() => openCreate()} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <Plus size={14} />New Event
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: view === 'week' ? '52px repeat(7,1fr)' : '52px 1fr', borderBottom: '0.5px solid var(--border)', background: 'var(--surface)', flexShrink: 0 }}>
        <div style={{ borderRight: '0.5px solid var(--border)' }} />
        {(view === 'week' ? weekDates : [current]).map((date, i) => (
          <div key={i} style={{ padding: '10px 8px', textAlign: 'center', borderRight: '0.5px solid var(--border)', background: isToday(date) ? 'var(--accent-light)' : 'transparent' }}>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 }}>{DAYS[date.getDay()]}</div>
            <div style={{ width: 30, height: 30, borderRadius: '50%', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isToday(date) ? 'var(--accent)' : 'transparent', fontSize: 15, fontWeight: 700, color: isToday(date) ? 'white' : 'var(--text)' }}>{date.getDate()}</div>
            {eventsOn(date).length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 3, marginTop: 4 }}>
                {eventsOn(date).slice(0,3).map((e,j) => <div key={j} style={{ width: 4, height: 4, borderRadius: '50%', background: COLORS[e.color]?.dot || 'var(--accent)' }} />)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Time grid */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: view === 'week' ? '52px repeat(7,1fr)' : '52px 1fr' }}>
          <div style={{ borderRight: '0.5px solid var(--border)' }}>
            {HOURS.map(h => (
              <div key={h} style={{ height: 52, borderBottom: '0.5px solid var(--border)', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', paddingRight: 8, paddingTop: 4 }}>
                <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{h === 0 ? '12am' : h < 12 ? `${h}am` : h === 12 ? '12pm' : `${h-12}pm`}</span>
              </div>
            ))}
          </div>
          {(view === 'week' ? weekDates : [current]).map((date, di) => (
            <div key={di} style={{ borderRight: '0.5px solid var(--border)', background: isToday(date) ? 'rgba(0,122,255,0.02)' : 'transparent' }}>
              {HOURS.map(hour => {
                const hourEvents = eventsAt(date, hour)
                return (
                  <div key={hour} style={{ height: 52, borderBottom: '0.5px solid var(--border)', position: 'relative', cursor: 'pointer' }} onClick={() => openCreate(new Date(date), hour)}>
                    {hourEvents.map((event, ei) => {
                      const start = new Date(event.start_time); const end = new Date(event.end_time)
                      const duration = (end.getTime() - start.getTime()) / 60000
                      const height = Math.max((duration / 60) * 52, 22)
                      const top = (start.getMinutes() / 60) * 52
                      const c = COLORS[event.color] || COLORS.blue
                      return (
                        <div key={ei} onClick={e => { e.stopPropagation(); setSelected(event); setNotes(event.notes || '') }}
                          style={{ position: 'absolute', left: 2, right: 2, top, height, background: c.bg, border: `1px solid ${c.border}`, borderLeft: `3px solid ${c.dot}`, borderRadius: 6, padding: '2px 6px', cursor: 'pointer', zIndex: 1, overflow: 'hidden' }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: c.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{event.title}</div>
                          {height > 36 && <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{fmtTime(start)}</div>}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Event detail panel */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', zIndex: 50, padding: 16 }}>
          <div style={{ width: 400, maxHeight: 'calc(100vh - 32px)', background: 'var(--surface)', borderRadius: 16, border: '0.5px solid var(--border)', overflow: 'auto', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ padding: '16px 18px', borderBottom: '0.5px solid var(--border)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[selected.color]?.dot || 'var(--accent)' }} />
                  <span style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{selected.event_type}</span>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: selected.prep_status === 'ready' ? 'rgba(52,199,89,0.12)' : 'var(--surface2)', color: selected.prep_status === 'ready' ? 'var(--success)' : 'var(--text-secondary)' }}>
                    {selected.prep_status === 'ready' ? 'Prepped' : selected.prep_status === 'partial' ? 'Partial' : 'No prep'}
                  </span>
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)', letterSpacing: -0.3 }}>{selected.title}</h2>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => del(selected.id)} style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--danger-bg)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--danger)' }}><Trash2 size={12} /></button>
                <button onClick={() => setSelected(null)} style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--surface2)', border: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={13} /></button>
              </div>
            </div>
            <div style={{ padding: '14px 18px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Clock size={13} style={{ color: 'var(--text-tertiary)' }} /><span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{fmtTime(new Date(selected.start_time))} — {fmtTime(new Date(selected.end_time))}, {new Date(selected.start_time).toLocaleDateString('en-AU', { weekday: 'short', month: 'short', day: 'numeric' })}</span></div>
                {selected.location && <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><MapPin size={13} style={{ color: 'var(--text-tertiary)' }} /><span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{selected.location}</span></div>}
                {selected.attendees?.length > 0 && <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Users size={13} style={{ color: 'var(--text-tertiary)' }} /><span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{selected.attendees.map(a => a.name).join(', ')}</span></div>}
                {selected.goals && <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Target size={13} style={{ color: 'var(--accent)' }} /><span style={{ fontSize: 13, color: 'var(--accent)' }}>{selected.goals.title}</span></div>}
              </div>

              {/* Notes */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.8 }}>Notes</span>
                  <button onClick={() => setEditingNotes(!editingNotes)} style={{ fontSize: 12, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>{editingNotes ? 'Cancel' : 'Edit'}</button>
                </div>
                {editingNotes ? (
                  <div>
                    <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} style={{ ...inp, resize: 'vertical' as const }} placeholder="Meeting notes..." />
                    <button onClick={async () => { await update(selected.id, { notes }); setEditingNotes(false); toast.success('Saved') }} style={{ marginTop: 8, background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 8, padding: '7px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Save</button>
                  </div>
                ) : (
                  <div style={{ background: 'var(--surface2)', borderRadius: 10, padding: 10, minHeight: 50 }}>
                    {selected.notes ? <p style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.6 }}>{selected.notes}</p> : <p style={{ fontSize: 13, color: 'var(--text-tertiary)', fontStyle: 'italic' }}>No notes yet</p>}
                  </div>
                )}
              </div>

              {/* Action items */}
              <div style={{ marginBottom: 14 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.8, display: 'block', marginBottom: 8 }}>Action Items</span>
                {selected.action_items?.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <button onClick={() => { const items = selected.action_items.map((a, j) => j === i ? { ...a, done: !a.done } : a); update(selected.id, { action_items: items }) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: item.done ? 'var(--success)' : 'var(--text-tertiary)' }}>
                      {item.done ? <CheckCircle size={14} /> : <Circle size={14} />}
                    </button>
                    <span style={{ fontSize: 13, color: item.done ? 'var(--text-tertiary)' : 'var(--text)', textDecoration: item.done ? 'line-through' : 'none' }}>{item.text}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  <input value={newAction} onChange={e => setNewAction(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && newAction.trim()) { const items = [...(selected.action_items || []), { text: newAction.trim(), done: false }]; update(selected.id, { action_items: items }); setNewAction('') } }} placeholder="Add action item..." style={{ ...inp, flex: 1 }} />
                </div>
              </div>

              {/* Prep status */}
              <div style={{ display: 'flex', gap: 6 }}>
                {['none','partial','ready'].map(s => (
                  <button key={s} onClick={() => update(selected.id, { prep_status: s })} style={{ flex: 1, padding: '6px 0', fontSize: 11, fontWeight: 600, borderRadius: 8, cursor: 'pointer', border: '0.5px solid', background: selected.prep_status === s ? (s === 'ready' ? 'rgba(52,199,89,0.12)' : s === 'partial' ? 'rgba(255,149,0,0.1)' : 'var(--surface2)') : 'transparent', borderColor: selected.prep_status === s ? (s === 'ready' ? 'var(--success)' : s === 'partial' ? 'var(--warning)' : 'var(--border)') : 'var(--border)', color: s === 'ready' ? 'var(--success)' : s === 'partial' ? 'var(--warning)' : 'var(--text-secondary)', textTransform: 'capitalize' }}>
                    {s === 'none' ? 'No prep' : s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
          <div style={{ width: 480, background: 'var(--surface)', borderRadius: 16, border: '0.5px solid var(--border)', boxShadow: 'var(--shadow-lg)', overflow: 'auto', maxHeight: 'calc(100vh - 32px)' }}>
            <div style={{ padding: '16px 18px', borderBottom: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)' }}>New Event</h2>
              <button onClick={() => setShowCreate(false)} style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--surface2)', border: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={13} /></button>
            </div>
            <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div><label className="label">Title *</label><input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))} style={inp} placeholder="Event title" /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div><label className="label">Start *</label><input type="datetime-local" value={form.start_time} onChange={e => setForm(f => ({...f, start_time: e.target.value}))} style={{ ...inp, colorScheme: 'dark' as any }} /></div>
                <div><label className="label">End</label><input type="datetime-local" value={form.end_time} onChange={e => setForm(f => ({...f, end_time: e.target.value}))} style={{ ...inp, colorScheme: 'dark' as any }} /></div>
              </div>
              <div><label className="label">Type</label><div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 6 }}>{EVENT_TYPES.map(t => <button key={t} onClick={() => setForm(f => ({...f, event_type: t}))} style={{ padding: '5px 12px', fontSize: 12, borderRadius: 20, border: '0.5px solid', background: form.event_type === t ? 'var(--accent-light)' : 'transparent', borderColor: form.event_type === t ? 'var(--accent)' : 'var(--border)', color: form.event_type === t ? 'var(--accent)' : 'var(--text-secondary)', cursor: 'pointer', textTransform: 'capitalize' }}>{t}</button>)}</div></div>
              <div><label className="label">Colour</label><div style={{ display: 'flex', gap: 8 }}>{Object.entries(COLORS).map(([key, val]) => <button key={key} onClick={() => setForm(f => ({...f, color: key}))} style={{ width: 22, height: 22, borderRadius: '50%', background: val.dot, border: form.color === key ? '3px solid var(--text)' : '2px solid transparent', cursor: 'pointer' }} />)}</div></div>
              <div><label className="label">Location</label><input value={form.location} onChange={e => setForm(f => ({...f, location: e.target.value}))} style={inp} placeholder="Room, Zoom, address..." /></div>
              <div><label className="label">Attendees (comma-separated)</label><input value={form.attendees_text} onChange={e => setForm(f => ({...f, attendees_text: e.target.value}))} style={inp} placeholder="John Smith, Sarah Jones" /></div>
              {goals.length > 0 && <div><label className="label">Link to Goal</label><select value={form.goal_id} onChange={e => setForm(f => ({...f, goal_id: e.target.value}))} style={{ ...inp, color: form.goal_id ? 'var(--text)' : 'var(--text-tertiary)' }}><option value="">No goal</option>{goals.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}</select></div>}
              <div><label className="label">Description</label><textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} rows={3} style={{ ...inp, resize: 'vertical' as const }} /></div>
              <button onClick={create} style={{ background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 10, padding: '11px 0', fontSize: 14, fontWeight: 600, cursor: 'pointer', marginTop: 4 }}>Create Event</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
