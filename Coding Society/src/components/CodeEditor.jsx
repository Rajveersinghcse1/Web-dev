import React, { useEffect, useRef, useState } from 'react';

// Simple syntax highlighting component
const CodeEditor = ({ 
  value, 
  onChange, 
  language, 
  fontSize = 14, 
  theme = 'dark',
  placeholder = 'Enter your code here...',
  className = '',
  style = {}
}) => {
  const textareaRef = useRef(null);
  const highlightRef = useRef(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [cursorPosition, setCursorPosition] = useState(0);

  // Language keywords and syntax patterns
  const LANGUAGE_PATTERNS = {
    python: {
      keywords: ['def', 'class', 'if', 'else', 'elif', 'for', 'while', 'try', 'except', 'finally', 'import', 'from', 'as', 'return', 'yield', 'lambda', 'with', 'global', 'nonlocal', 'assert', 'break', 'continue', 'pass', 'del', 'and', 'or', 'not', 'in', 'is'],
      builtins: ['print', 'input', 'len', 'range', 'list', 'dict', 'set', 'tuple', 'str', 'int', 'float', 'bool', 'type', 'isinstance', 'hasattr', 'getattr', 'setattr', 'open', 'file'],
      patterns: {
        string: /(["'])((?:\\.|(?!\1)[^\\])*?)\1/g,
        comment: /#.*/g,
        number: /\b\d+\.?\d*\b/g,
        function: /\b(\w+)(?=\s*\()/g
      }
    },
    javascript: {
      keywords: ['function', 'var', 'let', 'const', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'default', 'break', 'continue', 'return', 'try', 'catch', 'finally', 'throw', 'new', 'this', 'typeof', 'instanceof', 'delete', 'void', 'null', 'undefined', 'true', 'false'],
      builtins: ['console', 'log', 'warn', 'error', 'document', 'window', 'alert', 'confirm', 'prompt', 'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval', 'JSON', 'Math', 'Date', 'Array', 'Object', 'String', 'Number', 'Boolean'],
      patterns: {
        string: /(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g,
        comment: /\/\/.*|\/\*[\s\S]*?\*\//g,
        number: /\b\d+\.?\d*\b/g,
        function: /\b(\w+)(?=\s*\()/g
      }
    },
    java: {
      keywords: ['public', 'private', 'protected', 'static', 'final', 'abstract', 'class', 'interface', 'extends', 'implements', 'package', 'import', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'default', 'break', 'continue', 'return', 'try', 'catch', 'finally', 'throw', 'throws', 'new', 'this', 'super', 'null', 'true', 'false'],
      builtins: ['System', 'out', 'println', 'print', 'String', 'int', 'double', 'float', 'boolean', 'char', 'byte', 'short', 'long', 'void', 'ArrayList', 'HashMap', 'HashSet', 'Scanner'],
      patterns: {
        string: /(["'])((?:\\.|(?!\1)[^\\])*?)\1/g,
        comment: /\/\/.*|\/\*[\s\S]*?\*\//g,
        number: /\b\d+\.?\d*[fFdDlL]?\b/g,
        function: /\b(\w+)(?=\s*\()/g
      }
    },
    cpp: {
      keywords: ['int', 'double', 'float', 'char', 'bool', 'void', 'string', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'default', 'break', 'continue', 'return', 'class', 'struct', 'public', 'private', 'protected', 'virtual', 'static', 'const', 'new', 'delete', 'this', 'nullptr', 'true', 'false'],
      builtins: ['cout', 'cin', 'endl', 'std', 'vector', 'string', 'map', 'set', 'pair', 'make_pair', 'sort', 'max', 'min', 'abs', 'sqrt', 'pow'],
      patterns: {
        string: /(["'])((?:\\.|(?!\1)[^\\])*?)\1/g,
        comment: /\/\/.*|\/\*[\s\S]*?\*\//g,
        number: /\b\d+\.?\d*[fFdDlL]?\b/g,
        function: /\b(\w+)(?=\s*\()/g,
        preprocessor: /#\w+/g
      }
    },
    c: {
      keywords: ['int', 'double', 'float', 'char', 'void', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'default', 'break', 'continue', 'return', 'struct', 'union', 'enum', 'typedef', 'static', 'extern', 'const', 'volatile', 'sizeof', 'NULL'],
      builtins: ['printf', 'scanf', 'malloc', 'free', 'calloc', 'realloc', 'strlen', 'strcpy', 'strcat', 'strcmp', 'memcpy', 'memset'],
      patterns: {
        string: /(["'])((?:\\.|(?!\1)[^\\])*?)\1/g,
        comment: /\/\/.*|\/\*[\s\S]*?\*\//g,
        number: /\b\d+\.?\d*[fFdDlL]?\b/g,
        function: /\b(\w+)(?=\s*\()/g,
        preprocessor: /#\w+/g
      }
    },
    go: {
      keywords: ['func', 'var', 'const', 'if', 'else', 'for', 'range', 'switch', 'case', 'default', 'break', 'continue', 'return', 'package', 'import', 'type', 'struct', 'interface', 'go', 'defer', 'select', 'chan', 'make', 'new', 'nil', 'true', 'false'],
      builtins: ['fmt', 'Println', 'Printf', 'Sprintf', 'len', 'cap', 'append', 'copy', 'delete', 'panic', 'recover', 'string', 'int', 'int64', 'float64', 'bool', 'byte', 'rune'],
      patterns: {
        string: /(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g,
        comment: /\/\/.*|\/\*[\s\S]*?\*\//g,
        number: /\b\d+\.?\d*\b/g,
        function: /\b(\w+)(?=\s*\()/g
      }
    }
  };

  // Get suggestions based on current word
  const getSuggestions = (currentWord, language) => {
    const patterns = LANGUAGE_PATTERNS[language];
    if (!patterns || !currentWord) return [];

    const allWords = [...patterns.keywords, ...patterns.builtins];
    return allWords
      .filter(word => word.toLowerCase().startsWith(currentWord.toLowerCase()))
      .slice(0, 10);
  };

  // Handle syntax highlighting
  const highlightSyntax = (code, language) => {
    const patterns = LANGUAGE_PATTERNS[language];
    if (!patterns) return code;

    let highlightedCode = code;

    // Apply syntax highlighting patterns
    Object.entries(patterns.patterns).forEach(([type, pattern]) => {
      highlightedCode = highlightedCode.replace(pattern, (match) => {
        let className = '';
        switch (type) {
          case 'string':
            className = 'text-green-400';
            break;
          case 'comment':
            className = 'text-gray-500 italic';
            break;
          case 'number':
            className = 'text-blue-400';
            break;
          case 'function':
            className = 'text-yellow-400';
            break;
          case 'preprocessor':
            className = 'text-purple-400';
            break;
          default:
            className = 'text-white';
        }
        return `<span class="${className}">${match}</span>`;
      });
    });

    // Highlight keywords
    patterns.keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      highlightedCode = highlightedCode.replace(regex, `<span class="text-purple-400 font-semibold">${keyword}</span>`);
    });

    // Highlight built-ins
    patterns.builtins.forEach(builtin => {
      const regex = new RegExp(`\\b${builtin}\\b`, 'g');
      highlightedCode = highlightedCode.replace(regex, `<span class="text-cyan-400">${builtin}</span>`);
    });

    return highlightedCode;
  };

  // Handle input change
  const handleChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Get current word for auto-completion
    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = newValue.substring(0, cursorPos);
    const words = textBeforeCursor.split(/\s+/);
    const currentWord = words[words.length - 1];

    if (currentWord && currentWord.length > 1) {
      const newSuggestions = getSuggestions(currentWord, language);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
      setSuggestionIndex(0);
    } else {
      setShowSuggestions(false);
    }

    setCursorPosition(cursorPos);
  };

  // Handle key press for auto-completion
  const handleKeyDown = (e) => {
    if (showSuggestions) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSuggestionIndex(prev => (prev + 1) % suggestions.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSuggestionIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
          break;
        case 'Tab':
        case 'Enter':
          e.preventDefault();
          if (suggestions[suggestionIndex]) {
            applySuggestion(suggestions[suggestionIndex]);
          }
          break;
        case 'Escape':
          setShowSuggestions(false);
          break;
      }
    }

    // Handle common programming shortcuts
    if (e.key === 'Tab' && !showSuggestions) {
      e.preventDefault();
      const textarea = e.target;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = value.substring(0, start) + '    ' + value.substring(end);
      onChange(newValue);
      
      // Set cursor position after the inserted spaces
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4;
      }, 0);
    }
  };

  // Apply auto-completion suggestion
  const applySuggestion = (suggestion) => {
    const textarea = textareaRef.current;
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPos);
    const textAfterCursor = value.substring(cursorPos);
    
    const words = textBeforeCursor.split(/\s+/);
    const currentWord = words[words.length - 1];
    
    const newTextBefore = textBeforeCursor.substring(0, textBeforeCursor.length - currentWord.length) + suggestion;
    const newValue = newTextBefore + textAfterCursor;
    
    onChange(newValue);
    setShowSuggestions(false);
    
    // Set cursor position after the suggestion
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = newTextBefore.length;
      textarea.focus();
    }, 0);
  };

  // Sync scroll between textarea and highlight layer
  const handleScroll = () => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  // Update highlighting when value changes
  useEffect(() => {
    if (highlightRef.current) {
      const highlighted = highlightSyntax(value, language);
      highlightRef.current.innerHTML = highlighted + '\n'; // Add extra line for proper height
    }
  }, [value, language]);

  return (
    <div className={`relative ${className}`} style={style}>
      {/* Syntax highlighting layer */}
      <pre
        ref={highlightRef}
        className={`absolute top-0 left-0 w-full h-full p-4 font-mono pointer-events-none overflow-hidden whitespace-pre-wrap break-words ${
          theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'
        }`}
        style={{ 
          fontSize: `${fontSize}px`,
          lineHeight: '1.5',
          margin: 0,
          border: 'none',
          resize: 'none',
          outline: 'none',
          zIndex: 1
        }}
        aria-hidden="true"
      />

      {/* Code input textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onScroll={handleScroll}
        className={`relative w-full h-full p-4 font-mono resize-none border-0 bg-transparent text-transparent caret-white focus:outline-none focus:ring-0 ${
          theme === 'dark' ? 'selection:bg-blue-600' : 'selection:bg-blue-300'
        }`}
        style={{ 
          fontSize: `${fontSize}px`,
          lineHeight: '1.5',
          zIndex: 2
        }}
        placeholder={placeholder}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
      />

      {/* Auto-completion dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div 
          className={`absolute z-50 mt-1 max-w-xs rounded-md shadow-lg ${
            theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
          } border max-h-48 overflow-auto`}
          style={{
            top: '100%',
            left: 0
          }}
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={suggestion}
              className={`px-3 py-2 cursor-pointer text-sm ${
                index === suggestionIndex
                  ? theme === 'dark' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-blue-100 text-blue-900'
                  : theme === 'dark'
                    ? 'text-gray-200 hover:bg-gray-700'
                    : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => applySuggestion(suggestion)}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CodeEditor;