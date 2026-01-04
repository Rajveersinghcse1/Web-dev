// Database Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  current_level: 'beginner' | 'intermediate' | 'advanced' | 'pro';
  total_xp: number;
  current_streak: number;
  longest_streak: number;
  created_at: string;
}

export interface ExamCategory {
  id: string;
  name: 'ALP' | 'NTPC' | 'D Group' | 'Sectional Controller' | 'Technician';
  description: string;
  icon: string;
  color: string;
  syllabus: TopicSyllabus[];
  total_questions: number;
}

export interface TopicSyllabus {
  topic: string;
  subtopics: string[];
  weightage: number; // Percentage
}

export interface Topic {
  id: string;
  category_id: string;
  name: string;
  parent_topic_id?: string;
  importance_score: number;
  question_count: number;
}

export interface Question {
  id: string;
  category_id: string;
  topic_id: string;
  difficulty: DifficultyLevel;
  question_text: string;
  question_text_hi?: string; // Hindi version
  options: QuestionOption[];
  correct_option: number;
  explanation: string;
  explanation_hi?: string;
  source: 'ai_generated' | 'manual' | 'pyq';
  pyq_year?: number;
  pyq_shift?: string;
  times_appeared: number;
  created_at: string;
}

export interface QuestionOption {
  id: number;
  text: string;
  text_hi?: string;
}

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'pro';

export interface ExamSession {
  id: string;
  user_id: string;
  category_id: string;
  difficulty: DifficultyLevel;
  mode: 'practice' | 'full_exam' | 'daily_challenge' | 'custom';
  started_at: string;
  completed_at?: string;
  total_questions: number;
  answered_count: number;
  correct_count: number;
  time_taken_seconds: number;
  status: 'in_progress' | 'completed' | 'abandoned';
}

export interface UserAnswer {
  id: string;
  session_id: string;
  question_id: string;
  question_number: number;
  selected_option?: number;
  is_correct?: boolean;
  time_spent_seconds: number;
  status: 'not_visited' | 'answered' | 'marked_review' | 'answered_marked' | 'skipped';
}

export interface UserProgress {
  id: string;
  user_id: string;
  category_id: string;
  topic_id: string;
  total_attempts: number;
  correct_attempts: number;
  accuracy_percentage: number;
  last_attempted: string;
}

export interface WeakArea {
  id: string;
  user_id: string;
  topic_id: string;
  topic_name: string;
  weakness_score: number;
  recommended_questions: string[];
  updated_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  question_id: string;
  notes?: string;
  created_at: string;
}

export interface StudyMaterial {
  id: string;
  topic_id: string;
  title: string;
  content: string;
  content_type: 'note' | 'formula' | 'flashcard' | 'video';
  language: 'en' | 'hi';
  order: number;
}

export interface DailyChallenge {
  id: string;
  user_id: string;
  challenge_date: string;
  score: number;
  time_taken: number;
  completed: boolean;
}

export interface UserStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_active_date: string;
  total_xp: number;
  current_level: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  badge_type: BadgeType;
  earned_at: string;
  metadata?: Record<string, unknown>;
}

export type BadgeType = 
  | 'first_exam'
  | 'streak_7'
  | 'streak_30'
  | 'accuracy_master'
  | 'speed_demon'
  | 'topic_master'
  | 'daily_champion'
  | 'level_up';

// Exam Trend Types
export interface ExamTrend {
  category: string;
  year: number;
  topic_distribution: TopicDistribution[];
  difficulty_trend: DifficultyTrend[];
  average_cutoff: number;
}

export interface TopicDistribution {
  topic: string;
  question_count: number;
  percentage: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  predicted_next_year: number;
}

export interface DifficultyTrend {
  level: DifficultyLevel;
  percentage: number;
}

export interface RepeatedQuestion {
  question_pattern: string;
  variations: string[];
  appeared_in: string[];
  frequency: number;
  last_appeared: string;
  probability_next_exam: number;
  topic_tags: string[];
}

export interface TopicImportance {
  topic: string;
  subtopics: string[];
  historical_weight: number;
  trend_weight: number;
  difficulty_weight: number;
  overall_importance: number;
  recommended_questions: number;
  study_hours: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  must_know_facts: string[];
  frequently_asked: string[];
}

export interface TrendInsights {
  hot_topics: {
    name: string;
    reason: string;
    importance_score: number;
  }[];
  predicted_paper: {
    topic_breakdown: TopicDistribution[];
    expected_difficulty: string;
    expected_cutoff: number;
  };
  study_priority: {
    topic: string;
    current_mastery: number;
    target_mastery: number;
    hours_needed: number;
  }[];
  must_revise: string[];
}

// UI State Types
export interface ExamState {
  session: ExamSession | null;
  questions: Question[];
  answers: Map<string, UserAnswer>;
  currentQuestionIndex: number;
  timeRemaining: number;
  language: 'en' | 'hi';
  isSubmitting: boolean;
}

export interface ExamConfig {
  category_id: string;
  mode: 'practice' | 'full_exam' | 'daily_challenge' | 'custom';
  difficulty: DifficultyLevel;
  question_count: number;
  time_limit_minutes: number;
  topics?: string[];
  use_trend_data?: boolean;
  negative_marking: boolean;
  negative_mark_value: number;
}

export interface ExamResult {
  session: ExamSession;
  answers: UserAnswer[];
  questions: Question[];
  score: number;
  percentage: number;
  time_taken: string;
  topic_analysis: TopicAnalysis[];
  rank_percentile?: number;
  improvement_tips: string[];
}

export interface TopicAnalysis {
  topic: string;
  total: number;
  correct: number;
  wrong: number;
  skipped: number;
  accuracy: number;
  avg_time: number;
}
