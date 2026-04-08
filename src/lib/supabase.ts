import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? supabaseAnonKey,
  { auth: { storageKey: 'cervio-admin', persistSession: false, autoRefreshToken: false } }
)

export type Database = { public: { Tables: any } }

export interface Profile {
  id: string; email: string; full_name?: string; avatar_url?: string
  business_name?: string; business_description?: string; role?: string
  business_stage?: string; industry?: string; team_size?: string
  communication_style?: string; biggest_challenge?: string
  support_preference?: string; briefing_time?: string; timezone?: string
  onboarding_completed?: boolean; stripe_customer_id?: string
  subscription_status?: string; subscription_plan?: string
  trial_ends_at?: string; created_at?: string; updated_at?: string
}

export interface Goal {
  id: string; user_id: string; title: string; description?: string
  category?: string; priority?: number; status?: string; target_date?: string
  success_criteria?: string; current_progress?: number; progress?: number
  created_at?: string; updated_at?: string
}

export interface Briefing {
  id: string; user_id: string
  content: { priorities: string[]; decisions: string[]; risks: string[]; strategic_prompt: string }
  raw_text?: string; briefing_date?: string; was_read?: boolean; created_at?: string
}

export interface Decision {
  id: string; user_id: string; title: string; situation: string
  analysis?: any; chosen_option?: string; outcome_notes?: string
  status?: string; created_at?: string
}

export interface Meeting {
  id: string; user_id: string; title: string; meeting_with: string
  meeting_purpose: string; meeting_date?: string; background?: string
  brief?: any; status?: string; created_at?: string
}
