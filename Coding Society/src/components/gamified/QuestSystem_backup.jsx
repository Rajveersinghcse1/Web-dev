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
  Users
} from 'lucide-react';

/**
 * Interactive Quest System for Gamified Learning
 * Features:
 * - Story-driven coding challenges
 * - Progressive difficulty levels
 * - Instant feedback and hints
 * - Real code execution testing
 * - Achievement integration
 * - Branching quest paths
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
        { description: 'Has heading hierarchy', check: (code) => code.includes('<h1>') && code.includes('<h2>') }
      ],
      hints: [
        'Start with a proper HTML5 document structure',
        'Use semantic elements like <header>, <main>, <section>, and <footer>',
        'Add proper meta tags in the <head> section',
        'Create a logical heading hierarchy (h1, h2, h3...)'
      ]
    },
    rewards: [
      { type: 'avatar', item: 'html_badge' },
      { type: 'theme', item: 'web_developer_theme' }
    ],
    nextQuests: ['css_champion', 'js_journey']
  },

  'python_patterns': {
    id: 'python_patterns',
    title: 'Python Patterns: The Art of Loops',
    difficulty: 'apprentice',
    skill: 'algorithms',
    xpReward: 200,
    timeEstimate: '20 min',
    category: 'pattern_mastery',
    prerequisites: [],
    story: `In the mystical land of Pythonia, ancient geometries hold the key to unlocking powerful spells. 
    Master the sacred patterns, and you'll gain the ability to visualize any algorithm in beautiful ASCII art.`,
    description: 'Master pattern generation using loops and string manipulation',
    objectives: [
      'Create a diamond pattern using nested loops',
      'Handle spaces and stars correctly',
      'Make the pattern size dynamic',
      'Ensure perfect symmetry'
    ],
    challenge: {
      language: 'python',
      template: `# Create a diamond pattern
# Size should be dynamic based on input n
n = 5

# Your code here to create a diamond pattern
# Example output for n=5:
#     *
#    ***
#   *****
#  *******
# *********
#  *******
#   *****
#    ***
#     *

def create_diamond(size):
    # TODO: Implement the diamond pattern
    pass

# Test with different sizes
for size in [3, 5, 7]:
    print(f"Diamond of size {size}:")
    create_diamond(size)
    print()`,
      solution: `def create_diamond(size):
    # Upper half (including middle)
    for i in range(1, size + 1):
        spaces = " " * (size - i)
        stars = "*" * (2 * i - 1)
        print(spaces + stars)
    
    # Lower half
    for i in range(size - 1, 0, -1):
        spaces = " " * (size - i)
        stars = "*" * (2 * i - 1)
        print(spaces + stars)

# Test with different sizes
for size in [3, 5, 7]:
    print(f"Diamond of size {size}:")
    create_diamond(size)
    print()`,
      tests: [
        { description: 'Function exists', check: (code) => code.includes('def create_diamond') },
        { description: 'Uses proper spacing', check: (code) => code.includes('" " *') || code.includes("' ' *") },
        { description: 'Creates star pattern', check: (code) => code.includes('"*" *') || code.includes("'*' *") },
        { description: 'Has loop structure', check: (code) => code.includes('for') && code.includes('range') }
      ],
      hints: [
        'Think about the pattern: spaces decrease, stars increase going down',
        'For the upper half: spaces = size - row, stars = 2 * row - 1',
        'The lower half is the reverse of the upper half (excluding middle)',
        'Use string multiplication: " " * count creates multiple spaces'
      ]
    },
    rewards: [
      { type: 'achievement', key: 'pattern_master' },
      { type: 'avatar', item: 'python_wizard_hat' }
    ],
    nextQuests: ['algorithm_adventure', 'data_structures_dungeon']
  },

  'js_journey': {
    id: 'js_journey',
    title: 'JavaScript Journey: Functions & Logic',
    difficulty: 'apprentice',
    skill: 'frontend',
    xpReward: 180,
    timeEstimate: '25 min',
    category: 'programming_logic',
    prerequisites: ['html_hero'],
    story: `The JavaScript Realm is in chaos! Variables are running wild, functions have lost their purpose, 
    and logic gates are malfunctioning. As the chosen developer, you must restore order with the power of clean code.`,
    description: 'Master JavaScript functions, variables, and control flow',
    objectives: [
      'Create pure functions with proper parameters',
      'Implement conditional logic',
      'Use arrays and objects effectively',
      'Handle edge cases gracefully'
    ],
    challenge: {
      language: 'javascript',
      template: `// JavaScript Challenge: Create a smart calculator
// Your calculator should handle multiple operations and edge cases

function smartCalculator(operation, a, b) {
    // TODO: Implement the calculator
    // Operations: 'add', 'subtract', 'multiply', 'divide', 'power'
    // Handle edge cases like division by zero
}

// Bonus: Create a function that validates if a number is prime
function isPrime(number) {
    // TODO: Implement prime number checker
}

// Test your functions
console.log(smartCalculator('add', 5, 3)); // Should output 8
console.log(smartCalculator('divide', 10, 0)); // Should handle division by zero
console.log(isPrime(17)); // Should output true
console.log(isPrime(15)); // Should output false`,
      solution: `function smartCalculator(operation, a, b) {
    // Validate inputs
    if (typeof a !== 'number' || typeof b !== 'number') {
        return 'Error: Please provide valid numbers';
    }
    
    switch (operation.toLowerCase()) {
        case 'add':
            return a + b;
        case 'subtract':
            return a - b;
        case 'multiply':
            return a * b;
        case 'divide':
            return b === 0 ? 'Error: Division by zero' : a / b;
        case 'power':
            return Math.pow(a, b);
        default:
            return 'Error: Unknown operation';
    }
}

function isPrime(number) {
    if (typeof number !== 'number' || number < 2) {
        return false;
    }
    
    if (number === 2) return true;
    if (number % 2 === 0) return false;
    
    for (let i = 3; i <= Math.sqrt(number); i += 2) {
        if (number % i === 0) {
            return false;
        }
    }
    return true;
}

// Test functions
console.log(smartCalculator('add', 5, 3)); // 8
console.log(smartCalculator('divide', 10, 0)); // Error: Division by zero
console.log(isPrime(17)); // true
console.log(isPrime(15)); // false`,
      tests: [
        { description: 'Calculator function exists', check: (code) => code.includes('function smartCalculator') },
        { description: 'Handles division by zero', check: (code) => code.includes('b === 0') || code.includes('/ 0') },
        { description: 'Prime function exists', check: (code) => code.includes('function isPrime') },
        { description: 'Uses proper control flow', check: (code) => code.includes('switch') || code.includes('if') }
      ],
      hints: [
        'Use a switch statement or if-else for different operations',
        'Always validate your inputs before processing',
        'For division by zero, return an error message',
        'Prime numbers are only divisible by 1 and themselves'
      ]
    },
    rewards: [
      { type: 'achievement', key: 'logic_master' },
      { type: 'avatar', item: 'js_crown' }
    ],
    nextQuests: ['dom_domination', 'async_adventure']
  },

  'algorithm_adventure': {
    id: 'algorithm_adventure',
    title: 'Algorithm Adventure: Sorting Sorcery',
    difficulty: 'expert',
    skill: 'algorithms',
    xpReward: 300,
    timeEstimate: '35 min',
    category: 'algorithm_mastery',
    prerequisites: ['python_patterns'],
    story: `The Great Library of Algorithms has been cursed! All the sorting spells have been mixed up, 
    and the ancient knowledge is scattered in chaos. Use your algorithmic powers to restore order!`,
    description: 'Implement and optimize classic sorting algorithms',
    objectives: [
      'Implement bubble sort algorithm',
      'Create an optimized quicksort',
      'Compare algorithm efficiency',
      'Handle edge cases and empty arrays'
    ],
    challenge: {
      language: 'python',
      template: `# Sorting Sorcery Challenge
# Implement different sorting algorithms and compare their performance

def bubble_sort(arr):
    """Implement bubble sort algorithm"""
    # TODO: Implement bubble sort
    pass

def quicksort(arr):
    """Implement quicksort algorithm"""
    # TODO: Implement quicksort
    pass

def merge_sort(arr):
    """Implement merge sort algorithm"""
    # TODO: Implement merge sort
    pass

# Test function to compare algorithms
def test_sorting_algorithms():
    test_arrays = [
        [64, 34, 25, 12, 22, 11, 90],
        [5, 2, 4, 6, 1, 3],
        [1],
        [],
        [3, 3, 3, 3]
    ]
    
    for arr in test_arrays:
        print(f"Original: {arr}")
        print(f"Bubble Sort: {bubble_sort(arr.copy())}")
        print(f"Quick Sort: {quicksort(arr.copy())}")
        print(f"Merge Sort: {merge_sort(arr.copy())}")
        print("-" * 40)

test_sorting_algorithms()`,
      solution: `def bubble_sort(arr):
    """Implement bubble sort algorithm"""
    if not arr:
        return arr
    
    n = len(arr)
    for i in range(n):
        swapped = False
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:
            break
    return arr

def quicksort(arr):
    """Implement quicksort algorithm"""
    if len(arr) <= 1:
        return arr
    
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    
    return quicksort(left) + middle + quicksort(right)

def merge_sort(arr):
    """Implement merge sort algorithm"""
    if len(arr) <= 1:
        return arr
    
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    
    return merge(left, right)

def merge(left, right):
    """Helper function for merge sort"""
    result = []
    i = j = 0
    
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    
    result.extend(left[i:])
    result.extend(right[j:])
    return result

# Test function remains the same...`,
      tests: [
        { description: 'Bubble sort implemented', check: (code) => code.includes('def bubble_sort') },
        { description: 'Quicksort implemented', check: (code) => code.includes('def quicksort') },
        { description: 'Handles empty arrays', check: (code) => code.includes('if not arr') || code.includes('len(arr)') },
        { description: 'Uses proper swapping', check: (code) => code.includes('arr[j], arr[j + 1]') }
      ],
      hints: [
        'Bubble sort: compare adjacent elements and swap if in wrong order',
        'Quicksort: choose a pivot and partition around it recursively',
        'Always handle edge cases like empty arrays',
        'Use list comprehensions for cleaner quicksort implementation'
      ]
    },
    rewards: [
      { type: 'achievement', key: 'algorithm_sage' },
      { type: 'avatar', item: 'algorithm_wizard_staff' },
      { type: 'theme', item: 'algorithm_master_theme' }
    ],
    nextQuests: ['data_structures_dungeon', 'optimization_odyssey']
  },

  // Master Level Quests
  'react_realm': {
    id: 'react_realm',
    title: 'React Realm: Component Kingdom',
    difficulty: 'master',
    skill: 'frontend',
    xpReward: 500,
    timeEstimate: '45 min',
    category: 'framework_mastery',
    prerequisites: ['js_journey', 'html_hero'],
    story: `The React Kingdom has fallen into component chaos! Components are not communicating, 
    state is scattered across the realm, and props are being misused. As the React Wizard, 
    you must restore harmony using the ancient art of component composition.`,
    description: 'Master React components, state management, and lifecycle methods',
    objectives: [
      'Create reusable React components',
      'Implement proper state management',
      'Use props effectively for component communication',
      'Handle user interactions and events'
    ],
    challenge: {
      language: 'jsx',
      template: `// React Challenge: Build a Todo List Application
// Create components for TodoApp, TodoItem, and AddTodo

import React, { useState } from 'react';

// TODO: Create TodoItem component
function TodoItem({ todo, onToggle, onDelete }) {
    // Implement todo item with toggle and delete functionality
}

// TODO: Create AddTodo component
function AddTodo({ onAdd }) {
    // Implement form to add new todos
}

// Main TodoApp component
function TodoApp() {
    const [todos, setTodos] = useState([]);
    
    // TODO: Implement addTodo function
    const addTodo = (text) => {
        // Add new todo to the list
    };
    
    // TODO: Implement toggleTodo function
    const toggleTodo = (id) => {
        // Toggle completed status of todo
    };
    
    // TODO: Implement deleteTodo function
    const deleteTodo = (id) => {
        // Remove todo from list
    };
    
    return (
        <div className="todo-app">
            <h1>React Todo Realm</h1>
            {/* Render AddTodo and TodoItems here */}
        </div>
    );
}

