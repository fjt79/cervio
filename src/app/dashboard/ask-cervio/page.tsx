'use client'
import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Send, ArrowLeft, Sparkles, User } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Message { role: 'user' | 'assistant'; content: string }

const SUGGESTIONS = [
  "What decisions have I made in the last 30 days?",
  "Which of my goals is most at risk right now?",
  "Summarise my last 3 investor meetings",
  "What patterns do you see in how I spend my time?",
  "Who are my most important relationships right now?",
  "What should I focus on this week based on my goals?",
  "What's blocking my top priority goal?",
  "Give me an honest assessment of my progress this month",
]

export default function AskCervioPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const getHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    return { 'Authorization': `Bearer ${session?.access_token}`, 'Content-Type': 'application/json' }
  }

  const send = async (question?: string) => {
    const q = question || input.trim()
    if (!q || loading) return
    setInput('')

    const newMessages: Message[] = [...messages, { role: 'user', content: q }]
    setMessages(newMessages)
    setLoading(true)

    try {
      const headers = await getHeaders()
      const res = await fetch('/api/ask-cervio', {
        method: 'POST',
        headers,
        body: JSON.stringify({ question: q, history: messages }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMessages([...newMessages, { role: 'assistant', content: data.answer }])
    } catch (err: any) {
      toast.error(err.message || 'Failed to get response')
      setMessages(messages)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div style={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', maxWidth: 800, margin: '0 auto', padding: '0 16px' }}>
      {/* Header */}
      <div style={{ padding: '20px 0 16px', borderBottom: '1px solid #2a2a3a', flexShrink: 0 }}>
        <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6b6b80', textDecoration: 'none', marginBottom: 12 }}>
          <ArrowLeft size={13} />Back to Dashboard
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(201,169,110,0.15)', border: '1px solid rgba(201,169,110,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={16} style={{ color: '#c9a96e' }} />
          </div>
          <div>
            <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 20, color: '#e8e8f0', fontWeight: 700 }}>Ask Cervio</h1>
            <p style={{ fontSize: 12, color: '#6b6b80' }}>Your second brain — ask anything about your business</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 0' }}>
        {messages.length === 0 ? (
          <div>
            <p style={{ fontSize: 14, color: '#6b6b80', marginBottom: 20, lineHeight: 1.6 }}>
              Cervio knows your goals, decisions, meetings, stakeholders, and weekly patterns. Ask anything.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {SUGGESTIONS.map((s, i) => (
                <button key={i} onClick={() => send(s)} style={{ textAlign: 'left', padding: '10px 14px', background: '#111118', border: '1px solid #2a2a3a', borderRadius: 10, fontSize: 13, color: '#c0c0cc', cursor: 'pointer', lineHeight: 1.4, transition: 'all 0.15s' }}
                  onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = 'rgba(201,169,110,0.3)'; (e.target as HTMLElement).style.color = '#e8e8f0' }}
                  onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = '#2a2a3a'; (e.target as HTMLElement).style.color = '#c0c0cc' }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: msg.role === 'user' ? 'rgba(124,110,240,0.15)' : 'rgba(201,169,110,0.15)', border: `1px solid ${msg.role === 'user' ? 'rgba(124,110,240,0.3)' : 'rgba(201,169,110,0.3)'}` }}>
                  {msg.role === 'user' ? <User size={13} style={{ color: '#7c6ef0' }} /> : <Sparkles size={13} style={{ color: '#c9a96e' }} />}
                </div>
                <div style={{ maxWidth: '80%', background: msg.role === 'user' ? 'rgba(124,110,240,0.1)' : '#111118', border: `1px solid ${msg.role === 'user' ? 'rgba(124,110,240,0.2)' : '#2a2a3a'}`, borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px', padding: '12px 16px' }}>
                  <p style={{ fontSize: 14, color: '#e8e8f0', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(201,169,110,0.15)', border: '1px solid rgba(201,169,110,0.3)' }}>
                  <Sparkles size={13} style={{ color: '#c9a96e' }} />
                </div>
                <div style={{ background: '#111118', border: '1px solid #2a2a3a', borderRadius: '14px 14px 14px 4px', padding: '12px 16px' }}>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#c9a96e', animation: `bounce 1s ease-in-out ${i * 0.15}s infinite` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ padding: '12px 0 20px', flexShrink: 0, borderTop: '1px solid #2a2a3a' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', background: '#111118', border: '1px solid #2a2a3a', borderRadius: 14, padding: '10px 14px' }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your business..."
            rows={1}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#e8e8f0', fontSize: 14, fontFamily: 'inherit', resize: 'none', lineHeight: 1.5, maxHeight: 120, overflow: 'auto' }}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            style={{ width: 34, height: 34, borderRadius: 10, background: input.trim() && !loading ? '#c9a96e' : '#1a1a24', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() && !loading ? 'pointer' : 'default', flexShrink: 0, transition: 'all 0.15s' }}
          >
            <Send size={14} style={{ color: input.trim() && !loading ? '#0a0a0f' : '#6b6b80' }} />
          </button>
        </div>
        <p style={{ fontSize: 11, color: '#6b6b80', marginTop: 8, textAlign: 'center' }}>Enter to send · Shift+Enter for new line</p>
      </div>

      <style>{`@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }`}</style>
    </div>
  )
}
