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

    // Fetch profile, goals, and recent activity
    const [profileRes, goalsRes, briefingsRes, decisionsRes, meetingsRes] = await Promise.all([
      supabaseAdmin.from('profiles').select('*').eq('id', user.id).single(),
      supabaseAdmin.from('goals').select('*').eq('user_id', user.id).eq('status', 'active').order('priority'),
      supabaseAdmin.from('briefings').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(7),
      supabaseAdmin.from('decisions').select('id, title, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
      supabaseAdmin.from('meetings').select('id, title, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
    ])

    const profile = profileRes.data
    const goals = goalsRes.data || []
    const briefings = briefingsRes.data || []
    const decisions = decisionsRes.data || []
    const meetings = meetingsRes.data || []

    // Calculate momentum metrics
    const avgProgress = goals.length
      ? Math.round(goals.reduce((a: number, g: any) => a + (g.current_progress || 0), 0) / goals.length)
      : 0

    const briefingStreak = briefings.filter((b: any) => b.was_read).length
    const totalActivity = decisions.length + meetings.length + briefingStreak

    const goalsNeedingAttention = goals.filter((g: any) => (g.current_progress || 0) < 25)
    const goalsOnTrack = goals.filter((g: any) => (g.current_progress || 0) >= 50)

    const prompt = `You are Cervio's Coach — a direct, sharp, no-nonsense performance coach for executives and founders. You're like a world-class sports coach combined with a strategic advisor. You don't do generic motivation. You do personalised, honest, specific pushes.

USER PROFILE:
Name: ${profile?.full_name || 'the user'}
Business: ${profile?.business_name || 'their business'}
Role: ${profile?.role || 'executive'}
Biggest challenge: ${profile?.biggest_challenge || 'not specified'}

GOALS & PROGRESS:
${goals.map((g: any) => `- "${g.title}" — ${g.current_progress || 0}% complete (${g.priority === 1 ? 'HIGH priority' : g.priority === 2 ? 'medium priority' : 'low priority'})`).join('\n') || 'No active goals set'}

PERFORMANCE METRICS:
- Average goal progress: ${avgProgress}%
- Goals on track (50%+): ${goalsOnTrack.length}/${goals.length}
- Goals needing attention (<25%): ${goalsNeedingAttention.length}
- Briefings read this week: ${briefingStreak}
- Decisions analysed recently: ${decisions.length}
- Meetings prepped recently: ${meetings.length}

Generate a coach message with this exact JSON structure:
{
  "momentum_score": <number 1-100 based on overall progress and activity>,
  "momentum_label": "<one of: 'Building', 'Steady', 'Strong', 'On Fire', 'Stalling', 'Time to push'>",
  "headline": "<one punchy, direct sentence — max 12 words — that cuts to the heart of where they are right now>",
  "honest_assessment": "<2-3 sentences of honest, specific assessment of their progress. Reference their actual goals and numbers. Not generic. Not soft. If they're behind, say it clearly but constructively>",
  "the_push": "<1-2 sentences — a sharp, specific call to action. What's the ONE thing they should do today to move the needle? Make it concrete, not vague>",
  "spotlight_goal": "<title of the goal that needs the most attention right now>",
  "spotlight_action": "<one specific action they can take TODAY on that goal>",
  "weekly_challenge": "<a specific, measurable challenge for this week that would represent real progress>"
}

Return ONLY the JSON. No preamble, no markdown backticks.`

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
const coaching = JSON.parse(clean)

    return NextResponse.json({ coaching, metrics: { avgProgress, goalCount: goals.length, briefingStreak, totalActivity } })
  } catch (err: any) {
    console.error('Coach error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
