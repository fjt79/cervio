import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from "@/lib/supabase-admin"
import { generateDailyBriefing, logInteraction } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()
    if (!userId) return NextResponse.json({ error: 'User ID required' }, { status: 400 })

    // Fetch profile and goals
    const [profileRes, goalsRes, contextRes] = await Promise.all([
      supabaseAdmin.from('profiles').select('*').eq('id', userId).single(),
      supabaseAdmin.from('goals').select('*').eq('user_id', userId).eq('status', 'active').order('priority'),
      supabaseAdmin.from('user_context').select('content').eq('user_id', userId)
        .order('created_at', { ascending: false }).limit(10),
    ])

    if (!profileRes.data) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    const recentContext = contextRes.data?.map((c: any) => c.content) || []

    // Generate briefing
    const briefingContent = await generateDailyBriefing(
      profileRes.data,
      goalsRes.data || [],
      recentContext
    )

    // Save to database
    const today = new Date().toISOString().split('T')[0]

    // Delete old briefing for today if exists
    await supabaseAdmin.from('briefings')
      .delete()
      .eq('user_id', userId)
      .eq('briefing_date', today)

    const { data: briefing, error } = await supabaseAdmin
      .from('briefings')
      .insert({
        user_id: userId,
        content: {
          priorities: briefingContent.priorities,
          decisions: briefingContent.decisions,
          risks: briefingContent.risks,
          strategic_prompt: briefingContent.strategic_prompt,
        },
        raw_text: briefingContent.raw_text,
        briefing_date: today,
      })
      .select()
      .single()

    if (error) throw error

    // Log interaction
    await logInteraction(supabaseAdmin, userId, 'briefing', 'daily briefing request', briefingContent.raw_text)

    return NextResponse.json({ briefing })
  } catch (err: any) {
    console.error('Briefing API error:', err)
    return NextResponse.json({ error: err.message || 'Failed to generate briefing' }, { status: 500 })
  }
}
