"use client";
import React from 'react';
import { UserButton } from '@stackframe/stack';
import { Brain, Home, ChevronRight, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function AppHeader() {
    const pathname = usePathname();
    const isDashboard = pathname === '/dashboard';
    const isCommunity = pathname === '/community';
    const isDiscussion = pathname.includes('/discussion-room');
    const isSummary = pathname.includes('/view-summery');

    return (
        <div className='fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-all duration-300'>
            <div className='max-w-7xl mx-auto px-6 py-3 flex justify-between items-center'>
                <div className="flex items-center gap-4">
                    <Link href="/dashboard" className='flex items-center gap-2 group'>
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg group-hover:scale-105 transition-transform">
                            <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <span className="text-xl font-bold bg-linear-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent hidden md:block">
                            Brane Storm
                        </span>
                    </Link>

                    {/* Breadcrumbs */}
                    {!isDashboard && (
                        <div className="hidden md:flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 border-l border-gray-200 dark:border-gray-700 pl-4 ml-2">
                            <Link href="/dashboard" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors flex items-center gap-1">
                                <Home className="w-3 h-3" />
                                Dashboard
                            </Link>
                            {(isDiscussion || isSummary || isCommunity) && (
                                <>
                                    <ChevronRight className="w-3 h-3" />
                                    <span className="font-medium text-gray-900 dark:text-black">
                                        {isDiscussion ? 'Live Session' : isSummary ? 'Session Summary' : 'Community'}
                                    </span>
                                </>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    <Link 
                        href="/community" 
                        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                            isCommunity 
                                ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' 
                                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                        }`}
                    >
                        <Users className="w-4 h-4" />
                        <span className="hidden sm:inline font-medium">Community</span>
                    </Link>
                    <UserButton />
                </div>
            </div>
        </div>
    );
}

export default AppHeader;
