import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.Gemini_API_Key || '';

if (!GEMINI_API_KEY) {
  console.error('❌ CRITICAL: Gemini API key not found in environment variables for LearningPathService');
  console.error('Expected: NEXT_PUBLIC_GEMINI_API_KEY or Gemini_API_Key in .env.local');
}

const geminiAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Generate a comprehensive learning path using Gemini 2.5 Flash
 * @param {string} topic - The skill or domain to learn
 * @param {string} difficulty - beginner, intermediate, or advanced
 * @param {string} category - tech, soft-skills, or languages
 * @returns {Promise<Object>} - The generated learning path
 */
export const generateLearningPath = async (topic, difficulty = 'beginner', category = 'tech') => {
  const model = geminiAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192,
    },
  });

  const difficultyConfig = {
    beginner: {
      phasesCount: '3-4',
      topicsPerPhase: '2-3',
      xpRange: '100-150',
      timeEstimate: '15-25 hours'
    },
    intermediate: {
      phasesCount: '4-5',
      topicsPerPhase: '3-4',
      xpRange: '150-250',
      timeEstimate: '25-40 hours'
    },
    advanced: {
      phasesCount: '5-6',
      topicsPerPhase: '4-5',
      xpRange: '200-350',
      timeEstimate: '40-60 hours'
    }
  };

  const config = difficultyConfig[difficulty] || difficultyConfig.beginner;

  const prompt = `
    You are an expert career coach and technical mentor with deep industry knowledge.
    Create a comprehensive, industry-ready learning path for: "${topic}"
    
    Difficulty Level: ${difficulty.toUpperCase()}
    Category: ${category}
    
    Requirements:
    - Create ${config.phasesCount} learning phases with clear progression
    - Include ${config.topicsPerPhase} topics per phase with detailed subtopics
    - Estimated total time: ${config.timeEstimate}
    - XP rewards per topic: ${config.xpRange} (scale with difficulty)
    - Make content practical, job-oriented, and up-to-date (2024)
    - Include real-world projects for hands-on learning
    - Add relevant interview questions for job preparation
    - Map to actual companies hiring for these skills
    
    Return ONLY a valid JSON object with this exact structure:
    {
      "id": "generated-${Date.now()}",
      "name": "Professional name for the learning path",
      "description": "Compelling 1-2 sentence description",
      "icon": "Single relevant emoji",
      "category": "${category}",
      "difficulty": "${difficulty}",
      "estimatedHours": number,
      "totalXp": number (sum of all topic XP rewards),
      "prerequisites": ["List of prerequisites if any"],
      "phases": [
        {
          "name": "Phase Name",
          "duration": "X hours/days",
          "description": "What learner will achieve",
          "topics": [
            {
              "title": "Topic Title",
              "description": "Brief explanation",
              "subtopics": ["Subtopic 1", "Subtopic 2", "Subtopic 3"],
              "xpReward": number,
              "difficulty": "easy|medium|hard"
            }
          ],
          "milestones": ["Achievement 1", "Achievement 2"],
          "projects": [
            {
              "name": "Project Name",
              "description": "What to build/do",
              "skills": ["skill1", "skill2"]
            }
          ]
        }
      ],
      "interviewQuestions": [
        {
          "category": "Beginner|Intermediate|Advanced",
          "questions": ["Question 1?", "Question 2?", "Question 3?"]
        }
      ],
      "careerMapping": {
        "companies": ["Company1", "Company2", "Company3", "Company4", "Company5"],
        "roles": ["Role1", "Role2", "Role3"],
        "salaryRange": "$XX,XXX - $XXX,XXX",
        "requirements": ["Requirement 1", "Requirement 2", "Requirement 3"],
        "growthOutlook": "Description of career growth potential"
      },
      "resources": [
        {
          "type": "book|course|video|article",
          "name": "Resource Name",
          "description": "Brief description"
        }
      ]
    }

    IMPORTANT: Return ONLY the JSON object, no markdown code blocks or additional text.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Clean up potential markdown code blocks
    let jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();

    // Additional cleanup for edge cases
    if (jsonString.startsWith('`')) {
      jsonString = jsonString.slice(1);
    }
    if (jsonString.endsWith('`')) {
      jsonString = jsonString.slice(0, -1);
    }

    const parsedPath = JSON.parse(jsonString);

    // Ensure required fields exist
    return {
      ...parsedPath,
      id: parsedPath.id || `generated-${Date.now()}`,
      category: parsedPath.category || category,
      difficulty: parsedPath.difficulty || difficulty,
      progress: 0,
      phases: parsedPath.phases || [],
      interviewQuestions: parsedPath.interviewQuestions || [],
      careerMapping: parsedPath.careerMapping || { companies: [], roles: [], requirements: [] },
      resources: parsedPath.resources || []
    };
  } catch (error) {
    console.error("Error generating learning path:", error);

    // Enhanced fallback with meaningful structure
    return {
      id: `fallback-${Date.now()}`,
      name: `${topic} Learning Path`,
      description: `A structured path to master ${topic}. Generated path unavailable - using template.`,
      icon: '📚',
      category: category,
      difficulty: difficulty,
      estimatedHours: difficulty === 'beginner' ? 20 : difficulty === 'intermediate' ? 35 : 50,
      totalXp: difficulty === 'beginner' ? 2000 : difficulty === 'intermediate' ? 3500 : 5000,
      prerequisites: [],
      progress: 0,
      phases: [
        {
          name: 'Foundation',
          duration: '1-2 weeks',
          description: `Build your foundation in ${topic}`,
          topics: [
            {
              title: `Introduction to ${topic}`,
              description: 'Getting started with the basics',
              subtopics: ['Core concepts', 'Key terminology', 'Getting set up'],
              xpReward: 100,
              difficulty: 'easy'
            }
          ],
          milestones: ['Complete introduction'],
          projects: []
        }
      ],
      interviewQuestions: [
        {
          category: 'Beginner',
          questions: [`What is ${topic}?`, `Why is ${topic} important?`]
        }
      ],
      careerMapping: {
        companies: ['Various companies'],
        roles: [`${topic} Specialist`],
        requirements: [`${topic} knowledge`],
        salaryRange: 'Varies by location',
        growthOutlook: 'Growing demand'
      },
      resources: []
    };
  }
};

/**
 * Get suggested learning paths based on user profile
 * @param {Object} userProfile - User's learning profile
 * @returns {Array} - Array of suggested path IDs
 */
export const getSuggestedPaths = (userProfile) => {
  const suggestions = [];

  // Suggest based on weak areas
  if (userProfile?.difficultTopics?.includes('communication')) {
    suggestions.push('path-communication');
  }

  // Suggest based on preferences
  if (userProfile?.preferredTopics?.includes('leadership')) {
    suggestions.push('path-leadership');
  }

  // Default suggestions for new users
  if (suggestions.length === 0) {
    suggestions.push('path-communication', 'path-tech-interview');
  }

  return suggestions;
};
