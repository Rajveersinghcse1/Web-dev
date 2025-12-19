import React, { useState, useEffect } from 'react';
import { useMode } from '../context/ModeContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { 
  Code, 
  Plus, 
  Trash2, 
  Edit, 
  Copy, 
  Save, 
  Search,
  Star,
  StarOff,
  BookOpen,
  Zap,
  Clock,
  Tag
} from 'lucide-react';

// Predefined code snippets for different languages
const PREDEFINED_SNIPPETS = {
  python: [
    {
      id: 'python-hello',
      name: 'Hello World',
      description: 'Basic hello world program',
      category: 'basic',
      code: `print("Hello, World!")`,
      tags: ['basic', 'output']
    },
    {
      id: 'python-input',
      name: 'User Input',
      description: 'Getting user input',
      category: 'basic',
      code: `name = input("Enter your name: ")
print(f"Hello, {name}!")`,
      tags: ['input', 'variables']
    },
    {
      id: 'python-function',
      name: 'Function Definition',
      description: 'Basic function structure',
      category: 'functions',
      code: `def greet(name):
    """Greet a person by name."""
    return f"Hello, {name}!"

# Call the function
message = greet("World")
print(message)`,
      tags: ['functions', 'docstring']
    },
    {
      id: 'python-class',
      name: 'Class Definition',
      description: 'Basic class structure',
      category: 'oop',
      code: `class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age
    
    def introduce(self):
        return f"Hi, I'm {self.name} and I'm {self.age} years old."

# Create an instance
person = Person("Alice", 30)
print(person.introduce())`,
      tags: ['class', 'oop', 'constructor']
    },
    {
      id: 'python-loop',
      name: 'For Loop',
      description: 'Basic for loop structure',
      category: 'loops',
      code: `# Loop through a list
fruits = ["apple", "banana", "orange"]
for fruit in fruits:
    print(f"I like {fruit}")

# Loop with range
for i in range(5):
    print(f"Number: {i}")`,
      tags: ['loops', 'iteration']
    },
    {
      id: 'python-file',
      name: 'File Operations',
      description: 'Reading and writing files',
      category: 'file-io',
      code: `# Writing to a file
with open("example.txt", "w") as file:
    file.write("Hello, World!")

# Reading from a file
with open("example.txt", "r") as file:
    content = file.read()
    print(content)`,
      tags: ['files', 'io']
    }
  ],
  javascript: [
    {
      id: 'js-hello',
      name: 'Hello World',
      description: 'Basic hello world program',
      category: 'basic',
      code: `console.log("Hello, World!");`,
      tags: ['basic', 'output']
    },
    {
      id: 'js-function',
      name: 'Function Declaration',
      description: 'Basic function structure',
      category: 'functions',
      code: `function greet(name) {
    return \`Hello, \${name}!\`;
}

// Call the function
const message = greet("World");
console.log(message);`,
      tags: ['functions', 'template-literals']
    },
    {
      id: 'js-arrow',
      name: 'Arrow Function',
      description: 'ES6 arrow function syntax',
      category: 'functions',
      code: `const greet = (name) => {
    return \`Hello, \${name}!\`;
};

// Shorter syntax
const greetShort = name => \`Hello, \${name}!\`;

console.log(greet("World"));
console.log(greetShort("JavaScript"));`,
      tags: ['functions', 'es6', 'arrow-function']
    },
    {
      id: 'js-class',
      name: 'Class Definition',
      description: 'ES6 class structure',
      category: 'oop',
      code: `class Person {
    constructor(name, age) {
        this.name = name;
        this.age = age;
    }
    
    introduce() {
        return \`Hi, I'm \${this.name} and I'm \${this.age} years old.\`;
    }
}

// Create an instance
const person = new Person("Alice", 30);
console.log(person.introduce());`,
      tags: ['class', 'oop', 'constructor', 'es6']
    },
    {
      id: 'js-async',
      name: 'Async/Await',
      description: 'Asynchronous programming',
      category: 'async',
      code: `async function fetchData() {
    try {
        const response = await fetch('https://api.example.com/data');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Call the async function
fetchData().then(data => {
    console.log(data);
});`,
      tags: ['async', 'promises', 'fetch']
    }
  ],
  java: [
    {
      id: 'java-hello',
      name: 'Hello World',
      description: 'Basic hello world program',
      category: 'basic',
      code: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
      tags: ['basic', 'output', 'main']
    },
    {
      id: 'java-input',
      name: 'User Input',
      description: 'Getting user input with Scanner',
      category: 'basic',
      code: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        
        System.out.print("Enter your name: ");
        String name = scanner.nextLine();
        
        System.out.println("Hello, " + name + "!");
        
        scanner.close();
    }
}`,
      tags: ['input', 'scanner', 'import']
    },
    {
      id: 'java-method',
      name: 'Method Definition',
      description: 'Basic method structure',
      category: 'methods',
      code: `public class Main {
    public static String greet(String name) {
        return "Hello, " + name + "!";
    }
    
    public static void main(String[] args) {
        String message = greet("World");
        System.out.println(message);
    }
}`,
      tags: ['methods', 'static', 'return']
    },
    {
      id: 'java-class',
      name: 'Class Definition',
      description: 'Basic class structure',
      category: 'oop',
      code: `class Person {
    private String name;
    private int age;
    
    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }
    
    public String introduce() {
        return "Hi, I'm " + name + " and I'm " + age + " years old.";
    }
}

