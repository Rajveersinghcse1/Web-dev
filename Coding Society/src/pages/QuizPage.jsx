import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
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
  Zap
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
      case 'Beginner': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'Intermediate': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Advanced': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (currentQuiz && !quizCompleted) {
    const question = currentQuiz.questions[currentQuestion];
    
    return (
      <div className="min-h-screen bg-green-50 pt-16">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Quiz Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-6 sm:mb-8">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                {currentQuiz.title}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Question {currentQuestion + 1} of {currentQuiz.questions.length}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
              <div className={`flex items-center justify-center sm:justify-start gap-2 px-3 py-2 rounded-lg text-sm ${timeLeft <= 60 ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'}`}>
                <Clock className="w-4 h-4" />
                {formatTime(timeLeft)}
              </div>
              <Button variant="outline" onClick={resetQuiz} size="sm" className="w-full sm:w-auto">
                Exit Quiz
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Progress</span>
              <span>{Math.round(((currentQuestion + 1) / currentQuiz.questions.length) * 100)}%</span>
            </div>
            <div className="w-full bg-green-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / currentQuiz.questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Question */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-xl">
                {question.question}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {question.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    className={`p-4 text-left rounded-lg border transition-all ${
                      selectedAnswer === index
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        selectedAnswer === index 
                          ? 'border-blue-500 bg-blue-500' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}>
                        {selectedAnswer === index && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        )}
                      </div>
                      <span className="font-medium">
                        {String.fromCharCode(65 + index)}. {option}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0">
            <Button 
              variant="outline" 
              disabled={currentQuestion === 0}
              onClick={() => setCurrentQuestion(currentQuestion - 1)}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Previous
            </Button>
            <Button 
              onClick={handleNextQuestion} 
              disabled={selectedAnswer === null}
              className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto order-1 sm:order-2"
            >
              {currentQuestion === currentQuiz.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (quizCompleted) {
    return (
      <div className="min-h-screen bg-emerald-50 pt-16">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Trophy className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Quiz Completed!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {currentQuiz.title}
            </p>
          </div>

          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className={`text-6xl font-bold mb-4 ${getScoreColor(score)}`}>
                  {score}%
                </div>
                <p className="text-xl text-gray-700 dark:text-gray-300 mb-6">
                  You scored {answers.filter((answer, index) => answer === currentQuiz.questions[index].correct).length} out of {currentQuiz.questions.length} questions correctly
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{currentQuiz.questions.length}</div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Questions</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-xl sm:text-2xl font-bold text-green-600">
                      {answers.filter((answer, index) => answer === currentQuiz.questions[index].correct).length}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Correct Answers</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      {formatTime(currentQuiz.timeLimit - timeLeft)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Time Taken</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                  <Button onClick={resetQuiz} className="w-full sm:w-auto">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Take Another Quiz
                  </Button>
                  <Button variant="outline" onClick={() => {/* TODO: Implement review answers */}} className="w-full sm:w-auto">
                    Review Answers
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-teal-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Coding Quizzes
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Test your knowledge and compete with the community. 
            Take quizzes on various programming topics and track your progress.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Quiz Selection */}
          <div className="xl:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Available Quizzes
              </h2>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="text-xs">All</Button>
                <Button variant="outline" size="sm" className="text-xs">Frontend</Button>
                <Button variant="outline" size="sm">Backend</Button>
                <Button variant="outline" size="sm">AI/ML</Button>
              </div>
            </div>

            <div className="space-y-6">
              {quizzes.map((quiz) => (
                <Card key={quiz.id} className="hover:shadow-lg transition-shadow duration-300">
                  <CardHeader>
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-lg sm:text-xl mb-2">{quiz.title}</CardTitle>
                        <CardDescription className="text-sm sm:text-base mb-3">
                          {quiz.description}
                        </CardDescription>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(quiz.difficulty)}`}>
                            {quiz.difficulty}
                          </span>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {Math.floor(quiz.timeLimit / 60)} min
                          </div>
                          <div className="flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            {quiz.totalQuestions} questions
                          </div>
                          <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded text-xs">
                            {quiz.category}
                          </span>
                        </div>
                      </div>
                      <Button onClick={() => startQuiz(quiz)} className="w-full lg:w-auto lg:ml-4" size="sm">
                        <Play className="w-4 h-4 mr-2" />
                        Start Quiz
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Leaderboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Leaderboard
                </CardTitle>
                <CardDescription>
                  Top performers this month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaderboard.map((user, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
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
                        className="w-8 h-8 rounded-full"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {user.score} points
                        </p>
                      </div>
                      {index < 3 && (
                        <Star className={`w-4 h-4 ${
                          index === 0 ? 'text-yellow-500' :
                          index === 1 ? 'text-gray-400' :
                          'text-orange-400'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Your Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Your Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Quizzes Taken</span>
                    <span className="font-medium">23</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Average Score</span>
                    <span className="font-medium text-green-600">78%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Rank</span>
                    <span className="font-medium">#147</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Streak</span>
                    <span className="font-medium text-orange-600">5 days</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-500" />
                  Quick Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-500">💡</span>
                    <span>Read questions carefully before selecting answers</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-500">⏰</span>
                    <span>Manage your time wisely during timed quizzes</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-500">🎯</span>
                    <span>Review incorrect answers to learn from mistakes</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
