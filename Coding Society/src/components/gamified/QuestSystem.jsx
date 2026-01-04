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
  Lightbulb,
  ArrowLeft,
  Rocket,
  Swords,
  Shield,
  Crown,
  Coins,
  MapPin,
  Scroll,
  Wand2
} from 'lucide-react';

/**
 * ✨ ULTRA-MODERN QUEST SYSTEM ✨
 * 
 * A completely redesigned quest experience with:
 * - 🎨 Stunning visual design with gradients & glassmorphism
 * - ⚡ Smooth animations and micro-interactions
 * - 🎯 Intuitive quest progression system
 * - 🔍 Smart filtering and search
 * - 📊 Real-time progress tracking
 * - 🎁 Reward previews and celebrations
 */

// 🎮 COMPREHENSIVE QUEST DATABASE
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
    nextQuests: ['react_realm', 'algorithm_arena', 'python_pioneer']
  },

  // Python Quest
  'python_pioneer': {
    id: 'python_pioneer',
    title: 'Python Pioneer: Serpent\'s Path',
    difficulty: 'novice',
    skill: 'backend',
    xpReward: 200,
    timeEstimate: '25 min',
    category: 'programming_basics',
    prerequisites: [],
    story: `Deep in the Code Mountains, the ancient Python serpent guards powerful knowledge. 
    Master the elegant syntax and powerful capabilities of Python to unlock data manipulation, 
    automation, and the path to AI mastery.`,
    description: 'Learn Python fundamentals: variables, functions, lists, and control flow',
    objectives: [
      'Work with Python variables and data types',
      'Create and use functions',
      'Manipulate lists and dictionaries',
      'Use control flow (if/else, loops)'
    ],
    challenge: {
      language: 'python',
      template: `# Python Challenge: Data Processing

# Task 1: Create a function to calculate the sum of a list
def calculate_sum(numbers):
    # Your code here
    pass

# Task 2: Create a function to find the maximum number in a list
def find_max(numbers):
    # Your code here
    pass

# Task 3: Create a function to filter even numbers
def filter_even(numbers):
    # Your code here
    pass

# Task 4: Create a function to reverse a string
def reverse_string(text):
    # Your code here
    pass

# Test your functions
test_list = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
print(calculate_sum(test_list))  # Should output 55
print(find_max(test_list))  # Should output 10
print(filter_even(test_list))  # Should output [2, 4, 6, 8, 10]
print(reverse_string("Python"))  # Should output "nohtyP"`,
      solution: `# Python Challenge: Data Processing

# Task 1: Create a function to calculate the sum of a list
def calculate_sum(numbers):
    return sum(numbers)

# Task 2: Create a function to find the maximum number in a list
def find_max(numbers):
    return max(numbers)

# Task 3: Create a function to filter even numbers
def filter_even(numbers):
    return [num for num in numbers if num % 2 == 0]

# Task 4: Create a function to reverse a string
def reverse_string(text):
    return text[::-1]

# Test your functions
test_list = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
print(calculate_sum(test_list))  # Should output 55
print(find_max(test_list))  # Should output 10
print(filter_even(test_list))  # Should output [2, 4, 6, 8, 10]
print(reverse_string("Python"))  # Should output "nohtyP"`,
      tests: [
        { description: 'calculate_sum function exists', check: (code) => code.includes('def calculate_sum') },
        { description: 'find_max function exists', check: (code) => code.includes('def find_max') },
        { description: 'filter_even function exists', check: (code) => code.includes('def filter_even') },
        { description: 'reverse_string function exists', check: (code) => code.includes('def reverse_string') },
        { description: 'Uses return statements', check: (code) => (code.match(/return/g) || []).length >= 4 },
        { description: 'Handles list operations', check: (code) => code.includes('for') || code.includes('sum') || code.includes('max') }
      ],
      hints: [
        'Use built-in functions like sum() and max() for simple operations',
        'List comprehensions are perfect for filtering: [x for x in list if condition]',
        'String slicing [::-1] reverses a string in Python',
        'Remember to return values from your functions, not just print them'
      ]
    },
    rewards: [
      { type: 'achievement', key: 'python_master' },
      { type: 'avatar', item: 'serpent_staff' }
    ],
    nextQuests: ['python_advanced', 'data_science_quest']
  },

  // Advanced Python Quest
  'python_advanced': {
    id: 'python_advanced',
    title: 'Python Advanced: Data Structures Dungeon',
    difficulty: 'apprentice',
    skill: 'backend',
    xpReward: 300,
    timeEstimate: '35 min',
    category: 'algorithms',
    prerequisites: ['python_pioneer'],
    story: `The Data Structures Dungeon holds the secrets of efficient programming. 
    Master dictionaries, sets, and advanced list operations to become a true Python warrior.`,
    description: 'Master advanced Python: dictionaries, sets, list comprehensions, and lambda functions',
    objectives: [
      'Work with dictionaries and nested data',
      'Use sets for unique collections',
      'Master list comprehensions',
      'Create lambda functions'
    ],
    challenge: {
      language: 'python',
      template: `# Advanced Python Challenge: Student Grade Manager

# Task 1: Create a function to calculate average grades
def calculate_average(grades):
    # grades is a dictionary: {'student1': [90, 85, 88], 'student2': [75, 80, 85]}
    # Return a dictionary with averages: {'student1': 87.67, 'student2': 80.0}
    pass

# Task 2: Find students above threshold
def students_above_threshold(averages, threshold):
    # Return a list of student names with average above threshold
    pass

# Task 3: Get unique grades from all students
def get_unique_grades(grades):
    # Return a set of all unique grades
    pass

# Task 4: Sort students by average (use lambda)
def sort_by_average(averages):
    # Return list of tuples sorted by average (highest first)
    pass

# Test data
student_grades = {
    'Alice': [90, 85, 88, 92],
    'Bob': [75, 80, 85, 78],
    'Charlie': [95, 98, 96, 94],
    'Diana': [88, 86, 90, 87]
}

averages = calculate_average(student_grades)
print(averages)
print(students_above_threshold(averages, 85))
print(get_unique_grades(student_grades))
print(sort_by_average(averages))`,
      solution: `# Advanced Python Challenge: Student Grade Manager

# Task 1: Create a function to calculate average grades
def calculate_average(grades):
    return {student: sum(student_grades) / len(student_grades) 
            for student, student_grades in grades.items()}

# Task 2: Find students above threshold
def students_above_threshold(averages, threshold):
    return [student for student, avg in averages.items() if avg >= threshold]

# Task 3: Get unique grades from all students
def get_unique_grades(grades):
    all_grades = []
    for student_grades in grades.values():
        all_grades.extend(student_grades)
    return set(all_grades)

# Task 4: Sort students by average (use lambda)
def sort_by_average(averages):
    return sorted(averages.items(), key=lambda x: x[1], reverse=True)

# Test data
student_grades = {
    'Alice': [90, 85, 88, 92],
    'Bob': [75, 80, 85, 78],
    'Charlie': [95, 98, 96, 94],
    'Diana': [88, 86, 90, 87]
}

averages = calculate_average(student_grades)
print(averages)
print(students_above_threshold(averages, 85))
print(get_unique_grades(student_grades))
print(sort_by_average(averages))`,
      tests: [
        { description: 'calculate_average function exists', check: (code) => code.includes('def calculate_average') },
        { description: 'students_above_threshold function exists', check: (code) => code.includes('def students_above_threshold') },
        { description: 'get_unique_grades function exists', check: (code) => code.includes('def get_unique_grades') },
        { description: 'sort_by_average function exists', check: (code) => code.includes('def sort_by_average') },
        { description: 'Uses lambda function', check: (code) => code.includes('lambda') },
        { description: 'Uses list comprehension or dictionary comprehension', check: (code) => code.includes('for') && code.includes('in') }
      ],
      hints: [
        'Dictionary comprehension: {key: value for key, value in dict.items()}',
        'List comprehension with condition: [x for x in list if condition]',
        'Use set() to get unique values from a list',
        'sorted() with lambda: sorted(items, key=lambda x: x[1], reverse=True)'
      ]
    },
    rewards: [
      { type: 'achievement', key: 'data_structures_master' },
      { type: 'avatar', item: 'python_crown' }
    ],
    nextQuests: ['oop_quest', 'data_science_quest']
  },

  // Python OOP Quest
  'oop_quest': {
    id: 'oop_quest',
    title: 'Python OOP: Class Fortress',
    difficulty: 'expert',
    skill: 'backend',
    xpReward: 400,
    timeEstimate: '45 min',
    category: 'advanced_python',
    prerequisites: ['python_advanced'],
    story: `The Class Fortress stands before you, guarding the secrets of Object-Oriented Programming. 
    Master classes, inheritance, and polymorphism to build powerful, reusable code structures.`,
    description: 'Master Object-Oriented Programming in Python: classes, inheritance, encapsulation',
    objectives: [
      'Create classes with __init__ methods',
      'Implement inheritance and method overriding',
      'Use class and instance variables',
      'Apply encapsulation principles'
    ],
    challenge: {
      language: 'python',
      template: `# OOP Challenge: Game Character System

class Character:
    """Base character class"""
    def __init__(self, name, health, attack):
        # Initialize character attributes
        pass
    
    def take_damage(self, damage):
        # Reduce health by damage
        pass
    
    def is_alive(self):
        # Return True if health > 0
        pass
    
    def attack_enemy(self, enemy):
        # Deal attack damage to enemy
        pass

class Warrior(Character):
    """Warrior subclass with special abilities"""
    def __init__(self, name, health, attack):
        # Initialize with bonus health
        pass
    
    def shield_block(self, damage):
        # Block 50% of incoming damage
        pass

class Mage(Character):
    """Mage subclass with magic"""
    def __init__(self, name, health, attack, mana):
        # Initialize with mana attribute
        pass
    
    def cast_spell(self, enemy):
        # Deal 2x attack damage if mana > 20
        pass

# Test your classes
warrior = Warrior("Conan", 100, 15)
mage = Mage("Gandalf", 80, 10, 50)

print(f"{warrior.name}: Health = {warrior.health}")
warrior.attack_enemy(mage)
print(f"{mage.name}: Health after attack = {mage.health}")`,
      solution: `# OOP Challenge: Game Character System

class Character:
    """Base character class"""
    def __init__(self, name, health, attack):
        self.name = name
        self.health = health
        self.attack = attack
    
    def take_damage(self, damage):
        self.health -= damage
        if self.health < 0:
            self.health = 0
    
    def is_alive(self):
        return self.health > 0
    
    def attack_enemy(self, enemy):
        enemy.take_damage(self.attack)

class Warrior(Character):
    """Warrior subclass with special abilities"""
    def __init__(self, name, health, attack):
        super().__init__(name, health + 20, attack)
    
    def shield_block(self, damage):
        blocked_damage = damage // 2
        self.take_damage(blocked_damage)
        return blocked_damage

class Mage(Character):
    """Mage subclass with magic"""
    def __init__(self, name, health, attack, mana):
        super().__init__(name, health, attack)
        self.mana = mana
    
    def cast_spell(self, enemy):
        if self.mana >= 20:
            self.mana -= 20
            enemy.take_damage(self.attack * 2)
            return True
        return False

# Test your classes
warrior = Warrior("Conan", 100, 15)
mage = Mage("Gandalf", 80, 10, 50)

print(f"{warrior.name}: Health = {warrior.health}")
warrior.attack_enemy(mage)
print(f"{mage.name}: Health after attack = {mage.health}")`,
      tests: [
        { description: 'Character class exists with __init__', check: (code) => code.includes('class Character') && code.includes('def __init__') },
        { description: 'Warrior class inherits from Character', check: (code) => code.includes('class Warrior(Character)') },
        { description: 'Mage class inherits from Character', check: (code) => code.includes('class Mage(Character)') },
        { description: 'Uses super() for inheritance', check: (code) => code.includes('super()') },
        { description: 'Implements instance methods', check: (code) => code.includes('def take_damage') && code.includes('self') },
        { description: 'Creates class instances', check: (code) => code.includes('Warrior(') && code.includes('Mage(') }
      ],
      hints: [
        'Use __init__ to initialize object attributes with self',
        'super().__init__() calls the parent class constructor',
        'All instance methods need self as first parameter',
        'Access attributes with self.attribute_name'
      ]
    },
    rewards: [
      { type: 'achievement', key: 'oop_grandmaster' },
      { type: 'avatar', item: 'architect_robe' }
    ],
    nextQuests: ['design_patterns_quest']
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

        {/* Code Challenge - Ultra Professional Design */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Editor - Enhanced with Glassmorphism */}
          <Card className="border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-white shadow-xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-blue-50/50 to-purple-50/50 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg">
                    <Code className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Code Editor
                    </div>
                    <div className="text-xs text-gray-500 font-normal mt-0.5">
                      Write your solution below
                    </div>
                  </div>
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    onClick={showHint}
                    disabled={currentHint >= selectedQuest.challenge.hints.length}
                    size="sm"
                    className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed border-0"
                  >
                    <Lightbulb className="w-4 h-4 mr-1.5" />
                    <span className="font-semibold">Hint</span>
                    <span className="ml-1 text-xs opacity-90">({currentHint}/{selectedQuest.challenge.hints.length})</span>
                  </Button>
                  <Button
                    onClick={runTests}
                    disabled={isRunning}
                    size="sm"
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 border-0 px-4"
                  >
                    {isRunning ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-1.5"></div>
                        <span className="font-semibold">Testing...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-1.5" />
                        <span className="font-semibold">Run Tests</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative">
                <div className="absolute top-2 right-2 z-10 flex gap-2">
                  <div className="px-3 py-1 bg-slate-900/80 backdrop-blur-sm rounded-lg text-xs font-mono text-white shadow-lg">
                    {selectedQuest.challenge.language.toUpperCase()}
                  </div>
                </div>
                <CodeEditor
                  value={userCode}
                  onChange={setUserCode}
                  language={selectedQuest.challenge.language}
                  height="500px"
                />
              </div>
            </CardContent>
          </Card>

          {/* Test Results - Ultra Professional Design */}
          <Card className="border-2 border-slate-200 bg-gradient-to-br from-white to-slate-50 shadow-xl overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-purple-50/50 to-pink-50/50 backdrop-blur-sm">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg shadow-lg">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Test Results
                  </div>
                  <div className="text-xs text-gray-500 font-normal mt-0.5">
                    {testResults.length > 0 
                      ? `${testResults.filter(r => r.passed).length}/${testResults.length} tests passed`
                      : 'Awaiting test execution'}
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {testResults.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="relative mb-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl animate-pulse">
                      <Play className="w-12 h-12 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                      <Rocket className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Ready to Test Your Code?</h3>
                  <p className="text-gray-600 mb-6 max-w-sm">Click the button below to run automated tests on your solution and see instant feedback</p>
                  <Button 
                    onClick={runTests} 
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 px-8 py-6 text-base font-semibold border-0"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Execute Tests Now
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Test Cases */}
                  {testResults.map((result, index) => (
                    <div
                      key={index}
                      className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 hover:scale-[1.02] ${
                        result.passed
                          ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300 hover:shadow-lg hover:shadow-green-200'
                          : 'bg-gradient-to-br from-red-50 to-rose-50 border-red-300 hover:shadow-lg hover:shadow-red-200'
                      }`}
                    >
                      {/* Animated background effect */}
                      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                        result.passed ? 'bg-gradient-to-r from-green-100/50 to-emerald-100/50' : 'bg-gradient-to-r from-red-100/50 to-rose-100/50'
                      }`}></div>
                      
                      <div className="relative p-5">
                        <div className="flex items-start gap-4">
                          {/* Icon with glow effect */}
                          <div className={`relative flex-shrink-0 ${
                            result.passed ? 'animate-pulse' : ''
                          }`}>
                            {result.passed ? (
                              <div className="relative">
                                <div className="absolute inset-0 bg-green-400 rounded-full blur-md opacity-50"></div>
                                <CheckCircle className="relative w-7 h-7 text-green-600" />
                              </div>
                            ) : (
                              <div className="relative">
                                <div className="absolute inset-0 bg-red-400 rounded-full blur-md opacity-50"></div>
                                <XCircle className="relative w-7 h-7 text-red-600" />
                              </div>
                            )}
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                                result.passed 
                                  ? 'bg-green-200 text-green-800' 
                                  : 'bg-red-200 text-red-800'
                              }`}>
                                Test {index + 1}
                              </span>
                              <div className={`font-bold text-lg ${
                                result.passed ? 'text-green-900' : 'text-red-900'
                              }`}>
                                {result.description}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <div className={`text-sm font-medium px-3 py-1 rounded-lg ${
                                result.passed 
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {result.passed ? '✓ Passed' : '✗ Failed'}
                              </div>
                            </div>
                          </div>
                          
                          {/* Points Badge */}
                          <div className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl border-2 ${
                            result.passed
                              ? 'bg-green-100 border-green-300'
                              : 'bg-red-100 border-red-300'
                          }`}>
                            <div className={`text-2xl font-black ${
                              result.passed ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {result.points}
                            </div>
                            <div className="text-xs text-gray-600 font-semibold">/ 10</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Enhanced Summary Card */}
                  <div className="mt-8 relative overflow-hidden rounded-2xl border-2 border-slate-300 bg-gradient-to-br from-slate-50 to-white shadow-2xl">
                    {/* Animated background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-100/30 via-purple-100/30 to-pink-100/30"></div>
                    
                    <div className="relative p-6">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                            <Award className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">Overall Score</h3>
                            <p className="text-sm text-gray-600">Your performance summary</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-5xl font-black ${
                            Math.round((testResults.filter(r => r.passed).length / testResults.length) * 100) === 100
                              ? 'text-green-600'
                              : Math.round((testResults.filter(r => r.passed).length / testResults.length) * 100) >= 70
                              ? 'text-blue-600'
                              : 'text-orange-600'
                          }`}>
                            {Math.round((testResults.filter(r => r.passed).length / testResults.length) * 100)}%
                          </div>
                          <div className="text-xs text-gray-500 font-semibold mt-1">
                            {testResults.filter(r => r.passed).length} of {testResults.length} tests
                          </div>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="h-4 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                          <div
                            className={`h-full transition-all duration-1000 ease-out rounded-full ${
                              Math.round((testResults.filter(r => r.passed).length / testResults.length) * 100) === 100
                                ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                                : Math.round((testResults.filter(r => r.passed).length / testResults.length) * 100) >= 70
                                ? 'bg-gradient-to-r from-blue-500 to-purple-600'
                                : 'bg-gradient-to-r from-orange-500 to-red-600'
                            }`}
                            style={{
                              width: `${(testResults.filter(r => r.passed).length / testResults.length) * 100}%`
                            }}
                          />
                        </div>
                      </div>
                      
                      {/* Stats Grid */}
                      <div className="grid grid-cols-3 gap-4 mt-6">
                        <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                          <div className="text-2xl font-bold text-green-600">
                            {testResults.filter(r => r.passed).length}
                          </div>
                          <div className="text-xs text-gray-600 font-medium mt-1">Passed</div>
                        </div>
                        <div className="text-center p-4 bg-red-50 rounded-xl border border-red-200">
                          <div className="text-2xl font-bold text-red-600">
                            {testResults.filter(r => !r.passed).length}
                          </div>
                          <div className="text-xs text-gray-600 font-medium mt-1">Failed</div>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                          <div className="text-2xl font-bold text-blue-600">
                            {testResults.reduce((sum, r) => sum + r.points, 0)}
                          </div>
                          <div className="text-xs text-gray-600 font-medium mt-1">Total Points</div>
                        </div>
                      </div>
                      
                      {/* Message */}
                      {Math.round((testResults.filter(r => r.passed).length / testResults.length) * 100) === 100 && (
                        <div className="mt-6 p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white text-center">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <Trophy className="w-5 h-5" />
                            <span className="font-bold text-lg">Perfect Score!</span>
                            <Trophy className="w-5 h-5" />
                          </div>
                          <p className="text-sm opacity-90">Congratulations! You've mastered this quest!</p>
                        </div>
                      )}
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
