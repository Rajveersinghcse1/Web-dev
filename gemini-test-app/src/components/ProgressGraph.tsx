import { motion } from 'framer-motion';
import { TrendingUp, BarChart3 } from 'lucide-react';

interface ProgressGraphProps {
  testHistory: any[] | undefined;
}

export function ProgressGraph({ testHistory }: ProgressGraphProps) {
  if (!testHistory || testHistory.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-100 overflow-hidden shadow-lg p-6"
      >
        <h3 className="font-bold text-gray-900 text-base mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          Your Progress
        </h3>
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm font-medium">No test data yet</p>
            <p className="text-gray-400 text-xs mt-1">Take tests to see your progress</p>
          </div>
        </div>
      </motion.div>
    );
  }

  const recentTests = testHistory.slice(-10);
  const maxPercentage = Math.max(...recentTests.map(t => t.percentage), 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white/90 backdrop-blur-sm rounded-xl border border-gray-100 overflow-hidden shadow-lg p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          Your Progress
        </h3>
        <div className="text-xs text-gray-500">
          Last {recentTests.length} test{recentTests.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Bar Chart */}
      <div className="mb-4">
        <div className="h-56 flex items-end justify-between gap-2">
          {recentTests.map((test, index) => {
            const height = (test.percentage / maxPercentage) * 100;
            const color = test.percentage >= 70 ? 'bg-emerald-500' : 
                        test.percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500';
            const hoverColor = test.percentage >= 70 ? 'hover:bg-emerald-600' : 
                              test.percentage >= 50 ? 'hover:bg-yellow-600' : 'hover:bg-red-600';
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                <div 
                  className="w-full bg-gray-100 rounded-t-lg relative transition-all cursor-pointer" 
                  style={{ height: `${Math.max(height, 8)}%` }}
                  title={`${test.subject}: ${test.percentage}%\n${test.correct}/${test.totalQuestions} correct`}
                >
                  <div className={`${color} ${hoverColor} w-full h-full rounded-t-lg transition-all`}></div>
                  
                  {/* Tooltip on hover */}
                  <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                    <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl">
                      <div className="font-bold">{test.percentage}%</div>
                      <div className="text-gray-300">{test.correct}/{test.totalQuestions}</div>
                      <div className="text-gray-400 text-[10px] mt-1">{test.subject}</div>
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-gray-500 font-medium">T{index + 1}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-xs border-t border-gray-100 pt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-emerald-500 rounded"></div>
          <span className="text-gray-600 font-medium">Excellent (≥70%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded"></div>
          <span className="text-gray-600 font-medium">Good (50-69%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span className="text-gray-600 font-medium">Needs Work (&lt;50%)</span>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="mt-4 grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
        <div className="text-center">
          <p className="text-lg font-bold text-gray-900">
            {Math.round(recentTests.reduce((sum, t) => sum + t.percentage, 0) / recentTests.length)}%
          </p>
          <p className="text-xs text-gray-500">Avg Score</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-emerald-600">
            {Math.max(...recentTests.map(t => t.percentage))}%
          </p>
          <p className="text-xs text-gray-500">Best Score</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-gray-900">
            {recentTests.reduce((sum, t) => sum + t.correct, 0)}
          </p>
          <p className="text-xs text-gray-500">Total Correct</p>
        </div>
      </div>
    </motion.div>
  );
}
