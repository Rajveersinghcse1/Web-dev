import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import CodeEditor from '../components/CodeEditor';
import ApiStatusIndicator from '../components/ApiStatusIndicator';
import codeExecutionService from '../services/codeExecutionService';
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
  Cpu
} from 'lucide-react';

/**
 * Ultra-Advanced Coding Page
 * Features:
 * - Multiple language support
 * - Real-time code execution
 * - Proper pattern rendering with monospace fonts
 * - Split view editor and output
 * - Input/Output support
 * - Execution statistics
 * - Error handling with detailed messages
 * - Theme switching
 * - Code saving and sharing
 */
const CodingPage = () => {
  // Language templates with proper examples
  const LANGUAGE_TEMPLATES = {
    python: `# Pattern Examples
n = 5

# Simple pyramid pattern with stars and spaces
for i in range(1, n + 1):
    print("* " * i)

print()  # Empty line

# Diamond pattern
for i in range(1, n + 1):
    print(" " * (n - i) + "*" * (2 * i - 1))

for i in range(n - 1, 0, -1):
    print(" " * (n - i) + "*" * (2 * i - 1))`,
    
    javascript: `// JavaScript Pattern Example
const n = 5;

// Upper half
for (let i = 1; i <= n; i++) {
  console.log(" ".repeat(n - i) + "*".repeat(2 * i - 1));
}

// Lower half  
for (let i = n - 1; i >= 1; i--) {
  console.log(" ".repeat(n - i) + "*".repeat(2 * i - 1));
}`,
    
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
    { id: 'python', name: 'Python', icon: '🐍' },
    { id: 'javascript', name: 'JavaScript', icon: '📜' },
    { id: 'java', name: 'Java', icon: '☕' },
    { id: 'cpp', name: 'C++', icon: '⚡' },
    { id: 'go', name: 'Go', icon: '🚀' }
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
          exitCode: result.exitCode || 0
        });
      } else {
        setError(result.error || 'Execution failed');
        setOutput(result.combinedOutput || result.error || 'An error occurred');
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
      } else if (activeLanguage === 'javascript' || activeLanguage === 'java' || activeLanguage === 'cpp') {
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
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-blue-50'} pt-16`}>
      <div className="max-w-full mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              <Code2 className="inline w-8 h-8 mr-2" />
              Ultra Code Editor
            </h1>
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              Write, run, and debug code with advanced features and proper pattern rendering
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* API Status Indicator */}
            <ApiStatusIndicator />
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-9"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSplitView(splitView === 'horizontal' ? 'vertical' : 'horizontal')}
              className="h-9"
            >
              <Maximize2 className="w-4 h-4 mr-1" />
              {splitView === 'horizontal' ? 'Vertical' : 'Horizontal'}
            </Button>
          </div>
        </div>

        {/* Language Selector */}
        <div className="flex items-center gap-2 mb-4">
          {languages.map((lang) => (
            <Button
              key={lang.id}
              variant={activeLanguage === lang.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => changeLanguage(lang.id)}
              className={`h-10 ${activeLanguage === lang.id ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
            >
              <span className="mr-2">{lang.icon}</span>
              {lang.name}
            </Button>
          ))}
        </div>

        {/* Main Editor Area */}
        <div className={`grid ${splitView === 'horizontal' ? 'grid-cols-2' : 'grid-cols-1'} gap-6`}>
          {/* Code Editor Panel */}
          <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'} ${splitView === 'vertical' ? 'min-h-[500px]' : 'min-h-[700px]'}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className={`text-lg ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Code Editor
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    onClick={isRunning ? stopExecution : runCode}
                    disabled={!code.trim()}
                    className={isRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
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
                  <Button variant="outline" size="sm" onClick={resetCode}>
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0 h-[calc(100%-80px)]">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={handleKeyDown}
                className={`w-full h-full p-4 font-mono text-sm resize-none focus:outline-none border-none ${
                  theme === 'dark' 
                    ? 'bg-gray-900 text-gray-100' 
                    : 'bg-white text-gray-900'
                }`}
                style={{
                  fontFamily: '"Fira Code", "Cascadia Code", "Consolas", "Monaco", monospace',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  tabSize: 4
                }}
                spellCheck="false"
                placeholder="Start coding here..."
              />
            </CardContent>
          </Card>

          {/* Output Panel */}
          <div className="space-y-4">
            {/* Input Area */}
            <Card className={theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}>
              <CardHeader className="pb-3">
                <CardTitle className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  <Terminal className="inline w-4 h-4 mr-2" />
                  Input (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className={`w-full h-24 p-3 font-mono text-sm rounded border resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    theme === 'dark'
                      ? 'bg-gray-900 text-gray-100 border-gray-700'
                      : 'bg-gray-50 text-gray-900 border-gray-200'
                  }`}
                  placeholder="Enter input (one per line)..."
                  style={{
                    fontFamily: '"Fira Code", "Cascadia Code", "Consolas", "Monaco", monospace'
                  }}
                />
              </CardContent>
            </Card>

            {/* Output Area */}
            <Card className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'} ${splitView === 'horizontal' ? 'min-h-[500px]' : 'min-h-[400px]'}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className={`text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    <Terminal className="inline w-4 h-4 mr-2" />
                    Output
                  </CardTitle>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={copyOutput} className="h-8 w-8 p-0">
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={downloadOutput} className="h-8 w-8 p-0">
                      <Download className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                
                {/* Execution Stats */}
                {executionStats && (
                  <div className={`flex items-center gap-4 text-xs mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{executionStats.time}s</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Cpu className="w-3 h-3" />
                      <span>{executionStats.memory} KB</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {executionStats.exitCode === 0 ? (
                        <>
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          <span className="text-green-500">Success</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 text-red-500" />
                          <span className="text-red-500">Error</span>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </CardHeader>
              
              <CardContent>
                {error && (
                  <div className="bg-red-900/20 border border-red-500 rounded p-3 mb-3">
                    <div className="flex items-center gap-2 text-red-400 font-medium mb-1">
                      <XCircle className="w-4 h-4" />
                      Execution Error
                    </div>
                    <pre className="text-xs text-red-300 whitespace-pre-wrap font-mono">
                      {error}
                    </pre>
                  </div>
                )}
                
                <div
                  ref={outputRef}
                  className={`rounded p-4 overflow-auto font-mono text-sm whitespace-pre ${
                    theme === 'dark'
                      ? 'bg-gray-900 text-gray-100'
                      : 'bg-gray-50 text-gray-900'
                  }`}
                  style={{
                    fontFamily: '"Fira Code", "Cascadia Code", "Consolas", "Monaco", monospace',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    minHeight: '300px',
                    maxHeight: '500px'
                  }}
                >
                  {output || 'Click "Run Code" to see output here...'}
                  {isRunning && (
                    <div className="flex items-center gap-2 mt-2 text-green-400">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400"></div>
                      <span>Executing...</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tips Section */}
        <Card className={`mt-6 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-blue-500 text-xl">💡</span>
                <div className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                  <strong>Pattern Rendering:</strong> This editor properly displays patterns with monospace fonts and preserved whitespace.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500 text-xl">🎯</span>
                <div className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                  <strong>Error Handling:</strong> Detailed error messages help you debug issues quickly.
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-purple-500 text-xl">🚀</span>
                <div className={theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}>
                  <strong>Multi-Language:</strong> Supports Python, JavaScript, Java, C++, and more!
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CodingPage;
