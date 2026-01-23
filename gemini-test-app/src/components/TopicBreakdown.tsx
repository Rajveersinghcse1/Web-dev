import type { QuestionAnalysis } from '../types';
import { BarChart3 } from 'lucide-react';

interface TopicBreakdownProps {
  questions: QuestionAnalysis[];
}

export function TopicBreakdown({ questions }: TopicBreakdownProps) {
  // Group by topic
  const topicMap = new Map<string, { correct: number; total: number }>();
  
  questions.forEach(q => {
    if (q.topic) {
      const existing = topicMap.get(q.topic) || { correct: 0, total: 0 };
      topicMap.set(q.topic, {
        correct: existing.correct + (q.isCorrect ? 1 : 0),
        total: existing.total + 1,
      });
    }
  });

  const topics = Array.from(topicMap.entries())
    .map(([name, stats]) => ({
      name,
      accuracy: Math.round((stats.correct / stats.total) * 100),
      correct: stats.correct,
      total: stats.total,
    }))
    .sort((a, b) => b.accuracy - a.accuracy); // Sort by accuracy descending

  if (topics.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
        <p className="text-sm">No topic data available</p>
        <p className="text-xs text-gray-400 mt-1">
          Questions need a "topic" field for topic analysis
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {topics.map((topic, idx) => {
        const accuracyColor = topic.accuracy >= 70 ? 'emerald' : 
                             topic.accuracy >= 50 ? 'yellow' : 'red';
        
        return (
          <div 
            key={idx} 
            className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-200 hover:border-emerald-300 hover:shadow-md transition-all group"
          >
            {/* Topic Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-bold text-gray-800 text-sm group-hover:text-emerald-600 transition-colors line-clamp-2">
                  {topic.name}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  {topic.correct}/{topic.total} correct
                </p>
              </div>
              
              {/* Rank Badge */}
              {idx === 0 && (
                <div className="ml-2 px-2 py-1 bg-emerald-100 rounded-full">
                  <span className="text-xs font-bold text-emerald-600">Best</span>
                </div>
              )}
              {idx === topics.length - 1 && topics.length > 1 && (
                <div className="ml-2 px-2 py-1 bg-orange-100 rounded-full">
                  <span className="text-xs font-bold text-orange-600">Focus</span>
                </div>
              )}
            </div>

            {/* Accuracy Display */}
            <div className="flex items-end justify-between mb-2">
              <div className={`text-3xl font-bold text-${accuracyColor}-600`}>
                {topic.accuracy}%
              </div>
              <div className="text-right">
                <span className={`text-xs font-medium px-2 py-1 rounded-full bg-${accuracyColor}-100 text-${accuracyColor}-700`}>
                  {topic.accuracy >= 70 ? '✓ Strong' : 
                   topic.accuracy >= 50 ? '~ Average' : '⚠ Weak'}
                </span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ease-out bg-gradient-to-r ${
                  topic.accuracy >= 70 ? 'from-emerald-400 to-emerald-600' : 
                  topic.accuracy >= 50 ? 'from-yellow-400 to-yellow-600' : 
                  'from-red-400 to-red-600'
                }`}
                style={{ width: `${topic.accuracy}%` }}
              />
            </div>

            {/* Additional Stats */}
            <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500">Attempted:</span>
                <span className="ml-1 font-semibold text-gray-700">{topic.total}</span>
              </div>
              <div>
                <span className="text-gray-500">Incorrect:</span>
                <span className="ml-1 font-semibold text-red-600">{topic.total - topic.correct}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
