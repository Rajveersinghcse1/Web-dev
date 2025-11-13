import React, { useState, useEffect, useRef } from 'react';
import { useMode } from '../context/ModeContext';
import { useNotifications } from '../context/NotificationContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Play, 
  Square, 
  Download, 
  Upload, 
  Copy, 
  Trash2, 
  Settings, 
  Code, 
  Terminal,
  FileText,
  Clock,
  HardDrive,
  AlertCircle,
  CheckCircle,
  Loader2,
  ChevronDown,
  Save,
  Share2,
  RefreshCw,
  Maximize2,
  Eye,
  BookOpen,
  Zap,
  Cpu
} from 'lucide-react';
import codeExecutionService from '../services/codeExecutionService';

// Professional code templates for different languages
const CODE_TEMPLATES = {
  python: `# Welcome to Python Playground
def main():
    print("Hello, Python World!")
    
    # Write your Python code here
    name = input("Enter your name: ")
    print(f"Hello, {name}!")

if __name__ == "__main__":
    main()`,

  javascript: `// Welcome to JavaScript Playground
function main() {
    console.log("Hello, JavaScript World!");
    
    // Write your JavaScript code here
    const name = prompt("Enter your name:");
    console.log(\`Hello, \${name}!\`);
}

main();`,

  java: `// Welcome to Java Playground
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Java World!");
        
        // Write your Java code here
        Scanner scanner = new Scanner(System.in);
        System.out.print("Enter your name: ");
        String name = scanner.nextLine();
        System.out.println("Hello, " + name + "!");
        scanner.close();
    }
}`,

  cpp: `// Welcome to C++ Playground
#include <iostream>
#include <string>
using namespace std;

int main() {
    cout << "Hello, C++ World!" << endl;
    
    // Write your C++ code here
    string name;
    cout << "Enter your name: ";
    getline(cin, name);
    cout << "Hello, " << name << "!" << endl;
    
    return 0;
}`,

  c: `// Welcome to C Playground
#include <stdio.h>
#include <string.h>

int main() {
    printf("Hello, C World!\\n");
    
    // Write your C code here
    char name[100];
    printf("Enter your name: ");
    fgets(name, sizeof(name), stdin);
    name[strcspn(name, "\\n")] = 0; // Remove newline
    printf("Hello, %s!\\n", name);
    
    return 0;
}`,

  go: `// Welcome to Go Playground
package main

import (
    "bufio"
    "fmt"
    "os"
    "strings"
)

func main() {
    fmt.Println("Hello, Go World!")
    
    // Write your Go code here
    reader := bufio.NewReader(os.Stdin)
    fmt.Print("Enter your name: ")
    name, _ := reader.ReadString('\\n')
    name = strings.TrimSpace(name)
    fmt.Printf("Hello, %s!\\n", name)
}`,

  rust: `// Welcome to Rust Playground
use std::io;

fn main() {
    println!("Hello, Rust World!");
    
    // Write your Rust code here
    println!("Enter your name:");
    let mut name = String::new();
    io::stdin().read_line(&mut name).expect("Failed to read line");
    let name = name.trim();
    println!("Hello, {}!", name);
}`,

  php: `<?php
// Welcome to PHP Playground
echo "Hello, PHP World!\\n";

// Write your PHP code here
echo "Enter your name: ";
$name = trim(fgets(STDIN));
echo "Hello, $name!\\n";
?>`,

  ruby: `# Welcome to Ruby Playground
puts "Hello, Ruby World!"

# Write your Ruby code here
print "Enter your name: "
name = gets.chomp
puts "Hello, #{name}!"`,

  kotlin: `// Welcome to Kotlin Playground
fun main() {
    println("Hello, Kotlin World!")
    
    // Write your Kotlin code here
    print("Enter your name: ")
    val name = readLine()
    println("Hello, $name!")
}`,

  swift: `// Welcome to Swift Playground
import Foundation

print("Hello, Swift World!")

// Write your Swift code here
print("Enter your name: ", terminator: "")
if let name = readLine() {
    print("Hello, \\(name)!")
}`,

  typescript: `// Welcome to TypeScript Playground
function main(): void {
    console.log("Hello, TypeScript World!");
    
    // Write your TypeScript code here
    const name: string = "Developer";
    console.log(\`Hello, \${name}!\`);
}

main();`
};

