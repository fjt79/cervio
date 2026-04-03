import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://chindatsyzvaieflwzlf.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNoaW5kYXRzeXp2YWllZmx3emxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyMTQyNDcsImV4cCI6MjA5MDc5MDI0N30.wXR9NpRmeRGNQxBUM3156-qiQD27flejhHUI0Mr3jq0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const supabaseAdmin = createClient(
  supabaseUrl,
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNoaW5kYXRzeXp2YWllZmx3emxmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTIxNDI0NywiZXhwIjoyMDkwNzkwMjQ3fQ.8kxEYnXcqEfzeWIv948SlWxR-iHggXImwtDtsJb6T-Q'
)

export interface Decision {
  id: string
  user_id: string
  title: string
  situation: string
  analysis?: {
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
  }
  chosen_option?: string
  outcome_notes?: string
  status?: string
  created_at?: string
}

export interface Meeting {
  id: string
  user_id: string
  title: string
  meeting_with: string
  meeting_purpose: string
  meeting_date?: string
  background?: string
  brief?: {
    objective: string
    key_points: string[]
    questions: string[]
    risks: string[]
    recommended_outcome: string
  }
  status?: string
  created_at?: string
}

export interface Goal {
  id: string
  user_id: string
  title: string
  description?: string
  category?: string
  priority?: number
  status?: string
  target_date?: string
  success_criteria?: string
  current_progress?: number
  created_at?: string
  updated_at?: string
}

export interface Briefing {
  id: string
  user_id: string
  content: {
    priorities: string[]
    decisions: string[]
    risks: string[]
    strategic_prompt: string
  }
  raw_text?: string
  briefing_date?: string
  was_read?: boolean
  created_at?: string
}

export interface Profile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  business_name?: string
  business_description?: string
  role?: string
  business_stage?: string
  industry?: string
  team_size?: string
  communication_style?: string
  biggest_challenge?: string
  support_preference?: string
  briefing_time?: string
  timezone?: string
  onboarding_completed?: boolean
  stripe_customer_id?: string
  subscription_status?: string
  subscription_plan?: string
  trial_ends_at?: string
  created_at?: string
  updated_at?: string
}
