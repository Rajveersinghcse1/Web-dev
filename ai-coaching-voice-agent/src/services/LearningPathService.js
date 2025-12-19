import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.Gemini_API_Key || 'AIzaSyAKwqIyU55FS7b6F_Y_htc8Rw4v18RyzvM';
const geminiAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export const generateLearningPath = async (topic) => {
  const model = geminiAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

  const prompt = `
    Act as an expert career coach and technical mentor.
    Create a complete, industry-ready learning path roadmap for the skill or domain: "${topic}".
    
    The output must be a valid JSON object with the following structure:
    {
      "id": "generated-${Date.now()}",
      "name": "Learning Path for ${topic}",
      "description": "A comprehensive guide to mastering ${topic}",
      "phases": [
        {
          "name": "Phase Name (e.g., Beginner, Advanced)",
          "duration": "Estimated duration",
          "topics": [
            {
              "title": "Topic Title",
              "subtopics": ["Subtopic 1", "Subtopic 2"]
            }
          ],
          "milestones": ["Milestone 1", "Milestone 2"],
          "projects": [
            {
              "name": "Project Name",
              "description": "Project Description"
            }
          ]
        }
      ],
      "interviewQuestions": [
        {
          "category": "Difficulty (Beginner/Intermediate/Advanced)",
          "questions": ["Question 1", "Question 2"]
        }
      ],
      "careerMapping": {
        "companies": ["Company 1", "Company 2"],
        "roles": ["Role 1", "Role 2"],
        "requirements": ["Requirement 1", "Requirement 2"]
      }
    }

    Ensure the content is realistic, up-to-date, and job-oriented. Avoid academic fluff.
    Return ONLY the JSON object, no markdown formatting or extra text.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    // Clean up potential markdown code blocks
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error generating learning path:", error);
    // Fallback mock data if AI fails
    return {
        id: `fallback-${Date.now()}`,
        name: `${topic} Mastery (Fallback)`,
        description: `A structured path to learn ${topic}. (AI Generation Failed)`,
        phases: [],
        interviewQuestions: [],
        careerMapping: { companies: [], roles: [], requirements: [] }
    };
  }
};
