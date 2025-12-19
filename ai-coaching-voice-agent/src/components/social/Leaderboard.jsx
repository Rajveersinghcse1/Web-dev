import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Leaderboard = () => {
  // In a real app, we'd use the query:
  // const users = useQuery(api.social.getGlobalLeaderboard, { limit: 10 });
  
  // Mock data for visualization until we have real users
  const mockUsers = [
    { _id: '1', name: 'Sarah Chen', xp: 15420, level: 12, image: null, streak: 45 },
    { _id: '2', name: 'Mike Ross', xp: 14200, level: 11, image: null, streak: 32 },
    { _id: '3', name: 'Jessica Pearson', xp: 12800, level: 10, image: null, streak: 28 },
    { _id: '4', name: 'Harvey Specter', xp: 11500, level: 9, image: null, streak: 15 },
    { _id: '5', name: 'Louis Litt', xp: 10200, level: 8, image: null, streak: 12 },
  ];

  const users = mockUsers; // Fallback to mock data

  const getRankIcon = (index) => {
    switch (index) {
      case 0: return <Crown className="w-6 h-6 text-yellow-500" />;
      case 1: return <Medal className="w-6 h-6 text-gray-400" />;
      case 2: return <Medal className="w-6 h-6 text-amber-600" />;
      default: return <span className="font-bold text-gray-500 w-6 text-center">{index + 1}</span>;
    }
  };

  return (
    <Card className="w-full max-w-md bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-bold">
          <Trophy className="w-6 h-6 text-purple-500" />
          Global Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users?.map((user, index) => (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-4 p-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex-shrink-0">
                {getRankIcon(index)}
              </div>
              
              <Avatar className="w-10 h-10 border-2 border-purple-100 dark:border-purple-900">
                <AvatarImage src={user.image} />
                <AvatarFallback><User className="w-5 h-5" /></AvatarFallback>
              </Avatar>

              <div className="flex-grow">
                <h3 className="font-semibold text-sm">{user.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Level {user.level} • {user.streak} day streak</p>
              </div>

              <div className="text-right">
                <span className="font-bold text-purple-600 dark:text-purple-400">{user.xp.toLocaleString()}</span>
                <span className="text-xs text-gray-400 block">XP</span>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default Leaderboard;
