import { motion } from 'framer-motion';
import { Trophy, Users } from 'lucide-react';

interface TopPerformersProps {
  leaderboard: any[] | undefined;
  compact?: boolean;
}

export function TopPerformers({ leaderboard, compact = false }: TopPerformersProps) {
  if (!leaderboard || leaderboard.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-100 overflow-hidden shadow-lg"
      >
        <div className="p-4 border-b border-gray-100 flex items-center gap-2 bg-gradient-to-r from-yellow-50 to-orange-50">
          <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
            <Trophy className="w-4 h-4 text-yellow-600" />
          </div>
          <h3 className="font-bold text-gray-900 text-sm">Top Performers</h3>
        </div>
        <div className="p-8 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">No data yet</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-100 overflow-hidden shadow-lg"
    >
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-yellow-50 to-orange-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
            <Trophy className="w-4 h-4 text-yellow-600" />
          </div>
          <h3 className="font-bold text-gray-900 text-sm">Top Performers</h3>
        </div>
        {!compact && (
          <div className="text-xs text-gray-500">
            {leaderboard.length} student{leaderboard.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
      
      <div className={compact ? "p-3 space-y-2" : "p-4 space-y-3"}>
        {leaderboard.map((entry, index) => {
          const isTopThree = index < 3;
          const rankStyles = {
            0: 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-lg shadow-yellow-200',
            1: 'bg-gradient-to-br from-gray-300 to-gray-500 text-white shadow-md shadow-gray-200',
            2: 'bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-md shadow-orange-200',
          };

          return (
            <motion.div 
              key={index} 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className={`flex items-center gap-3 p-${compact ? '2' : '3'} rounded-lg hover:bg-gradient-to-r hover:from-yellow-50/50 hover:to-orange-50/50 transition-all group cursor-pointer ${
                isTopThree ? 'bg-gray-50/50' : ''
              }`}
            >
              {/* Rank Badge */}
              <div 
                className={`w-${compact ? '8' : '10'} h-${compact ? '8' : '10'} rounded-lg flex items-center justify-center font-bold text-${compact ? 'xs' : 'sm'} ${
                  rankStyles[index as keyof typeof rankStyles] || 'bg-gray-100 text-gray-600'
                }`}
              >
                {index === 0 && !compact && <span className="mr-0.5">👑</span>}
                {index + 1}
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <p className={`font-bold text-gray-900 truncate group-hover:text-emerald-600 transition-colors ${
                  compact ? 'text-xs' : 'text-sm'
                }`}>
                  {entry.name}
                </p>
                <p className={`text-gray-500 ${compact ? 'text-[10px]' : 'text-xs'}`}>
                  {entry.totalTests} test{entry.totalTests !== 1 ? 's' : ''}
                  {!compact && ` • ${entry.totalQuestions} questions`}
                </p>
              </div>

              {/* Accuracy Score */}
              <div className="text-right">
                <p className={`font-bold ${
                  entry.accuracy >= 80 ? 'text-emerald-600' : 
                  entry.accuracy >= 60 ? 'text-yellow-600' : 'text-orange-600'
                } ${compact ? 'text-sm' : 'text-lg'}`}>
                  {entry.accuracy}%
                </p>
                {!compact && (
                  <p className="text-[10px] text-gray-500">accuracy</p>
                )}
              </div>

              {/* Medal for top 3 */}
              {isTopThree && !compact && (
                <div className="text-xl">
                  {index === 0 && '🥇'}
                  {index === 1 && '🥈'}
                  {index === 2 && '🥉'}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Footer Stats */}
      {!compact && leaderboard.length > 0 && (
        <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-t border-gray-100">
          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="text-gray-500">Highest Accuracy:</span>
              <span className="ml-1 font-bold text-emerald-600">{leaderboard[0].accuracy}%</span>
            </div>
            <div>
              <span className="text-gray-500">Avg Accuracy:</span>
              <span className="ml-1 font-bold text-gray-700">
                {Math.round(leaderboard.reduce((sum, e) => sum + e.accuracy, 0) / leaderboard.length)}%
              </span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
