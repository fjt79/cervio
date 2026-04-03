import Anthropic from '@anthropic-ai/sdk'
import { Profile, Goal } from './supabase'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

// Cost-optimised: Haiku for simple tasks, Sonnet for complex reasoning
const HAIKU = 'claude-haiku-4-5-20251001'
const SONNET = 'claude-sonnet-4-6'

// ============================================================
// BUILD USER CONTEXT
// Injects user's profile + goals into every AI call
// ============================================================
function buildUserContext(profile: Profile, goals?: Goal[]): string {
  const activeGoals = goals?.filter(g => g.status === 'active') || []

  return `
## About This User
- Name: ${profile.full_name || 'the user'}
- Role: ${profile.role || 'Executive/Founder'}
- Business: ${profile.business_name || 'their business'} — ${profile.business_description || ''}
- Business Stage: ${profile.business_stage || 'growth'}
- Industry: ${profile.industry || 'technology'}
- Team Size: ${profile.team_size || 'small team'}
- Biggest Challenge: ${profile.biggest_challenge || 'scaling the business'}
- Communication Style: ${profile.communication_style || 'direct'} — ${profile.communication_style === 'direct' ? 'Give concise, direct advice. No fluff.' : 'Give detailed, thorough analysis.'}

## Active Goals
${activeGoals.length > 0
  ? activeGoals.map(g =>
      `- ${g.title} (Priority: ${g.priority === 1 ? 'High' : g.priority === 2 ? 'Medium' : 'Low'}, Progress: ${g.current_progress}%, Target: ${g.target_date || 'ongoing'})`
    ).join('\n')
  : '- No active goals set yet'}
`.trim()
}

