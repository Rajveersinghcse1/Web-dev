"use client"
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useConvex, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { CoachingOptions } from '@/services/Options';
import Image from 'next/image';
import moment from 'moment';
import Link from 'next/link';
import { BlurFade } from '@/components/ui/blur-fade';
import { Button } from '@/components/ui/button';
import { UserContext } from '@/app/AuthProvider';
import { 
    Clock, 
    BookOpen, 
    ArrowRight, 
    FileText, 
    Trash2, 
    Loader2, 
    RefreshCw,
    AlertCircle,
    ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 10;

function History() {
    const convex = useConvex();
    const { userData } = useContext(UserContext);
    const deleteRoom = useMutation(api.DiscussionRoom.DeleteDiscussionRoom);
    
    const [discussionRoomList, setDiscussionRoomList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);
    const [hasMore, setHasMore] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Fetch discussion rooms
    const fetchDiscussionRooms = useCallback(async (isLoadMore = false) => {
        if (!userData?._id) return;

        if (isLoadMore) {
            setLoadingMore(true);
        } else {
            setLoading(true);
            setError(null);
        }

        try {
            // Use standard query (fallback if paginated not available)
            const result = await convex.query(api.DiscussionRoom.GetAllDiscussionRoom, {
                uid: userData._id
            });
            
            setDiscussionRoomList(result || []);
            setHasMore(false);
        } catch (err) {
            console.error('Error fetching discussion rooms:', err);
            setError('Failed to load sessions. Please try again.');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, [convex, userData?._id]);

    useEffect(() => {
        if (userData?._id) {
            fetchDiscussionRooms();
        }
    }, [userData?._id, fetchDiscussionRooms]);

    // Handle delete
    const handleDelete = async (room, e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (deleteConfirm === room._id) {
            // Second click - confirm delete
            setDeleting(true);
            try {
                await deleteRoom({
                    id: room._id,
                    uid: userData._id
                });
                setDiscussionRoomList(prev => prev.filter(r => r._id !== room._id));
                toast.success('Session deleted');
            } catch (err) {
                console.error('Delete error:', err);
                toast.error(err.message || 'Failed to delete');
            } finally {
                setDeleting(false);
                setDeleteConfirm(null);
            }
        } else {
            // First click - show confirm
            setDeleteConfirm(room._id);
            // Auto-reset after 3 seconds
            setTimeout(() => setDeleteConfirm(null), 3000);
        }
    };

    const GetAbstractImages = (option) => {
        const coachingOption = CoachingOptions.find((item) => item.name === option);
        return coachingOption?.abstract ?? '/Interview.jpg';
    };

    const filteredRooms = discussionRoomList;

    const handleRefresh = () => {
        setDiscussionRoomList([]);
        fetchDiscussionRooms();
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-purple-100 rounded-lg">
                        <BookOpen className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                        <h2 className='font-bold text-xl text-gray-900'>Previous Sessions</h2>
                        <p className="text-sm text-gray-500">
                            {loading ? 'Loading...' : `${filteredRooms.length} sessions`}
                        </p>
                    </div>
                </div>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleRefresh}
                    disabled={loading}
                    className="gap-1"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span className="text-sm text-red-700">{error}</span>
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleRefresh}
                        className="ml-auto text-red-600"
                    >
                        Retry
                    </Button>
                </div>
            )}

            {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-3" />
                    <p className="text-gray-500 text-sm">Loading sessions...</p>
                </div>
            ) : filteredRooms.length === 0 ? (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">No sessions yet</h3>
                    <p className="text-gray-500 text-sm">Start a new session to see your history here</p>
                </div>
            ) : (
                <div className='space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar'>
                    {filteredRooms.map((item, index) => (
                        <BlurFade delay={0.05 + index * 0.02} key={item._id}>
                            <div className='group p-4 bg-gray-50 hover:bg-purple-50 rounded-xl transition-all duration-300 border border-transparent hover:border-purple-200'>
                                <div className='flex justify-between items-center'>
                                    <div className='flex gap-4 items-center flex-1 min-w-0'>
                                        <div className="relative flex-shrink-0">
                                            <Image
                                                src={GetAbstractImages(item.coachingOption)}
                                                alt='abstract'
                                                width={56}
                                                height={56}
                                                className='rounded-xl h-14 w-14 object-cover'
                                            />
                                            {item.summery && (
                                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                                                    <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className='font-semibold text-gray-900 truncate group-hover:text-purple-700 transition-colors'>
                                                {item.topic}
                                            </h3>
                                            <div className="flex items-center gap-3 mt-1 flex-wrap">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                                    {item.coachingOption}
                                                </span>
                                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                                    <Clock className="w-3 h-3" />
                                                    {moment(item._creationTime).fromNow()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => handleDelete(item, e)}
                                            disabled={deleting}
                                            className={`transition-all p-2 ${
                                                deleteConfirm === item._id 
                                                    ? 'bg-red-100 text-red-600 opacity-100' 
                                                    : 'opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 hover:bg-red-50'
                                            }`}
                                        >
                                            {deleting && deleteConfirm === item._id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                            {deleteConfirm === item._id && (
                                                <span className="ml-1 text-xs">Confirm?</span>
                                            )}
                                        </Button>
                                        <Link href={'/view-summery/' + item._id}>
                                            <Button 
                                                variant='outline' 
                                                size="sm"
                                                className='opacity-0 group-hover:opacity-100 transition-opacity bg-white hover:bg-purple-600 hover:text-black border-purple-200 gap-1'
                                            >
                                                View Notes
                                                <ArrowRight className="w-3 h-3" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </BlurFade>
                    ))}
                </div>
            )}
        </div>
    );
}

export default History;



