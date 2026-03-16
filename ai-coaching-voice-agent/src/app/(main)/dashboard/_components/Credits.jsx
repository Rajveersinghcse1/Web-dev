"use client";
import React, { useContext } from 'react';
import { UserContext } from '@/app/AuthProvider';
import Image from 'next/image';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Wallet2, User, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

function Credits() {
    const { userData, user, isLoading, error } = useContext(UserContext);

    const CalculateProgress = () => {
        const credits = userData?.credits || 0;
        const maxCredits = userData?.subscriptionId ? 500000 : 5000;
        return Math.min((credits / maxCredits) * 100, 100);
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="text-center py-8">
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Loading profile...</span>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="text-center py-8">
                <div className="flex flex-col items-center gap-3">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                    <p className="text-sm text-red-600">Failed to load profile</p>
                    <Button variant="outline" size="sm" onClick={retry}>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Retry
                    </Button>
                </div>
            </div>
        );
    }

    // No user data
    if (!userData) {
        return (
            <div className="text-center py-8">
                <div className="text-muted-foreground">No profile data available</div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* User Info */}
            <div className="flex gap-4 items-center">
                {user?.image ? (
                    <Image
                        src={user.image}
                        alt="user"
                        width={60}
                        height={60}
                        className="rounded-full"
                    />
                ) : (
                    <div className="w-[60px] h-[60px] rounded-full bg-secondary flex items-center justify-center">
                        <User className="w-8 h-8 text-muted-foreground" />
                    </div>
                )}
                <div>
                    <h2 className="text-lg font-bold">{user?.name || 'User'}</h2>
                    <h2 className="text-gray-500 text-sm">{user?.email || 'No email'}</h2>
                </div>
            </div>

            <hr />

            {/* Token Usage */}
            <div>
                <h2 className="font-bold">Token Usage</h2>
                <h2 className="text-sm text-gray-600">
                    {userData?.credits || 0} / {userData?.subscriptionId ? '500,000' : '5,000'}
                </h2>
                <Progress value={CalculateProgress()} className="my-3" />
            </div>

            {/* Current Plan */}
            <div className="flex justify-between items-center">
                <h2 className="font-bold">Current Plan</h2>
                <span className="p-1 bg-secondary rounded-lg px-2 text-sm">
                    {userData?.subscriptionId ? 'Pro Plan' : 'Free Plan'}
                </span>
            </div>

            <hr />

            {/* Upgrade Section */}
            <div className="p-4 border rounded-2xl space-y-2">
                <div className="flex justify-between">
                    <h2 className="font-bold">Pro Plan</h2>
                    <h2 className="text-sm">500,000 Tokens</h2>
                </div>
                <h2 className="font-bold text-lg">$10/Month</h2>
            </div>

            <Button className="w-full">
                <Wallet2 className="mr-2 h-4 w-4" /> Upgrade $10
            </Button>
        </div>
    );
}

export default Credits;