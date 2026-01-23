import type { QuestionAnalysis, TopicAnalysis } from '../types';

/**
 * Calculate topic-wise analytics from question analysis data
 */
export function calculateTopicAnalysis(questions: QuestionAnalysis[]): TopicAnalysis[] {
  const topicMap = new Map<string, { attempted: number; correct: number }>();
  
  questions.forEach(q => {
    const topic = q.topic || 'General'; // Default topic if not specified
    
    if (!topicMap.has(topic)) {
      topicMap.set(topic, { attempted: 0, correct: 0 });
    }
    
    const stats = topicMap.get(topic)!;
    stats.attempted++;
    if (q.isCorrect) {
      stats.correct++;
    }
  });
  
  // Convert to array and calculate accuracy
  return Array.from(topicMap.entries())
    .map(([topicName, stats]) => ({
      topicName,
      questionsAttempted: stats.attempted,
      correct: stats.correct,
      accuracy: stats.attempted > 0 
        ? Math.round((stats.correct / stats.attempted) * 100) 
        : 0,
    }))
    .sort((a, b) => b.questionsAttempted - a.questionsAttempted); // Sort by most attempted
}

/**
 * Get weak topics (accuracy < 50%)
 */
export function getWeakTopics(topicAnalysis: TopicAnalysis[]): TopicAnalysis[] {
  return topicAnalysis
    .filter(topic => topic.accuracy < 50 && topic.questionsAttempted >= 3)
    .sort((a, b) => a.accuracy - b.accuracy); // Sort by worst first
}

/**
 * Get strong topics (accuracy >= 80%)
 */
export function getStrongTopics(topicAnalysis: TopicAnalysis[]): TopicAnalysis[] {
  return topicAnalysis
    .filter(topic => topic.accuracy >= 80)
    .sort((a, b) => b.accuracy - a.accuracy); // Sort by best first
}

/**
 * Calculate performance metrics
 */
export function calculatePerformanceMetrics(questions: QuestionAnalysis[]) {
  const totalQuestions = questions.length;
  const attempted = questions.filter(q => q.userAnswer !== null).length;
  const correct = questions.filter(q => q.isCorrect).length;
  const incorrect = questions.filter(q => q.userAnswer !== null && !q.isCorrect).length;
  const unanswered = totalQuestions - attempted;
  
  const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
  const completionRate = Math.round((attempted / totalQuestions) * 100);
  
  return {
    totalQuestions,
    attempted,
    correct,
    incorrect,
    unanswered,
    accuracy,
    completionRate,
  };
}

/**
 * Format time in MM:SS format
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Get performance color based on percentage
 */
export function getPerformanceColor(percentage: number): {
  text: string;
  bg: string;
  label: string;
} {
  if (percentage >= 80) {
    return { text: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Excellent' };
  } else if (percentage >= 60) {
    return { text: 'text-blue-600', bg: 'bg-blue-50', label: 'Good' };
  } else if (percentage >= 40) {
    return { text: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Average' };
  } else {
    return { text: 'text-red-600', bg: 'bg-red-50', label: 'Needs Work' };
  }
}
