import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../components/ui/button';
import { 
  Play, 
  Download, 
  Copy, 
  Trash2, 
  Settings, 
  Code, 
  Terminal,
  Clock,
  HardDrive,
  AlertCircle,
  CheckCircle,
  Loader2,
  RefreshCw,
  Maximize2,
  Cpu,
  Zap,
  Save,
  Share2,
  History,
  X,
  Edit2,
  Layout,
  Package
} from 'lucide-react';
import codeExecutionService from '../services/codeExecutionService';

// Professional code templates for different languages
const CODE_TEMPLATES = {
  python: `# Welcome to Python Playground
def main():
    print("Hello, Python World!")
    
    # Write your Python code here
    name = "Developer"
    print(f"Hello, {name}!")

if __name__ == "__main__":
    main()`,

  javascript: `// Welcome to JavaScript Playground
function main() {
    console.log("Hello, JavaScript World!");
    
    // Write your JavaScript code here
    const name = "Developer";
    console.log(\`Hello, \${name}!\`);
}

main();`,

  java: `// Welcome to Java Playground
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Java World!");
        
        // Write your Java code here
        String name = "Developer";
        System.out.println("Hello, " + name + "!");
    }
}`,

  cpp: `// Welcome to C++ Playground
#include <iostream>
#include <string>
using namespace std;

int main() {
    cout << "Hello, C++ World!" << endl;
    
    // Write your C++ code here
    string name = "Developer";
    cout << "Hello, " << name << "!" << endl;
    
    return 0;
}`,

  c: `// Welcome to C Playground
#include <stdio.h>

int main() {
    printf("Hello, C World!\\n");
    
    // Write your C code here
    char name[] = "Developer";
    printf("Hello, %s!\\n", name);
    
    return 0;
}`,

  go: `// Welcome to Go Playground
package main

import "fmt"

func main() {
    fmt.Println("Hello, Go World!")
    
    // Write your Go code here
    name := "Developer"
    fmt.Printf("Hello, %s!\\n", name)
}`,

  rust: `// Welcome to Rust Playground
fn main() {
    println!("Hello, Rust World!");
    
    // Write your Rust code here
    let name = "Developer";
    println!("Hello, {}!", name);
}`,

  php: `<?php
// Welcome to PHP Playground
echo "Hello, PHP World!\\n";

// Write your PHP code here
$name = "Developer";
echo "Hello, $name!\\n";
?>`,

  ruby: `# Welcome to Ruby Playground
puts "Hello, Ruby World!"

# Write your Ruby code here
name = "Developer"
puts "Hello, #{name}!"`,

  typescript: `// Welcome to TypeScript Playground
function main(): void {
    console.log("Hello, TypeScript World!");
    
    // Write your TypeScript code here
    const name: string = "Developer";
    console.log(\`Hello, \${name}!\`);
}

main();`
};

// Enhanced language configurations
const LANGUAGE_CONFIGS = {
  python: { 
    name: 'Python', 
    icon: '🐍', 
    color: 'text-blue-500',
    bg: 'bg-blue-50',
    extension: '.py',
    description: 'High-level programming language'
  },
  javascript: { 
    name: 'JavaScript', 
    icon: '⚡', 
    color: 'text-yellow-500',
    bg: 'bg-yellow-50',
    extension: '.js',
    description: 'Dynamic web programming language'
  },
  java: { 
    name: 'Java', 
    icon: '☕', 
    color: 'text-red-500',
    bg: 'bg-red-50',
    extension: '.java',
    description: 'Object-oriented programming language'
  },
  cpp: { 
    name: 'C++', 
    icon: '⚙️', 
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    extension: '.cpp',
    description: 'Systems programming language'
  },
  c: { 
    name: 'C', 
    icon: '🔧', 
    color: 'text-gray-600',
    bg: 'bg-gray-50',
    extension: '.c',
    description: 'Low-level programming language'
  },
  go: { 
    name: 'Go', 
    icon: '🚀', 
    color: 'text-cyan-500',
    bg: 'bg-cyan-50',
    extension: '.go',
    description: 'Modern systems language'
  },
  rust: { 
    name: 'Rust', 
    icon: '🦀', 
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    extension: '.rs',
    description: 'Memory-safe systems language'
  },
  php: { 
    name: 'PHP', 
    icon: '🐘', 
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    extension: '.php',
    description: 'Server-side scripting language'
  },
  ruby: { 
    name: 'Ruby', 
    icon: '💎', 
    color: 'text-red-500',
    bg: 'bg-red-50',
    extension: '.rb',
    description: 'Dynamic programming language'
  },
  typescript: { 
    name: 'TypeScript', 
    icon: '📘', 
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    extension: '.ts',
    description: 'Typed JavaScript superset'
  }
};

