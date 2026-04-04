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

    // Get date range for last 7 days
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Fetch all context in parallel
    const [profileRes, goalsRes, decisionsRes, meetingsRes, briefingsRes, calendarRes] = await Promise.all([
      supabaseAdmin.from('profiles').select('*').eq('id', user.id).single(),
      supabaseAdmin.from('goals').select('*').eq('user_id', user.id).order('priority'),
      supabaseAdmin.from('decisions').select('*').eq('user_id', user.id)
        .gte('created_at', weekAgo.toISOString()).order('created_at', { ascending: false }),
      supabaseAdmin.from('meetings').select('*').eq('user_id', user.id)
        .gte('created_at', weekAgo.toISOString()).order('created_at', { ascending: false }),
      supabaseAdmin.from('briefings').select('*').eq('user_id', user.id)
        .gte('created_at', weekAgo.toISOString()).order('created_at', { ascending: false }),
      supabaseAdmin.from('calendar_events').select('*').eq('user_id', user.id)
        .gte('start_time', weekAgo.toISOString()).lte('start_time', now.toISOString())
        .order('start_time', { ascending: false }),
    ])

    const profile = profileRes.data
    const goals = goalsRes.data || []
    const decisions = decisionsRes.data || []
    const meetings = meetingsRes.data || []
    const briefings = briefingsRes.data || []
    const calendarEvents = calendarRes.data || []

    const activeGoals = goals.filter((g: any) => g.status === 'active')
    const completedGoals = goals.filter((g: any) => g.status === 'completed')

    const prompt = `You are Cervio — an AI Chief of Staff. Generate a deeply personalised weekly review for ${profile?.full_name}, ${profile?.role} at ${profile?.business_name}.

WEEK: ${weekAgo.toLocaleDateString('en-AU', { weekday: 'long', month: 'long', day: 'numeric' })} — ${now.toLocaleDateString('en-AU', { weekday: 'long', month: 'long', day: 'numeric' })}

PROFILE:
- Business: ${profile?.business_name}
- Stage: ${profile?.business_stage}
- Biggest challenge: ${profile?.biggest_challenge}
- Communication style: ${profile?.communication_style}

ACTIVE GOALS:
${activeGoals.map((g: any) => `- "${g.title}" — ${g.current_progress || 0}% complete (${g.priority === 1 ? 'HIGH' : g.priority === 2 ? 'MEDIUM' : 'LOW'} priority)${g.target_date ? `, due ${g.target_date}` : ''}`).join('\n') || 'No active goals'}

RECENTLY COMPLETED GOALS:
${completedGoals.slice(0, 3).map((g: any) => `- "${g.title}"`).join('\n') || 'None this week'}

DECISIONS MADE THIS WEEK (${decisions.length}):
${decisions.map((d: any) => `- "${d.title}" — ${d.situation?.substring(0, 100)}...`).join('\n') || 'No decisions logged'}

MEETINGS PREPPED THIS WEEK (${meetings.length}):
${meetings.map((m: any) => `- "${m.title}" with ${m.meeting_with}`).join('\n') || 'No meetings prepped'}

CALENDAR EVENTS THIS WEEK (${calendarEvents.length}):
${calendarEvents.map((e: any) => `- "${e.title}" on ${new Date(e.start_time).toLocaleDateString('en-AU')}`).join('\n') || 'No calendar events'}

BRIEFINGS READ THIS WEEK: ${briefings.filter((b: any) => b.was_read).length} of ${briefings.length}

Generate a comprehensive weekly review in this exact JSON format. Be specific, honest, and personalised. Reference actual goals, decisions, and activities. Don't be generic.

{
  "week_score": <number 1-100 — honest overall assessment of the week>,
  "week_label": "<one of: 'Exceptional', 'Strong', 'Solid', 'Mixed', 'Challenging', 'Lost week'>",
  "opening": "<2-3 sentences — a sharp, honest opening that sets the tone for this specific week. Reference actual things that happened>",
  "wins": [
    "<specific win from this week — reference actual goals/decisions/meetings>",
    "<another specific win>",
    "<another specific win>"
  ],
  "misses": [
    "<something that was supposed to happen but didn't — be honest and constructive>",
    "<another miss or area of concern>"
  ],
  "goal_updates": [
    {
      "title": "<goal title>",
      "progress": <current progress 0-100>,
      "assessment": "<1 sentence honest assessment of this goal's trajectory>",
      "status": "<one of: 'on_track', 'at_risk', 'behind', 'completed'>"
    }
  ],
  "key_decisions": [
    "<summary of a key decision made this week and why it mattered>"
  ],
  "patterns": "<1-2 sentences identifying any patterns in how the week went — time allocation, decision quality, energy, focus>",
  "next_week_focus": [
    "<the single most important thing to focus on next week>",
    "<second priority for next week>",
    "<third priority for next week>"
  ],
  "challenge": "<one specific, measurable challenge for next week that would make it a great week>",
  "closing": "<1-2 sentences — a direct, motivating close that's personalised to where they are in their journey>"
}

Return ONLY valid JSON. No markdown, no backticks, no preamble.`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const review = JSON.parse(clean)

    // Save to database
    const { data: saved } = await supabaseAdmin
      .from('weekly_reviews')
      .insert({
        user_id: user.id,
        week_start: weekAgo.toISOString(),
        week_end: now.toISOString(),
        content: review,
        week_score: review.week_score,
      })
      .select()
      .single()

    return NextResponse.json({ review, id: saved?.id })
  } catch (err: any) {
    console.error('Weekly review error:', err)
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
      .from('weekly_reviews')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    return NextResponse.json({ reviews: data || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
