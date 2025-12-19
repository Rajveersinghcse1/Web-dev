import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { 
  Clock, 
  Trophy, 
  Star, 
  CheckCircle, 
  XCircle, 
  Play,
  RotateCcw,
  Users,
  Target,
  Zap,
  Award,
  BarChart2,
  Flame,
  ChevronRight,
  Timer
} from 'lucide-react';

const QuizPage = () => {
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const quizzes = [
    {
      id: 1,
      title: 'JavaScript Fundamentals',
      description: 'Test your knowledge of basic JavaScript concepts',
      difficulty: 'Beginner',
      timeLimit: 300, // 5 minutes
      totalQuestions: 10,
      category: 'Frontend',
      questions: [
        {
          question: 'What is the correct way to declare a variable in JavaScript?',
          options: ['var myVar = 5;', 'variable myVar = 5;', 'v myVar = 5;', 'declare myVar = 5;'],
          correct: 0
        },
        {
          question: 'Which method is used to add an element to the end of an array?',
          options: ['append()', 'push()', 'add()', 'insert()'],
          correct: 1
        },
        {
          question: 'What does "=== " operator do in JavaScript?',
          options: ['Assignment', 'Equality with type coercion', 'Strict equality', 'Not equal'],
          correct: 2
        },
        {
          question: 'How do you create a function in JavaScript?',
          options: ['function myFunction() {}', 'create myFunction() {}', 'def myFunction() {}', 'func myFunction() {}'],
          correct: 0
        },
        {
          question: 'What is the output of: console.log(typeof null)?',
          options: ['null', 'undefined', 'object', 'boolean'],
          correct: 2
        }
      ]
    },
    {
      id: 2,
      title: 'React Components',
      description: 'Test your understanding of React components and JSX',
      difficulty: 'Intermediate',
      timeLimit: 450, // 7.5 minutes
      totalQuestions: 8,
      category: 'Frontend',
      questions: [
        {
          question: 'What is JSX?',
          options: ['A JavaScript library', 'A syntax extension for JavaScript', 'A CSS framework', 'A database'],
          correct: 1
        },
        {
          question: 'How do you pass data to a child component in React?',
          options: ['state', 'props', 'context', 'refs'],
          correct: 1
        },
        {
          question: 'Which hook is used for managing state in functional components?',
          options: ['useEffect', 'useState', 'useContext', 'useReducer'],
          correct: 1
        }
      ]
    },
    {
      id: 3,
      title: 'Python Basics',
      description: 'Fundamental concepts of Python programming',
      difficulty: 'Beginner',
      timeLimit: 360, // 6 minutes
      totalQuestions: 12,
      category: 'Backend',
      questions: [
        {
          question: 'How do you create a list in Python?',
          options: ['list = []', 'list = {}', 'list = ()', 'list = <>'],
          correct: 0
        },
        {
          question: 'What is the correct way to import a module in Python?',
          options: ['include module', 'import module', 'require module', 'using module'],
          correct: 1
        }
      ]
    }
  ];

  const leaderboard = [
    { name: 'Alice Johnson', score: 2450, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice' },
    { name: 'Bob Smith', score: 2380, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob' },
    { name: 'Carol Davis', score: 2290, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carol' },
    { name: 'David Wilson', score: 2180, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david' },
    { name: 'Emma Brown', score: 2050, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma' }
  ];

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      handleQuizComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const startQuiz = (quiz) => {
    setCurrentQuiz(quiz);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setTimeLeft(quiz.timeLimit);
    setQuizCompleted(false);
    setScore(0);
    setIsActive(true);
  };

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);
    
    if (currentQuestion < currentQuiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      handleQuizComplete(newAnswers);
    }
  };

  const handleQuizComplete = (finalAnswers = answers) => {
    setIsActive(false);
    setQuizCompleted(true);
    
    // Calculate score
    let correctCount = 0;
    finalAnswers.forEach((answer, index) => {
      if (answer === currentQuiz.questions[index].correct) {
        correctCount++;
      }
    });
    
    const finalScore = Math.round((correctCount / currentQuiz.questions.length) * 100);
    setScore(finalScore);
  };

  const resetQuiz = () => {
    setCurrentQuiz(null);
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setQuizCompleted(false);
    setIsActive(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Intermediate': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'Advanced': return 'text-rose-700 bg-rose-50 border-rose-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-rose-600';
  };

  if (currentQuiz && !quizCompleted) {
    const question = currentQuiz.questions[currentQuestion];
    
    return (
      <div className="min-h-screen bg-slate-50 pt-24 pb-12 font-sans">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Quiz Header */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-blue-900/5 p-8 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {currentQuiz.title}
                </h1>
                <p className="text-gray-500 font-medium">
                  Question {currentQuestion + 1} of {currentQuiz.questions.length}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <div className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border ${timeLeft <= 60 ? 'bg-rose-50 text-rose-600 border-rose-100 animate-pulse' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                  <Timer className="w-4 h-4" />
                  {formatTime(timeLeft)}
                </div>
                <Button variant="outline" onClick={resetQuiz} size="sm" className="rounded-xl border-gray-200 hover:bg-gray-50 text-gray-600">
                  Exit Quiz
                </Button>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-2">
              <div className="flex justify-between text-sm font-medium text-gray-500 mb-2">
                <span>Progress</span>
                <span>{Math.round(((currentQuestion + 1) / currentQuiz.questions.length) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${((currentQuestion + 1) / currentQuiz.questions.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-blue-900/5 overflow-hidden mb-8">
            <div className="p-8 border-b border-gray-100 bg-gray-50/30">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-relaxed">
                {question.question}
              </h2>
            </div>
            <div className="p-8">
              <div className="grid gap-4">
                {question.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`group relative p-5 text-left rounded-2xl border-2 transition-all duration-200 ${
                      selectedAnswer === index
                        ? 'border-blue-500 bg-blue-50/50 shadow-md shadow-blue-100'
                        : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        selectedAnswer === index 
                          ? 'border-blue-500 bg-blue-500 text-white' 
                          : 'border-gray-300 text-gray-400 group-hover:border-blue-400 group-hover:text-blue-400'
                      }`}>
                        {selectedAnswer === index ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <span className="text-sm font-bold">{String.fromCharCode(65 + index)}</span>
                        )}
                      </div>
                      <span className={`font-medium text-lg ${selectedAnswer === index ? 'text-blue-900' : 'text-gray-700'}`}>
                        {option}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <Button 
              variant="ghost" 
              disabled={currentQuestion === 0}
              onClick={() => setCurrentQuestion(currentQuestion - 1)}
              className="rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            >
              Previous Question
            </Button>
            <Button 
              onClick={handleNextQuestion} 
              disabled={selectedAnswer === null}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-8 py-6 text-lg font-medium shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {currentQuestion === currentQuiz.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (quizCompleted) {
    return (
      <div className="min-h-screen bg-slate-50 pt-24 pb-12 font-sans">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-blue-900/5 overflow-hidden">
            <div className="bg-gradient-to-b from-blue-50 to-white p-12 text-center border-b border-gray-100">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl flex items-center justify-center shadow-lg shadow-orange-500/20 rotate-3">
                <Trophy className="w-12 h-12 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Quiz Completed!
              </h1>
              <p className="text-gray-500 text-lg">
                {currentQuiz.title}
              </p>
            </div>

            <div className="p-8 sm:p-12">
              <div className="text-center mb-12">
                <div className={`text-7xl font-extrabold mb-4 tracking-tight ${getScoreColor(score)}`}>
                  {score}%
                </div>
                <p className="text-xl text-gray-600">
                  You scored <strong className="text-gray-900">{answers.filter((answer, index) => answer === currentQuiz.questions[index].correct).length}</strong> out of <strong className="text-gray-900">{currentQuiz.questions.length}</strong> questions correctly
                </p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-1">{currentQuiz.questions.length}</div>
                  <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Questions</div>
                </div>
                <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
                  <div className="text-3xl font-bold text-emerald-600 mb-1">
                    {answers.filter((answer, index) => answer === currentQuiz.questions[index].correct).length}
                  </div>
                  <div className="text-sm font-medium text-emerald-600/70 uppercase tracking-wide">Correct</div>
                </div>
                <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {formatTime(currentQuiz.timeLimit - timeLeft)}
                  </div>
                  <div className="text-sm font-medium text-blue-600/70 uppercase tracking-wide">Time Taken</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button onClick={resetQuiz} className="bg-gray-900 text-white hover:bg-gray-800 rounded-xl px-8 py-6 text-base font-medium shadow-lg shadow-gray-900/20">
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Take Another Quiz
                </Button>
                <Button variant="outline" className="rounded-xl border-gray-200 hover:bg-gray-50 text-gray-700 px-8 py-6 text-base font-medium">
                  Review Answers
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] bg-blue-100/50 blur-[100px] rounded-full pointer-events-none"></div>
          <h1 className="relative text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
            Coding <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">Quizzes</span>
          </h1>
          <p className="relative text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Test your knowledge and compete with the community. 
            Take quizzes on various programming topics and track your progress.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Quiz Selection */}
          <div className="xl:col-span-2 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Target className="w-6 h-6 text-blue-600" />
                Available Quizzes
              </h2>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" className="rounded-lg bg-gray-900 text-white hover:bg-gray-800">All</Button>
                <Button variant="ghost" size="sm" className="rounded-lg text-gray-600 hover:bg-gray-100">Frontend</Button>
                <Button variant="ghost" size="sm" className="rounded-lg text-gray-600 hover:bg-gray-100">Backend</Button>
                <Button variant="ghost" size="sm" className="rounded-lg text-gray-600 hover:bg-gray-100">AI/ML</Button>
              </div>
            </div>

            <div className="grid gap-6">
              {quizzes.map((quiz) => (
                <div key={quiz.id} className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 overflow-hidden">
                  <div className="p-8">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {quiz.title}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getDifficultyColor(quiz.difficulty)}`}>
                            {quiz.difficulty}
                          </span>
                        </div>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                          {quiz.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 font-medium">
                          <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                            <Clock className="w-4 h-4 text-gray-400" />
                            {Math.floor(quiz.timeLimit / 60)} min
                          </div>
                          <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                            <Target className="w-4 h-4 text-gray-400" />
                            {quiz.totalQuestions} questions
                          </div>
                          <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold border border-blue-100 uppercase tracking-wide">
                            {quiz.category}
                          </span>
                        </div>
                      </div>
                      <Button 
                        onClick={() => startQuiz(quiz)} 
                        className="w-full lg:w-auto bg-gray-900 text-white hover:bg-blue-600 rounded-xl px-6 py-6 shadow-lg shadow-gray-900/10 transition-all duration-300 group-hover:scale-105"
                      >
                        <Play className="w-5 h-5 mr-2" />
                        Start Quiz
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Leaderboard */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Leaderboard</h3>
                  <p className="text-sm text-gray-500">Top performers this month</p>
                </div>
              </div>
              <div className="space-y-4">
                {leaderboard.map((user, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 transition-colors">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-700' :
                      index === 1 ? 'bg-gray-100 text-gray-700' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-50 text-gray-600'
                    }`}>
                      {index + 1}
                    </div>
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate">
                        {user.name}
                      </p>
                      <p className="text-xs font-medium text-gray-500">
                        {user.score} points
                      </p>
                    </div>
                    {index < 3 && (
                      <Star className={`w-5 h-5 ${
                        index === 0 ? 'text-yellow-400 fill-yellow-400' :
                        index === 1 ? 'text-gray-300 fill-gray-300' :
                        'text-orange-300 fill-orange-300'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
              <Button variant="ghost" className="w-full mt-4 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl">
                View Full Leaderboard
              </Button>
            </div>

            {/* Your Stats */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl shadow-xl shadow-slate-900/20 p-6 text-white">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <BarChart2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Your Stats</h3>
                  <p className="text-sm text-slate-400">Keep up the good work!</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10">
                  <span className="text-slate-300 text-sm">Quizzes Taken</span>
                  <span className="font-bold text-white">23</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10">
                  <span className="text-slate-300 text-sm">Average Score</span>
                  <span className="font-bold text-emerald-400">78%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10">
                  <span className="text-slate-300 text-sm">Global Rank</span>
                  <span className="font-bold text-white">#147</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10">
                  <span className="text-slate-300 text-sm">Current Streak</span>
                  <div className="flex items-center gap-1.5 text-orange-400 font-bold">
                    <Flame className="w-4 h-4 fill-orange-400" />
                    5 days
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-blue-50 rounded-3xl border border-blue-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-bold text-blue-900">Quick Tips</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-blue-100 shadow-sm">
                  <span className="text-lg">💡</span>
                  <span className="text-sm text-blue-800 font-medium">Read questions carefully before selecting answers</span>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-blue-100 shadow-sm">
                  <span className="text-lg">⏰</span>
                  <span className="text-sm text-blue-800 font-medium">Manage your time wisely during timed quizzes</span>
                </div>
                <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-blue-100 shadow-sm">
                  <span className="text-lg">🎯</span>
                  <span className="text-sm text-blue-800 font-medium">Review incorrect answers to learn from mistakes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
