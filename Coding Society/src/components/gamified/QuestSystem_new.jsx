import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useGame } from '../../context/GameContext';
import CodeEditor from '../CodeEditor';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Star, 
  Trophy, 
  Target,
  Book,
  Code,
  Brain,
  Zap,
  Award,
  Timer,
  Users,
  Search,
  Filter,
  ChevronRight,
  Sparkles,
  Flame,
  Lock,
  Clock,
  Gift,
  X,
  Lightbulb,
  ArrowLeft
} from 'lucide-react';

/**
 * Modern Interactive Quest System for Gamified Learning
 * Features:
 * - Beautiful card-based UI with animations
 * - Advanced filtering and search
 * - Progress tracking
 * - Real-time feedback
 * - Responsive design
 */

// Quest Database with comprehensive coding challenges
const QUEST_DATABASE = {
  // Novice Level Quests
  'html_hero': {
    id: 'html_hero',
    title: 'HTML Hero: The Foundation',
    difficulty: 'novice',
    skill: 'frontend',
    xpReward: 150,
    timeEstimate: '15 min',
    category: 'web_basics',
    prerequisites: [],
    story: `Welcome, brave coder! The ancient Web Kingdom needs your help. The HTML Scrolls have been scattered, 
    and only by mastering the sacred tags can you restore order to the digital realm.`,
    description: 'Learn the fundamentals of HTML structure and semantic elements',
    objectives: [
      'Create a proper HTML document structure',
      'Use semantic HTML5 elements',
      'Add proper heading hierarchy',
      'Include meta information'
    ],
    challenge: {
      language: 'html',
      template: `<!DOCTYPE html>
<html lang="en">
<head>
    <!-- Add meta information here -->
</head>
<body>
    <!-- Create a semantic webpage structure -->
</body>
</html>`,
      solution: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HTML Hero Challenge</title>
</head>
<body>
    <header>
        <h1>Welcome to HTML Kingdom</h1>
        <nav>
            <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
            </ul>
        </nav>
    </header>
    <main>
        <section id="home">
            <h2>Home Section</h2>
            <p>This is the main content area.</p>
        </section>
        <section id="about">
            <h2>About Section</h2>
            <p>Learn more about our kingdom.</p>
        </section>
    </main>
    <footer>
        <p>&copy; 2025 HTML Kingdom</p>
    </footer>
</body>
</html>`,
      tests: [
        { description: 'Has proper DOCTYPE', check: (code) => code.includes('<!DOCTYPE html>') },
        { description: 'Includes meta charset', check: (code) => code.includes('meta charset') },
        { description: 'Uses semantic elements', check: (code) => code.includes('<header>') && code.includes('<main>') && code.includes('<footer>') },
        { description: 'Has proper heading hierarchy', check: (code) => code.includes('<h1>') && code.includes('<h2>') }
      ],
      hints: [
        'Start with the DOCTYPE declaration',
        'Use semantic HTML5 elements like header, main, footer',
        'Include proper meta tags in the head section',
        'Structure your headings hierarchically (h1, h2, h3...)'
      ]
    },
    rewards: [
      { type: 'achievement', key: 'html_master' },
      { type: 'avatar', item: 'web_warrior_helmet' }
    ],
    nextQuests: ['css_crusader', 'js_journey']
  },

  'css_crusader': {
    id: 'css_crusader',
    title: 'CSS Crusader: Styling Saga',
    difficulty: 'novice',
    skill: 'frontend',
    xpReward: 200,
    timeEstimate: '20 min',
    category: 'web_basics',
    prerequisites: ['html_hero'],
    story: `The Web Kingdom looks dull and lifeless! As the CSS Crusader, you must bring color, 
    style, and beauty to the realm using the ancient art of styling.`,
    description: 'Master CSS fundamentals including selectors, properties, and layouts',
    objectives: [
      'Style elements with CSS',
      'Use flexbox for layouts',
      'Apply colors and typography',
      'Create responsive designs'
    ],
    challenge: {
      language: 'css',
      template: `/* Style the card component */
.card {
  /* Add your styles here */
}

.card-header {
  /* Style the header */
}

.card-content {
  /* Style the content */
}`,
      solution: `/* Style the card component */
.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 20px;
  max-width: 400px;
  margin: 20px auto;
}

.card-header {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 16px;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 12px;
}

.card-content {
  color: #666;
  line-height: 1.6;
  font-size: 16px;
}`,
      tests: [
        { description: 'Card has background color', check: (code) => code.includes('background') },
        { description: 'Uses border-radius', check: (code) => code.includes('border-radius') },
        { description: 'Has box-shadow', check: (code) => code.includes('box-shadow') },
        { description: 'Styles header differently', check: (code) => code.includes('.card-header') }
      ],
      hints: [
        'Use border-radius for rounded corners',
        'box-shadow creates depth',
        'Use flexbox for alignment',
        'Choose readable colors and fonts'
      ]
    },
    rewards: [
      { type: 'achievement', key: 'style_master' },
      { type: 'avatar', item: 'designer_cape' }
    ],
    nextQuests: ['js_journey', 'responsive_realm']
  },

  'js_journey': {
    id: 'js_journey',
    title: 'JavaScript Journey: Logic Quest',
    difficulty: 'apprentice',
    skill: 'frontend',
    xpReward: 250,
    timeEstimate: '30 min',
    category: 'programming_basics',
    prerequisites: ['html_hero'],
    story: `The Kingdom needs intelligence! Learn JavaScript to bring your websites to life with 
    interactive features and dynamic behavior.`,
    description: 'Master JavaScript fundamentals: variables, functions, and DOM manipulation',
    objectives: [
      'Declare and use variables',
      'Create functions',
      'Manipulate the DOM',
      'Handle events'
    ],
    challenge: {
      language: 'javascript',
      template: `// Create a function to calculate factorial
function factorial(n) {
  // Your code here
}

// Create a function to check if a number is prime
function isPrime(num) {
  // Your code here
}

// Test your functions
console.log(factorial(5)); // Should output 120
console.log(isPrime(17)); // Should output true`,
      solution: `// Create a function to calculate factorial
function factorial(n) {
  if (n === 0 || n === 1) return 1;
  return n * factorial(n - 1);
}

// Create a function to check if a number is prime
function isPrime(num) {
  if (num <= 1) return false;
  if (num <= 3) return true;
  if (num % 2 === 0 || num % 3 === 0) return false;
  
  for (let i = 5; i * i <= num; i += 6) {
    if (num % i === 0 || num % (i + 2) === 0) return false;
  }
  return true;
}

// Test your functions
console.log(factorial(5)); // Should output 120
console.log(isPrime(17)); // Should output true`,
      tests: [
        { description: 'Factorial function exists', check: (code) => code.includes('function factorial') },
        { description: 'isPrime function exists', check: (code) => code.includes('function isPrime') },
        { description: 'Handles base cases', check: (code) => code.includes('if') },
        { description: 'Uses recursion or loops', check: (code) => code.includes('return') }
      ],
      hints: [
        'Factorial: multiply all numbers from 1 to n',
        'Use recursion for elegant factorial',
        'Prime: check divisibility up to square root',
        'Handle edge cases like 0, 1, 2'
      ]
    },
    rewards: [
      { type: 'achievement', key: 'logic_master' },
      { type: 'avatar', item: 'code_wizard_staff' }
    ],
    nextQuests: ['react_realm', 'algorithm_arena']
  }
};

