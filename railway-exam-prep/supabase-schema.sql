-- RailwayPrep Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  current_level TEXT DEFAULT 'beginner' CHECK (current_level IN ('beginner', 'intermediate', 'advanced', 'pro')),
  total_xp INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. EXAM CATEGORIES
CREATE TABLE IF NOT EXISTS public.exam_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  syllabus JSONB,
  total_questions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default categories
INSERT INTO public.exam_categories (name, full_name, description, icon, color, syllabus) VALUES
('ALP', 'Assistant Loco Pilot', 'Technical & aptitude tests for locomotive pilots - CBT 1 & CBT 2', '🚂', 'blue', '[{"topic": "Mathematics", "weight": 25}, {"topic": "General Intelligence & Reasoning", "weight": 25}, {"topic": "Basic Science & Engineering", "weight": 30}, {"topic": "General Awareness", "weight": 20}]'),
('NTPC', 'Non-Technical Popular Categories', 'Graduate-level railway positions - CBT 1 & CBT 2', '🚄', 'purple', '[{"topic": "General Awareness", "weight": 40}, {"topic": "Mathematics", "weight": 30}, {"topic": "General Intelligence & Reasoning", "weight": 30}]'),
('D Group', 'Group D', 'Entry-level railway recruitment with minimum qualifications', '🛤️', 'green', '[{"topic": "General Science", "weight": 25}, {"topic": "Mathematics", "weight": 25}, {"topic": "General Intelligence & Reasoning", "weight": 30}, {"topic": "General Awareness & Current Affairs", "weight": 20}]'),
('Sectional Controller', 'Sectional Controller', 'Train control room operations with aptitude tests', '🚦', 'orange', '[{"topic": "General Intelligence & Reasoning", "weight": 35}, {"topic": "Quantitative Aptitude", "weight": 25}, {"topic": "General Awareness", "weight": 25}, {"topic": "English Language", "weight": 15}]'),
('Technician', 'Railway Technician', 'Technical grade positions for ITI holders', '🔧', 'red', '[{"topic": "Mathematics", "weight": 25}, {"topic": "General Intelligence & Reasoning", "weight": 25}, {"topic": "General Science", "weight": 25}, {"topic": "General Awareness", "weight": 25}]')
ON CONFLICT (name) DO NOTHING;

-- 3. TOPICS
CREATE TABLE IF NOT EXISTS public.topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES public.exam_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  parent_topic_id UUID REFERENCES public.topics(id),
  importance_score DECIMAL DEFAULT 50,
  question_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. QUESTIONS
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES public.exam_categories(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES public.topics(id),
  difficulty TEXT DEFAULT 'intermediate' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced', 'pro')),
  question_text TEXT NOT NULL,
  question_text_hi TEXT,
  options JSONB NOT NULL,
  correct_option INTEGER NOT NULL CHECK (correct_option >= 0 AND correct_option <= 3),
  explanation TEXT,
  explanation_hi TEXT,
  source TEXT DEFAULT 'manual' CHECK (source IN ('ai_generated', 'manual', 'pyq')),
  pyq_year INTEGER,
  pyq_shift TEXT,
  times_appeared INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. EXAM SESSIONS
CREATE TABLE IF NOT EXISTS public.exam_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.exam_categories(id),
  difficulty TEXT DEFAULT 'intermediate',
  mode TEXT DEFAULT 'full_exam' CHECK (mode IN ('practice', 'full_exam', 'daily_challenge', 'custom')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  total_questions INTEGER NOT NULL,
  answered_count INTEGER DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  time_taken_seconds INTEGER DEFAULT 0,
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned'))
);

-- 6. USER ANSWERS
CREATE TABLE IF NOT EXISTS public.user_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES public.exam_sessions(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.questions(id),
  question_number INTEGER NOT NULL,
  selected_option INTEGER,
  is_correct BOOLEAN,
  time_spent_seconds INTEGER DEFAULT 0,
  status TEXT DEFAULT 'not_visited' CHECK (status IN ('not_visited', 'answered', 'marked_review', 'answered_marked', 'skipped')),
  UNIQUE(session_id, question_id)
);

-- 7. USER PROGRESS
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.exam_categories(id),
  topic_id UUID REFERENCES public.topics(id),
  total_attempts INTEGER DEFAULT 0,
  correct_attempts INTEGER DEFAULT 0,
  accuracy_percentage DECIMAL DEFAULT 0,
  last_attempted TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category_id, topic_id)
);

