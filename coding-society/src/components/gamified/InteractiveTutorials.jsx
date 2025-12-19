import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useGame } from '../../context/GameContext';
import CodeEditor from '../CodeEditor';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Check, 
  X, 
  Lightbulb, 
  BookOpen, 
  Target, 
  ArrowRight,
  ArrowLeft,
  Eye,
  Code,
  Brain,
  Zap,
  Star,
  Trophy,
  Clock,
  Users,
  ChevronDown,
  ChevronUp,
  Volume2,
  VolumeX,
  Settings,
  RotateCcw,
  FastForward
} from 'lucide-react';

/**
 * Interactive Tutorial System
 * Features:
 * - Step-by-step guided learning paths
 * - Real-time code execution and feedback
 * - Interactive coding examples with explanations
 * - Adaptive difficulty based on user progress
 * - Voice narration and visual highlights
 * - Progress tracking and checkpoint system
 * - Multiple learning styles (visual, kinesthetic, auditory)
 * - Branching paths based on user choices
 */

// Tutorial Database
const TUTORIAL_PATHS = {
  html_fundamentals: {
    id: 'html_fundamentals',
    title: 'HTML Fundamentals',
    description: 'Master the building blocks of the web',
    difficulty: 'beginner',
    estimatedTime: '30 minutes',
    icon: <Code className="w-6 h-6" />,
    prerequisites: [],
    skills: ['frontend'],
    steps: [
      {
        id: 'intro',
        title: 'Welcome to HTML',
        type: 'explanation',
        content: `HTML (HyperText Markup Language) is the standard markup language for creating web pages. 
        Think of it as the skeleton of a webpage - it provides the structure and content.`,
        highlights: [],
        tips: [
          'HTML uses tags to define elements',
          'Tags are enclosed in angle brackets < >',
          'Most tags come in pairs: opening and closing'
        ]
      },
      {
        id: 'basic_structure',
        title: 'Basic HTML Structure',
        type: 'interactive',
        explanation: `Every HTML document starts with a basic structure. Let's build one together!`,
        template: `<!-- This is where you'll write your HTML -->
<!-- Try typing the basic HTML structure -->`,
        solution: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My First Page</title>
</head>
<body>
    <h1>Hello, World!</h1>
    <p>This is my first HTML page!</p>
</body>
</html>`,
        instructions: [
          'Start with <!DOCTYPE html> to declare the document type',
          'Add the <html> tag with lang="en" attribute',
          'Create a <head> section with meta tags and title',
          'Add a <body> section with an h1 heading and paragraph'
        ],
        validation: (code) => {
          const checks = [
            { test: code.includes('<!DOCTYPE html>'), message: 'Add DOCTYPE declaration' },
            { test: code.includes('<html'), message: 'Add opening <html> tag' },
            { test: code.includes('<head>'), message: 'Add <head> section' },
            { test: code.includes('<body>'), message: 'Add <body> section' },
            { test: code.includes('<h1>'), message: 'Add an h1 heading' }
          ];
          return checks;
        }
      },
      {
        id: 'headings',
        title: 'HTML Headings',
        type: 'interactive',
        explanation: `HTML provides 6 levels of headings, from h1 (most important) to h6 (least important). 
        Let's create a heading hierarchy!`,
        template: `<!DOCTYPE html>
<html>
<head>
    <title>Headings Example</title>
</head>
<body>
    <!-- Create a heading hierarchy here -->
    <!-- h1: Main Title -->
    <!-- h2: Section Title -->
    <!-- h3: Subsection Title -->
    
</body>
</html>`,
        solution: `<!DOCTYPE html>
<html>
<head>
    <title>Headings Example</title>
</head>
<body>
    <h1>Main Title</h1>
    <h2>Section Title</h2>
    <h3>Subsection Title</h3>
    <h4>Sub-subsection Title</h4>
    <h5>Minor Heading</h5>
    <h6>Smallest Heading</h6>
</body>
</html>`,
        instructions: [
          'Add an h1 tag with "Main Title"',
          'Add an h2 tag with "Section Title"',
          'Add an h3 tag with "Subsection Title"',
          'Try adding h4, h5, and h6 headings too!'
        ],
        validation: (code) => [
          { test: code.includes('<h1>'), message: 'Add an h1 heading' },
          { test: code.includes('<h2>'), message: 'Add an h2 heading' },
          { test: code.includes('<h3>'), message: 'Add an h3 heading' }
        ]
      },
      {
        id: 'paragraphs_links',
        title: 'Paragraphs and Links',
        type: 'interactive',
        explanation: `Paragraphs (<p>) contain text content, and links (<a>) connect pages together. 
        The web is all about connections!`,
        template: `<!DOCTYPE html>
<html>
<head>
    <title>Paragraphs and Links</title>
</head>
<body>
    <h1>My Web Page</h1>
    <!-- Add a paragraph about yourself -->
    
    <!-- Add a link to your favorite website -->
    
</body>
</html>`,
        solution: `<!DOCTYPE html>
<html>
<head>
    <title>Paragraphs and Links</title>
</head>
<body>
    <h1>My Web Page</h1>
    <p>Welcome to my website! I'm learning HTML and it's amazing how you can create 
    web pages with just text and tags.</p>
    
    <p>Here are some useful links:</p>
    <a href="https://developer.mozilla.org">MDN Web Docs</a>
    <a href="https://www.w3schools.com">W3Schools</a>
</body>
</html>`,
        instructions: [
          'Add a paragraph describing yourself or your website',
          'Create a link using <a href="URL">Link Text</a>',
          'Try adding multiple links to different websites'
        ],
        validation: (code) => [
          { test: code.includes('<p>'), message: 'Add a paragraph' },
          { test: code.includes('<a href='), message: 'Add a link with href attribute' }
        ]
      }
    ]
  },

  javascript_basics: {
    id: 'javascript_basics',
    title: 'JavaScript Basics',
    description: 'Learn programming fundamentals with JavaScript',
    difficulty: 'beginner',
    estimatedTime: '45 minutes',
    icon: <Zap className="w-6 h-6" />,
    prerequisites: ['html_fundamentals'],
    skills: ['frontend', 'programming'],
    steps: [
      {
        id: 'variables',
        title: 'Variables and Data Types',
        type: 'interactive',
        explanation: `Variables are containers that store data. JavaScript has several data types: 
        strings (text), numbers, booleans (true/false), and more.`,
        template: `// Let's create some variables!
// Create a variable for your name (string)

// Create a variable for your age (number)

// Create a variable for whether you like coding (boolean)

// Log them to the console
console.log("My name is:", );
console.log("My age is:", );
console.log("I like coding:", );`,
        solution: `// Let's create some variables!
let myName = "Alex";
let myAge = 25;
let likeCoding = true;

// Log them to the console
console.log("My name is:", myName);
console.log("My age is:", myAge);
console.log("I like coding:", likeCoding);`,
        instructions: [
          'Declare a variable "myName" with your name as a string',
          'Declare a variable "myAge" with a number',
          'Declare a variable "likeCoding" with true or false',
          'Use console.log to display each variable'
        ],
        validation: (code) => [
          { test: code.includes('let') || code.includes('var') || code.includes('const'), message: 'Declare variables using let, var, or const' },
          { test: code.includes('console.log'), message: 'Use console.log to display variables' },
          { test: code.includes('"') || code.includes("'"), message: 'Use quotes for string values' }
        ]
      },
      {
        id: 'functions',
        title: 'Functions',
        type: 'interactive',
        explanation: `Functions are reusable blocks of code that perform specific tasks. 
        They help organize your code and avoid repetition.`,
        template: `// Create a function that greets someone
function greet(name) {
    // Return a greeting message
}

// Create a function that adds two numbers
function add(a, b) {
    // Return the sum of a and b
}

// Test your functions
console.log(greet("World"));
console.log(add(5, 3));`,
        solution: `// Create a function that greets someone
function greet(name) {
    return "Hello, " + name + "!";
}

// Create a function that adds two numbers
function add(a, b) {
    return a + b;
}

// Test your functions
console.log(greet("World"));
console.log(add(5, 3));`,
        instructions: [
          'Complete the greet function to return a greeting message',
          'Complete the add function to return the sum of two numbers',
          'Use the return keyword to send values back',
          'Test your functions with console.log'
        ],
        validation: (code) => [
          { test: code.includes('return'), message: 'Use return to send values back from functions' },
          { test: code.includes('function greet'), message: 'Create the greet function' },
          { test: code.includes('function add'), message: 'Create the add function' }
        ]
      }
    ]
  },

  react_components: {
    id: 'react_components',
    title: 'React Components',
    description: 'Build your first React components',
    difficulty: 'intermediate',
    estimatedTime: '60 minutes',
    icon: <Brain className="w-6 h-6" />,
    prerequisites: ['javascript_basics'],
    skills: ['frontend', 'react'],
    steps: [
      {
        id: 'first_component',
        title: 'Your First Component',
        type: 'interactive',
        explanation: `React components are like custom HTML elements. They're the building blocks 
        of React applications. Let's create your first component!`,
        template: `import React from 'react';

// Create a Welcome component
function Welcome() {
    return (
        // Add JSX here
    );
}

// Create an App component that uses Welcome
function App() {
    return (
        <div>
            {/* Use your Welcome component here */}
        </div>
    );
}

export default App;`,
        solution: `import React from 'react';

// Create a Welcome component
function Welcome() {
    return (
        <div>
            <h1>Welcome to React!</h1>
            <p>This is my first component.</p>
        </div>
    );
}

// Create an App component that uses Welcome
function App() {
    return (
        <div>
            <Welcome />
        </div>
    );
}

export default App;`,
        instructions: [
          'Make the Welcome component return JSX with an h1 and p tag',
          'Use the Welcome component inside the App component',
          'Remember: component names must start with a capital letter',
          'JSX must be wrapped in a single parent element'
        ],
        validation: (code) => [
          { test: code.includes('return'), message: 'Components must return JSX' },
          { test: code.includes('<Welcome'), message: 'Use the Welcome component in App' },
          { test: code.includes('<h1>'), message: 'Add an h1 heading to the Welcome component' }
        ]
      }
    ]
  }
};