const QuestSystem = () => {
  const { gameState, completeQuest, awardXP, showNotification } = useGame();
  
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [userCode, setUserCode] = useState('');
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentHint, setCurrentHint] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedSkill, setSelectedSkill] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Initialize code when quest is selected
  useEffect(() => {
    if (selectedQuest) {
      setUserCode(selectedQuest.challenge.template);
      setTestResults([]);
      setCurrentHint(0);
    }
  }, [selectedQuest]);

  // Categorize quests
  const activeQuests = Object.values(QUEST_DATABASE).filter(quest => 
    gameState.activeQuests?.includes(quest.id)
  );

  const availableQuests = Object.values(QUEST_DATABASE).filter(quest => {
    const isCompleted = gameState.completedQuests?.includes(quest.id);
    const isActive = gameState.activeQuests?.includes(quest.id);
    const prerequisitesMet = quest.prerequisites.every(prereq => 
      gameState.completedQuests?.includes(prereq)
    );
    
    return !isCompleted && !isActive && prerequisitesMet;
  });

  const completedQuests = Object.values(QUEST_DATABASE).filter(quest =>
    gameState.completedQuests?.includes(quest.id)
  );

  const lockedQuests = Object.values(QUEST_DATABASE).filter(quest => {
    const isCompleted = gameState.completedQuests?.includes(quest.id);
    const isActive = gameState.activeQuests?.includes(quest.id);
    const prerequisitesMet = quest.prerequisites.every(prereq => 
      gameState.completedQuests?.includes(prereq)
    );
    
    return !isCompleted && !isActive && !prerequisitesMet;
  });

  // Filter quests
  const filterQuests = (quests) => {
    return quests.filter(quest => {
      const matchesSearch = quest.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          quest.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDifficulty = selectedDifficulty === 'all' || quest.difficulty === selectedDifficulty;
      const matchesSkill = selectedSkill === 'all' || quest.skill === selectedSkill;
      
      return matchesSearch && matchesDifficulty && matchesSkill;
    });
  };

  const handleStartQuest = (quest) => {
    setSelectedQuest(quest);
    showNotification({
      type: 'info',
      title: 'Quest Started!',
      message: quest.title,
      icon: '🎯'
    });
  };

  const runTests = () => {
    if (!selectedQuest) return;
    
    setIsRunning(true);
    
    const { tests } = selectedQuest.challenge;
    const results = tests.map(test => ({
      ...test,
      passed: test.check(userCode),
      points: test.check(userCode) ? 10 : 0
    }));
    
    setTestResults(results);
    
    const passedTests = results.filter(r => r.passed).length;
    const totalTests = results.length;
    const score = (passedTests / totalTests) * 100;
    
    if (score === 100) {
      completeQuest(selectedQuest.id);
      showNotification({
        type: 'success',
        title: 'Quest Completed! 🎉',
        message: `${selectedQuest.title} - Perfect Score!`,
        xp: selectedQuest.xpReward
      });
      setTimeout(() => setSelectedQuest(null), 2000);
    } else if (score >= 70) {
      const partialXP = Math.floor(selectedQuest.xpReward * (score / 100));
      awardXP(partialXP, selectedQuest.skill, `Partial Quest: ${selectedQuest.title}`);
      showNotification({
        type: 'info',
        title: 'Good Progress!',
        message: `${score}% complete - Keep going!`,
        xp: partialXP
      });
    }
    
    setIsRunning(false);
  };

  const showHint = () => {
    if (!selectedQuest || currentHint >= selectedQuest.challenge.hints.length) return;
    
    showNotification({
      type: 'info',
      title: 'Hint',
      message: selectedQuest.challenge.hints[currentHint],
      icon: '💡'
    });
    
    setCurrentHint(currentHint + 1);
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      'novice': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      'apprentice': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      'expert': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      'master': 'bg-orange-500/10 text-orange-600 border-orange-500/20',
      'legendary': 'bg-red-500/10 text-red-600 border-red-500/20'
    };
    return colors[difficulty] || 'bg-gray-500/10 text-gray-600 border-gray-500/20';
  };

  const getDifficultyIcon = (difficulty) => {
    const icons = {
      'novice': <Sparkles className="w-4 h-4" />,
      'apprentice': <Star className="w-4 h-4" />,
      'expert': <Flame className="w-4 h-4" />,
      'master': <Trophy className="w-4 h-4" />,
      'legendary': <Crown className="w-4 h-4" />
    };
    return icons[difficulty] || <Star className="w-4 h-4" />;
  };

  const getSkillIcon = (skill) => {
    const icons = {
      'frontend': <Code className="w-4 h-4" />,
      'backend': <Brain className="w-4 h-4" />,
      'algorithms': <Target className="w-4 h-4" />,
      'ai': <Zap className="w-4 h-4" />,
      'mobile': <Users className="w-4 h-4" />
    };
    return icons[skill] || <Book className="w-4 h-4" />;
  };

  // Quest Detail View
  if (selectedQuest) {
    return (
      <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setSelectedQuest(null)}
            className="mb-4 hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Quests
          </Button>
          
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-xl border ${getDifficultyColor(selectedQuest.difficulty)}`}>
                  {getDifficultyIcon(selectedQuest.difficulty)}
                </div>
                <h1 className="text-3xl font-bold text-gray-900">{selectedQuest.title}</h1>
              </div>
              <p className="text-gray-600 text-lg">{selectedQuest.description}</p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className={`px-4 py-2 rounded-xl border font-medium ${getDifficultyColor(selectedQuest.difficulty)}`}>
                {selectedQuest.difficulty.toUpperCase()}
              </div>
              <div className="flex items-center gap-2 bg-yellow-50 text-yellow-700 px-4 py-2 rounded-xl border border-yellow-200">
                <Star className="w-5 h-5 fill-yellow-500" />
                <span className="font-bold">{selectedQuest.xpReward} XP</span>
              </div>
            </div>
          </div>
        </div>

        {/* Story Section */}
        <Card className="mb-6 border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900">
              <Book className="w-5 h-5" />
              Quest Story
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 italic leading-relaxed">{selectedQuest.story}</p>
          </CardContent>
        </Card>

        {/* Objectives and Info */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Objectives
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {selectedQuest.objectives.map((obj, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{obj}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600" />
                Quest Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Clock className="w-5 h-5 text-gray-600" />
                <div>
                  <div className="text-xs text-gray-500">Estimated Time</div>
                  <div className="font-semibold text-gray-900">{selectedQuest.timeEstimate}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                {getSkillIcon(selectedQuest.skill)}
                <div>
                  <div className="text-xs text-gray-500">Skill Category</div>
                  <div className="font-semibold text-gray-900 capitalize">{selectedQuest.skill}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Gift className="w-5 h-5 text-purple-600" />
                <div>
                  <div className="text-xs text-gray-500">Rewards</div>
                  <div className="font-semibold text-gray-900">{selectedQuest.rewards?.length || 0} Items</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Code Challenge */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Editor */}
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Code Editor
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    onClick={showHint}
                    disabled={currentHint >= selectedQuest.challenge.hints.length}
                    size="sm"
                    variant="outline"
                    className="border-yellow-200 hover:bg-yellow-50"
                  >
                    <Lightbulb className="w-4 h-4 mr-1 text-yellow-600" />
                    Hint ({currentHint}/{selectedQuest.challenge.hints.length})
                  </Button>
                  <Button
                    onClick={runTests}
                    disabled={isRunning}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Run Tests
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CodeEditor
                value={userCode}
                onChange={setUserCode}
                language={selectedQuest.challenge.language}
                height="500px"
              />
            </CardContent>
          </Card>

          {/* Test Results */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Test Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              {testResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Play className="w-10 h-10 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Test?</h3>
                  <p className="text-gray-600 mb-4">Run your code to see test results</p>
                  <Button onClick={runTests} className="bg-green-600 hover:bg-green-700">
                    <Play className="w-4 h-4 mr-2" />
                    Run Tests
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {testResults.map((result, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        result.passed
                          ? 'bg-green-50 border-green-200'
                          : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {result.passed ? (
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <div className={`font-semibold ${result.passed ? 'text-green-900' : 'text-red-900'}`}>
                            {result.description}
                          </div>
                          <div className="text-xs mt-1 text-gray-600">
                            {result.passed ? 'Test passed ✓' : 'Test failed ✗'}
                          </div>
                        </div>
                        <div className={`font-bold ${result.passed ? 'text-green-600' : 'text-red-600'}`}>
                          {result.points}/10
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Summary */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg border-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900">Overall Score</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {Math.round((testResults.filter(r => r.passed).length / testResults.length) * 100)}%
                      </span>
                    </div>
                    <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all duration-500"
                        style={{
                          width: `${(testResults.filter(r => r.passed).length / testResults.length) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Quest List View
  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quest Board</h1>
          <p className="text-gray-600">Embark on coding adventures and level up your skills</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search quests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none w-64 transition-all"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="border-2"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card className="border-2 animate-in slide-in-from-top-2 duration-300">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty</label>
                <div className="flex flex-wrap gap-2">
                  {['all', 'novice', 'apprentice', 'expert', 'master', 'legendary'].map(diff => (
                    <button
                      key={diff}
                      onClick={() => setSelectedDifficulty(diff)}
                      className={`px-4 py-2 rounded-lg border-2 font-medium transition-all capitalize ${
                        selectedDifficulty === diff
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Skill</label>
                <div className="flex flex-wrap gap-2">
                  {['all', 'frontend', 'backend', 'algorithms', 'ai', 'mobile'].map(skill => (
                    <button
                      key={skill}
                      onClick={() => setSelectedSkill(skill)}
                      className={`px-4 py-2 rounded-lg border-2 font-medium transition-all capitalize ${
                        selectedSkill === skill
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{activeQuests.length}</div>
                <div className="text-sm text-gray-600">Active</div>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{availableQuests.length}</div>
                <div className="text-sm text-gray-600">Available</div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Star className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{completedQuests.length}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-slate-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{lockedQuests.length}</div>
                <div className="text-sm text-gray-600">Locked</div>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                <Lock className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Quests */}
      {filterQuests(activeQuests).length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Active Quests</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-yellow-200 to-transparent"></div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filterQuests(activeQuests).map((quest) => (
              <Card
                key={quest.id}
                className="group cursor-pointer border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                onClick={() => setSelectedQuest(quest)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className={`p-2 rounded-lg border ${getDifficultyColor(quest.difficulty)}`}>
                      {getDifficultyIcon(quest.difficulty)}
                    </div>
                    <div className="flex items-center gap-1 text-yellow-600 bg-yellow-100 px-2 py-1 rounded-lg">
                      <Star className="w-3 h-3 fill-yellow-500" />
                      <span className="text-sm font-bold">{quest.xpReward}</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                    {quest.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">{quest.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm mb-3">
                    <div className="flex items-center gap-2 text-gray-600">
                      {getSkillIcon(quest.skill)}
                      <span className="capitalize">{quest.skill}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{quest.timeEstimate}</span>
                    </div>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 group-hover:shadow-lg transition-all">
                    Continue Quest
                    <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Available Quests */}
      {filterQuests(availableQuests).length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Available Quests</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-blue-200 to-transparent"></div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filterQuests(availableQuests).map((quest) => (
              <Card
                key={quest.id}
                className="group cursor-pointer border-2 hover:border-blue-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                onClick={() => handleStartQuest(quest)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className={`p-2 rounded-lg border ${getDifficultyColor(quest.difficulty)}`}>
                      {getDifficultyIcon(quest.difficulty)}
                    </div>
                    <div className="flex items-center gap-1 text-yellow-600">
                      <Star className="w-3 h-3" />
                      <span className="text-sm font-bold">{quest.xpReward}</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                    {quest.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">{quest.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm mb-3">
                    <div className="flex items-center gap-2 text-gray-600">
                      {getSkillIcon(quest.skill)}
                      <span className="capitalize">{quest.skill}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{quest.timeEstimate}</span>
                    </div>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 group-hover:shadow-lg transition-all">
                    Start Quest
                    <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Completed Quests */}
      {filterQuests(completedQuests).length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Completed Quests</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-green-200 to-transparent"></div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filterQuests(completedQuests).map((quest) => (
              <Card key={quest.id} className="border-2 border-green-200 bg-green-50/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="text-xs text-green-600 font-medium">Completed</div>
                  </div>
                  <CardTitle className="text-sm text-gray-900">{quest.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Star className="w-3 h-3 text-yellow-500" />
                    <span>{quest.xpReward} XP earned</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Locked Quests */}
      {filterQuests(lockedQuests).length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Locked Quests</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent"></div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filterQuests(lockedQuests).map((quest) => (
              <Card key={quest.id} className="opacity-60 border-2 border-gray-200 bg-gray-50">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="p-2 rounded-lg border border-gray-300 bg-gray-100">
                      <Lock className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className={`px-2 py-1 rounded-lg text-xs border ${getDifficultyColor(quest.difficulty)}`}>
                      {quest.difficulty}
                    </div>
                  </div>
                  <CardTitle className="text-lg text-gray-700">{quest.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{quest.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-gray-600 mb-2">
                    Complete these quests first:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {quest.prerequisites.map(prereq => (
                      <span key={prereq} className="px-2 py-1 bg-gray-200 rounded text-xs text-gray-700">
                        {QUEST_DATABASE[prereq]?.title || prereq}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {filterQuests([...activeQuests, ...availableQuests, ...completedQuests, ...lockedQuests]).length === 0 && (
        <div className="text-center py-20">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No quests found</h3>
          <p className="text-gray-600 mb-6">Try adjusting your filters or search query</p>
          <Button onClick={() => { setSearchQuery(''); setSelectedDifficulty('all'); setSelectedSkill('all'); }}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default QuestSystem;
