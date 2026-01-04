import { useEffect, useState } from 'react';
import { useTest } from '../context/TestContext';

export function Loading() {
    const { testConfig, testSets } = useTest();
    const [currentStep, setCurrentStep] = useState(0);
    const [dots, setDots] = useState('');

    useEffect(() => {
        const dotInterval = setInterval(() => {
            setDots(prev => prev.length >= 3 ? '' : prev + '.');
        }, 500);

        const stepInterval = setInterval(() => {
            setCurrentStep(prev => prev < testConfig.numSets - 1 ? prev + 1 : prev);
        }, 6000);

        return () => {
            clearInterval(dotInterval);
            clearInterval(stepInterval);
        };
    }, [testConfig.numSets]);

    const steps = Array.from({ length: testConfig.numSets }, (_, i) => ({
        label: `Generating Set ${String.fromCharCode(65 + i)}`,
        done: currentStep > i || testSets.length > i,
    }));

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 w-full max-w-md text-center">
                {/* Logo */}
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-200">
                    <span className="text-white font-bold text-2xl">FP</span>
                </div>

                {/* Spinner */}
                <div className="relative w-20 h-20 mx-auto mb-6">
                    <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-t-emerald-500 border-r-teal-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                </div>

                <h2 className="text-xl font-bold text-gray-800 mb-2">Generating Questions{dots}</h2>
                <p className="text-gray-500 mb-6">
                    Creating {testConfig.numSets * testConfig.questionsPerSet} unique questions
                </p>

                {/* Progress steps */}
                <div className="space-y-3 text-left mb-6">
                    {steps.map((step, index) => (
                        <div key={index} className="flex items-center gap-3">
                            {step.done ? (
                                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            ) : index === currentStep ? (
                                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center animate-pulse">
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                </div>
                            ) : (
                                <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                            )}
                            <span className={`text-sm ${step.done ? 'text-emerald-600' :
                                    index === currentStep ? 'text-gray-700 font-medium' :
                                        'text-gray-400'
                                }`}>
                                {step.label} ({testConfig.questionsPerSet} questions)
                            </span>
                        </div>
                    ))}
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-sm text-amber-700">
                        ⏳ This may take 30-60 seconds. Please don't refresh!
                    </p>
                </div>
            </div>
        </div>
    );
}