const InteractiveTutorials = () => {
  const { gameState, awardXP, completeQuest, showNotification } = useGame();
  const [selectedTutorial, setSelectedTutorial] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [userCode, setUserCode] = useState('');
  const [stepComplete, setStepComplete] = useState(false);
  const [validationResults, setValidationResults] = useState([]);
  const [showHints, setShowHints] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  // Auto-advance timer
  const autoAdvanceTimer = useRef(null);

  // Start tutorial
  const startTutorial = (tutorialId) => {
    const tutorial = TUTORIAL_PATHS[tutorialId];
    setSelectedTutorial(tutorial);
    setCurrentStep(0);
    setUserCode(tutorial.steps[0].template || '');
    setStepComplete(false);
    setValidationResults([]);
    setShowSolution(false);
  };

  // Validate current step
  const validateStep = () => {
    if (!selectedTutorial || !selectedTutorial.steps[currentStep].validation) {
      setStepComplete(true);
      return;
    }

    const step = selectedTutorial.steps[currentStep];
    const results = step.validation(userCode);
    setValidationResults(results);
    
    const allPassed = results.every(r => r.test);
    setStepComplete(allPassed);
    
    if (allPassed) {
      showNotification({
        type: 'success',
        title: 'Step Completed! ✅',
        message: `Great job on "${step.title}"!`,
        xp: 25
      });
      awardXP(25, 'learning', `Tutorial Step: ${step.title}`);
    }
  };

  // Navigate steps
  const nextStep = () => {
    if (!selectedTutorial) return;
    
    if (currentStep < selectedTutorial.steps.length - 1) {
      const nextStepIndex = currentStep + 1;
      setCurrentStep(nextStepIndex);
      setUserCode(selectedTutorial.steps[nextStepIndex].template || '');
      setStepComplete(false);
      setValidationResults([]);
      setShowSolution(false);
    } else {
      // Tutorial completed
      completeTutorial();
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      const prevStepIndex = currentStep - 1;
      setCurrentStep(prevStepIndex);
      setUserCode(selectedTutorial.steps[prevStepIndex].template || '');
      setStepComplete(false);
      setValidationResults([]);
      setShowSolution(false);
    }
  };

  // Complete tutorial
  const completeTutorial = () => {
    if (!selectedTutorial) return;
    
    const xpReward = selectedTutorial.steps.length * 50;
    awardXP(xpReward, 'learning', `Tutorial: ${selectedTutorial.title}`);
    
    showNotification({
      type: 'success',
      title: 'Tutorial Completed! 🎉',
      message: `You've mastered ${selectedTutorial.title}!`,
      xp: xpReward
    });

    // Mark tutorial as completed (in real app, save to backend)
    setTimeout(() => {
      setSelectedTutorial(null);
      setCurrentStep(0);
    }, 2000);
  };

  // Auto-advance functionality
  useEffect(() => {
    if (autoPlay && stepComplete) {
      const delay = (3000 / playbackSpeed);
      autoAdvanceTimer.current = setTimeout(() => {
        nextStep();
      }, delay);
    }
    
    return () => {
      if (autoAdvanceTimer.current) {
        clearTimeout(autoAdvanceTimer.current);
      }
    };
  }, [autoPlay, stepComplete, playbackSpeed]);

  // Voice narration (mock)
  const speakText = (text) => {
    if (voiceEnabled && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = playbackSpeed;
      speechSynthesis.speak(utterance);
    }
  };

  // Reset step
  const resetStep = () => {
    if (selectedTutorial && selectedTutorial.steps[currentStep]) {
      setUserCode(selectedTutorial.steps[currentStep].template || '');
      setStepComplete(false);
      setValidationResults([]);
      setShowSolution(false);
    }
  };

  // Show solution
  const toggleSolution = () => {
    if (!showSolution && selectedTutorial.steps[currentStep].solution) {
      setUserCode(selectedTutorial.steps[currentStep].solution);
      setShowSolution(true);
      validateStep();
    } else {
      resetStep();
    }
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: 'text-green-600 bg-green-100',
      intermediate: 'text-blue-600 bg-blue-100',
      advanced: 'text-purple-600 bg-purple-100',
      expert: 'text-red-600 bg-red-100'
    };
    return colors[difficulty] || 'text-gray-600 bg-gray-100';
  };

  // Check if tutorial is unlocked
  const isTutorialUnlocked = (tutorial) => {
    if (!tutorial.prerequisites.length) return true;
    
    const completedTutorials = gameState.completedTutorials || [];
    return tutorial.prerequisites.every(prereq => 
      completedTutorials.includes(prereq)
    );
  };

  // Render tutorial selection
  if (!selectedTutorial) {
    return (
      <div className="interactive-tutorials max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">📚 Interactive Tutorials</h1>
          <p className="text-gray-600">Learn by doing with step-by-step guided tutorials</p>
        </div>

        {/* Tutorial Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.values(TUTORIAL_PATHS).map((tutorial) => {
            const isUnlocked = isTutorialUnlocked(tutorial);
            const isCompleted = (gameState.completedTutorials || []).includes(tutorial.id);
            
            return (
              <Card
                key={tutorial.id}
                className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                  !isUnlocked ? 'opacity-60 grayscale' : ''
                } ${isCompleted ? 'ring-2 ring-green-400' : ''}`}
                onClick={() => isUnlocked && startTutorial(tutorial.id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {tutorial.icon}
                      <div>
                        <CardTitle className="text-lg">{tutorial.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(tutorial.difficulty)}`}>
                            {tutorial.difficulty}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {tutorial.estimatedTime}
                          </span>
                        </div>
                      </div>
                    </div>
                    {isCompleted && (
                      <Check className="w-6 h-6 text-green-600" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">{tutorial.description}</p>
                  
                  {/* Prerequisites */}
                  {tutorial.prerequisites.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Prerequisites:</h4>
                      <div className="flex flex-wrap gap-1">
                        {tutorial.prerequisites.map(prereq => (
                          <span key={prereq} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {TUTORIAL_PATHS[prereq]?.title || prereq}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Skills */}
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Skills:</h4>
                    <div className="flex flex-wrap gap-1">
                      {tutorial.skills.map(skill => (
                        <span key={skill} className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {tutorial.steps.length} steps
                    </span>
                    <Button
                      size="sm"
                      disabled={!isUnlocked}
                      onClick={(e) => {
                        e.stopPropagation();
                        startTutorial(tutorial.id);
                      }}
                    >
                      {isCompleted ? 'Review' : 'Start'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  // Render active tutorial
  const currentStepData = selectedTutorial.steps[currentStep];
  const progress = ((currentStep + 1) / selectedTutorial.steps.length) * 100;

  return (
    <div className="tutorial-interface max-w-7xl mx-auto p-6">
      {/* Tutorial Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setSelectedTutorial(null)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tutorials
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{selectedTutorial.title}</h1>
              <p className="text-gray-600">Step {currentStep + 1} of {selectedTutorial.steps.length}: {currentStepData.title}</p>
            </div>
          </div>
          
          {/* Tutorial Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoPlay(!autoPlay)}
              title="Auto-advance"
            >
              {autoPlay ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setVoiceEnabled(!voiceEnabled)}
              title="Voice narration"
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
            <select
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
              className="px-2 py-1 border rounded text-sm"
              title="Playback speed"
            >
              <option value={0.5}>0.5x</option>
              <option value={1}>1x</option>
              <option value={1.5}>1.5x</option>
              <option value={2}>2x</option>
            </select>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Panel - Instructions */}
        <div className="space-y-4">
          {/* Step Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                {currentStepData.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">{currentStepData.explanation}</p>
              
              {/* Instructions */}
              {currentStepData.instructions && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Instructions:</h4>
                  <ol className="list-decimal list-inside space-y-1">
                    {currentStepData.instructions.map((instruction, index) => (
                      <li key={index} className="text-sm text-gray-600">{instruction}</li>
                    ))}
                  </ol>
                </div>
              )}
              
              {/* Tips */}
              {currentStepData.tips && (
                <div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowHints(!showHints)}
                    className="mb-2"
                  >
                    <Lightbulb className="w-4 h-4 mr-2" />
                    {showHints ? 'Hide' : 'Show'} Tips
                    {showHints ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
                  </Button>
                  {showHints && (
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <ul className="space-y-1">
                        {currentStepData.tips.map((tip, index) => (
                          <li key={index} className="text-sm text-yellow-800 flex items-start gap-2">
                            <Lightbulb className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Validation Results */}
          {validationResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Step Validation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {validationResults.map((result, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-2 p-2 rounded ${
                        result.test ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                      }`}
                    >
                      {result.test ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <X className="w-4 h-4 text-red-600" />
                      )}
                      <span className="text-sm">{result.message}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={previousStep}
              disabled={currentStep === 0}
            >
              <SkipBack className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={resetStep}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              {currentStepData.solution && (
                <Button
                  variant="outline"
                  onClick={toggleSolution}
                  className="text-orange-600"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  {showSolution ? 'Hide' : 'Show'} Solution
                </Button>
              )}
            </div>
            
            <Button
              onClick={nextStep}
              disabled={!stepComplete && currentStepData.type === 'interactive'}
              className={stepComplete ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              {currentStep === selectedTutorial.steps.length - 1 ? 'Complete' : 'Next'}
              <SkipForward className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        {/* Right Panel - Code Editor (for interactive steps) */}
        {currentStepData.type === 'interactive' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Code Editor</CardTitle>
                <div className="flex gap-2">
                  <Button
                    onClick={validateStep}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Check Code
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-96 border rounded-lg overflow-hidden">
                <CodeEditor
                  value={userCode}
                  onChange={setUserCode}
                  language={selectedTutorial.id.includes('html') ? 'html' : 
                           selectedTutorial.id.includes('javascript') ? 'javascript' : 'jsx'}
                  readOnly={false}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default InteractiveTutorials;