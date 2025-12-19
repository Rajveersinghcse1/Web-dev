// API Configuration
const PISTON_API_BASE = 'https://emkc.org/api/v2/piston';
const RATE_LIMIT_DELAY = 200; // 5 requests per second = 200ms between requests

// Language mappings for Piston API
const LANGUAGE_MAPPING = {
  'python': 'python',
  'javascript': 'javascript',
  'java': 'java',
  'cpp': 'cpp',
  'c': 'c',
  'go': 'go',
  'rust': 'rust',
  'php': 'php',
  'ruby': 'ruby',
  'swift': 'swift',
  'kotlin': 'kotlin',
  'typescript': 'typescript',
  'csharp': 'csharp',
  'lua': 'lua',
  'perl': 'perl',
  'r': 'r',
  'scala': 'scala',
  'bash': 'bash'
};

// File extensions for different languages
const FILE_EXTENSIONS = {
  'python': 'py',
  'javascript': 'js',
  'java': 'java',
  'cpp': 'cpp',
  'c': 'c',
  'go': 'go',
  'rust': 'rs',
  'php': 'php',
  'ruby': 'rb',
  'swift': 'swift',
  'kotlin': 'kt',
  'typescript': 'ts',
  'csharp': 'cs',
  'lua': 'lua',
  'perl': 'pl',
  'r': 'r',
  'scala': 'scala',
  'bash': 'sh'
};

/**
 * Enhanced Code Execution Service with Piston API Integration
 * Supports real code execution with fallback to simulation
 */
class CodeExecutionService {
  constructor() {
    this.requestQueue = [];
    this.isProcessing = false;
    this.abortControllers = new Map();
    this.lastRequestTime = 0;
    this.rateLimitQueue = [];
    this.supportedRuntimes = null;
    this.runtimesCacheTime = 0;
    this.CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
    this.useRealAPI = true; // Set to true for real execution
  }

  /**
   * Get supported runtimes from Piston API with caching
   */
  async getSupportedRuntimes() {
    const now = Date.now();
    
    // Return cached runtimes if still valid
    if (this.supportedRuntimes && (now - this.runtimesCacheTime) < this.CACHE_DURATION) {
      return this.supportedRuntimes;
    }

    try {
      const response = await fetch(`${PISTON_API_BASE}/runtimes`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'CodingSociety/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch runtimes: ${response.status}`);
      }

      this.supportedRuntimes = await response.json();
      this.runtimesCacheTime = now;
      
      return this.supportedRuntimes;
    } catch (error) {
      console.error('Error fetching runtimes:', error);
      // Fallback to default runtimes if API fails
      return this.getFallbackRuntimes();
    }
  }

  /**
   * Fallback runtimes if API is unavailable
   */
  getFallbackRuntimes() {
    return [
      { language: 'python', version: '3.10.0', aliases: ['py'] },
      { language: 'javascript', version: '18.15.0', aliases: ['js', 'node'] },
      { language: 'java', version: '15.0.2', aliases: [] },
      { language: 'cpp', version: '10.2.0', aliases: ['c++', 'cxx'] },
      { language: 'c', version: '10.2.0', aliases: [] },
      { language: 'go', version: '1.16.2', aliases: ['golang'] },
      { language: 'rust', version: '1.68.2', aliases: ['rs'] }
    ];
  }

