import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from "@/lib/supabase-admin"
import { generateMeetingBrief, logInteraction } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const { userId, title, meeting_with, meeting_purpose, meeting_date, background } = await request.json()
    if (!userId || !meeting_with || !meeting_purpose) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const [profileRes, goalsRes] = await Promise.all([
      supabaseAdmin.from('profiles').select('*').eq('id', userId).single(),
      supabaseAdmin.from('goals').select('*').eq('user_id', userId).eq('status', 'active'),
    ])

    if (!profileRes.data) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

    const brief = await generateMeetingBrief(
      meeting_with,
      meeting_purpose,
      background || '',
      profileRes.data,
      goalsRes.data || []
    )

    // Save meeting
    const { error } = await supabaseAdmin.from('meetings').insert({
      user_id: userId,
      title: title || `Meeting with ${meeting_with}`,
      meeting_with,
      meeting_purpose,
      meeting_date: meeting_date || null,
      background: background || null,
      brief,
      status: 'upcoming',
    })

    if (error) throw error

    await logInteraction(supabaseAdmin, userId, 'meeting', `${meeting_with}: ${meeting_purpose}`, JSON.stringify(brief))

    return NextResponse.json({ brief })
  } catch (err: any) {
    console.error('Meeting prep API error:', err)
    return NextResponse.json({ error: err.message || 'Failed to generate brief' }, { status: 500 })
  }
}
