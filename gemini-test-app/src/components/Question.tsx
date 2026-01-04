import type { Question as QuestionType } from '../types';
import { useTest } from '../context/TestContext';

interface QuestionProps {
    question: QuestionType;
    questionNumber: number;
}

export function Question({ question, questionNumber }: QuestionProps) {
    const { allSetAnswers, getCurrentSetId, setAnswer, toggleMarkForReview } = useTest();

    const currentSetId = getCurrentSetId();
    const currentSetAnswers = allSetAnswers[currentSetId] || [];
    const currentAnswer = currentSetAnswers.find(a => a.questionId === question.id);

    const handleMCQSelect = (option: string) => {
        setAnswer(question.id, option);
    };

    const handleFillChange = (value: string) => {
        setAnswer(question.id, value);
    };

    const isMarkedForReview = currentAnswer?.isMarkedForReview || false;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {/* Question Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50 rounded-t-xl">
                <div className="flex items-center gap-3">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-lg font-semibold text-sm">
                        Q.{questionNumber}
                    </span>
                    <span className={`px-3 py-1 rounded-lg text-sm font-medium ${question.type === 'mcq'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-green-100 text-green-700'
                        }`}>
                        {question.type === 'mcq' ? 'Multiple Choice' : 'Fill in the Blank'}
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500">
                        <span className="font-semibold text-green-600">+{question.marks}</span> / <span className="text-red-500">-1</span>
                    </span>
                    <button
                        onClick={() => toggleMarkForReview(question.id)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isMarkedForReview
                            ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                            : 'bg-gray-100 text-gray-600 hover:bg-yellow-50'
                            }`}
                    >
                        <svg className="w-4 h-4" fill={isMarkedForReview ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                        {isMarkedForReview ? 'Marked' : 'Mark for Review'}
                    </button>
                </div>
            </div>

            {/* Question Content */}
            <div className="p-6">
                <p className="text-lg text-gray-800 leading-relaxed mb-6">{question.question}</p>

                {question.type === 'mcq' && question.options && (
                    <div className="space-y-3">
                        {question.options.map((option, index) => {
                            const optionLetter = String.fromCharCode(65 + index);
                            const isSelected = currentAnswer?.answer === optionLetter;

                            return (
                                <button
                                    key={index}
                                    onClick={() => handleMCQSelect(optionLetter)}
                                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${isSelected
                                        ? 'border-blue-500 bg-blue-50 shadow-md'
                                        : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50/50'
                                        }`}
                                >
                                    <span className={`w-10 h-10 flex items-center justify-center rounded-full font-semibold text-lg ${isSelected
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {optionLetter}
                                    </span>
                                    <span className={`flex-1 text-base ${isSelected ? 'text-blue-900 font-medium' : 'text-gray-700'}`}>
                                        {option}
                                    </span>
                                    {isSelected && (
                                        <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}

                {question.type === 'fill' && (
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                            Your Answer:
                        </label>
                        <input
                            type="text"
                            value={currentAnswer?.answer || ''}
                            onChange={(e) => handleFillChange(e.target.value)}
                            placeholder="Type your answer here..."
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors text-lg"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
