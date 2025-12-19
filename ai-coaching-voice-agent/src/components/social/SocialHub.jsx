import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, Share2, MessageSquare, Heart } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const SocialHub = () => {
  const [activeTab, setActiveTab] = useState('friends');

  // Mock data
  const friends = [
    { id: 1, name: 'Alex Johnson', status: 'online', activity: 'Practicing Interview' },
    { id: 2, name: 'Sam Smith', status: 'offline', activity: 'Last seen 2h ago' },
  ];

  const sharedActivity = [
    { id: 1, user: 'Alex Johnson', type: 'achievement', title: 'Earned "Week Warrior"', time: '2h ago', likes: 5 },
    { id: 2, user: 'You', type: 'session', title: 'Completed "Python Basics"', time: '5h ago', likes: 12 },
  ];

  return (
    <div className="w-full max-w-2xl space-y-6">
      <Tabs defaultValue="friends" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="friends">Friends & Activity</TabsTrigger>
          <TabsTrigger value="add">Add Friends</TabsTrigger>
        </TabsList>

        <TabsContent value="friends" className="space-y-4 mt-4">
          {/* Friends List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="w-5 h-5" />
                Online Friends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {friends.map((friend) => (
                  <div key={friend.id} className="flex flex-col items-center min-w-[80px]">
                    <div className="relative">
                      <Avatar className="w-12 h-12 border-2 border-white dark:border-gray-800 shadow-sm">
                        <AvatarFallback>{friend.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${friend.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`} />
                    </div>
                    <span className="text-xs font-medium mt-1 truncate w-full text-center">{friend.name}</span>
                  </div>
                ))}
                <Button variant="outline" className="h-12 w-12 rounded-full border-dashed">
                  <UserPlus className="w-5 h-5" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Activity Feed */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg px-1">Recent Activity</h3>
            {sharedActivity.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>{item.user[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-semibold">{item.user}</span>
                            <span className="text-gray-500 text-sm ml-2">shared an {item.type}</span>
                          </div>
                          <span className="text-xs text-gray-400">{item.time}</span>
                        </div>
                        <p className="text-sm mt-1 font-medium text-purple-600 dark:text-purple-400">{item.title}</p>
                        
                        <div className="flex gap-4 mt-3">
                          <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-500 hover:text-red-500">
                            <Heart className="w-4 h-4 mr-1" /> {item.likes}
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-500">
                            <MessageSquare className="w-4 h-4 mr-1" /> Comment
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-500 ml-auto">
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="add" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Find Friends</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input placeholder="Enter email or username..." />
                <Button>Search</Button>
              </div>
              
              <div className="text-center py-8 text-gray-500">
                <UserPlus className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>Search for friends to compare stats and compete!</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SocialHub;