  /**
   * Rate limiting to respect Piston API limits (5 requests/second)
   */
  async enforceRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
      const delay = RATE_LIMIT_DELAY - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Execute code using Piston API with enhanced error handling
   * @param {string} language - Programming language
   * @param {string} code - Code to execute
   * @param {string} input - Optional input for the program
   * @param {string} executionId - Unique ID for this execution
   * @returns {Promise} Execution result
   */
  async executeCode(language, code, input = '', executionId = null) {
    try {
      console.log(`[CodeExecutionService] Executing ${language} code, useRealAPI: ${this.useRealAPI}`);
      
      // Validate language support
      if (!LANGUAGE_MAPPING[language]) {
        throw new Error(`Language '${language}' is not supported`);
      }

      // Create abort controller for this execution
      const abortController = new AbortController();
      if (executionId) {
        this.abortControllers.set(executionId, abortController);
      }

      let result;

      if (this.useRealAPI) {
        try {
          // Enforce rate limiting
          await this.enforceRateLimit();

          // Get supported runtimes to find the best version
          const runtimes = await this.getSupportedRuntimes();
          const runtime = this.findBestRuntime(language, runtimes);
          
          if (!runtime) {
            console.log(`[CodeExecutionService] No runtime found for ${language}, using simulation`);
            // Fallback to simulation if language not available
            result = await this.simulateExecution(language, code, input);
          } else {
            // Prepare the request payload for Piston API
            const payload = this.preparePistonPayload(language, code, input, runtime);
            
            // Make API request to Piston
            const response = await this.makePistonRequest(payload, abortController.signal);
            
            // Process and return the result
            result = this.processPistonResponse(response);
          }
        } catch (error) {
          console.log(`[CodeExecutionService] API error for ${language}:`, error.message);
          // If Piston API fails, fallback to simulation
          if (error.message.includes('Failed to fetch') || error.message.includes('Network error')) {
            console.warn('Piston API unavailable, falling back to simulation');
            result = await this.simulateExecution(language, code, input);
          } else {
            throw error;
          }
        }
      } else {
        console.log(`[CodeExecutionService] Using simulation mode for ${language}`);
        // Use simulation mode
        result = await this.simulateExecution(language, code, input);
      }

      // Clean up abort controller
      if (executionId) {
        this.abortControllers.delete(executionId);
      }

      console.log(`[CodeExecutionService] Result for ${language}:`, result);
      return result;

    } catch (error) {
      console.error(`[CodeExecutionService] Error executing ${language}:`, error);
      // Clean up abort controller on error
      if (executionId) {
        this.abortControllers.delete(executionId);
      }
      
      return this.handleExecutionError(error);
    }
  }

  /**
   * Find the best runtime version for a language
   */
  findBestRuntime(language, runtimes) {
    const pistonLanguage = LANGUAGE_MAPPING[language];
    
    // Find exact language match
    let runtime = runtimes.find(r => r.language === pistonLanguage);
    
    // Try aliases if no exact match
    if (!runtime) {
      runtime = runtimes.find(r => 
        r.aliases && r.aliases.includes(pistonLanguage)
      );
    }
    
    return runtime;
  }

  /**
   * Prepare payload for Piston API
   */
  preparePistonPayload(language, code, input, runtime) {
    const extension = FILE_EXTENSIONS[language] || 'txt';
    const fileName = this.getFileName(language, extension);
    
    const payload = {
      language: runtime.language,
      version: runtime.version,
      files: [
        {
          name: fileName,
          content: code
        }
      ]
    };

    // Add stdin if input is provided
    if (input && input.trim()) {
      payload.stdin = input;
    }

    // Set execution limits for safety
    payload.compile_timeout = 10000; // 10 seconds
    payload.run_timeout = 5000; // 5 seconds
    payload.compile_memory_limit = 128 * 1024 * 1024; // 128MB
    payload.run_memory_limit = 64 * 1024 * 1024; // 64MB

    return payload;
  }