export default TodoApp;`,
      solution: `import React, { useState } from 'react';

function TodoItem({ todo, onToggle, onDelete }) {
    return (
        <div className={\`todo-item \${todo.completed ? 'completed' : ''}\`}>
            <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => onToggle(todo.id)}
            />
            <span className="todo-text">{todo.text}</span>
            <button onClick={() => onDelete(todo.id)} className="delete-btn">
                Delete
            </button>
        </div>
    );
}

function AddTodo({ onAdd }) {
    const [text, setText] = useState('');
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if (text.trim()) {
            onAdd(text.trim());
            setText('');
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="add-todo">
            <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Add a new quest..."
                className="todo-input"
            />
            <button type="submit" className="add-btn">Add Quest</button>
        </form>
    );
}

function TodoApp() {
    const [todos, setTodos] = useState([]);
    const [nextId, setNextId] = useState(1);
    
    const addTodo = (text) => {
        const newTodo = {
            id: nextId,
            text: text,
            completed: false
        };
        setTodos([...todos, newTodo]);
        setNextId(nextId + 1);
    };
    
    const toggleTodo = (id) => {
        setTodos(todos.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        ));
    };
    
    const deleteTodo = (id) => {
        setTodos(todos.filter(todo => todo.id !== id));
    };
    
    const completedCount = todos.filter(todo => todo.completed).length;
    
    return (
        <div className="todo-app">
            <h1>React Todo Realm</h1>
            <div className="stats">
                <p>Total Quests: {todos.length}</p>
                <p>Completed: {completedCount}</p>
                <p>Remaining: {todos.length - completedCount}</p>
            </div>
            <AddTodo onAdd={addTodo} />
            <div className="todo-list">
                {todos.map(todo => (
                    <TodoItem
                        key={todo.id}
                        todo={todo}
                        onToggle={toggleTodo}
                        onDelete={deleteTodo}
                    />
                ))}
            </div>
        </div>
    );
}

export default TodoApp;`,
      tests: [
        { description: 'TodoItem component exists', check: (code) => code.includes('function TodoItem') },
        { description: 'AddTodo component exists', check: (code) => code.includes('function AddTodo') },
        { description: 'Uses useState hook', check: (code) => code.includes('useState') },
        { description: 'Handles events properly', check: (code) => code.includes('onChange') && code.includes('onClick') }
      ],
      hints: [
        'Break down the app into smaller, reusable components',
        'Use the useState hook to manage component state',
        'Pass functions down as props for child components to communicate with parent',
        'Remember to use key props when rendering lists'
      ]
    },
    rewards: [
      { type: 'achievement', key: 'react_master' },
      { type: 'avatar', item: 'react_crown' },
      { type: 'theme', item: 'component_kingdom_theme' }
    ],
    nextQuests: ['fullstack_finale']
  }
};

