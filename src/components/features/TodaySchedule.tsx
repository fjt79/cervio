// Add this component to your dashboard page
// Import at top: import TodaySchedule from '@/components/features/TodaySchedule'
// Use in dashboard: <TodaySchedule />

'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Calendar, Clock, ChevronRight, Plus } from 'lucide-react'
import Link from 'next/link'

interface CalendarEvent {
  id: string
  title: string
  start_time: string
  end_time: string
  event_type: string
  color: string
  location?: string
  prep_status: string
  attendees: Array<{ name: string }>
}

const EVENT_COLORS: Record<string, string> = {
  accent: '#c9a96e', purple: '#7c6ef0', green: '#4ade80',
  red: '#f87171', blue: '#60a5fa', orange: '#fb923c',
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit', hour12: true })
}

export default function TodaySchedule() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const res = await fetch(`/api/calendar/events?start=${today.toISOString()}&end=${tomorrow.toISOString()}`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      })
      const data = await res.json()
      if (res.ok) setEvents(data.events || [])
      setLoading(false)
    }
    load()
  }, [])

  const now = new Date()
  const upcoming = events.filter(e => new Date(e.end_time) > now)
  const past = events.filter(e => new Date(e.end_time) <= now)
  const nextEvent = upcoming[0]

  return (
    <div style={{ background: '#111118', border: '1px solid #2a2a3a', borderRadius: 14, padding: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Calendar size={15} style={{ color: '#c9a96e' }} />
          <span style={{ fontFamily: 'Georgia, serif', fontSize: 16, color: '#e8e8f0', fontWeight: 700 }}>Today</span>
          <span style={{ fontSize: 12, color: '#6b6b80' }}>
            {new Date().toLocaleDateString('en-AU', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>
        <Link href="/dashboard/calendar" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#c9a96e', textDecoration: 'none' }}>
          View calendar <ChevronRight size={12} />
        </Link>
      </div>

      {loading ? (
        <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 20, height: 20, border: '2px solid #2a2a3a', borderTopColor: '#c9a96e', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        </div>
      ) : events.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <p style={{ fontSize: 13, color: '#6b6b80', marginBottom: 12 }}>No events today</p>
          <Link href="/dashboard/calendar" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#c9a96e', background: 'rgba(201,169,110,0.1)', border: '1px solid rgba(201,169,110,0.2)', borderRadius: 8, padding: '6px 12px', textDecoration: 'none' }}>
            <Plus size={12} />
            Add event
          </Link>
        </div>
      ) : (
        <div>
          {/* Next event highlight */}
          {nextEvent && (
            <div style={{ background: 'rgba(201,169,110,0.08)', border: '1px solid rgba(201,169,110,0.2)', borderRadius: 10, padding: 12, marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: '#c9a96e', fontWeight: 600, letterSpacing: 1, marginBottom: 6, textTransform: 'uppercase' }}>
                {new Date(nextEvent.start_time) <= now ? 'Happening now' : 'Up next'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 3, height: 36, borderRadius: 2, background: EVENT_COLORS[nextEvent.color] || '#c9a96e', flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#e8e8f0', marginBottom: 2 }}>{nextEvent.title}</div>
                  <div style={{ fontSize: 12, color: '#6b6b80', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={10} />
                    {formatTime(new Date(nextEvent.start_time))} — {formatTime(new Date(nextEvent.end_time))}
                  </div>
                </div>
                {nextEvent.prep_status === 'ready' && (
                  <div style={{ marginLeft: 'auto', fontSize: 10, color: '#4ade80', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 20, padding: '2px 8px' }}>
                    Prepped
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Timeline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {events.map((event, i) => {
              const start = new Date(event.start_time)
              const end = new Date(event.end_time)
              const isPast = end <= now
              const isNow = start <= now && end > now
              const color = EVENT_COLORS[event.color] || '#c9a96e'
              return (
                <Link key={event.id} href="/dashboard/calendar" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, background: isNow ? 'rgba(201,169,110,0.06)' : 'transparent', border: isNow ? '1px solid rgba(201,169,110,0.15)' : '1px solid transparent', textDecoration: 'none', opacity: isPast ? 0.5 : 1 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, color: isPast ? '#6b6b80' : '#e8e8f0', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {event.title}
                    </div>
                    {event.attendees?.length > 0 && (
                      <div style={{ fontSize: 11, color: '#6b6b80' }}>
                        {event.attendees.slice(0, 2).map(a => a.name).join(', ')}
                        {event.attendees.length > 2 ? ` +${event.attendees.length - 2}` : ''}
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: '#6b6b80', flexShrink: 0 }}>
                    {formatTime(start)}
                  </div>
                </Link>
              )
            })}
          </div>

          {/* Add more */}
          <Link href="/dashboard/calendar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 10, padding: '7px 0', fontSize: 12, color: '#6b6b80', background: '#1a1a24', border: '1px dashed #2a2a3a', borderRadius: 8, textDecoration: 'none' }}>
            <Plus size={12} />
            Add to calendar
          </Link>
        </div>
      )}
    </div>
  )
}