const CompilerPage = () => {
  // Core state
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  const [code, setCode] = useState(CODE_TEMPLATES.python);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  
  // Performance metrics
  const [executionTime, setExecutionTime] = useState(0);
  const [memoryUsage, setMemoryUsage] = useState(0);
  const [executionResult, setExecutionResult] = useState(null);
  
  // UI state
  const [fontSize, setFontSize] = useState(14);
  const [showSettings, setShowSettings] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [visibleLanguages, setVisibleLanguages] = useState(Object.keys(LANGUAGE_CONFIGS));
  const [activeSettingsTab, setActiveSettingsTab] = useState('editor'); // 'editor', 'languages', 'api'
  
  // History & Save state
  const [savedCodes, setSavedCodes] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [editingId, setEditingId] = useState(null);

  // Package Manager State
  const [showPackages, setShowPackages] = useState(false);
  const [installCommand, setInstallCommand] = useState('');
  const [installedPackages, setInstalledPackages] = useState([]);
  const [isInstalling, setIsInstalling] = useState(false);

  // Refs
  const codeRef = useRef(null);
  const outputRef = useRef(null);

  // Load saved codes from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('compiler_saved_codes');
    if (saved) {
      try {
        setSavedCodes(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved codes', e);
      }
    }
  }, []);

  // Save codes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('compiler_saved_codes', JSON.stringify(savedCodes));
  }, [savedCodes]);

  // Handle language change
  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
    setCode(CODE_TEMPLATES[language] || '');
    setOutput('');
    setExecutionResult(null);
    setInput('');
  };

  // History Management Functions
  const handleSaveClick = () => {
    setSaveName('');
    setEditingId(null);
    setShowSaveDialog(true);
  };

  const confirmSave = () => {
    if (!saveName.trim()) {
      alert('Please enter a name for your code');
      return;
    }

    const newCode = {
      id: editingId || Date.now().toString(),
      name: saveName,
      language: selectedLanguage,
      code: code,
      timestamp: new Date().toISOString()
    };

    if (editingId) {
      setSavedCodes(prev => prev.map(item => item.id === editingId ? newCode : item));
    } else {
      setSavedCodes(prev => [newCode, ...prev]);
    }

    setShowSaveDialog(false);
    setSaveName('');
    setEditingId(null);
    alert('Code saved successfully!');
  };

  const loadCode = (savedItem) => {
    if (window.confirm('Loading this code will replace your current editor content. Are you sure?')) {
      setSelectedLanguage(savedItem.language);
      setCode(savedItem.code);
      setIsHistoryOpen(false);
    }
  };

  const deleteCode = (id) => {
    if (window.confirm('Are you sure you want to delete this saved code?')) {
      setSavedCodes(prev => prev.filter(item => item.id !== id));
    }
  };

  const startEdit = (savedItem) => {
    setSaveName(savedItem.name);
    setEditingId(savedItem.id);
    setShowSaveDialog(true);
    setIsHistoryOpen(false);
  };

  // Package Manager Functions
  const handleInstallPackage = () => {
    if (!installCommand.trim()) return;
    
    setIsInstalling(true);
    // Simulate installation delay
    setTimeout(() => {
      setInstalledPackages(prev => [...prev, {
        name: installCommand,
        version: '1.0.0', // Mock version
        timestamp: new Date().toISOString()
      }]);
      setInstallCommand('');
      setIsInstalling(false);
      alert(`Package installed successfully! (Mock)`);
    }, 1500);
  };

  // Professional code execution
  const executeCode = async () => {
    if (!code.trim()) {
      alert('Please enter some code to execute');
      return;
    }

    setIsExecuting(true);
    setOutput('');
    setExecutionTime(0);
    setMemoryUsage(0);
    setExecutionResult(null);

    try {
      const startTime = Date.now();
      const result = await codeExecutionService.executeCode(selectedLanguage, code, input);
      const endTime = Date.now();
      
      setExecutionTime(endTime - startTime);
      setMemoryUsage(Math.random() * 50 + 10); // Simulated memory usage
      setOutput(result.output || result.error || 'No output generated');
      setExecutionResult(result);

    } catch (err) {
      const errorMsg = err.message || 'An unexpected error occurred';
      setOutput(errorMsg);
      setExecutionResult({ success: false, error: errorMsg });
    } finally {
      setIsExecuting(false);
    }
  };

  // Utility functions
  const formatExecutionTime = (time) => {
    if (time < 1000) return `${time}ms`;
    return `${(time / 1000).toFixed(2)}s`;
  };

  const formatMemoryUsage = (memory) => {
    return `${memory.toFixed(1)}MB`;
  };

  const downloadCode = () => {
    const config = LANGUAGE_CONFIGS[selectedLanguage];
    const filename = `code${config?.extension || '.txt'}`;
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    alert('Code copied to clipboard!');
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    alert('Output copied to clipboard!');
  };

  const clearOutput = () => {
    setOutput('');
    setExecutionResult(null);
    setExecutionTime(0);
    setMemoryUsage(0);
  };

  const resetCode = () => {
    setCode(CODE_TEMPLATES[selectedLanguage] || '');
    setOutput('');
    setInput('');
    setExecutionResult(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 pt-20 pb-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            {/* Left: Title/History Button */}
            <button 
              onClick={() => setIsHistoryOpen(true)}
              className="group flex items-center gap-4 hover:bg-gray-50 p-3 rounded-2xl transition-all duration-200 focus:outline-none cursor-pointer text-left"
              title="Click to view Saved Codes History"
            >
              <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-2xl shadow-inner group-hover:bg-blue-200 transition-colors">
                <Code className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                  Code <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Studio</span>
                  <History className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity text-blue-600" />
                </h1>
                <p className="text-sm text-gray-500 font-medium group-hover:text-blue-600 transition-colors">
                  Interactive Learning Environment
                </p>
              </div>
            </button>
            
            {/* Right: Toolbar & Metrics */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
              {/* Execution Metrics (Inline) */}
              {executionResult && (
                <div className="hidden xl:flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                    <Clock className="w-4 h-4 text-blue-500" />
                    {formatExecutionTime(executionTime)}
                  </div>
                  <div className="w-px h-4 bg-gray-300"></div>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                    <HardDrive className="w-4 h-4 text-purple-500" />
                    {formatMemoryUsage(memoryUsage)}
                  </div>
                  <div className="w-px h-4 bg-gray-300"></div>
                  <div className={`flex items-center gap-1.5 text-sm font-bold ${executionResult.success ? 'text-green-600' : 'text-red-600'}`}>
                    {executionResult.success ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {executionResult.success ? 'Success' : 'Failed'}
                  </div>
                </div>
              )}

              {/* Toolbar Controls */}
              <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl shadow-lg border border-gray-100">
                {/* Language Selector */}
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-lg">{LANGUAGE_CONFIGS[selectedLanguage]?.icon}</span>
                  </div>
                  <select
                    value={selectedLanguage}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    className="block w-40 pl-10 pr-8 py-2.5 text-sm border-none focus:outline-none focus:ring-0 bg-gray-50 rounded-xl font-bold text-gray-900 cursor-pointer hover:bg-gray-100 transition-colors appearance-none"
                  >
                    {Object.entries(LANGUAGE_CONFIGS)
                      .filter(([lang]) => visibleLanguages.includes(lang))
                      .map(([lang, config]) => (
                      <option key={lang} value={lang}>
                        {config.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-px h-8 bg-gray-200 mx-1"></div>

                {/* Save Button */}
                <Button
                  onClick={handleSaveClick}
                  className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-4 py-2.5 rounded-xl font-semibold shadow-sm transition-all duration-200 flex items-center gap-2 h-10"
                  title="Save Code Snippet"
                >
                  <Save className="h-4 w-4 text-blue-600" />
                  <span className="hidden sm:inline">Save</span>
                </Button>

                {/* Run Button */}
                <Button
                  onClick={executeCode}
                  disabled={isExecuting || !code.trim()}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-md shadow-emerald-500/20 transition-all duration-200 flex items-center gap-2 h-10 min-w-[120px] justify-center"
                >
                  {isExecuting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Running...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 fill-current" />
                      <span>Run Code</span>
                    </>
                  )}
                </Button>
                
                {/* Settings Button */}
                <Button
                  onClick={() => setShowSettings(!showSettings)}
                  variant="ghost"
                  className={`px-2.5 py-2.5 rounded-xl transition-colors h-10 w-10 flex items-center justify-center ${showSettings ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900'}`}
                  title="Settings"
                >
                  <Settings className="h-5 w-5" />
                </Button>

                {/* Packages Button */}
                <Button
                  onClick={() => setShowPackages(true)}
                  variant="ghost"
                  className={`px-2.5 py-2.5 rounded-xl transition-colors h-10 w-10 flex items-center justify-center ${showPackages ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-900'}`}
                  title="Manage Packages"
                >
                  <Package className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Settings Modal */}
          {showSettings && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
                {/* Modal Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Settings className="w-6 h-6 text-blue-600" />
                    Editor Settings
                  </h3>
                  <button 
                    onClick={() => setShowSettings(false)}
                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Modal Tabs */}
                <div className="flex border-b border-gray-100 px-6">
                  <button
                    onClick={() => setActiveSettingsTab('editor')}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeSettingsTab === 'editor' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                  >
                    Editor & Appearance
                  </button>
                  <button
                    onClick={() => setActiveSettingsTab('languages')}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeSettingsTab === 'languages' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                  >
                    Language Management
                  </button>
                  <button
                    onClick={() => setActiveSettingsTab('api')}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeSettingsTab === 'api' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                  >
                    API & Execution
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 overflow-y-auto flex-1">
                  {activeSettingsTab === 'editor' && (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-4">Font Size: {fontSize}px</label>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-gray-500">12px</span>
                          <input 
                            type="range" 
                            min="12" 
                            max="24" 
                            value={fontSize} 
                            onChange={(e) => setFontSize(parseInt(e.target.value))}
                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                          />
                          <span className="text-xs text-gray-500">24px</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                              <Layout className="w-5 h-5 text-blue-600" />
                            </div>
                            <span className="font-medium text-gray-700">Show Grid Lines</span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={showGrid} 
                              onChange={(e) => setShowGrid(e.target.checked)} 
                              className="sr-only peer" 
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white rounded-lg shadow-sm">
                              <Code className="w-5 h-5 text-purple-600" />
                            </div>
                            <span className="font-medium text-gray-700">Line Numbers</span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={showLineNumbers} 
                              onChange={(e) => setShowLineNumbers(e.target.checked)} 
                              className="sr-only peer" 
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeSettingsTab === 'languages' && (
                    <div className="space-y-4">
                      <p className="text-sm text-gray-500 mb-4">Select which languages should appear in the dropdown menu.</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {Object.entries(LANGUAGE_CONFIGS).map(([lang, config]) => (
                          <label key={lang} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${visibleLanguages.includes(lang) ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                            <input 
                              type="checkbox"
                              checked={visibleLanguages.includes(lang)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setVisibleLanguages(prev => [...prev, lang]);
                                } else {
                                  if (visibleLanguages.length > 1) {
                                    setVisibleLanguages(prev => prev.filter(l => l !== lang));
                                  } else {
                                    alert("You must have at least one language visible.");
                                  }
                                }
                              }}
                              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-lg">{config.icon}</span>
                            <span className="font-medium text-gray-700">{config.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeSettingsTab === 'api' && (
                    <div className="space-y-6">
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                        <div>
                          <h4 className="font-bold text-yellow-800 text-sm">Advanced Configuration</h4>
                          <p className="text-xs text-yellow-700 mt-1">
                            Modifying these settings may affect code execution stability. Only change if you know what you're doing.
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Execution Timeout (ms)</label>
                        <input 
                          type="number" 
                          placeholder="Default: 5000"
                          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Custom API Endpoint</label>
                        <input 
                          type="text" 
                          placeholder="https://api.codingsociety.com/execute"
                          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
                  <Button onClick={() => setShowSettings(false)} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6">
                    Done
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Editor Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden flex flex-col h-[600px]">
              {/* Editor Toolbar */}
              <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${LANGUAGE_CONFIGS[selectedLanguage]?.bg}`}>
                    <Code className={`w-5 h-5 ${LANGUAGE_CONFIGS[selectedLanguage]?.color}`} />
                  </div>
                  <span className="font-bold text-gray-900">main{LANGUAGE_CONFIGS[selectedLanguage]?.extension}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={resetCode} className="text-gray-500 hover:text-gray-900">
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={copyCode} className="text-gray-500 hover:text-gray-900">
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={downloadCode} className="text-gray-500 hover:text-gray-900">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Editor Area */}
              <div className="flex-1 relative flex overflow-hidden">
                {/* Line Numbers */}
                {showLineNumbers && (
                  <div className="bg-gray-50 border-r border-gray-200 py-4 px-3 text-right select-none overflow-hidden">
                    {code.split('\n').map((_, i) => (
                      <div key={i} className="text-xs text-gray-400 font-mono leading-6">
                        {i + 1}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Text Area */}
                <textarea
                  ref={codeRef}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className={`flex-1 p-4 font-mono text-sm resize-none border-none outline-none bg-white text-gray-800 leading-6 ${showGrid ? 'bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:20px_20px]' : ''}`}
                  spellCheck={false}
                  style={{ fontSize: `${fontSize}px` }}
                  onKeyDown={(e) => {
                    if (e.key === 'Tab') {
                      e.preventDefault();
                      const start = e.target.selectionStart;
                      const end = e.target.selectionEnd;
                      const value = e.target.value;
                      setCode(value.substring(0, start) + '  ' + value.substring(end));
                      setTimeout(() => {
                        e.target.selectionStart = e.target.selectionEnd = start + 2;
                      }, 0);
                    }
                    if (e.ctrlKey && e.key === 'Enter') {
                      e.preventDefault();
                      executeCode();
                    }
                  }}
                />
              </div>
              
              {/* Editor Footer */}
              <div className="bg-gray-50 border-t border-gray-200 px-6 py-2 flex items-center justify-between text-xs text-gray-500">
                <div className="flex gap-4">
                  <span>Ln {code.split('\n').length}, Col {code.length}</span>
                  <span>UTF-8</span>
                </div>
                <div className="flex gap-4">
                  <span>{LANGUAGE_CONFIGS[selectedLanguage]?.name}</span>
                  <span>Spaces: 2</span>
                </div>
              </div>
            </div>
          </div>

          {/* Output & Info Column */}
          <div className="space-y-6">
            {/* Output Panel */}
            <div className="bg-gray-900 rounded-3xl shadow-xl overflow-hidden flex flex-col h-[400px]">
              <div className="bg-gray-800 px-6 py-4 flex items-center justify-between border-b border-gray-700">
                <div className="flex items-center gap-2 text-white font-bold">
                  <Terminal className="w-5 h-5 text-green-400" />
                  Console Output
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={copyOutput} className="text-gray-400 hover:text-white">
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={clearOutput} className="text-gray-400 hover:text-white">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 p-4 font-mono text-sm overflow-auto bg-gray-900 text-gray-300">
                {output ? (
                  <pre className="whitespace-pre-wrap">{output}</pre>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-gray-600">
                    <Terminal className="w-12 h-12 mb-4 opacity-20" />
                    <p>Run code to see output</p>
                  </div>
                )}
              </div>
            </div>

            {/* Input Panel */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
              <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 font-bold text-gray-700 flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-500" />
                Standard Input (stdin)
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter input values here..."
                className="w-full p-4 h-32 resize-none border-none outline-none text-sm font-mono text-gray-700 placeholder-gray-400"
              />
            </div>

            {/* Metrics Panel - Hidden on desktop as it's now in header, visible on mobile */}
            {executionResult && (
              <div className="xl:hidden bg-white rounded-3xl border border-gray-100 shadow-xl p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-purple-600" />
                  Execution Metrics
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-xl">
                    <div className="text-xs text-gray-500 mb-1">Time</div>
                    <div className="font-mono font-bold text-gray-900 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      {formatExecutionTime(executionTime)}
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl">
                    <div className="text-xs text-gray-500 mb-1">Memory</div>
                    <div className="font-mono font-bold text-gray-900 flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-purple-500" />
                      {formatMemoryUsage(memoryUsage)}
                    </div>
                  </div>
                  <div className="col-span-2 bg-gray-50 p-3 rounded-xl">
                    <div className="text-xs text-gray-500 mb-1">Status</div>
                    <div className={`font-bold flex items-center gap-2 ${executionResult.success ? 'text-green-600' : 'text-red-600'}`}>
                      {executionResult.success ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Success
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4" />
                          Failed
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* History Sidebar */}
      <div className={`fixed top-16 bottom-0 right-0 w-96 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 border-l border-gray-100 ${isHistoryOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <History className="w-5 h-5 text-blue-600" />
              Saved Codes
            </h2>
            <button onClick={() => setIsHistoryOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {savedCodes.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <Save className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No saved codes yet</p>
              </div>
            ) : (
              savedCodes.map((item) => (
                <div key={item.id} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-gray-900">{item.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${LANGUAGE_CONFIGS[item.language]?.bg} ${LANGUAGE_CONFIGS[item.language]?.color}`}>
                          {LANGUAGE_CONFIGS[item.language]?.name}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => startEdit(item)}
                        className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                        title="Edit Name"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deleteCode(item.id)}
                        className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <Button 
                    onClick={() => loadCode(item)}
                    variant="outline" 
                    className="w-full mt-2 text-sm h-8 border-blue-100 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                  >
                    Load Code
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Overlay for Sidebar */}
      {isHistoryOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setIsHistoryOpen(false)}
        />
      )}

      {/* Package Manager Modal */}
      {showPackages && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Package className="w-6 h-6 text-blue-600" />
                Package Manager
              </h3>
              <button 
                onClick={() => setShowPackages(false)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Install New Package</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Terminal className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={installCommand}
                      onChange={(e) => setInstallCommand(e.target.value)}
                      placeholder="e.g. pip install numpy"
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono text-sm"
                      onKeyDown={(e) => e.key === 'Enter' && handleInstallPackage()}
                    />
                  </div>
                  <Button 
                    onClick={handleInstallPackage}
                    disabled={isInstalling || !installCommand.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4"
                  >
                    {isInstalling ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Install'}
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Supports pip (Python), npm (Node.js), cargo (Rust), etc.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Installed Packages
                </h4>
                <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 min-h-[150px] max-h-[300px] overflow-y-auto">
                  {installedPackages.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">
                      <Package className="w-8 h-8 mx-auto mb-2 opacity-20" />
                      <p className="text-sm">No packages installed yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {installedPackages.map((pkg, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                          <div className="font-mono text-sm font-medium text-gray-700">{pkg.name}</div>
                          <div className="text-xs text-gray-400">v{pkg.version}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 bg-gray-50">
              <h3 className="text-xl font-bold text-gray-900">
                {editingId ? 'Update Saved Code' : 'Save Code Snippet'}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="e.g., Binary Search Implementation"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && confirmSave()}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowSaveDialog(false)}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={confirmSave}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                >
                  {editingId ? 'Update' : 'Save'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompilerPage;