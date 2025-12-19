"use client";
import React from 'react';
import Credits from './Credits';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

function ProfileDialog({ children }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl">Your Profile</DialogTitle>
                </DialogHeader>
                <div className="mt-2">
                    <Credits />
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default ProfileDialog;