// ============================================================
// DAILY BRIEFING
// ============================================================
export async function generateDailyBriefing(
  profile: Profile,
  goals: Goal[],
  recentContext: string[] = []
): Promise<{
  priorities: string[]
  decisions: string[]
  risks: string[]
  strategic_prompt: string
  raw_text: string
}> {
  const userContext = buildUserContext(profile, goals)
  const today = new Date().toLocaleDateString('en-AU', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  const prompt = `You are Cervio, an elite AI Chief of Staff. Generate a sharp, personalised daily briefing for ${today}.

${userContext}

${recentContext.length > 0 ? `## Recent Context\n${recentContext.slice(-5).join('\n')}` : ''}

Generate a daily briefing in this EXACT JSON format:
{
  "priorities": ["Priority 1 description", "Priority 2 description", "Priority 3 description"],
  "decisions": ["Decision 1 that needs attention", "Decision 2 if applicable"],
  "risks": ["Risk or flag 1", "Risk 2 if applicable"],
  "strategic_prompt": "One powerful strategic question for them to reflect on today"
}

Rules:
- Priorities must be specific to their business context and goals
- Be direct, sharp, executive-level — no fluff
- Reference their actual goals and challenges
- Strategic prompt should be thought-provoking and relevant
- Return ONLY valid JSON, no other text`

  const response = await anthropic.messages.create({
    model: HAIKU,
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''

  try {
    const parsed = JSON.parse(text)
    return { ...parsed, raw_text: text }
  } catch {
    // Fallback if JSON parse fails
    return {
      priorities: [
        `Review progress on your key goals for ${profile.business_name || 'the business'}`,
        'Address any urgent team or operational matters',
        'Move your most important strategic initiative forward'
      ],
      decisions: ['Review any pending decisions in your pipeline'],
      risks: ['Ensure no critical deadlines are approaching unaddressed'],
      strategic_prompt: 'What is the single most important thing you could do today to move your business forward?',
      raw_text: text
    }
  }
}

// ============================================================
// DECISION SUPPORT
// ============================================================
export async function analyseDecision(
  situation: string,
  profile: Profile,
  goals: Goal[]
): Promise<{
  summary: string
  options: Array<{
    title: string
    description: string
    pros: string[]
    cons: string[]
    risk_level: string
  }>
  recommendation: string
  rationale: string
  watchpoints: string[]
}> {
  const userContext = buildUserContext(profile, goals)

  const prompt = `You are Cervio, an elite AI Chief of Staff and strategic advisor. Analyse this decision situation for a senior executive.

${userContext}

## Situation to Analyse
${situation}

Provide a thorough decision analysis in this EXACT JSON format:
{
  "summary": "2-3 sentence summary of the core decision and what's at stake",
  "options": [
    {
      "title": "Option name",
      "description": "What this option involves",
      "pros": ["Pro 1", "Pro 2", "Pro 3"],
      "cons": ["Con 1", "Con 2"],
      "risk_level": "low|medium|high"
    }
  ],
  "recommendation": "Your clear recommendation — which option and why",
  "rationale": "2-3 sentences explaining why this recommendation fits their specific context, goals, and situation",
  "watchpoints": ["What to monitor after the decision", "Key success indicator", "Red flag to watch for"]
}

Rules:
- Provide exactly 3 options (do-nothing or status-quo can be one)
- Recommendation must be specific and direct — no hedging
- Rationale must reference their actual business context and goals
- Be direct and executive-level — this person has no time for generic advice
- Return ONLY valid JSON`

  const response = await anthropic.messages.create({
    model: SONNET,
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''

  try {
    return JSON.parse(text)
  } catch {
    return {
      summary: 'Analysis of your decision situation',
      options: [
        { title: 'Option A', description: 'Move forward', pros: ['Progress'], cons: ['Risk'], risk_level: 'medium' },
        { title: 'Option B', description: 'Hold position', pros: ['Safety'], cons: ['Delay'], risk_level: 'low' },
        { title: 'Option C', description: 'Alternative path', pros: ['Flexibility'], cons: ['Complexity'], risk_level: 'high' },
      ],
      recommendation: 'Please try again with more context for a specific recommendation.',
      rationale: 'Unable to generate analysis. Please provide more detail about the situation.',
      watchpoints: ['Monitor outcomes carefully']
    }
  }
}

// ============================================================
// MEETING PREP
// ============================================================
export async function generateMeetingBrief(
  meetingWith: string,
  purpose: string,
  background: string,
  profile: Profile,
  goals: Goal[]
): Promise<{
  objective: string
  key_points: string[]
  questions: string[]
  risks: string[]
  recommended_outcome: string
}> {
  const userContext = buildUserContext(profile, goals)

  const prompt = `You are Cervio, an elite AI Chief of Staff. Prepare a sharp meeting brief.

${userContext}

## Meeting Details
- Meeting With: ${meetingWith}
- Purpose: ${purpose}
- Background/Context: ${background || 'No additional background provided'}

Generate a meeting brief in this EXACT JSON format:
{
  "objective": "Clear, single-sentence objective — what success looks like in this meeting",
  "key_points": ["Point to make 1", "Point to make 2", "Point to make 3", "Point to make 4"],
  "questions": ["Strategic question to ask 1", "Question 2", "Question 3"],
  "risks": ["Risk or sensitivity to be aware of 1", "Risk 2 if applicable"],
  "recommended_outcome": "The specific outcome to push for by end of this meeting"
}

Rules:
- Be specific to this exact meeting and person
- Key points should be tailored to the user's goals and business context
- Questions should be strategic, not surface-level
- Risks should help them navigate the meeting diplomatically
- Return ONLY valid JSON`

  const response = await anthropic.messages.create({
    model: HAIKU,
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''

  try {
    return JSON.parse(text)
  } catch {
    return {
      objective: `Have a productive meeting with ${meetingWith} about ${purpose}`,
      key_points: ['Clarify objectives', 'Discuss key concerns', 'Align on next steps', 'Define success criteria'],
      questions: ['What does success look like for you?', 'What are the main blockers?', 'What would make this a win?'],
      risks: ['Ensure alignment before diving into details'],
      recommended_outcome: 'Clear next steps with owners and timelines agreed'
    }
  }
}

// ============================================================
// GOAL CHECK-IN
// ============================================================
export async function generateGoalCheckIn(
  goals: Goal[],
  profile: Profile
): Promise<{
  on_track: string[]
  at_risk: string[]
  blockers: string[]
  recommended_actions: string[]
  motivation: string
}> {
  const userContext = buildUserContext(profile, goals)
  const activeGoals = goals.filter(g => g.status === 'active')

  const prompt = `You are Cervio, an elite AI Chief of Staff. Conduct a goal check-in for this executive.

${userContext}

## Goals to Review
${activeGoals.map(g => `- "${g.title}" | Progress: ${g.current_progress}% | Due: ${g.target_date || 'ongoing'} | Success: ${g.success_criteria || 'not defined'}`).join('\n')}

Generate a goal check-in in this EXACT JSON format:
{
  "on_track": ["Goal that appears on track and why"],
  "at_risk": ["Goal that may be at risk and why"],
  "blockers": ["Likely blocker 1", "Likely blocker 2"],
  "recommended_actions": ["Specific action to take this week 1", "Action 2", "Action 3"],
  "motivation": "One sharp, direct motivational statement tailored to their situation"
}

Be honest, direct, and constructive. Reference specific goals. Return ONLY valid JSON.`

  const response = await anthropic.messages.create({
    model: HAIKU,
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''

  try {
    return JSON.parse(text)
  } catch {
    return {
      on_track: ['Continue monitoring your active goals'],
      at_risk: [],
      blockers: ['Insufficient data to identify specific blockers'],
      recommended_actions: ['Review each goal and update progress', 'Identify one action per goal this week'],
      motivation: 'Every day of focused action compounds. Keep moving.'
    }
  }
}

// ============================================================
// SAVE INTERACTION LOG
// ============================================================
export async function logInteraction(
  supabaseAdmin: any,
  userId: string,
  feature: string,
  input: string,
  output: string,
  model: string = HAIKU
) {
  await supabaseAdmin.from('interactions').insert({
    user_id: userId,
    feature,
    input: input.substring(0, 500),
    output: output.substring(0, 2000),
    model_used: model
  })
}
