import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper function to check if Supabase is configured
export const isSupabaseConfigured = () => {
    return supabaseUrl !== '' && supabaseAnonKey !== '' &&
        supabaseUrl !== 'your_supabase_project_url';
};

// Auth helpers
export const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
            },
        },
    });
    return { data, error };
};

export const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });
    return { data, error };
};

export const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        },
    });
    return { data, error };
};

export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
};

export const getCurrentUser = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
};

// Database helpers
export const fetchExamCategories = async () => {
    const { data, error } = await supabase
        .from('exam_categories')
        .select('*')
        .order('name');
    return { data, error };
};

export const fetchTopics = async (categoryId: string) => {
    const { data, error } = await supabase
        .from('topics')
        .select('*')
        .eq('category_id', categoryId)
        .order('importance_score', { ascending: false });
    return { data, error };
};

export const fetchQuestions = async (
    categoryId: string,
    options: {
        topics?: string[];
        difficulty?: string;
        limit?: number;
        excludeIds?: string[];
        pyqOnly?: boolean;
    }
) => {
    let query = supabase
        .from('questions')
        .select('*')
        .eq('category_id', categoryId);

    if (options.topics && options.topics.length > 0) {
        query = query.in('topic_id', options.topics);
    }

    if (options.difficulty) {
        query = query.eq('difficulty', options.difficulty);
    }

    if (options.excludeIds && options.excludeIds.length > 0) {
        query = query.not('id', 'in', `(${options.excludeIds.join(',')})`);
    }

    if (options.pyqOnly) {
        query = query.eq('source', 'pyq');
    }

    if (options.limit) {
        query = query.limit(options.limit);
    }

    const { data, error } = await query;
    return { data, error };
};

export const createExamSession = async (session: Partial<ExamSession>) => {
    const { data, error } = await supabase
        .from('exam_sessions')
        .insert(session)
        .select()
        .single();
    return { data, error };
};

export const updateExamSession = async (sessionId: string, updates: Partial<ExamSession>) => {
    const { data, error } = await supabase
        .from('exam_sessions')
        .update(updates)
        .eq('id', sessionId)
        .select()
        .single();
    return { data, error };
};

export const saveUserAnswer = async (answer: Partial<UserAnswer>) => {
    const { data, error } = await supabase
        .from('user_answers')
        .upsert(answer, { onConflict: 'session_id,question_id' })
        .select()
        .single();
    return { data, error };
};

export const fetchUserProgress = async (userId: string, categoryId?: string) => {
    let query = supabase
        .from('user_progress')
        .select('*, topics(*)')
        .eq('user_id', userId);

    if (categoryId) {
        query = query.eq('category_id', categoryId);
    }

    const { data, error } = await query;
    return { data, error };
};

export const fetchWeakAreas = async (userId: string) => {
    const { data, error } = await supabase
        .from('weak_areas')
        .select('*, topics(*)')
        .eq('user_id', userId)
        .order('weakness_score', { ascending: false })
        .limit(10);
    return { data, error };
};

export const addBookmark = async (userId: string, questionId: string, notes?: string) => {
    const { data, error } = await supabase
        .from('bookmarks')
        .insert({ user_id: userId, question_id: questionId, notes })
        .select()
        .single();
    return { data, error };
};

export const removeBookmark = async (userId: string, questionId: string) => {
    const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', userId)
        .eq('question_id', questionId);
    return { error };
};

export const fetchBookmarks = async (userId: string) => {
    const { data, error } = await supabase
        .from('bookmarks')
        .select('*, questions(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
    return { data, error };
};

export const updateUserStreak = async (userId: string) => {
    const today = new Date().toISOString().split('T')[0];

    const { data: existingStreak } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', userId)
        .single();

    if (!existingStreak) {
        // Create new streak record
        return await supabase
            .from('user_streaks')
            .insert({
                user_id: userId,
                current_streak: 1,
                longest_streak: 1,
                last_active_date: today,
                total_xp: 0,
                current_level: 'Bronze'
            })
            .select()
            .single();
    }

    const lastActive = new Date(existingStreak.last_active_date);
    const todayDate = new Date(today);
    const diffDays = Math.floor((todayDate.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));

    let newStreak = existingStreak.current_streak;
    if (diffDays === 1) {
        newStreak += 1;
    } else if (diffDays > 1) {
        newStreak = 1;
    }

    const longestStreak = Math.max(newStreak, existingStreak.longest_streak);

    return await supabase
        .from('user_streaks')
        .update({
            current_streak: newStreak,
            longest_streak: longestStreak,
            last_active_date: today
        })
        .eq('user_id', userId)
        .select()
        .single();
};

export const addXP = async (userId: string, xp: number) => {
    const { data: streak } = await supabase
        .from('user_streaks')
        .select('total_xp, current_level')
        .eq('user_id', userId)
        .single();

    if (!streak) return { data: null, error: new Error('No streak record found') };

    const newXP = streak.total_xp + xp;
    const newLevel = calculateLevel(newXP);

    const { data, error } = await supabase
        .from('user_streaks')
        .update({ total_xp: newXP, current_level: newLevel })
        .eq('user_id', userId)
        .select()
        .single();

    return { data, error };
};

const calculateLevel = (xp: number): string => {
    if (xp >= 10000) return 'Diamond';
    if (xp >= 5000) return 'Platinum';
    if (xp >= 2000) return 'Gold';
    if (xp >= 500) return 'Silver';
    return 'Bronze';
};

// Import the ExamSession and UserAnswer types
import type { ExamSession, UserAnswer } from '@/types';
