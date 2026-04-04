import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { data: { user } } = await supabaseAdmin.auth.getUser(token)
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { data } = await supabaseAdmin
      .from('stakeholders')
      .select('*')
      .eq('user_id', user.id)
      .order('importance', { ascending: false })

    return NextResponse.json({ stakeholders: data || [] })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { data: { user } } = await supabaseAdmin.auth.getUser(token)
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const body = await request.json()

    // If action is 'draft_message', generate AI outreach
    if (body.action === 'draft_message') {
      const { stakeholder, message_type, context } = body
      const { data: profile } = await supabaseAdmin.from('profiles').select('*').eq('id', user.id).single()

      const response = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: `Draft a ${message_type} message from ${profile?.full_name} (${profile?.role} at ${profile?.business_name}) to ${stakeholder.name} (${stakeholder.role} at ${stakeholder.company}).

Relationship: ${stakeholder.relationship_type}, last contact: ${stakeholder.last_contact_date || 'unknown'}
Context: ${context || 'general check-in'}
Notes about this person: ${stakeholder.notes || 'none'}

Write a natural, ${stakeholder.relationship_type === 'investor' ? 'professional' : 'warm'} message. Keep it concise — 3-5 sentences max. Don't be generic. Reference the relationship and context.

Return just the message text, no subject line, no formatting.`
        }],
      })

      const message = response.content[0].type === 'text' ? response.content[0].text : ''
      return NextResponse.json({ message })
    }

    // Otherwise create stakeholder
    const { data, error } = await supabaseAdmin
      .from('stakeholders')
      .insert({ ...body, user_id: user.id, action: undefined })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ stakeholder: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const { data: { user } } = await supabaseAdmin.auth.getUser(token)
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const body = await request.json()
    const { id, ...updates } = body

    const { data, error } = await supabaseAdmin
      .from('stakeholders')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ stakeholder: data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
