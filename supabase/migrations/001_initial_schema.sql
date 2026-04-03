-- ============================================================
-- CERVIO DATABASE SCHEMA
-- Run this in your Supabase SQL editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES TABLE
-- Extended user data beyond Supabase auth
-- ============================================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  
  -- Business context (from onboarding)
  business_name TEXT,
  business_description TEXT,
  role TEXT,
  business_stage TEXT, -- 'idea', 'early', 'growth', 'scale', 'enterprise'
  industry TEXT,
  team_size TEXT,
  
  -- Decision style
  communication_style TEXT DEFAULT 'direct', -- 'direct', 'detailed'
  biggest_challenge TEXT,
  support_preference TEXT,
  
  -- App settings
  briefing_time TIME DEFAULT '07:00:00',
  timezone TEXT DEFAULT 'UTC',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  
  -- Subscription
  stripe_customer_id TEXT,
  subscription_status TEXT DEFAULT 'trial', -- 'trial', 'active', 'cancelled', 'past_due'
  subscription_plan TEXT DEFAULT 'trial', -- 'trial', 'solo', 'pro', 'team', 'enterprise'
  subscription_id TEXT,
  trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- GOALS TABLE
-- User's business and personal goals
-- ============================================================
CREATE TABLE goals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'business', -- 'business', 'personal', 'financial', 'team'
  priority INTEGER DEFAULT 1, -- 1=high, 2=medium, 3=low
  status TEXT DEFAULT 'active', -- 'active', 'completed', 'paused', 'cancelled'
  
  target_date DATE,
  success_criteria TEXT,
  current_progress INTEGER DEFAULT 0, -- 0-100
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BRIEFINGS TABLE
-- Daily briefings generated for users
-- ============================================================
CREATE TABLE briefings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  content JSONB NOT NULL, -- { priorities: [], decisions: [], risks: [], prompt: '' }
  raw_text TEXT,
  
  briefing_date DATE DEFAULT CURRENT_DATE,
  was_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DECISIONS TABLE
-- Decision support sessions
-- ============================================================
CREATE TABLE decisions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  title TEXT NOT NULL,
  situation TEXT NOT NULL,
  
  -- AI Analysis
  analysis JSONB, -- { summary, options: [{title, pros, cons, risk}], recommendation, rationale, watchpoints }
  
  -- User outcome
  chosen_option TEXT,
  outcome_notes TEXT,
  
  status TEXT DEFAULT 'analysing', -- 'analysing', 'decided', 'monitoring'
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MEETINGS TABLE
-- Meeting prep sessions
-- ============================================================
CREATE TABLE meetings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  title TEXT NOT NULL,
  meeting_with TEXT NOT NULL,
  meeting_purpose TEXT NOT NULL,
  meeting_date TIMESTAMPTZ,
  background TEXT,
  
  -- AI Brief
  brief JSONB, -- { objective, key_points: [], questions: [], risks: [], recommended_outcome }
  
  status TEXT DEFAULT 'upcoming', -- 'upcoming', 'completed'
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CONTEXT MEMORY TABLE
-- Persistent memory/context per user for AI personalisation
-- ============================================================
CREATE TABLE user_context (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  context_type TEXT NOT NULL, -- 'business', 'preference', 'decision_pattern', 'goal_update', 'general'
  content TEXT NOT NULL,
  importance INTEGER DEFAULT 1, -- 1=low, 2=medium, 3=high
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INTERACTIONS TABLE
-- Log of all AI interactions for learning
-- ============================================================
CREATE TABLE interactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  
  feature TEXT NOT NULL, -- 'briefing', 'decision', 'meeting', 'goal', 'chat'
  input TEXT,
  output TEXT,
  tokens_used INTEGER DEFAULT 0,
  model_used TEXT DEFAULT 'claude-haiku-4-5-20251001',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE briefings ENABLE ROW LEVEL SECURITY;
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only see/edit their own
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Goals
CREATE POLICY "Users manage own goals" ON goals FOR ALL USING (auth.uid() = user_id);

-- Briefings
CREATE POLICY "Users view own briefings" ON briefings FOR ALL USING (auth.uid() = user_id);

-- Decisions
CREATE POLICY "Users manage own decisions" ON decisions FOR ALL USING (auth.uid() = user_id);

-- Meetings
CREATE POLICY "Users manage own meetings" ON meetings FOR ALL USING (auth.uid() = user_id);

-- Context
CREATE POLICY "Users manage own context" ON user_context FOR ALL USING (auth.uid() = user_id);

-- Interactions
CREATE POLICY "Users view own interactions" ON interactions FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_goals_updated_at BEFORE UPDATE ON goals FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_decisions_updated_at BEFORE UPDATE ON decisions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON meetings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_status ON goals(status);
CREATE INDEX idx_briefings_user_date ON briefings(user_id, briefing_date DESC);
CREATE INDEX idx_decisions_user_id ON decisions(user_id);
CREATE INDEX idx_meetings_user_id ON meetings(user_id);
CREATE INDEX idx_context_user_id ON user_context(user_id);
CREATE INDEX idx_interactions_user_id ON interactions(user_id, created_at DESC);
