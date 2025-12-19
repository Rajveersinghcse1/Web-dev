import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../components/ui/button';
import ApiStatusIndicator from '../components/ApiStatusIndicator';
import codeExecutionService from '../services/codeExecutionService';
import { useMode } from '../context/ModeContext';
import { 
  Play, 
  Square, 
  RotateCcw, 
  Save, 
  Share2, 
  Settings,
  Plus,
  X,
  FileText,
  Folder,
  Code2,
  Terminal,
  Moon,
  Sun,
  Maximize2,
  Copy,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Cpu,
  ChevronRight,
  Layout,
  BookOpen,
  GitBranch,
  Shield
} from 'lucide-react';

/**
 * Professional Code Studio
 * Features:
 * - Multiple language support
 * - Real-time code execution
 * - Context-aware templates (Study vs Professional)
 * - Split view editor and output
 * - Input/Output support
 * - Execution statistics
 */
const CodingPage = () => {
  const { currentMode, MODES } = useMode();
  
  // Language templates with proper examples
  const LANGUAGE_TEMPLATES = {
    python: currentMode === MODES.STUDY ? `# Pattern Examples
n = 5

# Simple pyramid pattern with stars and spaces
for i in range(1, n + 1):
    print("* " * i)

print()  # Empty line

# Diamond pattern
for i in range(1, n + 1):
    print(" " * (n - i) + "*" * (2 * i - 1))

for i in range(n - 1, 0, -1):
    print(" " * (n - i) + "*" * (2 * i - 1))` : `# Two Sum Implementation
def two_sum(nums, target):
    """
    Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.
    """
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []

# Test the function
nums = [2, 7, 11, 15]
target = 9
print(f"Input: nums = {nums}, target = {target}")
print(f"Output: {two_sum(nums, target)}")`,
    
    javascript: currentMode === MODES.STUDY ? `// JavaScript Pattern Example
const n = 5;

// Upper half
for (let i = 1; i <= n; i++) {
  console.log(" ".repeat(n - i) + "*".repeat(2 * i - 1));
}

// Lower half  
for (let i = n - 1; i >= 1; i--) {
  console.log(" ".repeat(n - i) + "*".repeat(2 * i - 1));
}` : `// Binary Search Implementation
function binarySearch(arr, target) {
    let left = 0;
    let right = arr.length - 1;

    while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        
        if (arr[mid] === target) {
            return mid;
        }
        
        if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    return -1;
}

// Test the function
const arr = [1, 3, 5, 7, 9, 11, 13, 15];
const target = 7;
console.log(\`Array: \${arr}\`);
console.log(\`Target: \${target}\`);
console.log(\`Index: \${binarySearch(arr, target)}\`);`,
    
    java: `public class Main {
    public static void main(String[] args) {
        int n = 5;
        
        // Upper half
        for (int i = 1; i <= n; i++) {
            System.out.println(" ".repeat(n - i) + "*".repeat(2 * i - 1));
        }
        
        // Lower half
        for (int i = n - 1; i >= 1; i--) {
            System.out.println(" ".repeat(n - i) + "*".repeat(2 * i - 1));
        }
    }
}`,
    
    cpp: `#include <iostream>
#include <string>
using namespace std;

int main() {
    int n = 5;
    
    // Upper half
    for (int i = 1; i <= n; i++) {
        cout << string(n - i, ' ') << string(2 * i - 1, '*') << endl;
    }
    
    // Lower half
    for (int i = n - 1; i >= 1; i--) {
        cout << string(n - i, ' ') << string(2 * i - 1, '*') << endl;
    }
    
    return 0;
}`,

    c: `#include <stdio.h>

int main() {
    int n = 5;
    int i, j;
    
    // Upper half
    for (i = 1; i <= n; i++) {
        // Print spaces
        for (j = 1; j <= n - i; j++) {
            printf(" ");
        }
        // Print stars
        for (j = 1; j <= 2 * i - 1; j++) {
            printf("*");
        }
        printf("\\n");
    }
    
    // Lower half
    for (i = n - 1; i >= 1; i--) {
        // Print spaces
        for (j = 1; j <= n - i; j++) {
            printf(" ");
        }
        // Print stars
        for (j = 1; j <= 2 * i - 1; j++) {
            printf("*");
        }
        printf("\\n");
    }
    
    return 0;
}`,

    go: `package main

import (
    "fmt"
    "strings"
)

func main() {
    n := 5
    
    // Upper half
    for i := 1; i <= n; i++ {
        spaces := strings.Repeat(" ", n-i)
        stars := strings.Repeat("*", 2*i-1)
        fmt.Println(spaces + stars)
    }
    
    // Lower half
    for i := n - 1; i >= 1; i-- {
        spaces := strings.Repeat(" ", n-i)
        stars := strings.Repeat("*", 2*i-1)
        fmt.Println(spaces + stars)
    }
}`
  };

  const [activeLanguage, setActiveLanguage] = useState('python');
  const [code, setCode] = useState(LANGUAGE_TEMPLATES.python);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [executionStats, setExecutionStats] = useState(null);
  const [error, setError] = useState(null);
  const [theme, setTheme] = useState('dark');
  const [splitView, setSplitView] = useState('horizontal'); // horizontal or vertical
  const outputRef = useRef(null);

  const languages = [
    { id: 'python', name: 'Python', icon: '🐍', color: 'text-blue-500' },
    { id: 'javascript', name: 'JavaScript', icon: '📜', color: 'text-yellow-500' },
    { id: 'java', name: 'Java', icon: '☕', color: 'text-red-500' },
    { id: 'cpp', name: 'C++', icon: '⚡', color: 'text-blue-700' },
    { id: 'c', name: 'C', icon: '🔧', color: 'text-slate-500' },
    { id: 'go', name: 'Go', icon: '🚀', color: 'text-cyan-500' }
  ];

  useEffect(() => {
    // Load saved code from localStorage
    const savedCode = localStorage.getItem(`code_${activeLanguage}`);
    if (savedCode) {
      setCode(savedCode);
    } else {
      setCode(LANGUAGE_TEMPLATES[activeLanguage] || '');
    }
  }, [activeLanguage]);

  useEffect(() => {
    // Save code to localStorage
    if (code) {
      localStorage.setItem(`code_${activeLanguage}`, code);
    }
  }, [code, activeLanguage]);

  const runCode = async () => {
    setIsRunning(true);
    setError(null);
    setOutput('Running code...\n');
    
    const startTime = Date.now();
    const executionId = `exec_${Date.now()}`;
    
    try {
      const result = await codeExecutionService.executeCode(
        activeLanguage,
        code,
        input,
        executionId
      );
      
      const endTime = Date.now();
      const executionTime = ((endTime - startTime) / 1000).toFixed(3);
      
      if (result.success) {
        setOutput(result.output || result.stdout || 'Code executed successfully!');
        setExecutionStats({
          time: result.executionTime || executionTime,
          memory: result.memoryUsage || 'N/A',
          exitCode: result.exitCode || 0,
          isSimulation: result.isSimulation
        });
      } else {
        setError(result.error || 'Execution failed');
        setOutput(result.combinedOutput || result.error || 'An error occurred');
        if (result.isSimulation) {
          setExecutionStats({
            time: result.executionTime || executionTime,
            memory: result.memoryUsage || 'N/A',
            exitCode: result.exitCode || 1,
            isSimulation: true
          });
        }
      }
    } catch (err) {
      setError(err.message);
      setOutput(`Error: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const stopExecution = () => {
    // In a real implementation, this would cancel the execution
    setIsRunning(false);
    setOutput(prev => prev + '\n\n[Execution stopped by user]');
  };

  const resetCode = () => {
    setCode(LANGUAGE_TEMPLATES[activeLanguage] || '');
    setOutput('');
    setInput('');
    setError(null);
    setExecutionStats(null);
  };

  const copyOutput = async () => {
    try {
      await navigator.clipboard.writeText(output);
      // Show success toast (you can implement a toast notification)
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadOutput = () => {
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `output_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const changeLanguage = (langId) => {
    setActiveLanguage(langId);
    setOutput('');
    setError(null);
    setExecutionStats(null);
  };

  // Handle key events for auto-indentation and tab support
  const handleKeyDown = (e) => {
    const textarea = e.target;
    const { selectionStart, selectionEnd, value } = textarea;

    // Tab key handling - insert 4 spaces
    if (e.key === 'Tab') {
      e.preventDefault();
      const newCode = value.substring(0, selectionStart) + '    ' + value.substring(selectionEnd);
      setCode(newCode);
      
      // Set cursor position after tab
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = selectionStart + 4;
      }, 0);
    }
    
    // Enter key handling - auto-indent for Python
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // Find the current line
      const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
      const lineText = value.substring(lineStart, selectionStart);
      
      // Calculate current indentation
      const indentMatch = lineText.match(/^(\s*)/);
      const currentIndent = indentMatch ? indentMatch[1] : '';
      
      // Determine if we need extra indentation
      let extraIndent = '';
      if (activeLanguage === 'python') {
        // Add extra indent if line ends with :
        if (lineText.trim().endsWith(':')) {
          extraIndent = '    ';
        }
        // Add extra indent for control structures
        else if (lineText.trim().match(/^(if|for|while|def|class|try|except|finally|with|elif|else)\b/)) {
          if (lineText.trim().endsWith(':')) {
            extraIndent = '    ';
          }
        }
      } else if (activeLanguage === 'javascript' || activeLanguage === 'java' || activeLanguage === 'cpp' || activeLanguage === 'c') {
        // Add extra indent if line ends with { or contains control structures
        if (lineText.trim().endsWith('{') || 
            lineText.trim().match(/^(if|for|while|function|class|try|catch)\b.*{?$/)) {
          extraIndent = '    ';
        }
      }
      
      const newCode = value.substring(0, selectionStart) + '\n' + currentIndent + extraIndent + value.substring(selectionEnd);
      setCode(newCode);
      
      // Set cursor position after indentation
      setTimeout(() => {
        const newPosition = selectionStart + 1 + currentIndent.length + extraIndent.length;
        textarea.selectionStart = textarea.selectionEnd = newPosition;
      }, 0);
    }
    
    // Backspace handling - smart dedent
    if (e.key === 'Backspace') {
      const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
      const beforeCursor = value.substring(lineStart, selectionStart);
      
      // If we're at the beginning of indentation, remove 4 spaces at once
      if (beforeCursor.match(/^\s+$/) && beforeCursor.length % 4 === 0 && beforeCursor.length > 0) {
        e.preventDefault();
        const newCode = value.substring(0, selectionStart - 4) + value.substring(selectionEnd);
        setCode(newCode);
        
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = selectionStart - 4;
        }, 0);
      }
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-300 ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'} font-sans`}>
      {/* Navigation Header */}
      <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'} border-b sticky top-0 z-40`}>
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${theme === 'dark' ? 'bg-blue-600/20 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                <Code2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className={`text-lg font-bold leading-none ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Code Studio</h1>
                <p className={`text-xs font-medium mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>
                  {currentMode === MODES.STUDY ? 'Interactive Learning Environment' : 'Professional Development Environment'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <ApiStatusIndicator />
              
              <div className={`h-6 w-px ${theme === 'dark' ? 'bg-slate-800' : 'bg-gray-200'}`}></div>
              
              <div className="flex items-center gap-2 bg-slate-100/5 p-1 rounded-lg border border-transparent">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className={`rounded-md h-8 w-8 p-0 ${theme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSplitView(splitView === 'horizontal' ? 'vertical' : 'horizontal')}
                  className={`rounded-md h-8 w-8 p-0 ${theme === 'dark' ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
                >
                  <Layout className="w-4 h-4" />
                </Button>
              </div>

              <Button className={`hidden sm:flex items-center gap-2 ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white border-none shadow-lg shadow-blue-500/20`}>
                <Share2 className="w-4 h-4" />
                Share Code
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Language Selector */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
          {languages.map((lang) => (
            <button
              key={lang.id}
              onClick={() => changeLanguage(lang.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap border ${
                activeLanguage === lang.id
                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20'
                  : theme === 'dark'
                    ? 'bg-slate-800 text-gray-400 border-slate-700 hover:bg-slate-700 hover:text-white'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="text-lg">{lang.icon}</span>
              {lang.name}
            </button>
          ))}
        </div>

        {/* Main Editor Area */}
        <div className={`grid ${splitView === 'horizontal' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'} gap-6`}>
          {/* Code Editor Panel */}
          <div className={`flex flex-col rounded-3xl overflow-hidden border shadow-xl transition-all duration-300 ${
            theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
          } ${splitView === 'vertical' ? 'min-h-[500px]' : 'min-h-[700px]'}`}>
            
            {/* Editor Toolbar */}
            <div className={`flex items-center justify-between px-6 py-4 border-b ${theme === 'dark' ? 'border-slate-700 bg-slate-900/50' : 'border-gray-100 bg-gray-50/50'}`}>
              <div className="flex items-center gap-2">
                <Code2 className={`w-5 h-5 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                <span className={`font-bold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Editor</span>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={resetCode} className={`rounded-lg ${theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-slate-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>
                  <RotateCcw className="w-4 h-4" />
                </Button>
                <Button
                  onClick={isRunning ? stopExecution : runCode}
                  disabled={!code.trim()}
                  className={`rounded-xl font-bold shadow-lg transition-all hover:scale-105 ${
                    isRunning 
                      ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20' 
                      : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-green-500/20'
                  }`}
                  size="sm"
                >
                  {isRunning ? (
                    <>
                      <Square className="w-4 h-4 mr-2" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Run Code
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            {/* Editor Content */}
            <div className="flex-1 relative group">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={handleKeyDown}
                className={`w-full h-full p-6 font-mono text-sm resize-none focus:outline-none border-none leading-relaxed ${
                  theme === 'dark' 
                    ? 'bg-slate-900 text-gray-100 selection:bg-blue-500/30' 
                    : 'bg-white text-gray-900 selection:bg-blue-100'
                }`}
                style={{
                  fontFamily: '"Fira Code", "Cascadia Code", "Consolas", "Monaco", monospace',
                  fontSize: '14px',
                  tabSize: 4
                }}
                spellCheck="false"
                placeholder="Start coding here..."
              />
            </div>
          </div>

          {/* Output Panel */}
          <div className="space-y-6 flex flex-col">
            {/* Input Area */}
            <div className={`rounded-3xl overflow-hidden border shadow-sm transition-all duration-300 ${
              theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
            }`}>
              <div className={`px-6 py-3 border-b ${theme === 'dark' ? 'border-slate-700 bg-slate-900/50' : 'border-gray-100 bg-gray-50/50'}`}>
                <span className={`text-sm font-bold flex items-center gap-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  <Terminal className="w-4 h-4" />
                  Input (Optional)
                </span>
              </div>
              <div className="p-0">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className={`w-full h-24 p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all ${
                    theme === 'dark'
                      ? 'bg-slate-800 text-gray-100 placeholder-gray-600'
                      : 'bg-white text-gray-900 placeholder-gray-400'
                  }`}
                  placeholder="Enter input (one per line)..."
                  style={{
                    fontFamily: '"Fira Code", "Cascadia Code", "Consolas", "Monaco", monospace'
                  }}
                />
              </div>
            </div>

            {/* Output Area */}
            <div className={`flex-1 flex flex-col rounded-3xl overflow-hidden border shadow-xl transition-all duration-300 ${
              theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
            } ${splitView === 'horizontal' ? 'min-h-[500px]' : 'min-h-[400px]'}`}>
              
              <div className={`flex items-center justify-between px-6 py-4 border-b ${theme === 'dark' ? 'border-slate-700 bg-slate-900/50' : 'border-gray-100 bg-gray-50/50'}`}>
                <div className="flex items-center gap-2">
                  <Terminal className={`w-5 h-5 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`} />
                  <span className={`font-bold ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Output</span>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={copyOutput} className={`h-8 w-8 p-0 rounded-lg ${theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-slate-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={downloadOutput} className={`h-8 w-8 p-0 rounded-lg ${theme === 'dark' ? 'text-gray-400 hover:text-white hover:bg-slate-700' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {/* Execution Stats */}
              {executionStats && (
                <div className={`px-6 py-2 border-b flex items-center gap-6 text-xs font-medium ${theme === 'dark' ? 'border-slate-700 bg-slate-800/50 text-gray-400' : 'border-gray-100 bg-gray-50/50 text-gray-600'}`}>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{executionStats.time}s</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>{executionStats.memory} KB</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {executionStats.exitCode === 0 ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-emerald-500">Success</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-red-500" />
                        <span className="text-red-500">Error</span>
                      </>
                    )}
                  </div>
                  {executionStats.isSimulation && (
                    <div className="flex items-center gap-1.5 text-yellow-500" title="Running in simulation mode. Some features may be limited.">
                      <Shield className="w-3.5 h-3.5" />
                      <span>Simulated</span>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex-1 relative">
                {error && (
                  <div className="absolute top-0 left-0 right-0 bg-red-500/10 border-b border-red-500/20 p-4 backdrop-blur-sm z-10">
                    <div className="flex items-center gap-2 text-red-500 font-bold mb-1 text-sm">
                      <XCircle className="w-4 h-4" />
                      Execution Error
                    </div>
                    <pre className="text-xs text-red-400 whitespace-pre-wrap font-mono pl-6">
                      {error}
                    </pre>
                  </div>
                )}
                
                <div
                  ref={outputRef}
                  className={`w-full h-full p-6 overflow-auto font-mono text-sm whitespace-pre leading-relaxed ${
                    theme === 'dark'
                      ? 'bg-slate-900 text-gray-300'
                      : 'bg-slate-50 text-gray-800'
                  }`}
                  style={{
                    fontFamily: '"Fira Code", "Cascadia Code", "Consolas", "Monaco", monospace',
                  }}
                >
                  {output || <span className="opacity-50 italic">Click "Run Code" to see output here...</span>}
                  {isRunning && (
                    <div className="flex items-center gap-2 mt-4 text-emerald-500 animate-pulse">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <span>Executing...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features & Tips Section */}
        <div className={`mt-8 rounded-3xl border p-8 ${theme === 'dark' ? 'bg-slate-800/50 border-slate-800' : 'bg-white border-gray-200 shadow-sm'}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${theme === 'dark' ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h4 className={`font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {currentMode === MODES.STUDY ? 'Pattern Recognition' : 'Algorithm Optimization'}
                </h4>
                <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                  {currentMode === MODES.STUDY 
                    ? 'Learn to identify common coding patterns. The editor highlights syntax to help you visualize structure.' 
                    : 'Analyze time and space complexity. Use the execution stats to optimize your solution performance.'}
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${theme === 'dark' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className={`font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Real-time Validation</h4>
                <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                  Instant feedback on your code execution. Error messages are parsed to be human-readable and actionable.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${theme === 'dark' ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-50 text-purple-600'}`}>
                <GitBranch className="w-6 h-6" />
              </div>
              <div>
                <h4 className={`font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Version Control</h4>
                <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-gray-600'}`}>
                  Your code is automatically saved locally. In Professional mode, you can push directly to your connected repository.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodingPage;

