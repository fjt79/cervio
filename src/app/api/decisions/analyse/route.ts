import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { analyseDecision, logInteraction } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const { userId, title, situation } = await request.json()
    if (!userId || !title || !situation) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const [profileRes, goalsRes] = await Promise.all([
      supabaseAdmin.from('profiles').select('*').eq('id', userId).single(),
      supabaseAdmin.from('goals').select('*').eq('user_id', userId).eq('status', 'active'),
    ])

    if (!profileRes.data) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    // Run AI analysis
    const analysis = await analyseDecision(situation, profileRes.data, goalsRes.data || [])

    // Save decision
    const { data: decision, error } = await supabaseAdmin
      .from('decisions')
      .insert({
        user_id: userId,
        title,
        situation,
        analysis,
        status: 'analysed',
      })
      .select()
      .single()

    if (error) throw error

    // Save context for memory
    await supabaseAdmin.from('user_context').insert({
      user_id: userId,
      context_type: 'decision_pattern',
      content: `Decision made: "${title}" — Situation: ${situation.substring(0, 200)}`,
      importance: 2,
    })

    // Log interaction
    await logInteraction(supabaseAdmin, userId, 'decision', situation, JSON.stringify(analysis), 'claude-sonnet-4-6')

    return NextResponse.json({ analysis, decisionId: decision.id })
  } catch (err: any) {
    console.error('Decision API error:', err)
    return NextResponse.json({ error: err.message || 'Failed to analyse' }, { status: 500 })
  }
}