-- 8. WEAK AREAS
CREATE TABLE IF NOT EXISTS public.weak_areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES public.topics(id),
  weakness_score DECIMAL DEFAULT 0 CHECK (weakness_score >= 0 AND weakness_score <= 100),
  recommended_questions JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, topic_id)
);

-- 9. BOOKMARKS
CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.questions(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, question_id)
);

-- 10. STUDY MATERIALS
CREATE TABLE IF NOT EXISTS public.study_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID REFERENCES public.topics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  content_type TEXT DEFAULT 'note' CHECK (content_type IN ('note', 'formula', 'flashcard', 'video')),
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'hi')),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. DAILY CHALLENGES
CREATE TABLE IF NOT EXISTS public.daily_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  challenge_date DATE NOT NULL DEFAULT CURRENT_DATE,
  score INTEGER DEFAULT 0,
  time_taken INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, challenge_date)
);

-- 12. USER STREAKS
CREATE TABLE IF NOT EXISTS public.user_streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_active_date DATE DEFAULT CURRENT_DATE,
  total_xp INTEGER DEFAULT 0,
  current_level TEXT DEFAULT 'Bronze' CHECK (current_level IN ('Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'))
);

-- 13. ACHIEVEMENTS
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB,
  UNIQUE(user_id, badge_type)
);

-- 14. EXAM TRENDS (for AI analysis)
CREATE TABLE IF NOT EXISTS public.exam_trends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES public.exam_categories(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  topic_distribution JSONB,
  difficulty_trend JSONB,
  average_cutoff DECIMAL,
  analyzed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category_id, year)
);

-- 15. REPEATED QUESTIONS (AI detected)
CREATE TABLE IF NOT EXISTS public.repeated_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES public.exam_categories(id) ON DELETE CASCADE,
  question_pattern TEXT NOT NULL,
  variations JSONB,
  appeared_in JSONB,
  frequency INTEGER DEFAULT 1,
  last_appeared TEXT,
  probability_next_exam DECIMAL DEFAULT 0,
  topic_tags JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_questions_category ON public.questions(category_id);
CREATE INDEX IF NOT EXISTS idx_questions_topic ON public.questions(topic_id);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON public.questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_exam_sessions_user ON public.exam_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_weak_areas_user ON public.weak_areas(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_user ON public.bookmarks(user_id);

-- Row Level Security Policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weak_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Policies for users table
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Policies for exam_sessions
CREATE POLICY "Users can view their own sessions" ON public.exam_sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own sessions" ON public.exam_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sessions" ON public.exam_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Policies for user_answers
CREATE POLICY "Users can view their own answers" ON public.user_answers
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.exam_sessions WHERE id = session_id AND user_id = auth.uid())
  );
CREATE POLICY "Users can create their own answers" ON public.user_answers
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.exam_sessions WHERE id = session_id AND user_id = auth.uid())
  );

-- Public read access for categories, topics, questions
CREATE POLICY "Anyone can view categories" ON public.exam_categories
  FOR SELECT USING (true);
CREATE POLICY "Anyone can view topics" ON public.topics
  FOR SELECT USING (true);
CREATE POLICY "Anyone can view questions" ON public.questions
  FOR SELECT USING (true);
CREATE POLICY "Anyone can view study materials" ON public.study_materials
  FOR SELECT USING (true);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  
  INSERT INTO public.user_streaks (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
