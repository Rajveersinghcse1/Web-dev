import { useEffect, useRef, useState } from 'react';
import { useTest } from '../context/TestContext';

interface TimerProps {
    timePerQuestion: number;
}

export function Timer({ timePerQuestion }: TimerProps) {
    const { currentQuestionIndex } = useTest();
    const [timeRemaining, setTimeRemaining] = useState(timePerQuestion);
    const intervalRef = useRef<number | null>(null);

    // Reset timer when question changes
    useEffect(() => {
        setTimeRemaining(timePerQuestion);
    }, [currentQuestionIndex, timePerQuestion]);

    // Countdown logic
    useEffect(() => {
        intervalRef.current = window.setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [currentQuestionIndex]);

    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    const percentage = (timeRemaining / timePerQuestion) * 100;
    const isLow = timeRemaining <= 10;
    const isCritical = timeRemaining <= 5;

    return (
        <div className={`flex items-center gap-3 px-4 py-2 rounded-lg ${isCritical ? 'bg-red-100 animate-pulse' : isLow ? 'bg-orange-100' : 'bg-gray-100'
            }`}>
            <div className="relative w-10 h-10">
                <svg className="w-10 h-10 transform -rotate-90">
                    <circle
                        cx="20"
                        cy="20"
                        r="16"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        className="text-gray-200"
                    />
                    <circle
                        cx="20"
                        cy="20"
                        r="16"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 16}`}
                        strokeDashoffset={`${2 * Math.PI * 16 * (1 - percentage / 100)}`}
                        className={`${isCritical ? 'text-red-500' : isLow ? 'text-orange-500' : 'text-blue-500'} transition-all duration-1000`}
                        strokeLinecap="round"
                    />
                </svg>
                <svg
                    className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 ${isCritical ? 'text-red-500' : isLow ? 'text-orange-500' : 'text-gray-600'
                        }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <div>
                <div className={`text-xl font-mono font-bold ${isCritical ? 'text-red-600' : isLow ? 'text-orange-600' : 'text-gray-800'
                    }`}>
                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                </div>
                <div className="text-xs text-gray-500">Time Left</div>
            </div>
        </div>
    );
}