public class Main {
    public static void main(String[] args) {
        Person person = new Person("Alice", 30);
        System.out.println(person.introduce());
    }
}`,
      tags: ['class', 'oop', 'constructor', 'private', 'public']
    }
  ]
};

const CATEGORIES = {
  basic: { name: 'Basic', icon: '📚', color: 'from-blue-500 to-cyan-500' },
  functions: { name: 'Functions', icon: '⚡', color: 'from-yellow-500 to-orange-500' },
  methods: { name: 'Methods', icon: '⚡', color: 'from-yellow-500 to-orange-500' },
  oop: { name: 'OOP', icon: '🏗️', color: 'from-purple-500 to-pink-500' },
  loops: { name: 'Loops', icon: '🔄', color: 'from-green-500 to-emerald-500' },
  async: { name: 'Async', icon: '⏱️', color: 'from-indigo-500 to-purple-500' },
  'file-io': { name: 'File I/O', icon: '📁', color: 'from-gray-500 to-slate-500' }
};

const CodeSnippetsManager = ({ language, onSelectSnippet, currentCode }) => {
  const { mode } = useMode();
  const [snippets, setSnippets] = useState([]);
  const [customSnippets, setCustomSnippets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showNewSnippetForm, setShowNewSnippetForm] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState(null);
  const [favorites, setFavorites] = useState(new Set());

  // New snippet form state
  const [newSnippet, setNewSnippet] = useState({
    name: '',
    description: '',
    category: 'basic',
    code: '',
    tags: ''
  });

  // Load snippets for current language
  useEffect(() => {
    const predefinedSnippets = PREDEFINED_SNIPPETS[language] || [];
    setSnippets(predefinedSnippets);
    
    // Load custom snippets from localStorage
    const savedCustomSnippets = localStorage.getItem(`custom-snippets-${language}`);
    if (savedCustomSnippets) {
      setCustomSnippets(JSON.parse(savedCustomSnippets));
    }

    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem(`favorite-snippets-${language}`);
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
  }, [language]);

  // Save custom snippets to localStorage
  useEffect(() => {
    localStorage.setItem(`custom-snippets-${language}`, JSON.stringify(customSnippets));
  }, [customSnippets, language]);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem(`favorite-snippets-${language}`, JSON.stringify([...favorites]));
  }, [favorites, language]);

  // Filter snippets based on search and category
  const filteredSnippets = [...snippets, ...customSnippets].filter(snippet => {
    const matchesSearch = searchTerm === '' || 
      snippet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      snippet.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      snippet.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || 
      selectedCategory === 'favorites' ? favorites.has(snippet.id) : snippet.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Handle snippet selection
  const handleSelectSnippet = (snippet) => {
    onSelectSnippet(snippet.code);
  };

  // Handle adding new snippet
  const handleAddSnippet = () => {
    if (!newSnippet.name.trim() || !newSnippet.code.trim()) return;

    const snippet = {
      id: `custom-${Date.now()}`,
      name: newSnippet.name,
      description: newSnippet.description,
      category: newSnippet.category,
      code: newSnippet.code,
      tags: newSnippet.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      isCustom: true
    };

    if (editingSnippet) {
      setCustomSnippets(prev => prev.map(s => s.id === editingSnippet.id ? { ...snippet, id: editingSnippet.id } : s));
      setEditingSnippet(null);
    } else {
      setCustomSnippets(prev => [...prev, snippet]);
    }

    setNewSnippet({ name: '', description: '', category: 'basic', code: '', tags: '' });
    setShowNewSnippetForm(false);
  };

  // Handle editing snippet
  const handleEditSnippet = (snippet) => {
    setNewSnippet({
      name: snippet.name,
      description: snippet.description,
      category: snippet.category,
      code: snippet.code,
      tags: snippet.tags.join(', ')
    });
    setEditingSnippet(snippet);
    setShowNewSnippetForm(true);
  };

  // Handle deleting snippet
  const handleDeleteSnippet = (snippetId) => {
    setCustomSnippets(prev => prev.filter(s => s.id !== snippetId));
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      newFavorites.delete(snippetId);
      return newFavorites;
    });
  };

  // Toggle favorite
  const toggleFavorite = (snippetId) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(snippetId)) {
        newFavorites.delete(snippetId);
      } else {
        newFavorites.add(snippetId);
      }
      return newFavorites;
    });
  };

  // Save current code as snippet
  const saveCurrentCode = () => {
    if (!currentCode.trim()) return;

    setNewSnippet({
      name: `Snippet ${new Date().toLocaleTimeString()}`,
      description: 'Saved from editor',
      category: 'basic',
      code: currentCode,
      tags: 'custom'
    });
    setShowNewSnippetForm(true);
  };

  // Get available categories
  const availableCategories = ['all', 'favorites', ...new Set([...snippets, ...customSnippets].map(s => s.category))];

  return (
    <Card className={`${mode === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} h-full`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className={`text-lg ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            Code Snippets
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              onClick={saveCurrentCode}
              variant="outline"
              size="sm"
              disabled={!currentCode.trim()}
            >
              <Save className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => setShowNewSnippetForm(true)}
              variant="outline"
              size="sm"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${mode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
          <input
            type="text"
            placeholder="Search snippets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg text-sm ${
              mode === 'dark' 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500'
            } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {availableCategories.map(category => {
            const categoryConfig = CATEGORIES[category] || { name: category, icon: '📁', color: 'from-gray-500 to-gray-600' };
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === category
                    ? `bg-gradient-to-r ${categoryConfig.color} text-white`
                    : `${mode === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`
                }`}
              >
                <span className="mr-1">{category === 'all' ? '🗂️' : category === 'favorites' ? '⭐' : categoryConfig.icon}</span>
                {category === 'all' ? 'All' : category === 'favorites' ? 'Favorites' : categoryConfig.name}
              </button>
            );
          })}
        </div>

        {/* Snippets List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredSnippets.length === 0 ? (
            <div className={`text-center py-8 ${mode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No snippets found</p>
              <p className="text-sm">Try adjusting your search or add a new snippet</p>
            </div>
          ) : (
            filteredSnippets.map(snippet => (
              <div
                key={snippet.id}
                className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                  mode === 'dark' 
                    ? 'border-gray-700 hover:bg-gray-700 bg-gray-800' 
                    : 'border-gray-200 hover:bg-gray-50 bg-white'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className={`font-medium ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {snippet.name}
                      </h4>
                      <span className={`text-xs px-2 py-1 rounded ${
                        mode === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {CATEGORIES[snippet.category]?.name || snippet.category}
                      </span>
                    </div>
                    <p className={`text-sm ${mode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {snippet.description}
                    </p>
                    {snippet.tags && snippet.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {snippet.tags.map(tag => (
                          <span
                            key={tag}
                            className={`text-xs px-2 py-1 rounded-full ${
                              mode === 'dark' ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-1 ml-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(snippet.id);
                      }}
                      className={`p-1 rounded ${
                        favorites.has(snippet.id)
                          ? 'text-yellow-500 hover:text-yellow-600'
                          : `${mode === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-600'}`
                      }`}
                    >
                      {favorites.has(snippet.id) ? <Star className="h-4 w-4 fill-current" /> : <StarOff className="h-4 w-4" />}
                    </button>
                    {snippet.isCustom && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditSnippet(snippet);
                          }}
                          className={`p-1 rounded ${mode === 'dark' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-600'}`}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSnippet(snippet.id);
                          }}
                          className="p-1 rounded text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <pre className={`text-xs font-mono truncate ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {snippet.code.split('\n')[0]}...
                  </pre>
                  <Button
                    onClick={() => handleSelectSnippet(snippet)}
                    variant="outline"
                    size="sm"
                    className="ml-2"
                  >
                    <Code className="h-3 w-3 mr-1" />
                    Use
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* New Snippet Form */}
        {showNewSnippetForm && (
          <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50`}>
            <div className={`max-w-2xl w-full mx-4 p-6 rounded-lg ${mode === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
              <h3 className={`text-lg font-medium mb-4 ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {editingSnippet ? 'Edit Snippet' : 'Add New Snippet'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${mode === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    Name
                  </label>
                  <input
                    type="text"
                    value={newSnippet.name}
                    onChange={(e) => setNewSnippet(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full px-3 py-2 rounded border ${
                      mode === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Snippet name..."
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${mode === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    Description
                  </label>
                  <input
                    type="text"
                    value={newSnippet.description}
                    onChange={(e) => setNewSnippet(prev => ({ ...prev, description: e.target.value }))}
                    className={`w-full px-3 py-2 rounded border ${
                      mode === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Brief description..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${mode === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                      Category
                    </label>
                    <select
                      value={newSnippet.category}
                      onChange={(e) => setNewSnippet(prev => ({ ...prev, category: e.target.value }))}
                      className={`w-full px-3 py-2 rounded border ${
                        mode === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      {Object.entries(CATEGORIES).map(([key, category]) => (
                        <option key={key} value={key}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${mode === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={newSnippet.tags}
                      onChange={(e) => setNewSnippet(prev => ({ ...prev, tags: e.target.value }))}
                      className={`w-full px-3 py-2 rounded border ${
                        mode === 'dark' 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="tag1, tag2, tag3..."
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${mode === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>
                    Code
                  </label>
                  <textarea
                    value={newSnippet.code}
                    onChange={(e) => setNewSnippet(prev => ({ ...prev, code: e.target.value }))}
                    className={`w-full px-3 py-2 rounded border font-mono text-sm ${
                      mode === 'dark' 
                        ? 'bg-gray-700 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    rows={10}
                    placeholder="Enter your code here..."
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <Button
                    onClick={() => {
                      setShowNewSnippetForm(false);
                      setEditingSnippet(null);
                      setNewSnippet({ name: '', description: '', category: 'basic', code: '', tags: '' });
                    }}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddSnippet}
                    disabled={!newSnippet.name.trim() || !newSnippet.code.trim()}
                  >
                    {editingSnippet ? 'Update' : 'Add'} Snippet
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CodeSnippetsManager;