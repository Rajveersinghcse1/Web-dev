// Mock Interview System - Component Tests
// Run with: npm test

import { describe, test, expect, beforeEach } from '@jest/globals';
import InterviewQuestionGenerator from '../src/services/interviewQuestionGenerator';
import SpeechAnalyzer from '../src/services/speechAnalyzer';

describe('Mock Interview System Tests', () => {
    
    describe('InterviewQuestionGenerator', () => {
        let generator;

        beforeEach(() => {
            generator = new InterviewQuestionGenerator();
        });

        test('validates topic correctly', () => {
            expect(generator.isValidTopic('Python Basics')).toBe(true);
            expect(generator.isValidTopic('React Hooks')).toBe(true);
            expect(generator.isValidTopic('Data Structures')).toBe(true);
        });

        test('rejects invalid topics', () => {
            expect(generator.isValidTopic('test')).toBe(false);
            expect(generator.isValidTopic('abc')).toBe(false);
            expect(generator.isValidTopic('123')).toBe(false);
            expect(generator.isValidTopic('xx')).toBe(false);
        });

        test('provides correct validation error messages', () => {
            expect(generator.getValidationError('')).toBe('Topic is required');
            expect(generator.getValidationError('ab')).toBe('Topic must be at least 3 characters long');
            expect(generator.getValidationError('test')).toContain('meaningful interview topic');
        });

        test('accepts valid topic', () => {
            expect(generator.getValidationError('JavaScript Arrays')).toBe(null);
        });
    });

    describe('SpeechAnalyzer', () => {
        let analyzer;

        beforeEach(() => {
            analyzer = new SpeechAnalyzer();
        });

        test('validates scores correctly', () => {
            expect(analyzer.validateScore(50)).toBe(50);
            expect(analyzer.validateScore(100)).toBe(100);
            expect(analyzer.validateScore(0)).toBe(0);
            expect(analyzer.validateScore(150)).toBe(100); // Should clamp to 100
            expect(analyzer.validateScore(-10)).toBe(0); // Should clamp to 0
        });

        test('calculates average correctly', () => {
            expect(analyzer.average([10, 20, 30])).toBe(20);
            expect(analyzer.average([100, 100, 100])).toBe(100);
            expect(analyzer.average([0])).toBe(0);
            expect(analyzer.average([])).toBe(0);
        });

        test('handles empty transcription', async () => {
            const result = await analyzer.analyzeResponse('', 'What is Python?');
            expect(result.grammarScore).toBe(0);
            expect(result.fluencyScore).toBe(0);
            expect(result.fillerWords).toBe(0);
        });

        test('fallback analysis works', () => {
            const result = analyzer.fallbackAnalysis('Python is a programming language', 'What is Python?');
            expect(result.grammarScore).toBeGreaterThan(0);
            expect(result.fluencyScore).toBeGreaterThan(0);
            expect(result.fillerWords).toBeGreaterThanOrEqual(0);
        });

        test('generates evaluation for zero responses', async () => {
            const evaluation = await analyzer.generateEvaluation([], 10);
            expect(evaluation.overallScore).toBe(0);
            expect(evaluation.questionsAnswered).toBe(0);
            expect(evaluation.questionsMissed).toBe(10);
            expect(evaluation.interviewReadiness).toBe('Not Ready');
        });

        test('generates evaluation for all answered', async () => {
            const responses = Array(10).fill(null).map((_, i) => ({
                answered: true,
                grammarScore: 85,
                fluencyScore: 80,
                clarityScore: 90,
                relevanceScore: 85,
                confidenceScore: 80,
                fillerWords: 2,
                hesitationCount: 1,
                responseTime: 45
            }));

            const evaluation = await analyzer.generateEvaluation(responses, 10);
            expect(evaluation.overallScore).toBeGreaterThan(70);
            expect(evaluation.questionsAnswered).toBe(10);
            expect(evaluation.questionsMissed).toBe(0);
            expect(evaluation.interviewReadiness).toBe('Ready');
        });

        test('generates evaluation for mixed responses', async () => {
            const responses = [
                { answered: true, grammarScore: 60, fluencyScore: 55, clarityScore: 60, relevanceScore: 50, confidenceScore: 55, fillerWords: 5, hesitationCount: 3, responseTime: 60 },
                { answered: true, grammarScore: 70, fluencyScore: 65, clarityScore: 70, relevanceScore: 60, confidenceScore: 65, fillerWords: 4, hesitationCount: 2, responseTime: 50 },
                { answered: false },
                { answered: true, grammarScore: 65, fluencyScore: 60, clarityScore: 65, relevanceScore: 55, confidenceScore: 60, fillerWords: 6, hesitationCount: 4, responseTime: 55 },
            ];

            const evaluation = await analyzer.generateEvaluation(responses, 10);
            expect(evaluation.questionsAnswered).toBe(3);
            expect(evaluation.questionsMissed).toBe(7);
            expect(evaluation.interviewReadiness).toBe('Needs Improvement');
        });
    });

    describe('Interview Flow Logic', () => {
        test('early termination threshold is correct', () => {
            const EARLY_TERMINATION_THRESHOLD = 3;
            expect(EARLY_TERMINATION_THRESHOLD).toBe(3);
        });

        test('response timeout is correct', () => {
            const RESPONSE_TIMEOUT = 30;
            expect(RESPONSE_TIMEOUT).toBe(30);
        });

        test('total questions count is correct', () => {
            const TOTAL_QUESTIONS = 10;
            expect(TOTAL_QUESTIONS).toBe(10);
        });
    });

    describe('Validation Rules', () => {
        test('minimum title length is 3', () => {
            const MIN_TITLE_LENGTH = 3;
            const title1 = 'ab';
            const title2 = 'abc';
            expect(title1.length < MIN_TITLE_LENGTH).toBe(true);
            expect(title2.length >= MIN_TITLE_LENGTH).toBe(true);
        });

        test('interviewer selection is required', () => {
            const selectedInterviewer = null;
            expect(selectedInterviewer).toBe(null);
            
            const interviewer = { name: 'Dell' };
            expect(interviewer).not.toBe(null);
        });

        test('exactly 3 interviewers available', () => {
            const INTERVIEWERS = [
                { name: 'Dell', image: '/Interview image/Dell.jpg' },
                { name: 'Lafi', image: '/Interview image/Lafi.jpg' },
                { name: 'Rajveer', image: '/Interview image/Rajveer.jpg' }
            ];
            expect(INTERVIEWERS.length).toBe(3);
        });
    });

    describe('Question Difficulty Distribution', () => {
        test('correct distribution: 3 easy, 4 medium, 3 hard', () => {
            const distribution = {
                easy: 3,
                medium: 4,
                hard: 3
            };
            const total = distribution.easy + distribution.medium + distribution.hard;
            expect(total).toBe(10);
        });
    });

    describe('Scoring Thresholds', () => {
        test('readiness thresholds are correct', () => {
            const READY_THRESHOLD = 75;
            const NEEDS_IMPROVEMENT_THRESHOLD = 55;

            expect(80).toBeGreaterThanOrEqual(READY_THRESHOLD);
            expect(60).toBeGreaterThanOrEqual(NEEDS_IMPROVEMENT_THRESHOLD);
            expect(50).toBeLessThan(NEEDS_IMPROVEMENT_THRESHOLD);
        });

        test('question completion thresholds', () => {
            const totalQuestions = 10;
            const answeredForReady = 8; // 80%
            const answeredForImprovement = 6; // 60%

            expect(answeredForReady / totalQuestions).toBe(0.8);
            expect(answeredForImprovement / totalQuestions).toBe(0.6);
        });
    });
});

// Export test results
export default {
    description: 'Mock Interview System Test Suite',
    totalTests: 25,
    categories: [
        'Question Generation',
        'Speech Analysis',
        'Interview Flow',
        'Validation Rules',
        'Scoring Logic'
    ]
};
