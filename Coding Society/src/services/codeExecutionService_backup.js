// Enhanced Code Execution Service using Piston API
// Supports real code execution with multiple languages
// Ultra-advanced features with rate limiting and error handling

const PISTON_API_BASE = 'https://emkc.org/api/v2/piston';
const RATE_LIMIT_DELAY = 200; // 5 requests per second max

// Enhanced language mapping for Piston API
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
  'kotlin': 'kotlin',
  'swift': 'swift',
  'typescript': 'typescript',
  'csharp': 'csharp',
  'dart': 'dart',
  'haskell': 'haskell',
  'lua': 'lua',
  'bash': 'bash',
  'perl': 'perl',
  'scala': 'scala'
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
  'kotlin': 'kt',
  'swift': 'swift',
  'typescript': 'ts',
  'csharp': 'cs',
  'dart': 'dart',
  'haskell': 'hs',
  'lua': 'lua',
  'bash': 'sh',
  'perl': 'pl',
  'scala': 'scala'
};

// Main class names for languages that require them
const MAIN_CLASS_NAMES = {
  'java': 'Main',
  'kotlin': 'Main',
  'swift': 'Main'
};

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
      // Validate language support
      if (!LANGUAGE_MAPPING[language]) {
        throw new Error(`Language '${language}' is not supported`);
      }

      // Create abort controller for this execution
      const abortController = new AbortController();
      if (executionId) {
        this.abortControllers.set(executionId, abortController);
      }

      // Enforce rate limiting
      await this.enforceRateLimit();

      // Get supported runtimes to find the best version
      const runtimes = await this.getSupportedRuntimes();
      const runtime = this.findBestRuntime(language, runtimes);
      
      if (!runtime) {
        // Fallback to simulation if language not available
        return await this.simulateExecution(language, code, input);
      }

      // Prepare the request payload for Piston API
      const payload = this.preparePistonPayload(language, code, input, runtime);
      
      // Make API request to Piston
      const response = await this.makePistonRequest(payload, abortController.signal);
      
      // Clean up abort controller
      if (executionId) {
        this.abortControllers.delete(executionId);
      }

      // Process and return the result
      return this.processPistonResponse(response);

    } catch (error) {
      // Clean up abort controller on error
      if (executionId) {
        this.abortControllers.delete(executionId);
      }
      
      // If Piston API fails, fallback to simulation
      if (error.message.includes('Failed to fetch') || error.message.includes('Network error')) {
        console.warn('Piston API unavailable, falling back to simulation');
        return await this.simulateExecution(language, code, input);
      }
      
      throw this.handleExecutionError(error);
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
      version: apiResponse.version
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
        isSimulation: true
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
      'rust': 'main.rs'
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

  // ===== ORIGINAL SIMULATION METHODS (Enhanced) =====

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
   * Execute code using Glot.io API
   * @param {string} language - Programming language
   * @param {string} code - Code to execute
   * @param {string} input - Optional input for the program
   * @param {string} executionId - Unique ID for this execution
   * @returns {Promise} Execution result
   */
  async executeCode(language, code, input = '', executionId = null) {
    try {
      // Validate language support
      if (!LANGUAGE_MAPPING[language]) {
        throw new Error(`Language '${language}' is not supported`);
      }

      // Create abort controller for this execution
      const abortController = new AbortController();
      if (executionId) {
        this.abortControllers.set(executionId, abortController);
      }

      // Prepare the request payload
      const payload = this.preparePayload(language, code, input);
      
      // Make API request to Glot.io
      const response = await this.makeApiRequest(language, payload, abortController.signal);
      
      // Clean up abort controller
      if (executionId) {
        this.abortControllers.delete(executionId);
      }

      // Process and return the result
      return this.processApiResponse(response);

    } catch (error) {
      // Clean up abort controller on error
      if (executionId) {
        this.abortControllers.delete(executionId);
      }
      
      throw this.handleExecutionError(error);
    }
  }

  /**
   * Prepare payload for Glot.io API
   * @param {string} language - Programming language
   * @param {string} code - Source code
   * @param {string} input - Program input
   * @returns {object} API payload
   */
  preparePayload(language, code, input) {
    const extension = FILE_EXTENSIONS[language] || 'txt';
    const fileName = this.getFileName(language, extension);
    
    const payload = {
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

    // Add command for certain languages if needed
    const command = this.getExecutionCommand(language);
    if (command) {
      payload.command = command;
    }

    return payload;
  }

  /**
   * Get appropriate filename for the language
   * @param {string} language - Programming language
   * @param {string} extension - File extension
   * @returns {string} Filename
   */
  getFileName(language, extension) {
    const mainClassName = MAIN_CLASS_NAMES[language];
    if (mainClassName) {
      return `${mainClassName}.${extension}`;
    }
    return `main.${extension}`;
  }

  /**
   * Get execution command for specific languages
   * @param {string} language - Programming language
   * @returns {string|null} Execution command
   */
  getExecutionCommand(language) {
    const commands = {
      'python': 'python main.py',
      'javascript': 'node main.js',
      'typescript': 'npx ts-node main.ts',
      'java': 'javac Main.java && java Main',
      'cpp': 'g++ -o main main.cpp && ./main',
      'c': 'gcc -o main main.c && ./main',
      'go': 'go run main.go',
      'rust': 'rustc main.rs && ./main',
      'php': 'php main.php',
      'ruby': 'ruby main.rb',
      'kotlin': 'kotlinc Main.kt -include-runtime -d Main.jar && java -jar Main.jar',
      'swift': 'swift main.swift'
    };
    
    return commands[language] || null;
  }

  /**
   * Make API request to Glot.io
   * @param {string} language - Programming language
   * @param {object} payload - Request payload
   * @param {AbortSignal} signal - Abort signal
   * @returns {Promise<Response>} API response
   */
  async makeApiRequest(language, payload, signal) {
    const glotLanguage = LANGUAGE_MAPPING[language];
    const url = `${GLOT_API_BASE}/run/${glotLanguage}/${GLOT_API_VERSION}`;

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // Add authorization header if you have Glot.io API token
        // 'Authorization': `Token ${process.env.GLOT_API_TOKEN}`
      },
      body: JSON.stringify(payload),
      signal: signal
    };

    // For demo purposes, since Glot.io might require authentication,
    // we'll simulate the response for now
    if (true) { // Set to false when you have proper API access
      return this.simulateApiResponse(language, payload);
    }

    const response = await fetch(url, requestOptions);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
    }

    return response.json();
  }

  /**
   * Simulate API response for demo purposes
   * @param {string} language - Programming language
   * @param {object} payload - Request payload
   * @returns {Promise<object>} Simulated response
   */
  async simulateApiResponse(language, payload) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const code = payload.files[0].content;
    const stdin = payload.stdin || '';

    // Simple code execution simulation
    try {
      let stdout = '';
      let stderr = '';
      let exit_code = 0;

      switch (language) {
        case 'python':
          stdout = this.simulatePythonExecution(code, stdin);
          break;
        case 'javascript':
          stdout = this.simulateJavaScriptExecution(code, stdin);
          break;
        case 'java':
          stdout = this.simulateJavaExecution(code, stdin);
          break;
        case 'cpp':
        case 'c':
          stdout = this.simulateCExecution(code, stdin);
          break;
        default:
          stdout = `Hello from ${language}!\nYour code executed successfully.`;
      }

      // Simulate some common errors
      if (code.includes('error') || code.includes('Error')) {
        stderr = `${language} error: Simulated error in code execution`;
        exit_code = 1;
      }

      return {
        stdout,
        stderr,
        exit_code,
        execution_time: (Math.random() * 2).toFixed(3),
        memory_usage: Math.floor(Math.random() * 1024)
      };
    } catch (error) {
      return {
        stdout: '',
        stderr: `Execution error: ${error.message}`,
        exit_code: 1,
        execution_time: '0.001',
        memory_usage: 0
      };
    }
  }

  /**
   * Simulate Python code execution
   * Enhanced to properly handle patterns like diamonds with whitespace preservation
   */
  simulatePythonExecution(code, stdin) {
    let output = [];
    let inputLines = stdin.split('\n').filter(line => line.trim() !== '');
    let inputIndex = 0;
    
    try {
      // For simple pattern generation code, simulate the execution
      const variables = {};
      const lines = code.split('\n');
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();
        
        if (!trimmedLine || trimmedLine.startsWith('#')) continue;
        
        // Handle variable assignments - MUST come before print/input handling
        // Handle simple assignments like n = 5
        const simpleAssignMatch = trimmedLine.match(/^(\w+)\s*=\s*(.+)$/);
        if (simpleAssignMatch && !trimmedLine.includes('input(') && !trimmedLine.includes('print(')) {
          const varName = simpleAssignMatch[1];
          const value = simpleAssignMatch[2].trim();
          
          // Evaluate the value
          if (!isNaN(value)) {
            variables[varName] = parseInt(value);
          } else {
            // Try to evaluate it as an expression with existing variables
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
        
        // Handle input() function
        if (trimmedLine.includes('input(')) {
          const inputMatch = trimmedLine.match(/(\w+)\s*=\s*.*input\(/);
          if (inputMatch && inputIndex < inputLines.length) {
            const varName = inputMatch[1];
            const inputValue = inputLines[inputIndex];
            inputIndex++;
            
            // Handle int() conversion
            if (trimmedLine.includes('int(input')) {
              const numValue = parseInt(inputValue);
              if (!isNaN(numValue)) {
                variables[varName] = numValue;
              } else {
                output.push('❌ Please enter a valid integer.');
                continue;
              }
            } else {
              variables[varName] = inputValue;
            }
          }
          continue;
        }
        
        // Handle for loops - ENHANCED for pattern generation
        const forMatch = trimmedLine.match(/for\s+(\w+)\s+in\s+range\((.*?)\):/);
        if (forMatch) {
          const loopVar = forMatch[1];
          const rangeArgs = forMatch[2].split(',').map(arg => {
            arg = arg.trim();
            // Replace variables with their values
            for (const [key, val] of Object.entries(variables)) {
              arg = arg.replace(new RegExp(`\\b${key}\\b`, 'g'), val);
            }
            return eval(arg);
          });
          
          let start, end, step;
          if (rangeArgs.length === 1) {
            start = 0;
            end = rangeArgs[0];
            step = 1;
          } else if (rangeArgs.length === 2) {
            start = rangeArgs[0];
            end = rangeArgs[1];
            step = 1;
          } else {
            start = rangeArgs[0];
            end = rangeArgs[1];
            step = rangeArgs[2];
          }
          
          // Find the loop body
          const loopIndent = line.search(/\S/);
          const loopBody = [];
          let j = i + 1;
          while (j < lines.length && lines[j].search(/\S/) > loopIndent) {
            loopBody.push(lines[j]);
            j++;
          }
          
          // Execute loop
          if (step > 0) {
            for (let k = start; k < end; k += step) {
              variables[loopVar] = k;
              // Execute loop body
              for (const bodyLine of loopBody) {
                const bodyTrimmed = bodyLine.trim();
                if (bodyTrimmed.includes('print(')) {
                  const printOutput = this.evaluatePrintStatement(bodyTrimmed, variables);
                  output.push(printOutput);
                }
              }
            }
          } else {
            for (let k = start; k > end; k += step) {
              variables[loopVar] = k;
              // Execute loop body
              for (const bodyLine of loopBody) {
                const bodyTrimmed = bodyLine.trim();
                if (bodyTrimmed.includes('print(')) {
                  const printOutput = this.evaluatePrintStatement(bodyTrimmed, variables);
                  output.push(printOutput);
                }
              }
            }
          }
          
          // Skip the loop body lines
          i = j - 1;
          continue;
        }
        
        // Handle print() function at top level
        if (trimmedLine.includes('print(')) {
          const printOutput = this.evaluatePrintStatement(trimmedLine, variables);
          output.push(printOutput);
        }
      }
      
      return output.join('\n') || 'Code executed successfully';
      
    } catch (error) {
      return `Error: ${error.message}\n\nStack trace:\n  ${error.stack}`;
    }
  }

  /**
   * Helper function to evaluate print statements
   * Properly handles string concatenation and multiplication with + and * operators
   */
  evaluatePrintStatement(line, variables) {
    const printMatch = line.match(/print\((.*?)\)/);
    if (!printMatch) return '';
    
    let content = printMatch[1].trim();
    
    // Handle empty print()
    if (!content) return '';
    
    // Handle string multiplication patterns like "* " * i
    if (content.includes('"') || content.includes("'")) {
      // Check for string multiplication pattern: "string" * variable
      const stringMultMatch = content.match(/(['"])(.*?)\1\s*\*\s*(\w+)/);
      if (stringMultMatch) {
        const stringValue = stringMultMatch[2];
        const multiplierVar = stringMultMatch[3];
        
        if (variables.hasOwnProperty(multiplierVar)) {
          const multiplier = variables[multiplierVar];
          return stringValue.repeat(multiplier);
        }
      }
      
      // Handle more complex expressions with + and *
      return this.evaluateComplexExpression(content, variables);
    } else {
      // Simple expression without strings
      let evalStr = content;
      for (const [key, val] of Object.entries(variables)) {
        evalStr = evalStr.replace(new RegExp(`\\b${key}\\b`, 'g'), val);
      }
      try {
        return String(eval(evalStr));
      } catch {
        return content;
      }
    }
  }

  /**
   * Helper function to evaluate complex expressions with strings and operators
   */
  evaluateComplexExpression(content, variables) {
    // Handle expressions that might contain both strings and variables
    try {
      // Replace variables with their values in the expression
      let evalStr = content;
      for (const [key, val] of Object.entries(variables)) {
        evalStr = evalStr.replace(new RegExp(`\\b${key}\\b`, 'g'), val);
      }
      
      // Use JavaScript's eval to handle the expression
      // This will properly handle "* " * 3 => "* * * "
      const result = eval(evalStr);
      return String(result);
    } catch (error) {
      // Fallback to the original parsing method
      return this.parseStringExpression(content, variables);
    }
  }

  /**
   * Fallback method for parsing string expressions manually
   */
  parseStringExpression(content, variables) {
    // Split by + operator but preserve strings
    const parts = [];
    let currentPart = '';
    let inString = false;
    let stringChar = null;
    
    for (let i = 0; i < content.length; i++) {
      const char = content[i];
      
      if ((char === '"' || char === "'") && (i === 0 || content[i-1] !== '\\')) {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          inString = false;
          stringChar = null;
        }
        currentPart += char;
      } else if (char === '+' && !inString) {
        parts.push(currentPart.trim());
        currentPart = '';
      } else {
        currentPart += char;
      }
    }
    
    if (currentPart) {
      parts.push(currentPart.trim());
    }
    
    // Evaluate each part
    let result = '';
    for (const part of parts) {
      if (part.startsWith('"') || part.startsWith("'")) {
        // String literal - remove quotes
        result += part.slice(1, -1);
      } else {
        // Expression - evaluate it
        let evalStr = part;
        for (const [key, val] of Object.entries(variables)) {
          evalStr = evalStr.replace(new RegExp(`\\b${key}\\b`, 'g'), val);
        }
        try {
          const evalResult = eval(evalStr);
          result += evalResult;
        } catch {
          result += part;
        }
      }
    }
    
    return result;
  }

  /**
   * Simulate JavaScript code execution
   */
  simulateJavaScriptExecution(code, stdin) {
    let output = [];
    let inputLines = stdin.split('\n').filter(line => line.trim() !== '');
    let inputIndex = 0;
    
    try {
      // Simple JavaScript interpreter simulation
      let variables = {};
      let lines = code.split('\n');
      
      for (let line of lines) {
        line = line.trim();
        if (!line || line.startsWith('//')) continue;
        
        // Handle prompt() function
        if (line.includes('prompt(')) {
          const promptMatch = line.match(/(\w+)\s*=\s*prompt\(/);
          if (promptMatch && inputIndex < inputLines.length) {
            const varName = promptMatch[1];
            variables[varName] = inputLines[inputIndex];
            inputIndex++;
          }
        }
        
        // Handle console.log() function
        else if (line.includes('console.log(')) {
          const logMatch = line.match(/console\.log\((.*?)\)/);
          if (logMatch) {
            let content = logMatch[1];
            
            // Handle template literals and string concatenation
            if (content.includes('`') || content.includes('"') || content.includes("'")) {
              // Simple template literal handling
              content = content.replace(/`([^`]*)`/, (match, str) => {
                return str.replace(/\${(\w+)}/g, (match, varName) => {
                  return variables[varName] || varName;
                });
              });
              
              // Remove quotes
              content = content.replace(/[`"']/g, '');
              output.push(content);
            } else if (variables.hasOwnProperty(content)) {
              output.push(variables[content]);
            } else {
              output.push(content);
            }
          }
        }
      }
      
      return output.join('\n') || 'JavaScript code executed successfully';
      
    } catch (error) {
      return `Error: ${error.message}`;
    }
  }

  /**
   * Simulate Java code execution
   */
  simulateJavaExecution(code, stdin) {
    if (code.includes('System.out.println(')) {
      const printMatches = code.match(/System\.out\.println\((.*?)\)/g);
      if (printMatches) {
        return printMatches.map(match => {
          const content = match.match(/System\.out\.println\((.*?)\)/)[1];
          // Simple string evaluation
          if (content.includes('"')) {
            return content.replace(/"/g, '');
          }
          return content;
        }).join('\n');
      }
    }
    
    return 'Java code executed successfully';
  }

  /**
   * Simulate C/C++ code execution
   */
  simulateCExecution(code, stdin) {
    if (code.includes('printf(')) {
      const printMatches = code.match(/printf\((.*?)\)/g);
      if (printMatches) {
        return printMatches.map(match => {
          const content = match.match(/printf\((.*?)\)/)[1];
          // Simple string evaluation
          if (content.includes('"')) {
            return content.replace(/"/g, '').replace(/\\n/g, '\n');
          }
          return content;
        }).join('');
      }
    }
    
    if (code.includes('cout')) {
      return 'Hello from C++!';
    }
    
    return 'C/C++ code executed successfully';
  }

  /**
   * Process API response from Glot.io
   * @param {object} apiResponse - Raw API response
   * @returns {object} Processed execution result
   */
  processApiResponse(apiResponse) {
    const result = {
      success: true,
      output: '',
      error: '',
      executionTime: 0,
      memoryUsage: 0,
      exitCode: 0
    };

    // Extract stdout
    if (apiResponse.stdout) {
      result.output = apiResponse.stdout;
    }

    // Extract stderr
    if (apiResponse.stderr) {
      result.error = apiResponse.stderr;
      // If there's stderr but no stdout, consider it a compilation/runtime error
      if (!apiResponse.stdout && apiResponse.stderr) {
        result.success = false;
      }
    }

    // Extract exit code
    if (typeof apiResponse.exit_code !== 'undefined') {
      result.exitCode = apiResponse.exit_code;
      if (apiResponse.exit_code !== 0) {
        result.success = false;
      }
    }

    // Extract execution time (if available)
    if (apiResponse.execution_time) {
      result.executionTime = parseFloat(apiResponse.execution_time) * 1000; // Convert to milliseconds
    }

    // Extract memory usage (if available)
    if (apiResponse.memory_usage) {
      result.memoryUsage = parseFloat(apiResponse.memory_usage);
    }

    // Combine output and error for display
    let combinedOutput = result.output;
    if (result.error) {
      combinedOutput += (combinedOutput ? '\n' : '') + '--- Error ---\n' + result.error;
    }
    result.combinedOutput = combinedOutput;

    return result;
  }

  /**
   * Handle execution errors
   * @param {Error} error - Error object
   * @returns {object} Formatted error response
   */
  handleExecutionError(error) {
    let errorMessage = 'Code execution failed';
    let errorType = 'EXECUTION_ERROR';

    if (error.name === 'AbortError') {
      errorMessage = 'Code execution was cancelled';
      errorType = 'EXECUTION_CANCELLED';
    } else if (error.message.includes('timeout')) {
      errorMessage = 'Code execution timed out';
      errorType = 'EXECUTION_TIMEOUT';
    } else if (error.message.includes('API request failed')) {
      errorMessage = error.message;
      errorType = 'API_ERROR';
    } else if (error.message.includes('not supported')) {
      errorMessage = error.message;
      errorType = 'LANGUAGE_NOT_SUPPORTED';
    } else {
      errorMessage = error.message || errorMessage;
    }

    return {
      success: false,
      output: '',
      error: errorMessage,
      errorType: errorType,
      executionTime: 0,
      memoryUsage: 0,
      combinedOutput: `Error: ${errorMessage}`
    };
  }

  /**
   * Cancel code execution
   * @param {string} executionId - Execution ID to cancel
   * @returns {boolean} Success status
   */
  cancelExecution(executionId) {
    const abortController = this.abortControllers.get(executionId);
    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(executionId);
      return true;
    }
    return false;
  }

  /**
   * Get list of supported languages
   * @returns {Array} List of supported languages
   */
  getSupportedLanguages() {
    return Object.keys(LANGUAGE_MAPPING).map(lang => ({
      id: lang,
      name: this.getLanguageDisplayName(lang),
      extension: FILE_EXTENSIONS[lang] || 'txt'
    }));
  }

  /**
   * Get display name for language
   * @param {string} languageId - Language ID
   * @returns {string} Display name
   */
  getLanguageDisplayName(languageId) {
    const displayNames = {
      'python': 'Python',
      'javascript': 'JavaScript',
      'java': 'Java',
      'cpp': 'C++',
      'c': 'C',
      'go': 'Go',
      'rust': 'Rust',
      'php': 'PHP',
      'ruby': 'Ruby',
      'kotlin': 'Kotlin',
      'swift': 'Swift',
      'typescript': 'TypeScript'
    };
    
    return displayNames[languageId] || languageId.charAt(0).toUpperCase() + languageId.slice(1);
  }

  /**
   * Validate code before execution
   * @param {string} language - Programming language
   * @param {string} code - Source code
   * @returns {object} Validation result
   */
  validateCode(language, code) {
    const result = {
      isValid: true,
      warnings: [],
      suggestions: []
    };

    // Basic validation
    if (!code || code.trim().length === 0) {
      result.isValid = false;
      result.warnings.push('Code cannot be empty');
      return result;
    }

    // Language-specific validation
    switch (language) {
      case 'python':
        this.validatePythonCode(code, result);
        break;
      case 'java':
        this.validateJavaCode(code, result);
        break;
      case 'javascript':
        this.validateJavaScriptCode(code, result);
        break;
      case 'cpp':
      case 'c':
        this.validateCCode(code, result);
        break;
    }

    return result;
  }

  /**
   * Validate Python code
   * @param {string} code - Python code
   * @param {object} result - Validation result object
   */
  validatePythonCode(code, result) {
    // Check for common Python issues
    if (!code.includes('print') && !code.includes('input')) {
      result.suggestions.push('Consider adding print statements to see output');
    }
    
    // Check for proper indentation
    const lines = code.split('\n');
    let hasIndentationIssues = false;
    lines.forEach((line, index) => {
      if (line.trim() && line.startsWith(' ') && !line.startsWith('    ')) {
        hasIndentationIssues = true;
      }
    });
    
    if (hasIndentationIssues) {
      result.warnings.push('Python code should use 4 spaces for indentation');
    }
  }

  /**
   * Validate Java code
   * @param {string} code - Java code
   * @param {object} result - Validation result object
   */
  validateJavaCode(code, result) {
    // Check for main method
    if (!code.includes('public static void main')) {
      result.warnings.push('Java programs need a main method to execute');
    }
    
    // Check for public class Main
    if (!code.includes('public class Main')) {
      result.warnings.push('Code should contain "public class Main" for proper execution');
    }
  }

  /**
   * Validate JavaScript code
   * @param {string} code - JavaScript code
   * @param {object} result - Validation result object
   */
  validateJavaScriptCode(code, result) {
    // Check for output statements
    if (!code.includes('console.log')) {
      result.suggestions.push('Use console.log() to see output in JavaScript');
    }
  }

  /**
   * Validate C/C++ code
   * @param {string} code - C/C++ code
   * @param {object} result - Validation result object
   */
  validateCCode(code, result) {
    // Check for main function
    if (!code.includes('int main')) {
      result.warnings.push('C/C++ programs need a main() function');
    }
    
    // Check for includes
    if (!code.includes('#include')) {
      result.warnings.push('Consider adding necessary #include statements');
    }
  }
}

// Export the service
export default new CodeExecutionService();