  /**
   * Make API request to Piston
   */
  async makePistonRequest(payload, signal) {
    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'CodingSociety/1.0'
      },
      body: JSON.stringify(payload),
      signal: signal
    };

    const response = await fetch(`${PISTON_API_BASE}/execute`, requestOptions);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Piston API request failed: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
    }

    return response.json();
  }

  /**
   * Process Piston API response
   */
  processPistonResponse(apiResponse) {
    const { run, compile } = apiResponse;
    
    let stdout = '';
    let stderr = '';
    let exitCode = 0;
    let executionTime = 0;
    let memoryUsage = 0;

    // Process compile stage if present
    if (compile) {
      if (compile.stderr) {
        stderr += `Compilation Error:\n${compile.stderr}\n`;
      }
      if (compile.code !== 0) {
        exitCode = compile.code;
      }
      executionTime += compile.cpu_time || 0;
      memoryUsage = Math.max(memoryUsage, compile.memory || 0);
    }

    // Process run stage
    if (run) {
      stdout += run.stdout || '';
      if (run.stderr) {
        stderr += run.stderr;
      }
      if (run.code !== 0 && exitCode === 0) {
        exitCode = run.code;
      }
      executionTime += run.cpu_time || 0;
      memoryUsage = Math.max(memoryUsage, run.memory || 0);
    }

    // Determine success status
    const success = exitCode === 0 && !stderr.trim();
    
    return {
      success: success,
      output: stdout || 'No output',
      error: stderr || null,
      errorType: success ? null : 'RUNTIME_ERROR',
      executionTime: (executionTime / 1000).toFixed(3), // Convert to seconds
      memoryUsage: Math.round(memoryUsage / 1024), // Convert to KB
      combinedOutput: this.formatCombinedOutput(stdout, stderr, success),
      exitCode: exitCode,
      language: apiResponse.language,
      version: apiResponse.version,
      isRealExecution: true
    };
  }

  /**
   * Fallback to simulation for unsupported languages or API failures
   */
  async simulateExecution(language, code, input = '') {
    try {
      const result = await this.originalExecuteMethod(language, code, input);
      
      // Add metadata to indicate this is a simulation
      return {
        ...result,
        isSimulation: true,
        isRealExecution: false,
        simulationNotice: "This result is simulated. Enable API mode for real execution."
      };
    } catch (error) {
      return {
        success: false,
        output: '',
        error: error.message,
        errorType: 'SIMULATION_ERROR',
        executionTime: '0.000',
        memoryUsage: 0,
        combinedOutput: `Simulation Error: ${error.message}`,
        isSimulation: true,
        isRealExecution: false
      };
    }
  }

  /**
   * Get appropriate filename based on language
   */
  getFileName(language, extension) {
    const fileNames = {
      'python': 'main.py',
      'javascript': 'index.js',
      'java': 'Main.java',
      'cpp': 'main.cpp',
      'c': 'main.c',
      'go': 'main.go',
      'rust': 'main.rs',
      'php': 'index.php',
      'ruby': 'main.rb',
      'kotlin': 'Main.kt',
      'swift': 'main.swift',
      'typescript': 'index.ts'
    };
    
    return fileNames[language] || `main.${extension}`;
  }

  /**
   * Format combined output for display
   */
  formatCombinedOutput(stdout, stderr, success) {
    let output = '';
    
    if (stdout) {
      output += stdout;
    }
    
    if (stderr && !success) {
      if (output) output += '\n\n';
      output += `Error:\n${stderr}`;
    }
    
    return output || 'No output generated';
  }

  /**
   * Enhanced error handling
   */
  handleExecutionError(error) {
    if (error.name === 'AbortError') {
      return {
        success: false,
        output: '',
        error: 'Execution was cancelled',
        errorType: 'CANCELLED',
        executionTime: '0.000',
        memoryUsage: 0,
        combinedOutput: 'Execution cancelled by user'
      };
    }

    if (error.message.includes('timeout')) {
      return {
        success: false,
        output: '',
        error: 'Execution timed out',
        errorType: 'TIMEOUT',
        executionTime: 'timeout',
        memoryUsage: 0,
        combinedOutput: 'Code execution timed out. Please check for infinite loops.'
      };
    }

    return {
      success: false,
      output: '',
      error: error.message,
      errorType: 'API_ERROR',
      executionTime: '0.000',
      memoryUsage: 0,
      combinedOutput: `API Error: ${error.message}`
    };
  }

  /**
   * Cancel specific execution
   */
  async cancelExecution(executionId) {
    const abortController = this.abortControllers.get(executionId);
    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(executionId);
      return true;
    }
    return false;
  }

  /**
   * Cancel all pending executions
   */
  async cancelAllExecutions() {
    for (const [id, controller] of this.abortControllers) {
      controller.abort();
    }
    this.abortControllers.clear();
    this.requestQueue = [];
  }

  /**
   * Get API status and health
   */
  async getApiStatus() {
    try {
      const response = await fetch(`${PISTON_API_BASE}/runtimes`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      return {
        available: response.ok,
        status: response.status,
        runtimeCount: response.ok ? (await response.json()).length : 0
      };
    } catch (error) {
      return {
        available: false,
        status: 0,
        error: error.message
      };
    }
  }

  /**
   * Toggle between real API and simulation mode
   */
  setApiMode(useRealAPI) {
    this.useRealAPI = useRealAPI;
  }

  // ===== SIMULATION METHODS =====

  /**
   * Original execute method for simulation fallback
   */
  async originalExecuteMethod(language, code, input = '') {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          let result;
          
          switch (language) {
            case 'python':
              result = this.simulatePythonExecution(code, input);
              break;
            case 'javascript':
              result = this.simulateJavaScriptExecution(code, input);
              break;
            case 'java':
              result = this.simulateJavaExecution(code, input);
              break;
            case 'cpp':
              result = this.simulateCppExecution(code, input);
              break;
            case 'c':
              result = this.simulateCExecution(code, input);
              break;
            case 'go':
              result = this.simulateGoExecution(code, input);
              break;
            case 'rust':
              result = this.simulateRustExecution(code, input);
              break;
            case 'php':
              result = this.simulatePhpExecution(code, input);
              break;
            case 'ruby':
              result = this.simulateRubyExecution(code, input);
              break;
            case 'kotlin':
              result = this.simulateKotlinExecution(code, input);
              break;
            case 'swift':
              result = this.simulateSwiftExecution(code, input);
              break;
            case 'typescript':
              result = this.simulateTypeScriptExecution(code, input);
              break;
            default:
              result = {
                success: false,
                output: '',
                error: `Language '${language}' is not supported in simulation mode`,
                errorType: 'UNSUPPORTED_LANGUAGE'
              };
          }
          
          // Add execution metadata
          result.executionTime = (Math.random() * 0.5 + 0.1).toFixed(3);
          result.memoryUsage = Math.floor(Math.random() * 1024 + 512);
          result.combinedOutput = result.success 
            ? result.output 
            : `Error: ${result.error}`;
          
          resolve(result);
        } catch (error) {
          resolve({
            success: false,
            output: '',
            error: error.message,
            errorType: 'SIMULATION_ERROR',
            executionTime: '0.000',
            memoryUsage: 0,
            combinedOutput: `Simulation Error: ${error.message}`
          });
        }
      }, Math.random() * 500 + 200);
    });
  }

  /**
   * Simulate Python code execution - Enhanced for pattern handling
   */
  simulatePythonExecution(code, stdin) {
    let output = [];
    let inputLines = stdin.split('\n').filter(line => line.trim() !== '');
    let inputIndex = 0;
    
    try {
      const variables = {};
      const lines = code.split('\n');
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();
        
        if (!trimmedLine || trimmedLine.startsWith('#')) continue;
        
        // Handle variable assignments
        const simpleAssignMatch = trimmedLine.match(/^(\w+)\s*=\s*(.+)$/);
        if (simpleAssignMatch && !trimmedLine.includes('input(') && !trimmedLine.includes('print(')) {
          const varName = simpleAssignMatch[1];
          const value = simpleAssignMatch[2].trim();
          
          if (!isNaN(value)) {
            variables[varName] = parseInt(value);
          } else {
            try {
              let evalStr = value;
              for (const [key, val] of Object.entries(variables)) {
                evalStr = evalStr.replace(new RegExp(`\\b${key}\\b`, 'g'), val);
              }
              variables[varName] = eval(evalStr);
            } catch {
              variables[varName] = value;
            }
          }
          continue;
        }
        
        // Handle input()
        if (trimmedLine.includes('input(')) {
          const inputMatch = trimmedLine.match(/(\w+)\s*=\s*.*input\(/);
          if (inputMatch && inputIndex < inputLines.length) {
            const varName = inputMatch[1];
            const inputValue = inputLines[inputIndex++];
            variables[varName] = isNaN(inputValue) ? inputValue : parseInt(inputValue);
          }
          continue;
        }
        
        // Handle print statements with enhanced pattern support
        if (trimmedLine.includes('print(')) {
          const printMatch = trimmedLine.match(/print\((.+)\)/);
          if (printMatch) {
            const content = printMatch[1].trim();
            const evaluatedResult = this.evaluatePrintStatement(content, variables);
            output.push(evaluatedResult);
          }
          continue;
        }
        
        // Handle for loops for pattern generation
        if (trimmedLine.startsWith('for ')) {
          const forMatch = trimmedLine.match(/for\s+(\w+)\s+in\s+range\((.+)\):/);
          if (forMatch) {
            const varName = forMatch[1];
            const rangeExpr = forMatch[2];
            let rangeEnd;
            
            if (variables[rangeExpr] !== undefined) {
              rangeEnd = variables[rangeExpr];
            } else {
              rangeEnd = parseInt(rangeExpr);
            }
            
            // Process loop body
            for (let j = 0; j < rangeEnd; j++) {
              variables[varName] = j;
              // Look for print statements in the next line(s)
              if (i + 1 < lines.length) {
                const nextLine = lines[i + 1].trim();
                if (nextLine.includes('print(')) {
                  const printMatch = nextLine.match(/print\((.+)\)/);
                  if (printMatch) {
                    const content = printMatch[1].trim();
                    const evaluatedResult = this.evaluatePrintStatement(content, variables);
                    output.push(evaluatedResult);
                  }
                }
              }
            }
            i++; // Skip the next line as we processed it
          }
          continue;
        }
      }
      
      return {
        success: true,
        output: output.join('\n'),
        error: null,
        errorType: null
      };
    } catch (error) {
      return {
        success: false,
        output: '',
        error: error.message,
        errorType: 'RUNTIME_ERROR'
      };
    }
  }

  /**
   * Enhanced print statement evaluation with proper pattern handling
   */
  evaluatePrintStatement(content, variables) {
    // Handle string literals and variable combinations
    if (content.includes('+') || content.includes('*')) {
      return this.evaluateComplexExpression(content, variables);
    }
    
    // Handle simple variable
    if (variables[content] !== undefined) {
      return String(variables[content]);
    }
    
    // Handle string literals
    if (content.startsWith('"') && content.endsWith('"')) {
      return content.slice(1, -1);
    }
    
    if (content.startsWith("'") && content.endsWith("'")) {
      return content.slice(1, -1);
    }
    
    return content;
  }

  /**
   * Enhanced expression evaluation for patterns like "* " * i
   */
  evaluateComplexExpression(content, variables) {
    try {
      // Replace variables with their values in the expression
      let evalStr = content;
      for (const [key, val] of Object.entries(variables)) {
        evalStr = evalStr.replace(new RegExp(`\\b${key}\\b`, 'g'), val);
      }
      
      // Use JavaScript's eval to handle the expression
      const result = eval(evalStr);
      return String(result);
    } catch (error) {
      return content;
    }
  }

  /**
   * Simulate JavaScript execution - Enhanced
   */
  simulateJavaScriptExecution(code, stdin) {
    try {
      let output = [];
      let inputLines = stdin.split('\n').filter(line => line.trim() !== '');
      let inputIndex = 0;
      
      // Handle console.log statements
      const consoleMatches = code.match(/console\.log\s*\(\s*([^)]+)\s*\)/g);
      if (consoleMatches) {
        const outputs = consoleMatches.map(match => {
          const content = match.match(/console\.log\s*\(\s*([^)]+)\s*\)/)[1];
          // Handle template literals
          if (content.includes('`')) {
            return content.replace(/[`]/g, '').replace(/\$\{[^}]+\}/g, 'value');
          }
          return content.replace(/['"]/g, '');
        });
        output = outputs;
      }
      
      // Handle prompt() calls by using input
      if (code.includes('prompt(') && inputLines.length > 0) {
        output.push(`Input received: ${inputLines[0]}`);
      }
      
      return {
        success: true,
        output: output.length > 0 ? output.join('\n') : 'JavaScript code executed successfully',
        error: null,
        errorType: null
      };
    } catch (error) {
      return {
        success: false,
        output: '',
        error: error.message,
        errorType: 'RUNTIME_ERROR'
      };
    }
  }

  /**
   * Simulate Java execution
   */
  simulateJavaExecution(code, stdin) {
    try {
      const printMatches = code.match(/System\.out\.println?\(([^)]+)\)/g);
      if (printMatches) {
        const outputs = printMatches.map(match => {
          const content = match.match(/System\.out\.println?\(([^)]+)\)/)[1];
          return content.replace(/['"]/g, '');
        });
        return {
          success: true,
          output: outputs.join('\n'),
          error: null,
          errorType: null
        };
      }
      
      return {
        success: true,
        output: 'Java code compiled and executed successfully',
        error: null,
        errorType: null
      };
    } catch (error) {
      return {
        success: false,
        output: '',
        error: error.message,
        errorType: 'RUNTIME_ERROR'
      };
    }
  }

  /**
   * Simulate C/C++ execution
   */
  simulateCppExecution(code, stdin) {
    try {
      const printMatches = code.match(/(?:printf|cout)\s*(?:\(|<<)\s*([^;)]+)/g);
      if (printMatches) {
        const outputs = printMatches.map(match => {
          if (match.includes('printf')) {
            const content = match.match(/printf\s*\(\s*([^,)]+)/)[1];
            return content.replace(/['"]/g, '');
          } else {
            const content = match.match(/cout\s*<<\s*([^;]+)/)[1];
            return content.replace(/['"]/g, '');
          }
        });
        return {
          success: true,
          output: outputs.join('\n'),
          error: null,
          errorType: null
        };
      }
      
      return {
        success: true,
        output: 'C++ code compiled and executed successfully',
        error: null,
        errorType: null
      };
    } catch (error) {
      return {
        success: false,
        output: '',
        error: error.message,
        errorType: 'RUNTIME_ERROR'
      };
    }
  }

  /**
   * Simulate C execution
   */
  simulateCExecution(code, stdin) {
    try {
      const printMatches = code.match(/printf\s*\(\s*([^,)]+)/g);
      if (printMatches) {
        const outputs = printMatches.map(match => {
          const content = match.match(/printf\s*\(\s*([^,)]+)/)[1];
          return content.replace(/['"]/g, '').replace(/\\n/g, '\n');
        });
        return {
          success: true,
          output: outputs.join('\n'),
          error: null,
          errorType: null
        };
      }
      
      return {
        success: true,
        output: 'C code compiled and executed successfully',
        error: null,
        errorType: null
      };
    } catch (error) {
      return {
        success: false,
        output: '',
        error: error.message,
        errorType: 'RUNTIME_ERROR'
      };
    }
  }

  /**
   * Simulate Go execution
   */
  simulateGoExecution(code, stdin) {
    try {
      const printMatches = code.match(/fmt\.(?:Print|Println)\s*\(\s*([^)]+)\)/g);
      if (printMatches) {
        const outputs = printMatches.map(match => {
          const content = match.match(/fmt\.(?:Print|Println)\s*\(\s*([^)]+)\)/)[1];
          return content.replace(/['"]/g, '');
        });
        return {
          success: true,
          output: outputs.join('\n'),
          error: null,
          errorType: null
        };
      }
      
      return {
        success: true,
        output: 'Go code compiled and executed successfully',
        error: null,
        errorType: null
      };
    } catch (error) {
      return {
        success: false,
        output: '',
        error: error.message,
        errorType: 'RUNTIME_ERROR'
      };
    }
  }

  /**
   * Simulate Rust execution
   */
  simulateRustExecution(code, stdin) {
    try {
      const printMatches = code.match(/println!\s*\(\s*([^)]+)\)/g);
      if (printMatches) {
        const outputs = printMatches.map(match => {
          const content = match.match(/println!\s*\(\s*([^)]+)\)/)[1];
          return content.replace(/['"]/g, '');
        });
        return {
          success: true,
          output: outputs.join('\n'),
          error: null,
          errorType: null
        };
      }
      
      return {
        success: true,
        output: 'Rust code compiled and executed successfully',
        error: null,
        errorType: null
      };
    } catch (error) {
      return {
        success: false,
        output: '',
        error: error.message,
        errorType: 'RUNTIME_ERROR'
      };
    }
  }

  /**
   * Simulate PHP execution
   */
  simulatePhpExecution(code, stdin) {
    try {
      const printMatches = code.match(/echo\s+([^;]+);/g);
      if (printMatches) {
        const outputs = printMatches.map(match => {
          const content = match.match(/echo\s+([^;]+);/)[1];
          return content.replace(/['"]/g, '').replace(/\\n/g, '\n');
        });
        return {
          success: true,
          output: outputs.join('\n'),
          error: null,
          errorType: null
        };
      }
      
      return {
        success: true,
        output: 'PHP code executed successfully',
        error: null,
        errorType: null
      };
    } catch (error) {
      return {
        success: false,
        output: '',
        error: error.message,
        errorType: 'RUNTIME_ERROR'
      };
    }
  }

  /**
   * Simulate Ruby execution
   */
  simulateRubyExecution(code, stdin) {
    try {
      const printMatches = code.match(/(?:puts|print)\s+([^;\n]+)/g);
      if (printMatches) {
        const outputs = printMatches.map(match => {
          const content = match.match(/(?:puts|print)\s+([^;\n]+)/)[1];
          return content.replace(/['"]/g, '');
        });
        return {
          success: true,
          output: outputs.join('\n'),
          error: null,
          errorType: null
        };
      }
      
      return {
        success: true,
        output: 'Ruby code executed successfully',
        error: null,
        errorType: null
      };
    } catch (error) {
      return {
        success: false,
        output: '',
        error: error.message,
        errorType: 'RUNTIME_ERROR'
      };
    }
  }

  /**
   * Simulate Kotlin execution
   */
  simulateKotlinExecution(code, stdin) {
    try {
      const printMatches = code.match(/println\s*\(\s*([^)]+)\)/g);
      if (printMatches) {
        const outputs = printMatches.map(match => {
          const content = match.match(/println\s*\(\s*([^)]+)\)/)[1];
          return content.replace(/['"]/g, '');
        });
        return {
          success: true,
          output: outputs.join('\n'),
          error: null,
          errorType: null
        };
      }
      
      return {
        success: true,
        output: 'Kotlin code compiled and executed successfully',
        error: null,
        errorType: null
      };
    } catch (error) {
      return {
        success: false,
        output: '',
        error: error.message,
        errorType: 'RUNTIME_ERROR'
      };
    }
  }

  /**
   * Simulate Swift execution
   */
  simulateSwiftExecution(code, stdin) {
    try {
      const printMatches = code.match(/print\s*\(\s*([^)]+)\)/g);
      if (printMatches) {
        const outputs = printMatches.map(match => {
          const content = match.match(/print\s*\(\s*([^)]+)\)/)[1];
          return content.replace(/['"]/g, '');
        });
        return {
          success: true,
          output: outputs.join('\n'),
          error: null,
          errorType: null
        };
      }
      
      return {
        success: true,
        output: 'Swift code compiled and executed successfully',
        error: null,
        errorType: null
      };
    } catch (error) {
      return {
        success: false,
        output: '',
        error: error.message,
        errorType: 'RUNTIME_ERROR'
      };
    }
  }

  /**
   * Simulate TypeScript execution
   */
  simulateTypeScriptExecution(code, stdin) {
    try {
      // TypeScript simulation is similar to JavaScript
      return this.simulateJavaScriptExecution(code, stdin);
    } catch (error) {
      return {
        success: false,
        output: '',
        error: error.message,
        errorType: 'RUNTIME_ERROR'
      };
    }
  }
}

// Export the service
export default new CodeExecutionService();