'use client'
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import {
  ChevronLeft, ChevronRight, Plus, X, Clock, MapPin,
  Users, Target, FileText, CheckCircle, Circle, Calendar,
  Edit3, Trash2, AlertCircle, Zap, Star
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

// ─── Types ───────────────────────────────────────────────────

interface CalendarEvent {
  id: string
  title: string
  description?: string
  location?: string
  event_type: string
  color: string
  start_time: string
  end_time: string
  all_day: boolean
  attendees: Array<{ name: string; email?: string; role?: string }>
  goal_id?: string
  has_brief: boolean
  prep_status: string
  notes?: string
  action_items: Array<{ text: string; done: boolean; due_date?: string }>
  meeting_outcome?: string
  goals?: { id: string; title: string }
  meetings?: { id: string; title: string; brief?: any }
}

interface Goal {
  id: string
  title: string
}

// ─── Constants ───────────────────────────────────────────────

const EVENT_COLORS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  accent:  { bg: 'rgba(201,169,110,0.15)', border: 'rgba(201,169,110,0.5)', text: '#c9a96e', dot: '#c9a96e' },
  purple:  { bg: 'rgba(124,110,240,0.15)', border: 'rgba(124,110,240,0.5)', text: '#7c6ef0', dot: '#7c6ef0' },
  green:   { bg: 'rgba(74,222,128,0.12)',  border: 'rgba(74,222,128,0.4)',  text: '#4ade80', dot: '#4ade80' },
  red:     { bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.4)', text: '#f87171', dot: '#f87171' },
  blue:    { bg: 'rgba(96,165,250,0.12)',  border: 'rgba(96,165,250,0.4)',  text: '#60a5fa', dot: '#60a5fa' },
  orange:  { bg: 'rgba(251,146,60,0.12)',  border: 'rgba(251,146,60,0.4)',  text: '#fb923c', dot: '#fb923c' },
}

const EVENT_TYPES = [
  { value: 'meeting', label: 'Meeting', icon: Users },
  { value: 'call', label: 'Call', icon: Clock },
  { value: 'focus', label: 'Focus Time', icon: Target },
  { value: 'review', label: 'Review', icon: FileText },
  { value: 'deadline', label: 'Deadline', icon: AlertCircle },
  { value: 'personal', label: 'Personal', icon: Star },
]

const HOURS = Array.from({ length: 24 }, (_, i) => i)
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

function formatTime(date: Date) {
  return date.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: true })
}

function formatDateShort(date: Date) {
  return date.toLocaleDateString('en-AU', { month: 'short', day: 'numeric' })
}

function getWeekDates(date: Date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day
  return Array.from({ length: 7 }, (_, i) => {
    const dd = new Date(d)
    dd.setDate(diff + i)
    dd.setHours(0, 0, 0, 0)
    return dd
  })
}

