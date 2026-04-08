import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { data: { user } } = await supabaseAdmin.auth.getUser(token)
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { message, history = [] } = await request.json()
    if (!message) return NextResponse.json({ error: 'Message required' }, { status: 400 })

    const [profileRes, goalsRes, decisionsRes] = await Promise.all([
      supabaseAdmin.from('profiles').select('*').eq('id', user.id).single(),
      supabaseAdmin.from('goals').select('*').eq('user_id', user.id).eq('status', 'active').order('priority'),
      supabaseAdmin.from('decisions').select('title, context, status').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
    ])

    const profile = profileRes.data
    const goals = goalsRes.data || []
    const decisions = decisionsRes.data || []

    const systemPrompt = `You are Cervio, an AI Chief of Staff for ${profile?.full_name || 'the user'}, ${profile?.role || 'an executive'} at ${profile?.business_name || 'their company'}.

Business context:
- Stage: ${profile?.business_stage || 'unknown'}
- Industry: ${profile?.industry || 'unknown'}
- Team size: ${profile?.team_size || 'unknown'}
- Biggest challenge: ${profile?.biggest_challenge || 'unknown'}
- Communication style: ${profile?.communication_style || 'direct'}

Active goals:
${goals.map((g: any) => `- ${g.title} (${g.current_progress || 0}% complete)`).join('\n') || 'No active goals'}

Recent decisions:
${decisions.map((d: any) => `- ${d.title}: ${d.context || ''}`).join('\n') || 'No recent decisions'}

Be direct, sharp, and genuinely useful. Match their communication style. Give real advice based on their actual context.`

    const messages = [
      ...history.map((h: any) => ({ role: h.role as 'user' | 'assistant', content: h.content })),
      { role: 'user' as const, content: message }
    ]

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1000,
      system: systemPrompt,
      messages,
    })

    const reply = response.content[0].type === 'text' ? response.content[0].text : ''
    return NextResponse.json({ reply })
  } catch (err: any) {
    console.error('Coach chat error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