// Enhanced language configurations with professional styling
const LANGUAGE_CONFIGS = {
  python: { 
    name: 'Python', 
    icon: '🐍', 
    color: 'from-blue-500 to-green-500',
    extension: '.py',
    description: 'High-level programming language'
  },
  javascript: { 
    name: 'JavaScript', 
    icon: '⚡', 
    color: 'from-yellow-400 to-orange-500',
    extension: '.js',
    description: 'Dynamic web programming language'
  },
  java: { 
    name: 'Java', 
    icon: '☕', 
    color: 'from-red-500 to-orange-600',
    extension: '.java',
    description: 'Object-oriented programming language'
  },
  cpp: { 
    name: 'C++', 
    icon: '⚙️', 
    color: 'from-blue-600 to-purple-600',
    extension: '.cpp',
    description: 'Systems programming language'
  },
  c: { 
    name: 'C', 
    icon: '🔧', 
    color: 'from-gray-600 to-blue-600',
    extension: '.c',
    description: 'Low-level programming language'
  },
  go: { 
    name: 'Go', 
    icon: '🚀', 
    color: 'from-cyan-500 to-blue-500',
    extension: '.go',
    description: 'Modern systems language'
  },
  rust: { 
    name: 'Rust', 
    icon: '🦀', 
    color: 'from-orange-600 to-red-600',
    extension: '.rs',
    description: 'Memory-safe systems language'
  },
  php: { 
    name: 'PHP', 
    icon: '🐘', 
    color: 'from-purple-600 to-pink-600',
    extension: '.php',
    description: 'Server-side scripting language'
  },
  ruby: { 
    name: 'Ruby', 
    icon: '💎', 
    color: 'from-red-500 to-pink-500',
    extension: '.rb',
    description: 'Dynamic programming language'
  },
  kotlin: { 
    name: 'Kotlin', 
    icon: '🎯', 
    color: 'from-purple-500 to-indigo-500',
    extension: '.kt',
    description: 'Modern JVM language'
  },
  swift: { 
    name: 'Swift', 
    icon: '🦉', 
    color: 'from-orange-500 to-red-500',
    extension: '.swift',
    description: 'Apple platform language'
  },
  typescript: { 
    name: 'TypeScript', 
    icon: '📘', 
    color: 'from-blue-500 to-indigo-600',
    extension: '.ts',
    description: 'Typed JavaScript superset'
  }
};

