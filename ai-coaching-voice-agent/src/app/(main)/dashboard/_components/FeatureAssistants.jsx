"use client";
import React from 'react';
import { BlurFade } from '@/components/ui/blur-fade';
import { CoachingOptions } from '@/services/Options';
import UserInputDialog from './UserInputDialog';
import Image from 'next/image';

function FeatureAssistants() {
    return (
        <div>
            {/* Feature Cards */}
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6'>
                {CoachingOptions.map((option, index) => (
                    <BlurFade key={option.name} delay={0.1 + index * 0.05} inView>
                        <UserInputDialog coachingOption={option}>
                            <div className='group p-6 bg-white rounded-2xl border border-gray-100 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-100/50 transition-all duration-300 cursor-pointer hover:-translate-y-1'>
                                <div className='flex flex-col items-center text-center'>
                                    <div className="relative mb-4">
                                        <div className="absolute inset-0 bg-linear-to-r from-purple-400 to-pink-400 rounded-full blur-lg opacity-0 group-hover:opacity-30 transition-opacity"></div>
                                        <Image 
                                            src={option.icon} 
                                            alt={option.name}
                                            width={80}
                                            height={80}
                                            className='relative h-16 w-16 object-cover rounded-full group-hover:scale-110 transition-transform duration-300'
                                        />
                                    </div>
                                    <h3 className='font-semibold text-gray-900 group-hover:text-purple-700 transition-colors'>
                                        {option.name}
                                    </h3>
                                </div>
                            </div>
                        </UserInputDialog>
                    </BlurFade>
                ))}
            </div>
        </div>
    );
}

export default FeatureAssistants;
