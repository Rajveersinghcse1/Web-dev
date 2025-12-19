"use client"
import React, { useState, useEffect, useContext } from 'react';
import { useConvex } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { CoachingOptions } from '@/services/Options';
import Image from 'next/image';
import moment from 'moment';
import { Button } from '@/components/ui/button';
import { UserContext } from '@/app/AuthProvider';
import Link from 'next/link';
import { BlurFade } from '@/components/ui/blur-fade';
import { MessageSquare, ArrowRight, Clock, Award, Loader2, CheckCircle2 } from 'lucide-react';

function Feedback() {
    const convex = useConvex();
    const { userData } = useContext(UserContext);
    const [discussionRoomList, setDiscussionRoomList] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userData?._id) {
            GetDiscussionRooms();
        }
    }, [userData]);

    const GetDiscussionRooms = async () => {
        setLoading(true);
        try {
            const result = await convex.query(api.DiscussionRoom.GetAllDiscussionRoom, {
                uid: userData?._id
            });
            setDiscussionRoomList(result || []);
        } catch (error) {
            console.error('Error fetching rooms:', error);
        } finally {
            setLoading(false);
        }
    };

    const GetAbstractImages = (option) => {
        const coachingOption = CoachingOptions.find((item) => item.name === option);
        return coachingOption?.abstract ?? '/Interview.jpg';
    };

    // Filter for interview-type sessions that have summaries
    const filteredRooms = discussionRoomList.filter(item => 
        (item.coachingOption === 'Mock Interview' || 
         item.coachingOption === 'Ques Ans Prep' ||
         item.coachingOption === 'Ques_Ans') &&
        item.summery // Only show items with feedback
    );

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-linear-to-r from-pink-100 to-purple-100 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                    <h2 className='font-bold text-xl text-gray-900'>Interview Feedback</h2>
                    <p className="text-sm text-gray-500">
                        {loading ? 'Loading...' : `${filteredRooms.length} with feedback`}
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
                </div>
            ) : filteredRooms.length === 0 ? (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-linear-to-r from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Award className="w-8 h-8 text-pink-500" />
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">No feedback yet</h3>
                    <p className="text-gray-500 text-sm">Complete a mock interview and generate feedback to see it here</p>
                </div>
            ) : (
                <div className='space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar'>
                    {filteredRooms.map((item, index) => (
                        <BlurFade delay={0.05 + index * 0.03} key={item._id}>
                            <div className='group p-4 bg-linear-to-r from-gray-50 to-pink-50/30 hover:from-purple-50 hover:to-pink-50 rounded-xl transition-all duration-300 border border-transparent hover:border-pink-200'>
                                <div className='flex justify-between items-center'>
                                    <div className='flex gap-4 items-center flex-1 min-w-0'>
                                        <div className="relative shrink-0">
                                            <Image
                                                src={GetAbstractImages(item.coachingOption)}
                                                alt='abstract'
                                                width={56}
                                                height={56}
                                                className='rounded-xl h-14 w-14 object-cover ring-2 ring-white shadow-sm'
                                            />
                                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-linear-to-r from-green-500 to-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                                                <CheckCircle2 className="w-3 h-3 text-black" />
                                            </div>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className='font-semibold text-gray-900 truncate group-hover:text-purple-700 transition-colors'>
                                                {item.topic}
                                            </h3>
                                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-linear-to-r from-pink-100 to-purple-100 text-pink-700">
                                                    {item.coachingOption}
                                                </span>
                                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                                    <Clock className="w-3 h-3" />
                                                    {moment(item._creationTime).fromNow()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <Link href={'/view-summery/' + item._id}>
                                        <Button 
                                            variant='outline' 
                                            size="sm"
                                            className='opacity-0 group-hover:opacity-100 transition-opacity bg-white hover:bg-linear-to-r hover:from-pink-500 hover:to-purple-500 hover:text-black border-pink-200 gap-1'
                                        >
                                            View Feedback
                                            <ArrowRight className="w-3 h-3" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </BlurFade>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Feedback;