const CompilerPage = () => {
  const { mode } = useMode();
  const { success, error, warning, info } = useNotifications();
  
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
  const [activeTab, setActiveTab] = useState('snippets');
  const [fontSize, setFontSize] = useState(14);
  const [showSettings, setShowSettings] = useState(false);
  const [codeHistory, setCodeHistory] = useState([]);
  
  // Refs
  const codeRef = useRef(null);
  const outputRef = useRef(null);

  // Simple syntax highlighting function
  const highlightCode = (code, language) => {
    if (!code) return '';
    
    // Basic syntax highlighting patterns
    const patterns = {
      python: {
        keywords: /\b(def|class|if|else|elif|for|while|try|except|finally|import|from|as|return|yield|lambda|with|global|nonlocal|assert|break|continue|pass|del|and|or|not|in|is|True|False|None)\b/g,
        strings: /(["'])((?:\\.|(?!\1)[^\\])*?)\1/g,
        comments: /#.*/g,
        numbers: /\b\d+\.?\d*\b/g,
        functions: /\b(\w+)(?=\s*\()/g
      },
      javascript: {
        keywords: /\b(function|var|let|const|if|else|for|while|do|switch|case|default|break|continue|return|try|catch|finally|throw|new|this|typeof|instanceof|delete|void|null|undefined|true|false)\b/g,
        strings: /(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g,
        comments: /\/\/.*|\/\*[\s\S]*?\*\//g,
        numbers: /\b\d+\.?\d*\b/g,
        functions: /\b(\w+)(?=\s*\()/g
      },
      typescript: {
        keywords: /\b(function|var|let|const|if|else|for|while|do|switch|case|default|break|continue|return|try|catch|finally|throw|new|this|typeof|instanceof|delete|void|null|undefined|true|false|interface|type|enum|class|extends|implements|public|private|protected|static|readonly)\b/g,
        strings: /(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g,
        comments: /\/\/.*|\/\*[\s\S]*?\*\//g,
        numbers: /\b\d+\.?\d*\b/g,
        functions: /\b(\w+)(?=\s*\()/g
      },
      java: {
        keywords: /\b(public|private|protected|static|final|abstract|class|interface|extends|implements|package|import|if|else|for|while|do|switch|case|default|break|continue|return|try|catch|finally|throw|throws|new|this|super|null|true|false|int|double|float|boolean|char|byte|short|long|void)\b/g,
        strings: /(["'])((?:\\.|(?!\1)[^\\])*?)\1/g,
        comments: /\/\/.*|\/\*[\s\S]*?\*\//g,
        numbers: /\b\d+\.?\d*[fFdDlL]?\b/g,
        functions: /\b(\w+)(?=\s*\()/g
      },
      cpp: {
        keywords: /\b(int|float|double|char|bool|void|if|else|for|while|do|switch|case|default|break|continue|return|class|struct|public|private|protected|virtual|static|const|namespace|using|include|define|ifdef|ifndef|endif|true|false|null|nullptr)\b/g,
        strings: /(["'])((?:\\.|(?!\1)[^\\])*?)\1/g,
        comments: /\/\/.*|\/\*[\s\S]*?\*\//g,
        numbers: /\b\d+\.?\d*[fFdDlL]?\b/g,
        functions: /\b(\w+)(?=\s*\()/g
      },
      c: {
        keywords: /\b(int|float|double|char|void|if|else|for|while|do|switch|case|default|break|continue|return|struct|union|enum|typedef|static|extern|const|volatile|auto|register|signed|unsigned|short|long|sizeof|true|false|null|NULL)\b/g,
        strings: /(["'])((?:\\.|(?!\1)[^\\])*?)\1/g,
        comments: /\/\/.*|\/\*[\s\S]*?\*\//g,
        numbers: /\b\d+\.?\d*[fFdDlL]?\b/g,
        functions: /\b(\w+)(?=\s*\()/g
      },
      go: {
        keywords: /\b(package|import|func|var|const|type|struct|interface|if|else|for|range|switch|case|default|break|continue|return|go|chan|select|defer|panic|recover|map|slice|make|new|len|cap|append|copy|delete|true|false|nil|int|int8|int16|int32|int64|uint|uint8|uint16|uint32|uint64|float32|float64|bool|string|byte|rune)\b/g,
        strings: /(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g,
        comments: /\/\/.*|\/\*[\s\S]*?\*\//g,
        numbers: /\b\d+\.?\d*\b/g,
        functions: /\b(\w+)(?=\s*\()/g
      },
      rust: {
        keywords: /\b(fn|let|mut|const|static|if|else|match|loop|while|for|in|break|continue|return|struct|enum|impl|trait|pub|mod|use|crate|self|super|where|as|dyn|move|ref|true|false|i8|i16|i32|i64|i128|u8|u16|u32|u64|u128|f32|f64|bool|char|str|String|Vec|Option|Result)\b/g,
        strings: /(["'])((?:\\.|(?!\1)[^\\])*?)\1/g,
        comments: /\/\/.*|\/\*[\s\S]*?\*\//g,
        numbers: /\b\d+\.?\d*\b/g,
        functions: /\b(\w+)(?=\s*\()/g
      },
      php: {
        keywords: /\b(if|else|elseif|endif|for|foreach|endfor|while|endwhile|do|switch|case|default|break|continue|return|function|class|extends|implements|public|private|protected|static|final|abstract|interface|namespace|use|try|catch|finally|throw|new|this|self|parent|true|false|null|array|string|int|float|bool|object|resource|mixed|callable|iterable|void)\b/g,
        strings: /(["'])((?:\\.|(?!\1)[^\\])*?)\1/g,
        comments: /\/\/.*|\/\*[\s\S]*?\*\/|#.*/g,
        numbers: /\b\d+\.?\d*\b/g,
        functions: /\b(\w+)(?=\s*\()/g
      },
      ruby: {
        keywords: /\b(def|class|module|if|unless|else|elsif|end|case|when|for|while|until|do|break|next|return|yield|begin|rescue|ensure|retry|raise|super|self|nil|true|false|and|or|not|in|puts|print|p|require|include|extend|attr_reader|attr_writer|attr_accessor)\b/g,
        strings: /(["'])((?:\\.|(?!\1)[^\\])*?)\1/g,
        comments: /#.*/g,
        numbers: /\b\d+\.?\d*\b/g,
        functions: /\b(\w+)(?=\s*\()/g
      },
      kotlin: {
        keywords: /\b(fun|val|var|class|interface|object|if|else|when|for|while|do|break|continue|return|try|catch|finally|throw|public|private|protected|internal|final|open|abstract|override|lateinit|by|delegate|in|out|true|false|null|this|super|is|as|Int|Double|Float|Boolean|Char|Byte|Short|Long|String|Unit|Any|Nothing)\b/g,
        strings: /(["'])((?:\\.|(?!\1)[^\\])*?)\1/g,
        comments: /\/\/.*|\/\*[\s\S]*?\*\//g,
        numbers: /\b\d+\.?\d*[fFdDlL]?\b/g,
        functions: /\b(\w+)(?=\s*\()/g
      },
      swift: {
        keywords: /\b(func|var|let|class|struct|enum|protocol|if|else|guard|switch|case|default|for|while|repeat|break|continue|return|throws|try|catch|public|private|fileprivate|internal|open|final|static|override|mutating|inout|true|false|nil|self|super|Int|Double|Float|Bool|String|Character|Array|Dictionary|Set|Optional|Any|AnyObject)\b/g,
        strings: /(["'])((?:\\.|(?!\1)[^\\])*?)\1/g,
        comments: /\/\/.*|\/\*[\s\S]*?\*\//g,
        numbers: /\b\d+\.?\d*\b/g,
        functions: /\b(\w+)(?=\s*\()/g
      }
    };

    let highlighted = code;
    const langPatterns = patterns[language] || patterns.javascript;

    // Apply syntax highlighting
    highlighted = highlighted
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(langPatterns.comments, '<span style="color: #6b7280; font-style: italic;">$&</span>')
      .replace(langPatterns.strings, '<span style="color: #10b981;">$&</span>')
      .replace(langPatterns.keywords, '<span style="color: #8b5cf6; font-weight: bold;">$&</span>')
      .replace(langPatterns.numbers, '<span style="color: #f59e0b;">$&</span>')
      .replace(langPatterns.functions, '<span style="color: #3b82f6;">$1</span>');

    return highlighted;
  };

  // Auto-save functionality
  useEffect(() => {
    if (code.trim() && code !== CODE_TEMPLATES[selectedLanguage]) {
      const timeoutId = setTimeout(() => {
        const historyEntry = {
          id: Date.now(),
          language: selectedLanguage,
          code: code,
          timestamp: new Date().toISOString(),
          name: `Auto-save ${new Date().toLocaleTimeString()}`,
          result: executionResult
        };
        setCodeHistory(prev => [historyEntry, ...prev.slice(0, 9)]);
      }, 3000);

      return () => clearTimeout(timeoutId);
    }
  }, [code, selectedLanguage, executionResult]);

  // Handle language change with professional template switching
  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
    setCode(CODE_TEMPLATES[language] || '');
    setOutput('');
    setExecutionResult(null);
    setInput('');
    
    success(`Switched to ${LANGUAGE_CONFIGS[language]?.name || language}`, {
      title: 'Language Changed',
      duration: 2000
    });
  };

  // Professional code execution
  const executeCode = async () => {
    if (!code.trim()) {
      warning('Please enter some code to execute', {
        title: 'No Code Found'
      });
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

      if (result.success) {
        success('Code executed successfully!', {
          title: 'Execution Complete'
        });
      } else {
        error('Code execution failed', {
          title: 'Execution Error'
        });
      }
    } catch (err) {
      const errorMsg = err.message || 'An unexpected error occurred';
      setOutput(errorMsg);
      setExecutionResult({ success: false, error: errorMsg });
      error('Execution failed: ' + errorMsg, {
        title: 'Runtime Error'
      });
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
    
    success(`Downloaded as ${filename}`, {
      title: 'File Downloaded'
    });
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    success('Code copied to clipboard!', {
      title: 'Copied'
    });
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    success('Output copied to clipboard!', {
      title: 'Copied'
    });
  };

  const clearOutput = () => {
    setOutput('');
    setExecutionResult(null);
    setExecutionTime(0);
    setMemoryUsage(0);
    info('Output cleared', {
      title: 'Cleared'
    });
  };

  const resetCode = () => {
    setCode(CODE_TEMPLATES[selectedLanguage] || '');
    setOutput('');
    setInput('');
    setExecutionResult(null);
    info(`Reset to ${LANGUAGE_CONFIGS[selectedLanguage]?.name} template`, {
      title: 'Code Reset'
    });
  };

  return (
    <div className={`min-h-screen ${mode === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} transition-all duration-300`}>
      {/* Professional Header */}
      <div className={`border-b-2 ${mode === 'dark' ? 'border-gray-800 bg-gray-900/95' : 'border-gray-200 bg-white/95'} backdrop-blur-xl sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-2xl bg-gradient-to-r ${LANGUAGE_CONFIGS[selectedLanguage]?.color || 'from-blue-500 to-purple-600'}`}>
                <Code className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className={`text-3xl font-bold ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Code Compiler
                </h1>
                <p className={`text-lg font-medium ${mode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Professional Multi-Language IDE
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <Button
                onClick={executeCode}
                disabled={isExecuting || !code.trim()}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 py-3 text-lg font-bold shadow-lg"
              >
                {isExecuting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5 mr-2" />
                    Run Code
                  </>
                )}
              </Button>
              
              <Button
                onClick={() => setShowSettings(!showSettings)}
                variant="outline"
                className={`border-2 ${mode === 'dark' ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
              >
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="space-y-4">
          
          {/* Top Controls Bar */}
          <div className="flex items-center justify-between">
            {/* Language Selector */}
            <div className="flex items-center space-x-4">
              <label className={`text-lg font-bold ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                🎯 Language:
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className={`px-4 py-3 rounded-xl border-2 font-bold text-lg min-w-[200px] ${
                  mode === 'dark' 
                    ? 'bg-gray-800 border-gray-600 text-white focus:border-blue-500' 
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
              >
                {Object.entries(LANGUAGE_CONFIGS).map(([lang, config]) => (
                  <option key={lang} value={lang}>
                    {config.icon} {config.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-2">
              <Button
                onClick={resetCode}
                variant="outline"
                size="sm"
                className="border-2"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button
                onClick={downloadCode}
                variant="outline"
                size="sm"
                className="border-2"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button
                onClick={copyCode}
                variant="outline"
                size="sm"
                className="border-2"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="space-y-3">
            {/* Code Editor Panel */}
            <Card className={`${mode === 'dark' ? 'bg-gray-800/50 border-gray-700/50 backdrop-blur-xl' : 'bg-white/70 border-gray-200/50 backdrop-blur-xl'} shadow-xl`}>
              <CardHeader className="pb-3 border-b border-gray-200/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${LANGUAGE_CONFIGS[selectedLanguage]?.color || 'from-blue-500 to-purple-600'}`}>
                      <Code className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className={`text-xl font-bold ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        💻 Code Editor - {LANGUAGE_CONFIGS[selectedLanguage]?.name}
                      </CardTitle>
                    </div>
                  </div>
                  
                  {/* Editor Controls */}
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-medium px-3 py-2 rounded-lg ${
                      mode === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
                    }`}>
                      {LANGUAGE_CONFIGS[selectedLanguage]?.extension || '.txt'}
                    </span>
                    <Button
                      onClick={() => setFontSize(fontSize === 14 ? 16 : fontSize === 16 ? 18 : 14)}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                    >
                      {fontSize}px
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                <div className="relative">
                  {/* Enhanced Code Editor */}
                  <div className="flex">
                    {/* Line Numbers */}
                    <div className={`w-16 p-4 pr-2 font-mono text-sm select-none border-r ${
                      mode === 'dark' 
                        ? 'bg-gray-800/80 text-gray-500 border-gray-700' 
                        : 'bg-gray-100/80 text-gray-400 border-gray-300'
                    }`}>
                      {code.split('\n').map((_, index) => (
                        <div key={index} className="leading-6 text-right">
                          {index + 1}
                        </div>
                      ))}
                    </div>
                    
                    {/* Code Input Area */}
                    <div className="flex-1 relative">
                      <textarea
                        ref={codeRef}
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className={`w-full p-4 font-mono resize-none border-0 outline-none ${
                          mode === 'dark' 
                            ? 'bg-gray-900/50 text-gray-100 placeholder-gray-500' 
                            : 'bg-gray-50/50 text-gray-900 placeholder-gray-400'
                        }`}
                        style={{ 
                          fontSize: `${fontSize}px`,
                          lineHeight: '1.5',
                          height: '400px',
                          tabSize: 2,
                          fontFamily: "'JetBrains Mono', 'Fira Code', 'Source Code Pro', Consolas, 'Liberation Mono', Menlo, Monaco, 'Courier New', monospace"
                        }}
                        placeholder={`Write your ${LANGUAGE_CONFIGS[selectedLanguage]?.name || selectedLanguage} code here...

// Start coding with the template above
// Use Tab for indentation
// Press Ctrl+Enter to run code`}
                        spellCheck={false}
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        onKeyDown={(e) => {
                          // Handle Tab key for indentation
                          if (e.key === 'Tab') {
                            e.preventDefault();
                            const start = e.target.selectionStart;
                            const end = e.target.selectionEnd;
                            const value = e.target.value;
                            const newValue = value.substring(0, start) + '  ' + value.substring(end);
                            setCode(newValue);
                            // Set cursor position after the tab
                            setTimeout(() => {
                              e.target.selectionStart = e.target.selectionEnd = start + 2;
                            }, 0);
                          }
                          
                          // Handle Ctrl+Enter to run code
                          if (e.ctrlKey && e.key === 'Enter') {
                            e.preventDefault();
                            executeCode();
                          }
                        }}
                      />
                      
                      {/* Editor Status Bar */}
                      <div className={`absolute bottom-0 left-0 right-0 px-4 py-2 border-t text-xs ${
                        mode === 'dark' 
                          ? 'bg-gray-800/90 border-gray-700 text-gray-400' 
                          : 'bg-gray-100/90 border-gray-300 text-gray-600'
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <span>Lines: {code.split('\n').length}</span>
                            <span>Characters: {code.length}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span>Font: {fontSize}px</span>
                            <span>Tab: 2 spaces</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Input/Output Panel */}
            <Card className={`${mode === 'dark' ? 'bg-gray-800/50 border-gray-700/50 backdrop-blur-xl' : 'bg-white/70 border-gray-200/50 backdrop-blur-xl'} shadow-xl`}>
              <CardHeader className="pb-3 border-b border-gray-200/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${executionResult?.success ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-gray-500 to-gray-600'}`}>
                      <Terminal className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className={`text-xl font-bold ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      📤 Input & Output
                    </CardTitle>
                  </div>
                  
                  {/* Performance Metrics */}
                  <div className="flex items-center space-x-2">
                    {executionResult && (
                      <div className="flex items-center space-x-4 text-sm font-medium">
                        {executionTime > 0 && (
                          <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg ${
                            mode === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'
                          }`}>
                            <Clock className="h-4 w-4" />
                            <span>{formatExecutionTime(executionTime)}</span>
                          </div>
                        )}
                        {memoryUsage > 0 && (
                          <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg ${
                            mode === 'dark' ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'
                          }`}>
                            <HardDrive className="h-4 w-4" />
                            <span>{formatMemoryUsage(memoryUsage)}</span>
                          </div>
                        )}
                        <div className={`flex items-center space-x-1 px-3 py-2 rounded-lg font-bold ${
                          executionResult.success 
                            ? mode === 'dark' ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-600'
                            : mode === 'dark' ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600'
                        }`}>
                          {executionResult.success ? (
                            <>
                              <CheckCircle className="h-4 w-4" />
                              <span>✅ Success</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="h-4 w-4" />
                              <span>❌ Error</span>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                    <Button
                      onClick={copyOutput}
                      variant="outline"
                      size="sm"
                      disabled={!output}
                      className={`border-2 ${mode === 'dark' ? 'border-green-500 text-green-400 hover:bg-green-500 hover:text-white' : 'border-green-500 text-green-600 hover:bg-green-500 hover:text-white'}`}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={clearOutput}
                      variant="outline"
                      size="sm"
                      disabled={!output}
                      className={`border-2 ${mode === 'dark' ? 'border-red-500 text-red-400 hover:bg-red-500 hover:text-white' : 'border-red-500 text-red-600 hover:bg-red-500 hover:text-white'}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                <div className="flex h-48">
                  {/* Input Panel */}
                  <div className="w-1/2 border-r border-gray-200/20">
                    <div className={`px-4 py-2 border-b border-gray-200/20 ${mode === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100/50'}`}>
                      <h4 className={`font-bold text-sm ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        📝 Input
                      </h4>
                    </div>
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Enter input for your program here..."
                      className={`w-full h-full p-4 font-mono text-sm resize-none border-0 outline-none ${
                        mode === 'dark' 
                          ? 'bg-gray-900/30 text-gray-100 placeholder-gray-500' 
                          : 'bg-gray-50/30 text-gray-900 placeholder-gray-400'
                      }`}
                      style={{ height: 'calc(100% - 40px)' }}
                    />
                  </div>
                  
                  {/* Output Panel */}
                  <div className="w-1/2">
                    <div className={`px-4 py-2 border-b border-gray-200/20 ${mode === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100/50'}`}>
                      <h4 className={`font-bold text-sm ${mode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        🖥️ Output
                      </h4>
                    </div>
                    <pre
                      ref={outputRef}
                      className={`w-full h-full p-4 font-mono text-sm overflow-auto whitespace-pre-wrap ${
                        mode === 'dark' 
                          ? 'bg-gray-900/30 text-gray-100' 
                          : 'bg-gray-50/30 text-gray-900'
                      } ${!output ? 'flex items-center justify-center' : ''}`}
                      style={{ height: 'calc(100% - 40px)' }}
                    >
                      {output || (
                        <div className={`text-center ${mode === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                          <Terminal className="h-6 w-6 mx-auto mb-2 opacity-30" />
                          <p className="text-xs">Run code to see output</p>
                        </div>
                      )}
                    </pre>
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

export default CompilerPage;