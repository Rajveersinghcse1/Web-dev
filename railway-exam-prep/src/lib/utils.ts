import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Tailwind class merger
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Format time as MM:SS
export function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Format time as HH:MM:SS
export function formatTimeHMS(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Calculate percentage
export function calculatePercentage(correct: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((correct / total) * 100);
}

// Get grade based on percentage
export function getGrade(percentage: number): { grade: string; color: string } {
    if (percentage >= 90) return { grade: 'A+', color: 'text-green-500' };
    if (percentage >= 80) return { grade: 'A', color: 'text-green-400' };
    if (percentage >= 70) return { grade: 'B+', color: 'text-blue-500' };
    if (percentage >= 60) return { grade: 'B', color: 'text-blue-400' };
    if (percentage >= 50) return { grade: 'C', color: 'text-yellow-500' };
    if (percentage >= 40) return { grade: 'D', color: 'text-orange-500' };
    return { grade: 'F', color: 'text-red-500' };
}

// Shuffle array (Fisher-Yates)
export function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Calculate XP for various actions
export function calculateXP(action: string, params?: Record<string, number>): number {
    const xpTable: Record<string, number> = {
        correct_answer: 10,
        exam_complete: 50,
        daily_challenge: 30,
        streak_bonus: 5, // per day
        perfect_score: 100,
        first_exam: 25,
        topic_master: 200,
    };

    let xp = xpTable[action] || 0;

    if (action === 'streak_bonus' && params?.days) {
        xp = xpTable.streak_bonus * params.days;
    }

    return xp;
}

// Get level progress
export function getLevelProgress(totalXP: number): { level: string; progress: number; nextLevel: string; xpNeeded: number } {
    const levels = [
        { name: 'Bronze', minXP: 0 },
        { name: 'Silver', minXP: 500 },
        { name: 'Gold', minXP: 2000 },
        { name: 'Platinum', minXP: 5000 },
        { name: 'Diamond', minXP: 10000 },
    ];

    let currentLevel = levels[0];
    let nextLevel = levels[1];

    for (let i = 0; i < levels.length; i++) {
        if (totalXP >= levels[i].minXP) {
            currentLevel = levels[i];
            nextLevel = levels[i + 1] || levels[i];
        }
    }

    const xpInLevel = totalXP - currentLevel.minXP;
    const xpForLevel = nextLevel.minXP - currentLevel.minXP;
    const progress = xpForLevel > 0 ? (xpInLevel / xpForLevel) * 100 : 100;

    return {
        level: currentLevel.name,
        progress: Math.min(progress, 100),
        nextLevel: nextLevel.name,
        xpNeeded: Math.max(0, nextLevel.minXP - totalXP),
    };
}

// Get difficulty color
export function getDifficultyColor(difficulty: string): string {
    const colors: Record<string, string> = {
        beginner: 'bg-green-500/20 text-green-400 border-green-500/50',
        intermediate: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
        advanced: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
        pro: 'bg-red-500/20 text-red-400 border-red-500/50',
    };
    return colors[difficulty] || colors.beginner;
}

// Get question status color
export function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
        not_visited: 'bg-slate-600',
        answered: 'bg-green-500',
        marked_review: 'bg-yellow-500',
        answered_marked: 'bg-purple-500',
        skipped: 'bg-red-500',
    };
    return colors[status] || colors.not_visited;
}

// Calculate negative marking score
export function calculateScore(
    correct: number,
    wrong: number,
    negativeMarkValue: number = 0.33
): number {
    return correct - (wrong * negativeMarkValue);
}

// Format date
export function formatDate(date: string | Date): string {
    return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    }).format(new Date(date));
}

// Format relative time
export function formatRelativeTime(date: string | Date): string {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return formatDate(date);
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

// Local storage helpers
export const storage = {
    get: <T>(key: string, defaultValue: T): T => {
        if (typeof window === 'undefined') return defaultValue;
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch {
            return defaultValue;
        }
    },
    set: <T>(key: string, value: T): void => {
        if (typeof window === 'undefined') return;
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch {
            console.error('Failed to save to localStorage');
        }
    },
    remove: (key: string): void => {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(key);
    },
};

// Category icons and colors
export const categoryConfig: Record<string, { icon: string; color: string; gradient: string }> = {
    ALP: {
        icon: '🚂',
        color: 'from-blue-500 to-blue-700',
        gradient: 'bg-gradient-to-r from-blue-500/20 to-blue-700/20',
    },
    NTPC: {
        icon: '🚄',
        color: 'from-purple-500 to-purple-700',
        gradient: 'bg-gradient-to-r from-purple-500/20 to-purple-700/20',
    },
    'D Group': {
        icon: '🛤️',
        color: 'from-green-500 to-green-700',
        gradient: 'bg-gradient-to-r from-green-500/20 to-green-700/20',
    },
    'Sectional Controller': {
        icon: '🚦',
        color: 'from-orange-500 to-orange-700',
        gradient: 'bg-gradient-to-r from-orange-500/20 to-orange-700/20',
    },
    Technician: {
        icon: '🔧',
        color: 'from-red-500 to-red-700',
        gradient: 'bg-gradient-to-r from-red-500/20 to-red-700/20',
    },
};
