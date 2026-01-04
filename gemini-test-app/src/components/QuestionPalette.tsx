import { useTest } from '../context/TestContext';

export function QuestionPalette() {
    const { getCurrentQuestions, currentQuestionIndex, setCurrentQuestionIndex, getQuestionStatus, getCurrentSetId } = useTest();
    const questions = getCurrentQuestions();
    const currentSetId = getCurrentSetId();

    const statusColors = {
        'not-visited': 'bg-gray-200 text-gray-600',
        'not-answered': 'bg-red-100 text-red-700 border-red-300',
        'answered': 'bg-green-100 text-green-700 border-green-300',
        'marked-for-review': 'bg-yellow-100 text-yellow-700 border-yellow-300',
    };

    const statusLabels = {
        'not-visited': { label: 'Not Visited', color: 'bg-gray-200' },
        'not-answered': { label: 'Not Answered', color: 'bg-red-100 border border-red-300' },
        'answered': { label: 'Answered', color: 'bg-green-100 border border-green-300' },
        'marked-for-review': { label: 'Marked', color: 'bg-yellow-100 border border-yellow-300' },
    };

    const getCounts = () => {
        let notVisited = 0, notAnswered = 0, answered = 0, marked = 0;
        questions.forEach(q => {
            const status = getQuestionStatus(q.id);
            if (status === 'not-visited') notVisited++;
            else if (status === 'not-answered') notAnswered++;
            else if (status === 'answered') answered++;
            else if (status === 'marked-for-review') marked++;
        });
        return { notVisited, notAnswered, answered, marked };
    };

    const counts = getCounts();

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Set {currentSetId}</h3>
                <span className="text-sm text-gray-500">{questions.length} Questions</span>
            </div>

            {/* Question Grid */}
            <div className="grid grid-cols-5 gap-2 mb-6">
                {questions.map((question, index) => {
                    const status = getQuestionStatus(question.id);
                    const isCurrent = index === currentQuestionIndex;

                    return (
                        <button
                            key={question.id}
                            onClick={() => setCurrentQuestionIndex(index)}
                            className={`w-10 h-10 rounded-lg font-semibold text-sm border-2 transition-all ${statusColors[status]} ${isCurrent ? 'ring-2 ring-blue-500 ring-offset-2 scale-110' : 'hover:scale-105'
                                }`}
                        >
                            {index + 1}
                        </button>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="space-y-2 pt-4 border-t border-gray-100">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Legend</div>
                <div className="grid grid-cols-2 gap-2">
                    {Object.entries(statusLabels).map(([key, { label, color }]) => (
                        <div key={key} className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded ${color}`}></div>
                            <span className="text-xs text-gray-600">{label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Stats */}
            <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Answered:</span>
                        <span className="font-semibold text-green-600">{counts.answered}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Skipped:</span>
                        <span className="font-semibold text-red-600">{counts.notAnswered}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Remaining:</span>
                        <span className="font-semibold text-gray-600">{counts.notVisited}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Marked:</span>
                        <span className="font-semibold text-yellow-600">{counts.marked}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
