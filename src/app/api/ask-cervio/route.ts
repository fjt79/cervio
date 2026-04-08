import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from "@/lib/supabase-admin"
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { data: { user } } = await supabaseAdmin.auth.getUser(token)
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { question, history } = await request.json()

    // Load full user context
    const [profileRes, goalsRes, decisionsRes, meetingsRes, briefingsRes, reviewsRes, stakeholdersRes] = await Promise.all([
      supabaseAdmin.from('profiles').select('*').eq('id', user.id).single(),
      supabaseAdmin.from('goals').select('*').eq('user_id', user.id).order('priority'),
      supabaseAdmin.from('decisions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
      supabaseAdmin.from('meetings').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20),
      supabaseAdmin.from('briefings').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(7),
      supabaseAdmin.from('weekly_reviews').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(4),
      supabaseAdmin.from('stakeholders').select('*').eq('user_id', user.id).order('importance', { ascending: false }).limit(20),
    ])

    const profile = profileRes.data
    const goals = goalsRes.data || []
    const decisions = decisionsRes.data || []
    const meetings = meetingsRes.data || []
    const briefings = briefingsRes.data || []
    const reviews = reviewsRes.data || []
    const stakeholders = stakeholdersRes.data || []

    const systemPrompt = `You are Cervio — ${profile?.full_name}'s personal AI Chief of Staff. You have complete context about their business, goals, decisions, meetings, and relationships. You answer questions about their business with the insight of a trusted advisor who knows everything.

You are direct, sharp, and specific. You reference actual data. You never say "I don't have enough information" — you work with what you have and flag if something seems missing.

COMPLETE CONTEXT FOR ${profile?.full_name?.toUpperCase()}:

PROFILE:
- Name: ${profile?.full_name}
- Role: ${profile?.role} at ${profile?.business_name}
- Business: ${profile?.business_description}
- Stage: ${profile?.business_stage}
- Industry: ${profile?.industry}
- Team: ${profile?.team_size}
- Biggest challenge: ${profile?.biggest_challenge}

ACTIVE GOALS (${goals.filter((g: any) => g.status === 'active').length}):
${goals.filter((g: any) => g.status === 'active').map((g: any) => `- "${g.title}" — ${g.current_progress || 0}% (${g.priority === 1 ? 'HIGH' : 'MEDIUM'} priority)${g.target_date ? `, due ${g.target_date}` : ''}`).join('\n')}

COMPLETED GOALS:
${goals.filter((g: any) => g.status === 'completed').map((g: any) => `- "${g.title}"`).join('\n') || 'None yet'}

RECENT DECISIONS (last 20):
${decisions.map((d: any) => `- [${new Date(d.created_at).toLocaleDateString('en-AU')}] "${d.title}" — ${d.situation?.substring(0, 150)}${d.analysis?.recommendation ? ` → Recommendation: ${d.analysis.recommendation.substring(0, 100)}` : ''}`).join('\n') || 'None logged'}

RECENT MEETINGS (last 20):
${meetings.map((m: any) => `- [${new Date(m.created_at).toLocaleDateString('en-AU')}] "${m.title}" with ${m.meeting_with} — Purpose: ${m.meeting_purpose}${m.brief?.recommended_outcome ? ` → Goal: ${m.brief.recommended_outcome.substring(0, 80)}` : ''}`).join('\n') || 'None logged'}

WEEKLY REVIEWS (last 4):
${reviews.map((r: any) => `- Week of ${new Date(r.week_start).toLocaleDateString('en-AU')}: Score ${r.week_score}/100 (${r.content?.week_label}) — ${r.content?.opening?.substring(0, 150)}`).join('\n') || 'None yet'}

KEY STAKEHOLDERS:
${stakeholders.map((s: any) => `- ${s.name} (${s.role} at ${s.company}) — ${s.relationship_type}, importance: ${s.importance}/5, last contact: ${s.last_contact_date ? new Date(s.last_contact_date).toLocaleDateString('en-AU') : 'unknown'}`).join('\n') || 'None tracked'}

RECENT BRIEFINGS: ${briefings.length} briefings in the last 7 days, ${briefings.filter((b: any) => b.was_read).length} read.`

    // Build conversation history
    const messages: any[] = []
    if (history && history.length > 0) {
      for (const msg of history.slice(-10)) {
        messages.push({ role: msg.role, content: msg.content })
      }
    }
    messages.push({ role: 'user', content: question })

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1000,
      system: systemPrompt,
      messages,
    })

    const answer = response.content[0].type === 'text' ? response.content[0].text : ''

    // Save interaction
    await supabaseAdmin.from('interactions').insert({
      user_id: user.id,
      feature: 'ask_cervio',
      input: question,
      output: answer,
      model_used: 'claude-sonnet-4-5',
    })

    return NextResponse.json({ answer })
  } catch (err: any) {
    console.error('Ask Cervio error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
