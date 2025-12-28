// Speech Analysis Service
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.Gemini_API_Key || "";

if (!API_KEY) {
    console.error('❌ CRITICAL: Gemini API key not found in environment variables for SpeechAnalyzer');
}

const genAI = new GoogleGenerativeAI(API_KEY);

export class SpeechAnalyzer {
    constructor() {
        if (!API_KEY) {
            console.warn('⚠️ SpeechAnalyzer: No API key - will use fallback analysis');
        }
        this.model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        this.hasAPIKey = !!API_KEY;
        console.log('✓ SpeechAnalyzer initialized (gemini-2.5-flash)');
    }

    /**
     * Analyze transcribed speech for various metrics
     * @param {string} transcription - The transcribed text
     * @param {string} questionText - The question that was asked
     * @returns {Promise<Object>} Analysis results
     */
    async analyzeResponse(transcription, questionText) {
        if (!transcription || transcription.trim().length === 0) {
            console.log('⚠️ SpeechAnalyzer: Empty transcription - returning zero scores');
            return {
                grammarScore: 0,
                fluencyScore: 0,
                fillerWords: 0,
                hesitationCount: 0,
                clarityScore: 0,
                relevanceScore: 0,
                confidenceScore: 0,
            };
        }

        if (!this.hasAPIKey) {
            console.log('⚠️ SpeechAnalyzer: No API key - using fallback analysis');
            return this.fallbackAnalysis(transcription, questionText);
        }

        console.log(`🔄 Gemini API (SpeechAnalyzer): Analyzing response (${transcription.length} chars)`);

        const prompt = `Analyze the following interview response for a technical interview question.

Question: "${questionText}"
Response: "${transcription}"

Analyze the response and provide scores (0-100) for:
1. Grammar Score - Grammatical correctness
2. Fluency Score - Flow and coherence
3. Filler Words Count - Count of um, uh, hmm, like, you know, etc.
4. Hesitation Count - Number of pauses or stammering instances
5. Clarity Score - How clear and articulate the response is
6. Relevance Score - How relevant the answer is to the question
7. Confidence Score - Overall confidence in delivery

Return ONLY a JSON object with this exact structure:
{
  "grammarScore": 85,
  "fluencyScore": 80,
  "fillerWords": 3,
  "hesitationCount": 2,
  "clarityScore": 90,
  "relevanceScore": 85,
  "confidenceScore": 80
}`;

        try {
            console.log('📡 Gemini API (SpeechAnalyzer): Sending analysis request...');
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            let text = response.text().trim();

            // Clean up response
            if (text.startsWith("```json")) {
                text = text.substring(7);
            }
            if (text.startsWith("```")) {
                text = text.substring(3);
            }
            if (text.endsWith("```")) {
                text = text.substring(0, text.length - 3);
            }
            text = text.trim();

            const analysis = JSON.parse(text);

            // Validate scores
            const validatedAnalysis = {
                grammarScore: this.validateScore(analysis.grammarScore),
                fluencyScore: this.validateScore(analysis.fluencyScore),
                fillerWords: Math.max(0, parseInt(analysis.fillerWords) || 0),
                hesitationCount: Math.max(0, parseInt(analysis.hesitationCount) || 0),
                clarityScore: this.validateScore(analysis.clarityScore),
                relevanceScore: this.validateScore(analysis.relevanceScore),
                confidenceScore: this.validateScore(analysis.confidenceScore),
            };

            console.log('✅ Gemini API (SpeechAnalyzer): Analysis complete', {
                grammar: validatedAnalysis.grammarScore,
                fluency: validatedAnalysis.fluencyScore,
                clarity: validatedAnalysis.clarityScore,
                relevance: validatedAnalysis.relevanceScore
            });

            return validatedAnalysis;

        } catch (error) {
            console.error("❌ Gemini API (SpeechAnalyzer): Analysis failed:", error.message);
            console.log('⚠️ SpeechAnalyzer: Falling back to heuristic analysis');
            
            // Return basic analysis based on text length and simple heuristics
            return this.fallbackAnalysis(transcription, questionText);
        }
    }

    /**
     * Validate and clamp score between 0-100
     */
    validateScore(score) {
        const num = parseFloat(score) || 0;
        return Math.max(0, Math.min(100, num));
    }

    /**
     * Fallback analysis using simple heuristics
     */
    fallbackAnalysis(transcription, questionText) {
        const text = transcription.toLowerCase();
        const words = text.split(/\s+/);
        const wordCount = words.length;

        // Count filler words
        const fillerPatterns = ['um', 'uh', 'hmm', 'like', 'you know', 'actually', 'basically'];
        let fillerWords = 0;
        fillerPatterns.forEach(pattern => {
            const regex = new RegExp(`\\b${pattern}\\b`, 'gi');
            const matches = text.match(regex);
            if (matches) fillerWords += matches.length;
        });

        // Estimate scores based on length and filler words
        const lengthScore = Math.min(100, (wordCount / 50) * 100); // Ideal ~50 words
        const fillerPenalty = Math.min(30, fillerWords * 10);

        return {
            grammarScore: Math.max(50, 90 - fillerPenalty),
            fluencyScore: Math.max(50, lengthScore - fillerPenalty),
            fillerWords: fillerWords,
            hesitationCount: Math.floor(fillerWords / 2),
            clarityScore: Math.max(50, 85 - fillerPenalty),
            relevanceScore: 70, // Default moderate score
            confidenceScore: Math.max(50, 80 - fillerPenalty),
        };
    }

