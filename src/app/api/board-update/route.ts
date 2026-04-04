import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { data: { user } } = await supabaseAdmin.auth.getUser(token)
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const body = await request.json()
    const {
      period,
      update_type,
      revenue_current,
      revenue_previous,
      revenue_target,
      highlights,
      challenges,
      metrics,
      the_ask,
      next_period_plan,
      tone,
    } = body

    const { data: profile } = await supabaseAdmin.from('profiles').select('*').eq('id', user.id).single()
    const { data: goals } = await supabaseAdmin.from('goals').select('*').eq('user_id', user.id).eq('status', 'active').order('priority')

    const prompt = `You are a world-class startup advisor and communications expert. Write a ${update_type} update for ${profile?.full_name}, ${profile?.role} of ${profile?.business_name}.

CONTEXT:
- Business: ${profile?.business_name}
- Description: ${profile?.business_description}
- Stage: ${profile?.business_stage}
- Industry: ${profile?.industry}
- Team size: ${profile?.team_size}

PERIOD: ${period}
UPDATE TYPE: ${update_type} (${update_type === 'board' ? 'formal board update' : update_type === 'investor' ? 'investor update email' : 'monthly update'})
TONE: ${tone || 'professional and direct'}

FINANCIAL METRICS:
- Current period revenue/ARR: ${revenue_current || 'not provided'}
- Previous period: ${revenue_previous || 'not provided'}
- Target: ${revenue_target || 'not provided'}

KEY METRICS THIS PERIOD:
${metrics || 'not provided'}

HIGHLIGHTS & WINS:
${highlights}

CHALLENGES & RISKS:
${challenges}

ACTIVE GOALS:
${goals?.map((g: any) => `- ${g.title}: ${g.current_progress || 0}% complete`).join('\n') || 'not provided'}

NEXT PERIOD PLAN:
${next_period_plan || 'not provided'}

THE ASK (if any):
${the_ask || 'no specific ask this update'}

Generate a polished, professional ${update_type} update. Structure it properly for the audience. Be specific, confident, and honest about both wins and challenges. Don't oversell or undersell. Write in the voice of ${profile?.full_name} — a confident, direct founder/executive.

Return this exact JSON:
{
  "subject": "<email subject line if investor update, or document title if board update>",
  "sections": [
    {
      "title": "<section heading>",
      "content": "<section content — well-written paragraphs or bullet points as appropriate>"
    }
  ],
  "tldr": "<2-3 sentence executive summary for busy readers>",
  "tone_notes": "<1 sentence note on the tone and approach taken>"
}

Return ONLY valid JSON. No markdown backticks.`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const update = JSON.parse(clean)

    // Save
    await supabaseAdmin.from('board_updates').insert({
      user_id: user.id,
      period,
      update_type,
      content: update,
      inputs: body,
    })

    return NextResponse.json({ update })
  } catch (err: any) {
    console.error('Board update error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { data: { user } } = await supabaseAdmin.auth.getUser(token)
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { data } = await supabaseAdmin
      .from('board_updates')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    return NextResponse.json({ updates: data || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