function isToday(date: Date) {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

// ─── Main Component ───────────────────────────────────────────

export default function CalendarPage() {
  const [view, setView] = useState<'week' | 'day'>('week')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createDate, setCreateDate] = useState<Date | null>(null)
  const [editingNotes, setEditingNotes] = useState(false)
  const [notesValue, setNotesValue] = useState('')
  const [newActionItem, setNewActionItem] = useState('')

  const weekDates = getWeekDates(currentDate)

  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    location: '',
    event_type: 'meeting',
    color: 'accent',
    start_time: '',
    end_time: '',
    all_day: false,
    attendees_text: '',
    goal_id: '',
  })

  const getAuthHeader = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return { 'Authorization': `Bearer ${session?.access_token}`, 'Content-Type': 'application/json' }
  }

  const loadEvents = useCallback(async () => {
    setLoading(true)
    try {
      const headers = await getAuthHeader()
      const start = weekDates[0].toISOString()
      const end = new Date(weekDates[6].getTime() + 86400000).toISOString()
      const res = await fetch(`/api/calendar/events?start=${start}&end=${end}`, { headers })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setEvents(data.events)
    } catch (err: any) {
      toast.error('Failed to load events')
    } finally {
      setLoading(false)
    }
  }, [currentDate])

  const loadGoals = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const { data } = await supabase.from('goals').select('id, title').eq('status', 'active')
    if (data) setGoals(data)
  }

  useEffect(() => {
    loadEvents()
    loadGoals()
  }, [loadEvents])

  const createEvent = async () => {
    if (!createForm.title || !createForm.start_time) {
      toast.error('Title and start time are required')
      return
    }
    try {
      const headers = await getAuthHeader()
      const attendees = createForm.attendees_text
        ? createForm.attendees_text.split(',').map(a => ({ name: a.trim() }))
        : []
      const res = await fetch('/api/calendar/events', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...createForm,
          attendees,
          attendees_text: undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Event created!')
      setShowCreateModal(false)
      setCreateForm({ title: '', description: '', location: '', event_type: 'meeting', color: 'accent', start_time: '', end_time: '', all_day: false, attendees_text: '', goal_id: '' })
      loadEvents()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const updateEvent = async (id: string, updates: Partial<CalendarEvent>) => {
    try {
      const headers = await getAuthHeader()
      const res = await fetch(`/api/calendar/events/${id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(updates),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setEvents(prev => prev.map(e => e.id === id ? { ...e, ...data.event } : e))
      if (selectedEvent?.id === id) setSelectedEvent({ ...selectedEvent, ...data.event })
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const deleteEvent = async (id: string) => {
    if (!confirm('Delete this event?')) return
    try {
      const headers = await getAuthHeader()
      await fetch(`/api/calendar/events/${id}`, { method: 'DELETE', headers })
      setEvents(prev => prev.filter(e => e.id !== id))
      setSelectedEvent(null)
      toast.success('Event deleted')
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const saveNotes = async () => {
    if (!selectedEvent) return
    await updateEvent(selectedEvent.id, { notes: notesValue })
    setEditingNotes(false)
    toast.success('Notes saved')
  }

  const addActionItem = async () => {
    if (!selectedEvent || !newActionItem.trim()) return
    const items = [...(selectedEvent.action_items || []), { text: newActionItem.trim(), done: false }]
    await updateEvent(selectedEvent.id, { action_items: items })
    setNewActionItem('')
  }

  const toggleActionItem = async (index: number) => {
    if (!selectedEvent) return
    const items = selectedEvent.action_items.map((item, i) =>
      i === index ? { ...item, done: !item.done } : item
    )
    await updateEvent(selectedEvent.id, { action_items: items })
  }

  const getEventsForDayHour = (date: Date, hour: number) => {
    return events.filter(e => {
      const start = new Date(e.start_time)
      return start.toDateString() === date.toDateString() && start.getHours() === hour
    })
  }

  const getEventsForDay = (date: Date) => {
    return events.filter(e => new Date(e.start_time).toDateString() === date.toDateString())
  }

  const navigate = (dir: number) => {
    const d = new Date(currentDate)
    if (view === 'week') d.setDate(d.getDate() + dir * 7)
    else d.setDate(d.getDate() + dir)
    setCurrentDate(d)
  }

  const openCreate = (date?: Date, hour?: number) => {
    const d = date || new Date()
    if (hour !== undefined) d.setHours(hour, 0, 0, 0)
    const end = new Date(d)
    end.setHours(end.getHours() + 1)
    const toLocal = (dt: Date) => new Date(dt.getTime() - dt.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
    setCreateForm(f => ({ ...f, start_time: toLocal(d), end_time: toLocal(end) }))
    setShowCreateModal(true)
  }

  const prepStatus = (event: CalendarEvent) => {
    if (event.prep_status === 'ready' || event.has_brief) return { color: '#4ade80', label: 'Prepped' }
    if (event.prep_status === 'partial') return { color: '#fbbf24', label: 'Partial' }
    return { color: '#6b6b80', label: 'No prep' }
  }

  return (
    <div style={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #2a2a3a', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => navigate(-1)} style={{ width: 32, height: 32, borderRadius: 8, background: '#1a1a24', border: '1px solid #2a2a3a', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#c0c0cc' }}>
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => navigate(1)} style={{ width: 32, height: 32, borderRadius: 8, background: '#1a1a24', border: '1px solid #2a2a3a', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#c0c0cc' }}>
              <ChevronRight size={16} />
            </button>
          </div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 22, color: '#e8e8f0', fontWeight: 700 }}>
            {view === 'week'
              ? `${formatDateShort(weekDates[0])} — ${formatDateShort(weekDates[6])}, ${weekDates[0].getFullYear()}`
              : `${currentDate.toLocaleDateString('en-AU', { weekday: 'long', month: 'long', day: 'numeric' })}`
            }
          </h1>
          <button onClick={() => setCurrentDate(new Date())} style={{ fontSize: 12, color: '#c9a96e', background: 'rgba(201,169,110,0.1)', border: '1px solid rgba(201,169,110,0.2)', borderRadius: 6, padding: '4px 10px', cursor: 'pointer' }}>
            Today
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', background: '#1a1a24', border: '1px solid #2a2a3a', borderRadius: 8, overflow: 'hidden' }}>
            {(['week', 'day'] as const).map(v => (
              <button key={v} onClick={() => setView(v)} style={{ padding: '6px 14px', fontSize: 12, fontWeight: 500, background: view === v ? '#c9a96e' : 'transparent', color: view === v ? '#0a0a0f' : '#6b6b80', border: 'none', cursor: 'pointer', textTransform: 'capitalize' }}>
                {v}
              </button>
            ))}
          </div>
          <button onClick={() => openCreate()} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#c9a96e', color: '#0a0a0f', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <Plus size={14} />
            New Event
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: view === 'week' ? '56px repeat(7, 1fr)' : '56px 1fr', borderBottom: '1px solid #2a2a3a', flexShrink: 0 }}>
          <div style={{ borderRight: '1px solid #2a2a3a' }} />
          {(view === 'week' ? weekDates : [currentDate]).map((date, i) => {
            const dayEvents = getEventsForDay(date)
            return (
              <div key={i} style={{ padding: '10px 8px', borderRight: '1px solid #1a1a24', textAlign: 'center', background: isToday(date) ? 'rgba(201,169,110,0.05)' : 'transparent' }}>
                <div style={{ fontSize: 11, color: '#6b6b80', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>
                  {DAYS[date.getDay()]}
                </div>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto', fontFamily: 'Georgia, serif', fontSize: 16, fontWeight: 700,
                  background: isToday(date) ? '#c9a96e' : 'transparent',
                  color: isToday(date) ? '#0a0a0f' : '#e8e8f0',
                }}>
                  {date.getDate()}
                </div>
                {dayEvents.length > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 3, marginTop: 4 }}>
                    {dayEvents.slice(0, 3).map((e, j) => (
                      <div key={j} style={{ width: 5, height: 5, borderRadius: '50%', background: EVENT_COLORS[e.color]?.dot || '#c9a96e' }} />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Time grid */}
        <div style={{ display: 'grid', gridTemplateColumns: view === 'week' ? '56px repeat(7, 1fr)' : '56px 1fr', flex: 1 }}>
          {/* Time labels */}
          <div style={{ borderRight: '1px solid #2a2a3a' }}>
            {HOURS.map(hour => (
              <div key={hour} style={{ height: 56, borderBottom: '1px solid #1a1a24', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', paddingRight: 8, paddingTop: 4 }}>
                <span style={{ fontSize: 10, color: '#6b6b80', lineHeight: 1 }}>
                  {hour === 0 ? '12am' : hour < 12 ? `${hour}am` : hour === 12 ? '12pm' : `${hour - 12}pm`}
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {(view === 'week' ? weekDates : [currentDate]).map((date, di) => (
            <div key={di} style={{ borderRight: '1px solid #1a1a24', background: isToday(date) ? 'rgba(201,169,110,0.02)' : 'transparent', position: 'relative' }}>
              {HOURS.map(hour => {
                const hourEvents = getEventsForDayHour(date, hour)
                return (
                  <div
                    key={hour}
                    style={{ height: 56, borderBottom: '1px solid #1a1a24', position: 'relative', cursor: 'pointer' }}
                    onClick={() => openCreate(new Date(date), hour)}
                  >
                    {hourEvents.map((event, ei) => {
                      const start = new Date(event.start_time)
                      const end = new Date(event.end_time)
                      const duration = (end.getTime() - start.getTime()) / 60000
                      const height = Math.max((duration / 60) * 56, 24)
                      const top = (start.getMinutes() / 60) * 56
                      const colors = EVENT_COLORS[event.color] || EVENT_COLORS.accent
                      return (
                        <div
                          key={ei}
                          onClick={(e) => { e.stopPropagation(); setSelectedEvent(event); setNotesValue(event.notes || ''); setShowEventModal(true) }}
                          style={{
                            position: 'absolute', left: 2, right: 2, top, height,
                            background: colors.bg, border: `1px solid ${colors.border}`,
                            borderLeft: `3px solid ${colors.dot}`,
                            borderRadius: 6, padding: '3px 6px', overflow: 'hidden',
                            cursor: 'pointer', zIndex: 1,
                          }}
                        >
                          <div style={{ fontSize: 11, fontWeight: 600, color: colors.text, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {event.title}
                          </div>
                          {height > 36 && (
                            <div style={{ fontSize: 10, color: '#6b6b80', marginTop: 1 }}>
                              {formatTime(start)}
                            </div>
                          )}
                          {height > 48 && event.prep_status === 'ready' && (
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', position: 'absolute', top: 4, right: 4 }} />
                          )}
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

      {/* Event Detail Modal */}
      {showEventModal && selectedEvent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,10,15,0.85)', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', zIndex: 50, padding: 16 }}>
          <div style={{ width: 420, maxHeight: 'calc(100vh - 32px)', background: '#111118', borderRadius: 16, border: '1px solid #2a2a3a', overflow: 'auto' }}>
            {/* Modal header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #2a2a3a', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: EVENT_COLORS[selectedEvent.color]?.dot || '#c9a96e' }} />
                  <span style={{ fontSize: 11, color: '#6b6b80', textTransform: 'uppercase', letterSpacing: 1 }}>{selectedEvent.event_type}</span>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: prepStatus(selectedEvent).color + '20', color: prepStatus(selectedEvent).color }}>
                    {prepStatus(selectedEvent).label}
                  </span>
                </div>
                <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 20, color: '#e8e8f0', fontWeight: 700 }}>{selectedEvent.title}</h2>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={() => deleteEvent(selectedEvent.id)} style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#f87171' }}>
                  <Trash2 size={13} />
                </button>
                <button onClick={() => setShowEventModal(false)} style={{ width: 30, height: 30, borderRadius: 8, background: '#1a1a24', border: '1px solid #2a2a3a', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6b6b80' }}>
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Event details */}
            <div style={{ padding: '16px 20px' }}>
              {/* Time */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Clock size={14} style={{ color: '#6b6b80', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: '#c0c0cc' }}>
                  {formatTime(new Date(selectedEvent.start_time))} — {formatTime(new Date(selectedEvent.end_time))}
                  <span style={{ color: '#6b6b80', marginLeft: 6 }}>
                    {new Date(selectedEvent.start_time).toLocaleDateString('en-AU', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                </span>
              </div>

              {selectedEvent.location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <MapPin size={14} style={{ color: '#6b6b80', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: '#c0c0cc' }}>{selectedEvent.location}</span>
                </div>
              )}

              {selectedEvent.attendees?.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
                  <Users size={14} style={{ color: '#6b6b80', flexShrink: 0, marginTop: 2 }} />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {selectedEvent.attendees.map((a, i) => (
                      <span key={i} style={{ fontSize: 11, background: '#1a1a24', border: '1px solid #2a2a3a', borderRadius: 20, padding: '3px 10px', color: '#c0c0cc' }}>
                        {a.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedEvent.goals && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <Target size={14} style={{ color: '#c9a96e', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: '#c9a96e' }}>{selectedEvent.goals.title}</span>
                </div>
              )}

              {selectedEvent.description && (
                <p style={{ fontSize: 13, color: '#6b6b80', lineHeight: 1.6, marginBottom: 16, paddingTop: 8, borderTop: '1px solid #2a2a3a' }}>
                  {selectedEvent.description}
                </p>
              )}

              {/* Cervio Brief */}
              {selectedEvent.meetings?.brief && (
                <div style={{ background: 'rgba(201,169,110,0.08)', border: '1px solid rgba(201,169,110,0.2)', borderRadius: 10, padding: 12, marginBottom: 16 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#c9a96e', letterSpacing: 1.5, marginBottom: 8 }}>CERVIO BRIEF</div>
                  <p style={{ fontSize: 12, color: '#c0c0cc', lineHeight: 1.6 }}>{selectedEvent.meetings.brief.objective}</p>
                </div>
              )}

              {/* Notes */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#6b6b80', textTransform: 'uppercase', letterSpacing: 1 }}>Meeting Notes</span>
                  <button onClick={() => setEditingNotes(!editingNotes)} style={{ fontSize: 11, color: '#c9a96e', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Edit3 size={11} />
                    {editingNotes ? 'Cancel' : 'Edit'}
                  </button>
                </div>
                {editingNotes ? (
                  <div>
                    <textarea
                      value={notesValue}
                      onChange={e => setNotesValue(e.target.value)}
                      placeholder="Type your meeting notes here..."
                      style={{ width: '100%', minHeight: 120, background: '#1a1a24', border: '1px solid #2a2a3a', borderRadius: 8, padding: 10, color: '#e8e8f0', fontSize: 13, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6 }}
                    />
                    <button onClick={saveNotes} style={{ marginTop: 8, background: '#c9a96e', color: '#0a0a0f', border: 'none', borderRadius: 8, padding: '7px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                      Save Notes
                    </button>
                  </div>
                ) : (
                  <div style={{ background: '#1a1a24', borderRadius: 8, padding: 10, minHeight: 60 }}>
                    {selectedEvent.notes
                      ? <p style={{ fontSize: 13, color: '#c0c0cc', lineHeight: 1.6 }}>{selectedEvent.notes}</p>
                      : <p style={{ fontSize: 13, color: '#6b6b80', fontStyle: 'italic' }}>No notes yet. Click edit to add notes.</p>
                    }
                  </div>
                )}
              </div>

              {/* Action Items */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#6b6b80', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Action Items</div>
                {selectedEvent.action_items?.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <button onClick={() => toggleActionItem(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: item.done ? '#4ade80' : '#6b6b80', flexShrink: 0 }}>
                      {item.done ? <CheckCircle size={14} /> : <Circle size={14} />}
                    </button>
                    <span style={{ fontSize: 13, color: item.done ? '#6b6b80' : '#c0c0cc', textDecoration: item.done ? 'line-through' : 'none' }}>
                      {item.text}
                    </span>
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  <input
                    value={newActionItem}
                    onChange={e => setNewActionItem(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addActionItem()}
                    placeholder="Add action item..."
                    style={{ flex: 1, background: '#1a1a24', border: '1px solid #2a2a3a', borderRadius: 8, padding: '6px 10px', color: '#e8e8f0', fontSize: 13, fontFamily: 'inherit' }}
                  />
                  <button onClick={addActionItem} style={{ background: '#1a1a24', border: '1px solid #2a2a3a', borderRadius: 8, padding: '6px 10px', color: '#c9a96e', cursor: 'pointer' }}>
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Prep status toggle */}
              <div style={{ display: 'flex', gap: 8 }}>
                {['none', 'partial', 'ready'].map(status => (
                  <button
                    key={status}
                    onClick={() => updateEvent(selectedEvent.id, { prep_status: status })}
                    style={{
                      flex: 1, padding: '6px 0', fontSize: 11, fontWeight: 600, borderRadius: 8, cursor: 'pointer', border: '1px solid',
                      background: selectedEvent.prep_status === status ? (status === 'ready' ? '#4ade8020' : status === 'partial' ? '#fbbf2420' : '#6b6b8020') : 'transparent',
                      borderColor: selectedEvent.prep_status === status ? (status === 'ready' ? '#4ade80' : status === 'partial' ? '#fbbf24' : '#6b6b80') : '#2a2a3a',
                      color: status === 'ready' ? '#4ade80' : status === 'partial' ? '#fbbf24' : '#6b6b80',
                      textTransform: 'capitalize',
                    }}
                  >
                    {status === 'none' ? 'No Prep' : status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,10,15,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 16 }}>
          <div style={{ width: 480, background: '#111118', borderRadius: 16, border: '1px solid #2a2a3a', overflow: 'auto', maxHeight: 'calc(100vh - 32px)' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #2a2a3a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 18, color: '#e8e8f0', fontWeight: 700 }}>New Event</h2>
              <button onClick={() => setShowCreateModal(false)} style={{ width: 30, height: 30, borderRadius: 8, background: '#1a1a24', border: '1px solid #2a2a3a', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6b6b80' }}>
                <X size={14} />
              </button>
            </div>
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Title */}
              <div>
                <label style={{ fontSize: 11, color: '#6b6b80', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: 1 }}>Title *</label>
                <input value={createForm.title} onChange={e => setCreateForm(f => ({ ...f, title: e.target.value }))} placeholder="Meeting title" style={{ width: '100%', background: '#1a1a24', border: '1px solid #2a2a3a', borderRadius: 8, padding: '8px 12px', color: '#e8e8f0', fontSize: 14, fontFamily: 'inherit' }} />
              </div>
              {/* Times */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, color: '#6b6b80', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: 1 }}>Start *</label>
                  <input type="datetime-local" value={createForm.start_time} onChange={e => setCreateForm(f => ({ ...f, start_time: e.target.value }))} style={{ width: '100%', background: '#1a1a24', border: '1px solid #2a2a3a', borderRadius: 8, padding: '8px 10px', color: '#e8e8f0', fontSize: 12, fontFamily: 'inherit', colorScheme: 'dark' }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, color: '#6b6b80', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: 1 }}>End</label>
                  <input type="datetime-local" value={createForm.end_time} onChange={e => setCreateForm(f => ({ ...f, end_time: e.target.value }))} style={{ width: '100%', background: '#1a1a24', border: '1px solid #2a2a3a', borderRadius: 8, padding: '8px 10px', color: '#e8e8f0', fontSize: 12, fontFamily: 'inherit', colorScheme: 'dark' }} />
                </div>
              </div>
              {/* Type */}
              <div>
                <label style={{ fontSize: 11, color: '#6b6b80', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: 1 }}>Type</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {EVENT_TYPES.map(t => (
                    <button key={t.value} onClick={() => setCreateForm(f => ({ ...f, event_type: t.value }))} style={{ padding: '5px 12px', fontSize: 12, borderRadius: 20, border: '1px solid', background: createForm.event_type === t.value ? 'rgba(201,169,110,0.15)' : '#1a1a24', borderColor: createForm.event_type === t.value ? 'rgba(201,169,110,0.4)' : '#2a2a3a', color: createForm.event_type === t.value ? '#c9a96e' : '#6b6b80', cursor: 'pointer' }}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Color */}
              <div>
                <label style={{ fontSize: 11, color: '#6b6b80', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: 1 }}>Colour</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {Object.entries(EVENT_COLORS).map(([key, val]) => (
                    <button key={key} onClick={() => setCreateForm(f => ({ ...f, color: key }))} style={{ width: 24, height: 24, borderRadius: '50%', background: val.dot, border: createForm.color === key ? `3px solid white` : '2px solid transparent', cursor: 'pointer' }} />
                  ))}
                </div>
              </div>
              {/* Location */}
              <div>
                <label style={{ fontSize: 11, color: '#6b6b80', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: 1 }}>Location</label>
                <input value={createForm.location} onChange={e => setCreateForm(f => ({ ...f, location: e.target.value }))} placeholder="Room, Zoom link, address..." style={{ width: '100%', background: '#1a1a24', border: '1px solid #2a2a3a', borderRadius: 8, padding: '8px 12px', color: '#e8e8f0', fontSize: 13, fontFamily: 'inherit' }} />
              </div>
              {/* Attendees */}
              <div>
                <label style={{ fontSize: 11, color: '#6b6b80', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: 1 }}>Attendees (comma-separated)</label>
                <input value={createForm.attendees_text} onChange={e => setCreateForm(f => ({ ...f, attendees_text: e.target.value }))} placeholder="John Smith, Sarah Jones..." style={{ width: '100%', background: '#1a1a24', border: '1px solid #2a2a3a', borderRadius: 8, padding: '8px 12px', color: '#e8e8f0', fontSize: 13, fontFamily: 'inherit' }} />
              </div>
              {/* Goal */}
              {goals.length > 0 && (
                <div>
                  <label style={{ fontSize: 11, color: '#6b6b80', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: 1 }}>Link to Goal</label>
                  <select value={createForm.goal_id} onChange={e => setCreateForm(f => ({ ...f, goal_id: e.target.value }))} style={{ width: '100%', background: '#1a1a24', border: '1px solid #2a2a3a', borderRadius: 8, padding: '8px 12px', color: createForm.goal_id ? '#e8e8f0' : '#6b6b80', fontSize: 13, fontFamily: 'inherit' }}>
                    <option value="">No goal linked</option>
                    {goals.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
                  </select>
                </div>
              )}
              {/* Description */}
              <div>
                <label style={{ fontSize: 11, color: '#6b6b80', marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: 1 }}>Description</label>
                <textarea value={createForm.description} onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))} placeholder="What's this event about?" rows={3} style={{ width: '100%', background: '#1a1a24', border: '1px solid #2a2a3a', borderRadius: 8, padding: '8px 12px', color: '#e8e8f0', fontSize: 13, fontFamily: 'inherit', resize: 'vertical' }} />
              </div>
              <button onClick={createEvent} style={{ background: '#c9a96e', color: '#0a0a0f', border: 'none', borderRadius: 10, padding: '11px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 4 }}>
                Create Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
