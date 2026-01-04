import { useState, useEffect } from 'react';
import { useTest } from '../context/TestContext';
import { Question } from './Question';
import { QuestionPalette } from './QuestionPalette';
import { Timer } from './Timer';

export function TestInterface() {
    const {
        subject,
        currentSetIndex,
        setCurrentSetIndex,
        getCurrentQuestions,
        getCurrentSetId,
        currentQuestionIndex,
        setCurrentQuestionIndex,
        calculateCombinedResult,
        testSets,
        getSetProgress,
        getTotalProgress,
        goToNextSet,
        testConfig,
        recordQuestionTime,
        startQuestionTimer
    } = useTest();

    const questions = getCurrentQuestions();
    const currentQuestion = questions[currentQuestionIndex];
    const currentSetId = getCurrentSetId();
    const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
    const totalProgress = getTotalProgress();

    // Start timer when component mounts or question changes
    useEffect(() => {
        startQuestionTimer();
    }, [currentQuestionIndex, currentSetIndex, startQuestionTimer]);

    const handlePrevious = () => {
        recordQuestionTime();
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        } else if (currentSetIndex > 0) {
            setCurrentSetIndex(currentSetIndex - 1);
            const prevSet = testSets[currentSetIndex - 1];
            if (prevSet) {
                setCurrentQuestionIndex(prevSet.questions.length - 1);
            }
        }
    };

    const handleNext = () => {
        recordQuestionTime();
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else if (currentSetIndex < testSets.length - 1) {
            goToNextSet();
        }
    };

    const handleSubmit = () => {
        setShowSubmitConfirm(true);
    };

    const confirmSubmit = () => {
        calculateCombinedResult();
    };

    const isLastQuestion = currentSetIndex === testSets.length - 1 && currentQuestionIndex === questions.length - 1;
    const isFirstQuestion = currentSetIndex === 0 && currentQuestionIndex === 0;

    if (!currentQuestion) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <p className="text-gray-600">No questions available</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">FP</span>
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold text-gray-800">{subject}</h1>
                                    <p className="text-xs text-gray-500">{testSets.length} Sets • {testConfig.questionsPerSet} Q/Set</p>
                                </div>
                            </div>
                        </div>

                        {/* Total Progress */}
                        <div className="hidden md:flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-lg">
                            <span className="text-sm text-gray-500">Progress:</span>
                            <span className="font-bold text-gray-800">{totalProgress.answered}/{totalProgress.total}</span>
                            <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all"
                                    style={{ width: `${totalProgress.total > 0 ? (totalProgress.answered / totalProgress.total) * 100 : 0}%` }}
                                />
                            </div>
                        </div>

                        {/* Timer & Submit */}
                        <div className="flex items-center gap-4">
                            <Timer timePerQuestion={testConfig.timePerQuestion} />
                            <button
                                onClick={handleSubmit}
                                className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-semibold hover:opacity-90 transition-all shadow-lg flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Submit Test
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Set Selector Bar */}
            <div className="bg-white border-b border-gray-100 py-2">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-center gap-2 flex-wrap">
                        {testSets.map((set, index) => {
                            const progress = getSetProgress(index);
                            const isComplete = progress.answered === progress.total && progress.total > 0;
                            const isCurrent = index === currentSetIndex;

                            return (
                                <button
                                    key={set.setId}
                                    onClick={() => {
                                        recordQuestionTime();
                                        setCurrentSetIndex(index);
                                        setCurrentQuestionIndex(0);
                                    }}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${isCurrent
                                            ? 'bg-emerald-500 text-white shadow-lg scale-105'
                                            : isComplete
                                                ? 'bg-green-100 text-green-700 border border-green-300'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        }`}
                                >
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${isCurrent ? 'bg-white/20 text-white' :
                                            isComplete ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                                        }`}>
                                        {isComplete ? '✓' : set.setId}
                                    </div>
                                    <div className="text-left text-sm">
                                        <span className="font-semibold">Set {set.setId}</span>
                                        <span className="ml-2 opacity-75">({progress.answered}/{progress.total})</span>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex gap-6">
                    {/* Question Area */}
                    <div className="flex-1">
                        <Question
                            question={currentQuestion}
                            questionNumber={currentQuestionIndex + 1}
                        />

                        {/* Navigation */}
                        <div className="flex items-center justify-between mt-6">
                            <button
                                onClick={handlePrevious}
                                disabled={isFirstQuestion}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${isFirstQuestion
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-sm'
                                    }`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                </svg>
                                {currentQuestionIndex === 0 && currentSetIndex > 0 ? `← Set ${testSets[currentSetIndex - 1]?.setId}` : 'Previous'}
                            </button>

                            <div className="text-gray-500 text-center">
                                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg font-bold text-sm">Set {currentSetId}</span>
                                <span className="mx-2">•</span>
                                Question <span className="font-semibold text-gray-800">{currentQuestionIndex + 1}</span> of <span className="font-semibold text-gray-800">{questions.length}</span>
                            </div>

                            <button
                                onClick={handleNext}
                                disabled={isLastQuestion}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${isLastQuestion
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : currentQuestionIndex === questions.length - 1
                                            ? 'bg-teal-500 text-white hover:bg-teal-600 shadow-lg'
                                            : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg'
                                    }`}
                            >
                                {currentQuestionIndex === questions.length - 1 && currentSetIndex < testSets.length - 1
                                    ? `Set ${testSets[currentSetIndex + 1]?.setId} →`
                                    : 'Next'}
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>

                        <div className="mt-4 text-center">
                            <p className="text-sm text-gray-400">
                                💡 Time is recorded for each question. Skip and navigate freely.
                            </p>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="w-72 flex-shrink-0">
                        <QuestionPalette />
                    </div>
                </div>
            </div>

            {/* Submit Confirmation Modal */}
            {showSubmitConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">Submit Test?</h3>

                            <div className="bg-gray-50 rounded-xl p-4 mb-4 text-left">
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-600">Answered:</span>
                                    <span className="font-bold text-green-600">{totalProgress.answered}</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-600">Unanswered:</span>
                                    <span className="font-bold text-red-600">{totalProgress.total - totalProgress.answered}</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t">
                                    <span className="text-gray-600">Total:</span>
                                    <span className="font-bold text-gray-800">{totalProgress.total}</span>
                                </div>
                            </div>

                            {totalProgress.answered < totalProgress.total && (
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                                    <p className="text-sm text-amber-700">
                                        ⚠️ You have {totalProgress.total - totalProgress.answered} unanswered questions.
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowSubmitConfirm(false)}
                                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                                >
                                    Continue Test
                                </button>
                                <button
                                    onClick={confirmSubmit}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
                                >
                                    Submit Now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
