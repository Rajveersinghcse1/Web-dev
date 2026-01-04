import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Editor } from '@monaco-editor/react';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, 
  Play, 
  CheckCircle, 
  XCircle, 
  Star, 
  Trophy, 
  Target,
  Clock,
  Lightbulb,
  BookOpen,
  Code,
  Award,
  Zap,
  Flame,
  Sparkles,
  MessageSquare,
  TrendingUp
} from 'lucide-react';

/**
 * Modern Quest Detail Page
 * Story-driven coding challenge with narrative elements
 */

const QuestDetailPage = () => {
  const { questId } = useParams();
  const navigate = useNavigate();
  
  const [quest, setQuest] = useState(null);
  const [userCode, setUserCode] = useState('');
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetchQuestDetails();
  }, [questId]);

  const fetchQuestDetails = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/v1/quests/${questId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setQuest(data.data);
        setUserCode(data.data.challenge?.starterCode || '');
      }
    } catch (error) {
      console.error('Failed to fetch quest:', error);
    }
  };

  const runTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    try {
      const response = await fetch(`http://localhost:5000/api/v1/quests/${questId}/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ code: userCode })
      });

      if (response.ok) {
        const data = await response.json();
        setTestResults(data.data.testResults);
      }
    } catch (error) {
      console.error('Failed to run tests:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const submitQuest = async () => {
    setIsRunning(true);

    try {
      const response = await fetch(`http://localhost:5000/api/v1/quests/${questId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ code: userCode })
      });

      if (response.ok) {
        const data = await response.json();
        setTestResults(data.data.testResults);
        
        if (data.data.allPassed) {
          setShowSuccess(true);
          triggerConfetti();
        }
      }
    } catch (error) {
      console.error('Failed to submit quest:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const triggerConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min, max) => Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);
  };

  const showHint = () => {
    if (hintsUsed < quest?.challenge?.hints?.length) {
      setHintsUsed(hintsUsed + 1);
    }
  };

  if (!quest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: 'bg-green-500',
      intermediate: 'bg-yellow-500',
      advanced: 'bg-orange-500',
      expert: 'bg-red-500'
    };
    return colors[difficulty] || colors.beginner;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="max-w-md w-full border-4 border-green-500 shadow-2xl animate-in zoom-in">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Quest Complete!</h2>
              <p className="text-gray-600 mb-6">You've successfully completed the quest and earned rewards!</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-yellow-50 rounded-xl border-2 border-yellow-200">
                  <Star className="w-6 h-6 text-yellow-500 mx-auto mb-2 fill-yellow-500" />
                  <div className="font-bold text-xl text-yellow-700">+{quest.rewards?.xp || 0}</div>
                  <div className="text-xs text-gray-600">XP Earned</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
                  <Award className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                  <div className="font-bold text-xl text-purple-700">{quest.rewards?.items?.length || 0}</div>
                  <div className="text-xs text-gray-600">Items Unlocked</div>
                </div>
              </div>

              <Button 
                onClick={() => setShowSuccess(false)}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                Continue
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/quests')}
            className="text-white hover:bg-white/20 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Quests
          </Button>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-2 h-8 rounded-full ${getDifficultyColor(quest.difficulty)}`}></div>
                <h1 className="text-3xl font-bold">{quest.title}</h1>
              </div>
              <p className="text-blue-100 text-lg mb-4">{quest.description}</p>
              
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-lg">
                  <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                  <span className="font-semibold">{quest.rewards?.xp || 0} XP</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-lg">
                  <Clock className="w-4 h-4" />
                  <span>{quest.estimatedTime || '30m'}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-2 rounded-lg">
                  <TrendingUp className="w-4 h-4" />
                  <span>{quest.completionRate || 0}% Success Rate</span>
                </div>
                <div className="px-3 py-2 bg-white/20 backdrop-blur-sm rounded-lg font-mono text-sm">
                  {quest.programmingLanguage}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Panel - Quest Details */}
          <div className="space-y-6">
            {/* Story Card */}
            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-900">
                  <BookOpen className="w-5 h-5" />
                  Quest Story
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 italic leading-relaxed">{quest.story}</p>
              </CardContent>
            </Card>

            {/* Tabs for Description, Objectives, Hints */}
            <Card className="border-2">
              <CardHeader className="pb-3">
                <div className="flex gap-2">
                  <Button
                    variant={activeTab === 'description' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTab('description')}
                    className={activeTab === 'description' ? 'bg-blue-600' : ''}
                  >
                    <Target className="w-4 h-4 mr-1" />
                    Objectives
                  </Button>
                  <Button
                    variant={activeTab === 'hints' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTab('hints')}
                    className={activeTab === 'hints' ? 'bg-amber-500' : ''}
                  >
                    <Lightbulb className="w-4 h-4 mr-1" />
                    Hints ({hintsUsed}/{quest.challenge?.hints?.length || 0})
                  </Button>
                  <Button
                    variant={activeTab === 'examples' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTab('examples')}
                    className={activeTab === 'examples' ? 'bg-green-600' : ''}
                  >
                    <Code className="w-4 h-4 mr-1" />
                    Examples
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {activeTab === 'description' && (
                  <div className="space-y-3">
                    {quest.objectives?.map((obj, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{obj}</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'hints' && (
                  <div className="space-y-4">
                    {quest.challenge?.hints?.slice(0, hintsUsed).map((hint, idx) => (
                      <div key={idx} className="p-4 bg-amber-50 border-2 border-amber-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb className="w-4 h-4 text-amber-600" />
                          <span className="font-semibold text-amber-900">Hint {idx + 1}</span>
                        </div>
                        <p className="text-gray-700">{hint}</p>
                      </div>
                    ))}
                    
                    {hintsUsed < (quest.challenge?.hints?.length || 0) && (
                      <Button 
                        onClick={showHint}
                        className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600"
                      >
                        <Lightbulb className="w-4 h-4 mr-2" />
                        Show Next Hint
                      </Button>
                    )}
                    
                    {hintsUsed === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Lightbulb className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Click the button above to reveal hints if you need help</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'examples' && (
                  <div className="space-y-4">
                    {quest.challenge?.examples?.map((example, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 border-2 border-slate-200 rounded-lg">
                        <div className="font-semibold text-gray-900 mb-2">Example {idx + 1}</div>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-600">Input:</span>
                            <code className="block mt-1 p-2 bg-white border border-gray-200 rounded font-mono text-xs">
                              {example.input}
                            </code>
                          </div>
                          <div>
                            <span className="text-gray-600">Output:</span>
                            <code className="block mt-1 p-2 bg-white border border-gray-200 rounded font-mono text-xs">
                              {example.output}
                            </code>
                          </div>
                          {example.explanation && (
                            <div>
                              <span className="text-gray-600">Explanation:</span>
                              <p className="mt-1 text-gray-700">{example.explanation}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Test Results */}
            {testResults.length > 0 && (
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-blue-600" />
                    Test Results
                    <span className={`ml-auto px-3 py-1 rounded-lg text-sm font-semibold ${
                      testResults.every(r => r.passed) 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {testResults.filter(r => r.passed).length} / {testResults.length} Passed
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {testResults.map((result, idx) => (
                      <div
                        key={idx}
                        className={`p-4 border-2 rounded-lg ${
                          result.passed 
                            ? 'bg-green-50 border-green-300' 
                            : 'bg-red-50 border-red-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {result.passed ? (
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">Test {idx + 1}</div>
                            {result.error && (
                              <div className="text-sm text-red-700 mt-1 font-mono">{result.error}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Panel - Code Editor */}
          <div className="space-y-6">
            <Card className="border-2">
              <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5 text-blue-600" />
                    Code Editor
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      onClick={runTests}
                      disabled={isRunning}
                      size="sm"
                      className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                    >
                      {isRunning ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-1.5"></div>
                          Running...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-1.5" />
                          Run Tests
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={submitQuest}
                      disabled={isRunning}
                      size="sm"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Trophy className="w-4 h-4 mr-1.5" />
                      Submit
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Editor
                  height="600px"
                  language={quest.programmingLanguage?.toLowerCase() || 'javascript'}
                  value={userCode}
                  onChange={setUserCode}
                  theme="vs-dark"
                  options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    roundedSelection: false,
                    scrollBeyondLastLine: false,
                    automaticLayout: true
                  }}
                />
              </CardContent>
            </Card>

            {/* Rewards Preview */}
            <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-900">
                  <Trophy className="w-5 h-5" />
                  Quest Rewards
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg border-2 border-yellow-300">
                    <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2 fill-yellow-500" />
                    <div className="text-2xl font-bold text-yellow-700">{quest.rewards?.xp || 0}</div>
                    <div className="text-xs text-gray-600">Experience Points</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border-2 border-purple-300">
                    <Sparkles className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-700">{quest.rewards?.items?.length || 0}</div>
                    <div className="text-xs text-gray-600">Items to Unlock</div>
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

export default QuestDetailPage;