    /**
     * Generate comprehensive evaluation for entire interview
     * @param {Array} responses - Array of question responses with analysis
     * @param {number} totalQuestions - Total number of questions
     * @returns {Promise<Object>} Comprehensive evaluation
     */
    async generateEvaluation(responses, totalQuestions) {
        const answeredResponses = responses.filter(r => r.answered);
        const questionsAnswered = answeredResponses.length;
        const questionsMissed = totalQuestions - questionsAnswered;

        if (questionsAnswered === 0) {
            return {
                overallScore: 0,
                grammarAccuracy: 0,
                fluencyScore: 0,
                hesitationFrequency: 0,
                avgResponseTime: 0,
                topicRelevance: 0,
                interviewReadiness: "Not Ready",
                strengths: [],
                weaknesses: [
                    "No responses provided",
                    "Unable to engage with interview questions",
                    "Requires significant preparation before attempting interviews"
                ],
                suggestions: [
                    "Practice answering common interview questions aloud",
                    "Build confidence by preparing and rehearsing responses",
                    "Start with easier topics to build foundational skills",
                    "Consider mock interviews with friends or mentors"
                ],
                questionsAnswered,
                questionsMissed,
            };
        }

        // Calculate averages
        const avgGrammar = this.average(answeredResponses.map(r => r.grammarScore || 0));
        const avgFluency = this.average(answeredResponses.map(r => r.fluencyScore || 0));
        const avgClarity = this.average(answeredResponses.map(r => r.clarityScore || 0));
        const avgRelevance = this.average(answeredResponses.map(r => r.relevanceScore || 0));
        const avgConfidence = this.average(answeredResponses.map(r => r.confidenceScore || 0));
        const avgResponseTime = this.average(answeredResponses.map(r => r.responseTime || 0));
        const totalFillers = answeredResponses.reduce((sum, r) => sum + (r.fillerWords || 0), 0);
        const avgHesitation = this.average(answeredResponses.map(r => r.hesitationCount || 0));

        // Calculate overall score
        const overallScore = (
            avgGrammar * 0.2 +
            avgFluency * 0.2 +
            avgClarity * 0.15 +
            avgRelevance * 0.25 +
            avgConfidence * 0.2
        );

        // Determine readiness
        let interviewReadiness;
        if (overallScore >= 75 && questionsAnswered >= totalQuestions * 0.8) {
            interviewReadiness = "Ready";
        } else if (overallScore >= 55 && questionsAnswered >= totalQuestions * 0.6) {
            interviewReadiness = "Needs Improvement";
        } else {
            interviewReadiness = "Not Ready";
        }

        // Identify strengths
        const strengths = [];
        if (avgGrammar >= 80) strengths.push("Strong grammar and language skills");
        if (avgFluency >= 80) strengths.push("Excellent fluency and coherence");
        if (avgClarity >= 80) strengths.push("Clear and articulate communication");
        if (avgRelevance >= 80) strengths.push("Highly relevant and focused responses");
        if (avgConfidence >= 80) strengths.push("Confident delivery and presentation");
        if (totalFillers <= questionsAnswered * 2) strengths.push("Minimal use of filler words");
        if (questionsAnswered === totalQuestions) strengths.push("Attempted all questions");

        // Identify weaknesses
        const weaknesses = [];
        if (avgGrammar < 60) weaknesses.push("Grammar and language accuracy needs work");
        if (avgFluency < 60) weaknesses.push("Fluency and flow can be improved");
        if (avgClarity < 60) weaknesses.push("Responses lack clarity");
        if (avgRelevance < 60) weaknesses.push("Answers often miss the main point");
        if (avgConfidence < 60) weaknesses.push("Delivery shows lack of confidence");
        if (totalFillers > questionsAnswered * 5) weaknesses.push("Excessive use of filler words");
        if (avgHesitation > 3) weaknesses.push("Frequent hesitation and pauses");
        if (questionsMissed > totalQuestions * 0.3) weaknesses.push("Did not complete all questions");

        // Generate suggestions
        const suggestions = [];
        if (avgGrammar < 70) suggestions.push("Review grammar fundamentals and practice speaking clearly");
        if (avgFluency < 70) suggestions.push("Practice speaking on technical topics to improve flow");
        if (totalFillers > questionsAnswered * 3) suggestions.push("Reduce filler words by pausing instead");
        if (avgRelevance < 70) suggestions.push("Focus on understanding the question before answering");
        if (avgConfidence < 70) suggestions.push("Build confidence through more mock interviews");
        if (avgResponseTime > 15) suggestions.push("Work on providing more concise answers");
        if (questionsMissed > 0) suggestions.push("Attempt all questions even if uncertain");
        suggestions.push("Practice with progressively harder questions");

        return {
            overallScore: Math.round(overallScore),
            grammarAccuracy: Math.round(avgGrammar),
            fluencyScore: Math.round(avgFluency),
            hesitationFrequency: Math.round(avgHesitation * 10) / 10,
            avgResponseTime: Math.round(avgResponseTime),
            topicRelevance: Math.round(avgRelevance),
            interviewReadiness,
            strengths: strengths.slice(0, 5), // Top 5
            weaknesses: weaknesses.slice(0, 5), // Top 5
            suggestions: suggestions.slice(0, 6), // Top 6
            questionsAnswered,
            questionsMissed,
        };
    }

    /**
     * Calculate average of array
     */
    average(arr) {
        if (arr.length === 0) return 0;
        return arr.reduce((sum, val) => sum + val, 0) / arr.length;
    }
}

export default SpeechAnalyzer;
