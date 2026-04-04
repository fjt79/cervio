'use client'
import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Send, Sparkles, User, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Message { role: 'user' | 'assistant'; content: string }

const SUGGESTIONS = [
  "What should I focus on today?",
  "Which of my goals is most at risk?",
  "What decisions have I made this week?",
  "How are my key relationships tracking?",
  "Give me an honest assessment of my progress",
  "What's blocking my top priority goal?",
]

export default function AskCervioPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

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
      const res = await fetch('/api/ask-cervio', { method: 'POST', headers, body: JSON.stringify({ question: q, history: messages }) })
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

  return (
    <div style={{ height: 'calc(100vh - 72px)', display: 'flex', flexDirection: 'column', maxWidth: 760, margin: '0 auto', padding: '0 20px' }}>
      {/* Header */}
      <div style={{ padding: '20px 0 16px', borderBottom: '0.5px solid var(--border)', flexShrink: 0 }}>
        <Link href="/dashboard" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: 14 }}>
          <ArrowLeft size={13} />Dashboard
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Sparkles size={18} style={{ color: 'white' }} />
          </div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', letterSpacing: -0.5 }}>Ask Cervio</h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Your second brain — ask anything about your business</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflow: 'auto', padding: '20px 0' }}>
        {messages.length === 0 ? (
          <div>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.6 }}>
              Cervio knows your goals, decisions, meetings, stakeholders, and weekly patterns. Ask anything about your business.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {SUGGESTIONS.map((s, i) => (
                <button key={i} onClick={() => send(s)} style={{ textAlign: 'left' as const, padding: '12px 14px', background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 12, fontSize: 14, color: 'var(--text)', cursor: 'pointer', lineHeight: 1.4, boxShadow: 'var(--shadow-sm)', transition: 'all 0.15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; (e.currentTarget as HTMLElement).style.background = 'var(--accent-light)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.background = 'var(--surface)' }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: msg.role === 'user' ? 'var(--accent)' : 'var(--surface)', border: msg.role === 'assistant' ? '0.5px solid var(--border)' : 'none', boxShadow: msg.role === 'assistant' ? 'var(--shadow-sm)' : 'none' }}>
                  {msg.role === 'user' ? <User size={13} style={{ color: 'white' }} /> : <Sparkles size={13} style={{ color: 'var(--accent)' }} />}
                </div>
                <div style={{ maxWidth: '80%', background: msg.role === 'user' ? 'var(--accent)' : 'var(--surface)', border: msg.role === 'assistant' ? '0.5px solid var(--border)' : 'none', borderRadius: msg.role === 'user' ? '16px 4px 16px 16px' : '4px 16px 16px 16px', padding: '11px 15px', boxShadow: msg.role === 'assistant' ? 'var(--shadow-sm)' : 'none' }}>
                  <p style={{ fontSize: 14, color: msg.role === 'user' ? 'white' : 'var(--text)', lineHeight: 1.65, margin: 0, whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface)', border: '0.5px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                  <Sparkles size={13} style={{ color: 'var(--accent)' }} />
                </div>
                <div style={{ background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: '4px 16px 16px 16px', padding: '12px 16px', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                    {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', opacity: 0.6, animation: `bounce 1s ease-in-out ${i * 0.15}s infinite` }} />)}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{ padding: '12px 0 20px', flexShrink: 0, borderTop: '0.5px solid var(--border)' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', background: 'var(--surface)', border: '0.5px solid var(--border)', borderRadius: 14, padding: '10px 12px', boxShadow: 'var(--shadow-sm)' }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            placeholder="Ask anything about your business..."
            rows={1}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 15, fontFamily: 'inherit', resize: 'none', lineHeight: 1.5, maxHeight: 120 }}
          />
          <button onClick={() => send()} disabled={!input.trim() || loading} style={{ width: 34, height: 34, borderRadius: 10, background: input.trim() && !loading ? 'var(--accent)' : 'var(--surface2)', border: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() && !loading ? 'pointer' : 'default', flexShrink: 0, transition: 'all 0.15s' }}>
            <Send size={14} style={{ color: input.trim() && !loading ? 'white' : 'var(--text-tertiary)' }} />
          </button>
        </div>
        <p style={{ fontSize: 11, color: 'var(--text-tertiary)', textAlign: 'center' as const, marginTop: 8 }}>Enter to send · Shift+Enter for new line</p>
      </div>

      <style>{`@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }`}</style>
    </div>
  )
}
