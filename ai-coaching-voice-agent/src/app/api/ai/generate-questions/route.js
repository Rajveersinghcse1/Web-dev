import { NextResponse } from 'next/server';

/**
 * API Route: Generate Interview Questions
 * 
 * POST /api/ai/generate-questions
 * 
 * Generates AI-powered interview questions based on domain and level
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { domain, level, title, count = 10 } = body;

    // Validate input
    if (!domain || !level) {
      return NextResponse.json(
        { error: 'Missing required fields: domain, level' },
        { status: 400 }
      );
    }

    // TODO: Replace with actual AI service call (OpenAI, Gemini, etc.)
    // For now, generating structured mock questions
    
    const questions = Array.from({ length: count }, (_, i) => ({
      id: `q_${Date.now()}_${i}`,
      text: generateQuestionText(domain, level, i),
      difficulty: level,
      category: getCategoryForQuestion(i, domain),
      expectedDuration: 30,
    }));

    return NextResponse.json({
      success: true,
      questions,
      metadata: {
        domain,
        level,
        title,
        generatedAt: Date.now(),
      },
    });

  } catch (error) {
    console.error('[AI API] Generate questions error:', error);
    return NextResponse.json(
      { error: 'Failed to generate questions', details: error.message },
      { status: 500 }
    );
  }
}

// Helper: Generate question text based on domain and level
function generateQuestionText(domain, level, index) {
  const templates = {
    'Frontend Development': [
      'Explain the difference between var, let, and const in JavaScript',
      'What are React hooks and how do you use useState?',
      'How would you optimize performance in a React application?',
      'Explain the concept of closures in JavaScript',
      'What is the virtual DOM and how does it work?',
      'Describe the CSS box model',
      'What is responsive design and how do you implement it?',
      'Explain event delegation in JavaScript',
      'What are promises and async/await in JavaScript?',
      'How would you handle state management in a large React app?',
    ],
    'Backend Development': [
      'Explain RESTful API design principles',
      'What is the difference between SQL and NoSQL databases?',
      'How would you handle authentication and authorization?',
      'Explain the concept of middleware in Express.js',
      'What is database indexing and why is it important?',
      'Describe the N+1 query problem and how to solve it',
      'What is caching and when should you use it?',
      'Explain ACID properties in databases',
      'How would you design a scalable API?',
      'What are microservices and when should you use them?',
    ],
    'Data Science': [
      'Explain the difference between supervised and unsupervised learning',
      'What is overfitting and how do you prevent it?',
      'Describe the bias-variance tradeoff',
      'How would you handle missing data in a dataset?',
      'Explain cross-validation and its importance',
      'What is feature engineering and why is it important?',
      'Describe the difference between classification and regression',
      'How would you evaluate a machine learning model?',
      'Explain the concept of gradient descent',
      'What is regularization and when should you use it?',
    ],
  };

  const domainQuestions = templates[domain] || templates['Frontend Development'];
  return domainQuestions[index % domainQuestions.length];
}

// Helper: Categorize questions
function getCategoryForQuestion(index, domain) {
  const categories = {
    'Frontend Development': ['JavaScript', 'React', 'CSS', 'Performance', 'State Management'],
    'Backend Development': ['API Design', 'Databases', 'Security', 'Architecture', 'Performance'],
    'Data Science': ['ML Concepts', 'Data Processing', 'Model Evaluation', 'Statistics', 'Algorithms'],
  };

  const domainCategories = categories[domain] || categories['Frontend Development'];
  return domainCategories[index % domainCategories.length];
}