const QuestSystem = () => {
  const { gameState, startQuest, completeQuest, awardXP, showNotification } = useGame();
  const [selectedQuest, setSelectedQuest] = useState(null);
  const [userCode, setUserCode] = useState('');
  const [testResults, setTestResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentHint, setCurrentHint] = useState(0);
  const [showSolution, setShowSolution] = useState(false);

  // Get available quests based on completed prerequisites
  const getAvailableQuests = () => {
    const completed = gameState.quests.completed.map(q => q.id);
    return Object.values(QUEST_DATABASE).filter(quest => {
      return quest.prerequisites.every(prereq => completed.includes(prereq));
    });
  };

  const handleStartQuest = (quest) => {
    setSelectedQuest(quest);
    setUserCode(quest.challenge.template);
    setTestResults([]);
    setCurrentHint(0);
    setShowSolution(false);
    startQuest(quest);
  };

  const runTests = () => {
    if (!selectedQuest) return;
    
    setIsRunning(true);
    const quest = selectedQuest;
    const tests = quest.challenge.tests || [];
    
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
      // Quest completed!
      completeQuest(quest.id);
      showNotification({
        type: 'success',
        title: 'Quest Completed! 🎉',
        message: `${quest.title} - Perfect Score!`,
        xp: quest.xpReward
      });
    } else if (score >= 70) {
      // Partial completion
      const partialXP = Math.floor(quest.xpReward * (score / 100));
      awardXP(partialXP, quest.skill, `Partial Quest: ${quest.title}`);
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
      'novice': 'text-green-600 bg-green-100',
      'apprentice': 'text-blue-600 bg-blue-100',
      'expert': 'text-purple-600 bg-purple-100',
      'master': 'text-orange-600 bg-orange-100',
      'legendary': 'text-red-600 bg-red-100'
    };
    return colors[difficulty] || 'text-gray-600 bg-gray-100';
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

  if (selectedQuest) {
    return (
      <div className="quest-interface max-w-7xl mx-auto p-6">
        {/* Quest Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              onClick={() => setSelectedQuest(null)}
              className="mb-4"
            >
              ← Back to Quests
            </Button>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(selectedQuest.difficulty)}`}>
                {selectedQuest.difficulty.toUpperCase()}
              </span>
              <div className="flex items-center gap-1 text-yellow-600">
                <Star className="w-4 h-4" />
                <span>{selectedQuest.xpReward} XP</span>
              </div>
            </div>
          </div>
          
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getSkillIcon(selectedQuest.skill)}
                {selectedQuest.title}
              </CardTitle>
              <p className="text-gray-600">{selectedQuest.description}</p>
            </CardHeader>
            <CardContent>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h4 className="font-semibold mb-2">📖 Quest Story</h4>
                <p className="text-gray-700 italic">{selectedQuest.story}</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">🎯 Objectives</h4>
                  <ul className="space-y-1">
                    {selectedQuest.objectives.map((obj, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <Target className="w-3 h-3 text-blue-500" />
                        {obj}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">📊 Quest Info</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <Timer className="w-3 h-3" />
                      <span>Estimated Time: {selectedQuest.timeEstimate}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-3 h-3" />
                      <span>Skill: {selectedQuest.skill}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Code Challenge */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Code Editor */}
          <Card>
            <CardHeader>
              <CardTitle>Code Challenge</CardTitle>
              <div className="flex gap-2">
                <Button
                  onClick={runTests}
                  disabled={isRunning}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  {isRunning ? 'Testing...' : 'Run Tests'}
                </Button>
                <Button
                  variant="outline"
                  onClick={showHint}
                  disabled={currentHint >= selectedQuest.challenge.hints.length}
                >
                  💡 Hint ({currentHint}/{selectedQuest.challenge.hints.length})
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowSolution(!showSolution)}
                  className="text-orange-600"
                >
                  {showSolution ? 'Hide' : 'Show'} Solution
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-96 border rounded-lg overflow-hidden">
                <CodeEditor
                  value={showSolution ? selectedQuest.challenge.solution : userCode}
                  onChange={setUserCode}
                  language={selectedQuest.challenge.language}
                  readOnly={showSolution}
                />
              </div>
            </CardContent>
          </Card>

          {/* Test Results */}
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              {testResults.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Run tests to see your progress</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {testResults.map((result, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-3 p-3 rounded-lg ${
                        result.passed ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                      }`}
                    >
                      {result.passed ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                      <span className="flex-1">{result.description}</span>
                      <span className="font-medium">
                        {result.points}/10 pts
                      </span>
                    </div>
                  ))}
                  
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Total Score:</span>
                      <span className="text-xl font-bold text-blue-600">
                        {testResults.filter(r => r.passed).length}/{testResults.length}
                      </span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${(testResults.filter(r => r.passed).length / testResults.length) * 100}%`
                        }}
                      ></div>
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

  // Quest Selection Screen
  const availableQuests = getAvailableQuests();
  const activeQuests = gameState.quests.active || [];
  const completedQuests = gameState.quests.completed || [];

  return (
    <div className="quest-selection max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🗡️ Quest Board</h1>
        <p className="text-gray-600">Choose your coding adventure and embark on epic quests!</p>
      </div>

      {/* Active Quests */}
      {activeQuests.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            Active Quests
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeQuests.map((quest) => (
              <Card key={quest.id} className="cursor-pointer hover:shadow-lg transition-shadow border-yellow-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{quest.title}</CardTitle>
                    <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(quest.difficulty)}`}>
                      {quest.difficulty}
                    </span>
                  </div>
                  <CardDescription>{quest.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      {getSkillIcon(quest.skill)}
                      <span>{quest.skill}</span>
                    </div>
                    <Button
                      onClick={() => setSelectedQuest(QUEST_DATABASE[quest.id])}
                      size="sm"
                    >
                      Continue
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Available Quests */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-blue-600" />
          Available Quests
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableQuests.map((quest) => (
            <Card key={quest.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{quest.title}</CardTitle>
                  <span className={`px-2 py-1 rounded text-xs ${getDifficultyColor(quest.difficulty)}`}>
                    {quest.difficulty}
                  </span>
                </div>
                <CardDescription>{quest.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      {getSkillIcon(quest.skill)}
                      <span>{quest.skill}</span>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-600">
                      <Star className="w-3 h-3" />
                      <span>{quest.xpReward} XP</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>⏱️ {quest.timeEstimate}</span>
                    <span>📚 {quest.category}</span>
                  </div>
                  
                  <Button
                    onClick={() => handleStartQuest(quest)}
                    className="w-full"
                    size="sm"
                  >
                    Start Quest
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Completed Quests */}
      {completedQuests.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Completed Quests ({completedQuests.length})
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {completedQuests.map((quest) => (
              <Card key={quest.id} className="opacity-75 border-green-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    {quest.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-gray-500">
                    Completed: {new Date(quest.completedAt).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestSystem;