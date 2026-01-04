/**
 * Professional Coding Challenge Interface
 * Split-screen layout with Monaco-style editor and test case execution
 * Comparable to LeetCode/GeeksforGeeks
 */

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MonacoEditor from '@monaco-editor/react';
import { 
  Play, Send, ChevronLeft, ChevronRight, 
  Clock, MemoryStick, CheckCircle2, XCircle, 
  AlertCircle, Trophy, Code2, Loader2
} from 'lucide-react';
import confetti from 'canvas-confetti';

// Language configurations
const LANGUAGES = {
  'C': { monacoId: 'c', defaultCode: '#include <stdio.h>\n\nint main() {\n    // Your code here\n    return 0;\n}' },
  'C++': { monacoId: 'cpp', defaultCode: '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Your code here\n    return 0;\n}' },
  'Java': { monacoId: 'java', defaultCode: 'public class Solution {\n    public static void main(String[] args) {\n        // Your code here\n    }\n}' },
  'Python': { monacoId: 'python', defaultCode: '# Your code here\n\ndef solution():\n    pass' },
  'JavaScript': { monacoId: 'javascript', defaultCode: '// Your code here\n\nfunction solution() {\n    \n}' }
};

const ChallengePage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  // UI State
  const [dividerPosition, setDividerPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState('description'); // description, submissions
  const [consoleTab, setConsoleTab] = useState('results'); // results, logs

  // Data State
  const [challenge, setChallenge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('Python');
  const [code, setCode] = useState(LANGUAGES['Python'].defaultCode);
  
  // Execution State
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [executionResults, setExecutionResults] = useState(null);
  const [executionLogs, setExecutionLogs] = useState([]);

  // Submission State
  const [hasAccepted, setHasAccepted] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const dividerRef = useRef(null);
  const startTimeRef = useRef(Date.now());

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  useEffect(() => {
    fetchChallenge();
  }, [slug]);

  const fetchChallenge = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/challenges/${slug}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      if (!response.ok) throw new Error('Failed to fetch challenge');

      const data = await response.json();
      setChallenge(data.data);

      // Set starter code if available
      if (data.data.starterCode && data.data.starterCode[selectedLanguage]) {
        setCode(data.data.starterCode[selectedLanguage]);
      }

      // Set solved status
      if (data.data.userProgress) {
        setHasAccepted(data.data.userProgress.isSolved);
      }

    } catch (error) {
      console.error('Error fetching challenge:', error);
      addLog('error', `Failed to load challenge: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // DIVIDER DRAGGING
  // ============================================================================

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const containerWidth = window.innerWidth;
      const newPosition = (e.clientX / containerWidth) * 100;
      setDividerPosition(Math.min(Math.max(newPosition, 30), 70));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleDividerMouseDown = () => {
    setIsDragging(true);
  };

  // ============================================================================
  // CODE EXECUTION
  // ============================================================================

  const addLog = (type, message) => {
    setExecutionLogs(prev => [...prev, { 
      type, 
      message, 
      timestamp: new Date().toLocaleTimeString() 
    }]);
  };

  const handleRunCode = async () => {
    try {
      setIsRunning(true);
      setExecutionResults(null);
      setExecutionLogs([]);
      addLog('info', `Running ${selectedLanguage} code...`);

      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/challenges/${slug}/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          code,
          language: selectedLanguage
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Execution failed');
      }

      const result = await response.json();
      setExecutionResults(result.data);

      const passed = result.data.summary.passedTestCases;
      const total = result.data.summary.totalTestCases;
      
      if (passed === total) {
        addLog('success', `✓ All ${total} test cases passed!`);
      } else {
        addLog('error', `✗ ${passed}/${total} test cases passed`);
      }

      setConsoleTab('results');

    } catch (error) {
      console.error('Execution error:', error);
      addLog('error', `Execution failed: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmitCode = async () => {
    try {
      setIsSubmitting(true);
      setExecutionResults(null);
      setExecutionLogs([]);
      addLog('info', `Submitting ${selectedLanguage} solution...`);

      const timeSpent = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const token = localStorage.getItem('token');

      const response = await fetch(`/api/v1/challenges/${slug}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          code,
          language: selectedLanguage,
          timeSpentCoding: timeSpent
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Submission failed');
      }

      const result = await response.json();
      setExecutionResults(result.data);

      if (result.data.status === 'ACCEPTED') {
        addLog('success', `✓ ACCEPTED! All test cases passed!`);
        setHasAccepted(true);
        setShowSuccessModal(true);
        triggerSuccessAnimation();
      } else {
        addLog('error', `✗ ${result.data.status.replace(/_/g, ' ')}`);
      }

      setConsoleTab('results');

    } catch (error) {
      console.error('Submission error:', error);
      addLog('error', `Submission failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const triggerSuccessAnimation = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // ============================================================================
  // LANGUAGE CHANGE
  // ============================================================================

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
    
    // Load starter code or default code
    if (challenge?.starterCode?.[language]) {
      setCode(challenge.starterCode[language]);
    } else {
      setCode(LANGUAGES[language].defaultCode);
    }
  };

  // ============================================================================
  // DIFFICULTY BADGE
  // ============================================================================

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-50 border-green-200';
      case 'Medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Hard': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">Challenge not found</h2>
          <button 
            onClick={() => navigate('/challenges')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Challenges
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* ================ HEADER ================ */}
      <header className="h-14 border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/challenges')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <Code2 className="w-5 h-5 text-blue-600" />
            <h1 className="text-lg font-semibold text-gray-900">{challenge.title}</h1>
            <span className={`px-2 py-1 text-xs font-medium rounded border ${getDifficultyColor(challenge.difficulty)}`}>
              {challenge.difficulty}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasAccepted && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg border border-green-200">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm font-medium">Solved</span>
            </div>
          )}
        </div>
      </header>

      {/* ================ MAIN CONTENT ================ */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* ================ LEFT PANEL - PROBLEM STATEMENT ================ */}
        <div 
          className="flex flex-col bg-white border-r border-gray-200 overflow-hidden"
          style={{ width: `${dividerPosition}%` }}
        >
          {/* Tabs */}
          <div className="flex items-center gap-1 px-4 pt-3 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('description')}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === 'description'
                  ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === 'submissions'
                  ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Submissions
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'description' ? (
              <div className="prose prose-sm max-w-none">
                {/* Problem Description */}
                <section className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Problem Description</h2>
                  <p className="text-gray-700 whitespace-pre-wrap">{challenge.problemStatement.description}</p>
                </section>

                {/* Input Format */}
                <section className="mb-6">
                  <h3 className="text-base font-semibold text-gray-900 mb-2">Input Format</h3>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-gray-700 text-sm whitespace-pre-wrap">{challenge.problemStatement.inputFormat}</p>
                  </div>
                </section>

                {/* Output Format */}
                <section className="mb-6">
                  <h3 className="text-base font-semibold text-gray-900 mb-2">Output Format</h3>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-gray-700 text-sm whitespace-pre-wrap">{challenge.problemStatement.outputFormat}</p>
                  </div>
                </section>

                {/* Constraints */}
                <section className="mb-6">
                  <h3 className="text-base font-semibold text-gray-900 mb-2">Constraints</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm">
                    {challenge.problemStatement.constraints.map((constraint, idx) => (
                      <li key={idx}>{constraint}</li>
                    ))}
                  </ul>
                </section>

                {/* Example Test Cases */}
                <section className="mb-6">
                  <h3 className="text-base font-semibold text-gray-900 mb-3">Examples</h3>
                  {challenge.problemStatement.exampleTestCases.map((example, idx) => (
                    <div key={idx} className="mb-4 border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                        <span className="text-sm font-medium text-gray-700">Example {idx + 1}</span>
                      </div>
                      <div className="p-4 space-y-3">
                        <div>
                          <div className="text-xs font-semibold text-gray-600 mb-1">Input:</div>
                          <code className="block bg-gray-900 text-green-400 p-2 rounded text-sm font-mono">
                            {example.input}
                          </code>
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-gray-600 mb-1">Output:</div>
                          <code className="block bg-gray-900 text-green-400 p-2 rounded text-sm font-mono">
                            {example.output}
                          </code>
                        </div>
                        {example.explanation && (
                          <div>
                            <div className="text-xs font-semibold text-gray-600 mb-1">Explanation:</div>
                            <p className="text-sm text-gray-700">{example.explanation}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </section>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>Your submissions will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* ================ DRAGGABLE DIVIDER ================ */}
        <div
          ref={dividerRef}
          onMouseDown={handleDividerMouseDown}
          className="w-1 bg-gray-200 hover:bg-blue-400 cursor-col-resize transition-colors flex-shrink-0"
        />

        {/* ================ RIGHT PANEL - CODE EDITOR ================ */}
        <div 
          className="flex flex-col bg-white overflow-hidden"
          style={{ width: `${100 - dividerPosition}%` }}
        >
          {/* Editor Header */}
          <div className="h-12 border-b border-gray-200 flex items-center justify-between px-4 flex-shrink-0">
            <select
              value={selectedLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {challenge.supportedLanguages.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRunCode}
                disabled={isRunning || isSubmitting}
                className="flex items-center gap-2 px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRunning ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                Run Code
              </button>

              <button
                onClick={handleSubmitCode}
                disabled={isRunning || isSubmitting || hasAccepted}
                className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Submit
              </button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 overflow-hidden">
            <MonacoEditor
              height="100%"
              language={LANGUAGES[selectedLanguage].monacoId}
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{
                minimap: { enabled: true },
                fontSize: 14,
                lineNumbers: 'on',
                automaticLayout: true,
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                tabSize: 4
              }}
            />
          </div>

          {/* Console / Results */}
          <div className="h-64 border-t border-gray-200 flex flex-col flex-shrink-0">
            {/* Console Tabs */}
            <div className="flex items-center gap-1 px-4 pt-2 bg-gray-50 border-b border-gray-200">
              <button
                onClick={() => setConsoleTab('results')}
                className={`px-3 py-1.5 text-sm font-medium rounded-t transition-colors ${
                  consoleTab === 'results'
                    ? 'bg-white text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Test Results
              </button>
              <button
                onClick={() => setConsoleTab('logs')}
                className={`px-3 py-1.5 text-sm font-medium rounded-t transition-colors ${
                  consoleTab === 'logs'
                    ? 'bg-white text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Logs
              </button>
            </div>

            {/* Console Content */}
            <div className="flex-1 overflow-y-auto p-4 bg-white">
              {consoleTab === 'results' ? (
                executionResults ? (
                  <ResultsView results={executionResults} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                    Run or submit your code to see results
                  </div>
                )
              ) : (
                <LogsView logs={executionLogs} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================ SUCCESS MODAL ================ */}
      {showSuccessModal && (
        <SuccessModal
          challenge={challenge}
          results={executionResults}
          onClose={() => setShowSuccessModal(false)}
          onNext={() => navigate('/challenges')}
        />
      )}
    </div>
  );
};

// ============================================================================
// RESULTS VIEW COMPONENT
// ============================================================================

const ResultsView = ({ results }) => {
  if (!results) return null;

  const isAccepted = results.status === 'ACCEPTED' || results.status === 'ALL_PASSED';
  const { summary } = results;

  return (
    <div className="space-y-4">
      {/* Status Header */}
      <div className={`flex items-center gap-3 p-4 rounded-lg border-2 ${
        isAccepted 
          ? 'bg-green-50 border-green-200' 
          : 'bg-red-50 border-red-200'
      }`}>
        {isAccepted ? (
          <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
        ) : (
          <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
        )}
        <div>
          <h3 className={`text-lg font-semibold ${
            isAccepted ? 'text-green-900' : 'text-red-900'
          }`}>
            {results.status.replace(/_/g, ' ')}
          </h3>
          <p className={`text-sm ${
            isAccepted ? 'text-green-700' : 'text-red-700'
          }`}>
            {summary.passedTestCases}/{summary.totalTestCases} test cases passed
          </p>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 text-blue-700 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-medium">Execution Time</span>
          </div>
          <p className="text-lg font-semibold text-blue-900">
            {summary.totalExecutionTime}ms
          </p>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
          <div className="flex items-center gap-2 text-purple-700 mb-1">
            <MemoryStick className="w-4 h-4" />
            <span className="text-xs font-medium">Memory Used</span>
          </div>
          <p className="text-lg font-semibold text-purple-900">
            {summary.peakMemoryUsage?.toFixed(2) || 0} MB
          </p>
        </div>
      </div>

      {/* Test Case Results */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-gray-900">Test Cases</h4>
        {results.testCaseResults?.map((result, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg border ${
              result.passed
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm font-medium ${
                result.passed ? 'text-green-900' : 'text-red-900'
              }`}>
                Test Case {result.testCaseNumber || idx + 1} {result.isHidden && '(Hidden)'}
              </span>
              <span className={`text-xs font-medium ${
                result.passed ? 'text-green-700' : 'text-red-700'
              }`}>
                {result.executionTime}ms
              </span>
            </div>
            {!result.isHidden && !result.passed && (
              <div className="space-y-1 text-xs">
                <div>
                  <span className="font-semibold text-gray-700">Input: </span>
                  <code className="text-gray-600">{result.input}</code>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Expected: </span>
                  <code className="text-green-700">{result.expectedOutput}</code>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Got: </span>
                  <code className="text-red-700">{result.actualOutput}</code>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// LOGS VIEW COMPONENT
// ============================================================================

const LogsView = ({ logs }) => {
  return (
    <div className="space-y-1 font-mono text-xs">
      {logs.length === 0 ? (
        <div className="text-gray-400 text-center py-8">No logs yet</div>
      ) : (
        logs.map((log, idx) => (
          <div
            key={idx}
            className={`py-1 ${
              log.type === 'error' ? 'text-red-600' :
              log.type === 'success' ? 'text-green-600' :
              'text-gray-700'
            }`}
          >
            <span className="text-gray-400">[{log.timestamp}]</span> {log.message}
          </div>
        ))
      )}
    </div>
  );
};

// ============================================================================
// SUCCESS MODAL COMPONENT
// ============================================================================

const SuccessModal = ({ challenge, results, onClose, onNext }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
        <div className="text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            All Test Cases Passed!
          </h2>
          <p className="text-gray-600 mb-6">
            Congratulations on solving "{challenge.title}"
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600 mx-auto mb-1" />
              <div className="text-2xl font-bold text-blue-900">
                {results.summary.totalExecutionTime}ms
              </div>
              <div className="text-xs text-blue-700">Execution Time</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <Trophy className="w-5 h-5 text-purple-600 mx-auto mb-1" />
              <div className="text-2xl font-bold text-purple-900">
                +{results.summary.earnedPoints || 0}
              </div>
              <div className="text-xs text-purple-700">Points Earned</div>
            </div>
          </div>

          {/* Complexity Visualization Placeholder */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-600 mb-2">Your solution performance:</p>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-500 to-blue-500"
                style={{ width: '85%' }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Faster than 85% of submissions
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Review Solution
            </button>
            <button
              onClick={onNext}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
            >
              Next Problem →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengePage;
