'use client'
import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Sparkles, Send, X, ChevronDown, Maximize2 } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface Message { role: 'user' | 'assistant'; content: string }

export default function AskCervioBar() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [messages, open])

  const send = async () => {
    const q = input.trim()
    if (!q || loading) return
    setInput('')
    const newMessages: Message[] = [...messages, { role: 'user', content: q }]
    setMessages(newMessages)
    setLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/ask-cervio', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${session?.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, history: messages }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMessages([...newMessages, { role: 'assistant', content: data.answer }])
    } catch (err: any) {
      toast.error(err.message || 'Failed')
      setMessages(messages)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 240,
      right: 0,
      zIndex: 40,
      background: 'var(--surface)',
      borderTop: '0.5px solid var(--border)',
      boxShadow: open ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
      transition: 'all 0.25s ease',
    }}>
      {/* Expanded chat */}
      {open && (
        <div style={{ height: 320, display: 'flex', flexDirection: 'column', borderBottom: '0.5px solid var(--border)' }}>
          {/* Chat header */}
          <div style={{ padding: '10px 16px', borderBottom: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={12} style={{ color: 'white' }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Ask Cervio</span>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Your AI Chief of Staff</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Link href="/dashboard/ask-cervio" style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--accent)', textDecoration: 'none' }}>
                <Maximize2 size={12} />
                Full view
              </Link>
              <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', padding: 2 }}>
                <ChevronDown size={16} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflow: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Ask anything about your business, goals, or decisions.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center', marginTop: 12 }}>
                  {['What should I focus on today?', 'How are my goals tracking?', 'What decisions did I make this week?'].map(s => (
                    <button key={s} onClick={() => { setInput(s); inputRef.current?.focus() }} style={{ fontSize: 12, color: 'var(--accent)', background: 'var(--accent-light)', border: 'none', borderRadius: 20, padding: '4px 12px', cursor: 'pointer' }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '75%',
                    padding: '8px 12px',
                    borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                    background: msg.role === 'user' ? 'var(--accent)' : 'var(--surface2)',
                    color: msg.role === 'user' ? 'white' : 'var(--text)',
                    fontSize: 13,
                    lineHeight: 1.5,
                  }}>
                    {msg.content}
                  </div>
                </div>
              ))
            )}
            {loading && (
              <div style={{ display: 'flex' }}>
                <div style={{ padding: '8px 12px', borderRadius: '16px 16px 16px 4px', background: 'var(--surface2)' }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[0,1,2].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', animation: `bounce 1s ease-in-out ${i * 0.15}s infinite` }} />)}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>
      )}

      {/* Input bar — always visible */}
      <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer' }} onClick={() => setOpen(!open)}>
          <Sparkles size={13} style={{ color: 'white' }} />
        </div>
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={e => { if (e.key === 'Enter') send() }}
          placeholder="Ask Cervio anything about your business..."
          style={{ flex: 1, background: 'var(--surface2)', border: '0.5px solid var(--border)', borderRadius: 20, padding: '8px 14px', fontSize: 14, color: 'var(--text)', outline: 'none', fontFamily: 'inherit' }}
        />
        <button
          onClick={send}
          disabled={!input.trim() || loading}
          style={{ width: 32, height: 32, borderRadius: '50%', background: input.trim() && !loading ? 'var(--accent)' : 'var(--surface3)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() && !loading ? 'pointer' : 'default', flexShrink: 0, transition: 'all 0.15s' }}
        >
          <Send size={13} style={{ color: input.trim() && !loading ? 'white' : 'var(--text-tertiary)' }} />
        </button>
      </div>
    </div>
  )
}
