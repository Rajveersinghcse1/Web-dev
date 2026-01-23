# 📘 Integration Guide - Adding Topic Support

## Overview
This guide explains how to add topic categorization to your questions so the new topic analysis features work properly.

---

## 🎯 Quick Start

### Step 1: Add Topics to Your Questions

When generating questions via Gemini AI or manually creating them, include a `topic` field:

```typescript
// Example in ChatBot.tsx or wherever questions are generated
const question: Question = {
  id: 1,
  type: 'mcq',
  question: "What is Newton's First Law of Motion?",
  options: ["A", "B", "C", "D"],
  correctAnswer: "A",
  marks: 1,
  topic: "Mechanics" // ← Add this field
};
```

---

## 📝 Subject-Specific Topic Examples

### Physics Topics
```typescript
const physicsTopics = [
  "Mechanics",
  "Thermodynamics",
  "Optics",
  "Electricity & Magnetism",
  "Modern Physics",
  "Waves & Sound"
];
```

### Mathematics Topics
```typescript
const mathTopics = [
  "Algebra",
  "Geometry",
  "Trigonometry",
  "Calculus",
  "Statistics",
  "Probability"
];
```

### Chemistry Topics
```typescript
const chemistryTopics = [
  "Organic Chemistry",
  "Inorganic Chemistry",
  "Physical Chemistry",
  "Chemical Bonding",
  "Thermochemistry",
  "Electrochemistry"
];
```

---

## 🔧 Implementation in Gemini AI

If you're using Gemini AI to generate questions, modify your prompt to include topic categorization:

```typescript
// In api/gemini.ts or ChatBot component
const prompt = `
Generate ${numQuestions} ${subject} questions with the following format:

For each question, include:
1. Question text
2. 4 options (A, B, C, D)
3. Correct answer
4. Topic/subtopic from: ${topicsList.join(', ')}

Format as JSON array with structure:
{
  "question": "...",
  "options": ["A", "B", "C", "D"],
  "correctAnswer": "A",
  "topic": "Mechanics"  ← Gemini will assign topic
}
`;
```

---

## 🎨 Displaying Topic Analysis

### In Test Results

The `Result` component can now display topic breakdown. Here's how to add it:

```tsx
// In Result.tsx, add this section after the score card
{result.questionAnalysis.some(q => q.topic) && (
  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-4">
    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
      <BarChart3 className="w-5 h-5 text-blue-600" />
      Topic-wise Performance
    </h3>
    
    <TopicBreakdown questions={result.questionAnalysis} />
  </div>
)}
```

### Topic Breakdown Component

Create this reusable component:

```tsx
// src/components/TopicBreakdown.tsx
import { QuestionAnalysis } from '../types';

interface TopicBreakdownProps {
  questions: QuestionAnalysis[];
}

export function TopicBreakdown({ questions }: TopicBreakdownProps) {
  // Group by topic
  const topicMap = new Map<string, { correct: number; total: number }>();
  
  questions.forEach(q => {
    if (q.topic) {
      const existing = topicMap.get(q.topic) || { correct: 0, total: 0 };
      topicMap.set(q.topic, {
        correct: existing.correct + (q.isCorrect ? 1 : 0),
        total: existing.total + 1,
      });
    }
  });

  const topics = Array.from(topicMap.entries()).map(([name, stats]) => ({
    name,
    accuracy: Math.round((stats.correct / stats.total) * 100),
    correct: stats.correct,
    total: stats.total,
  }));

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {topics.map((topic, idx) => (
        <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
          <p className="text-sm font-medium text-gray-800 mb-2">{topic.name}</p>
          <div className="flex items-end justify-between">
            <span className="text-xs text-gray-500">
              {topic.correct}/{topic.total} correct
            </span>
            <span className={`text-lg font-bold ${
              topic.accuracy >= 70 ? 'text-emerald-600' : 
              topic.accuracy >= 50 ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {topic.accuracy}%
            </span>
          </div>
          
          {/* Progress bar */}
          <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all ${
                topic.accuracy >= 70 ? 'bg-emerald-500' : 
                topic.accuracy >= 50 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${topic.accuracy}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## 🔄 Backward Compatibility

### Questions Without Topics
If questions don't have a `topic` field, the system will still work:
- `topicAnalysis` in the database will be an empty array
- Dashboard and test details will show "No topic data available"
- All other features work normally

### Gradual Migration
You can add topics gradually:
1. Start by adding topics to new tests
2. Old tests will display without topic analysis
3. Eventually, all tests will have topic data

---

## 📊 Database Behavior

When you save a test result with topics:

```typescript
// Frontend sends (automatically from App.tsx)
await saveResult({
  questionAnalysis: [
    {
      questionId: 1,
      question: "...",
      correctAnswer: "A",
      isCorrect: true,
      topic: "Mechanics"  // ← Topic included
    }
  ]
});

// Backend auto-computes (in testResults.ts)
const topicAnalysis = [
  {
    topicName: "Mechanics",
    questionsAttempted: 10,
    correct: 9,
    accuracy: 90
  }
];
// Stored in database for O(1) retrieval
```

---

## 🎯 Best Practices

### 1. Consistent Topic Names
```typescript
// ✅ Good - Consistent naming
"Mechanics"
"Mechanics"
"Mechanics"

// ❌ Bad - Inconsistent
"Mechanics"
"mechanics"
"Mech"
```

### 2. Reasonable Granularity
```typescript
// ✅ Good - Balanced
"Organic Chemistry" → "Hydrocarbons"

// ❌ Too broad
"Chemistry"

// ❌ Too specific
"Alkanes with 5-7 carbons"
```

### 3. Predefined Topic Lists
```typescript
// Define topics per subject
const SUBJECT_TOPICS = {
  Physics: ["Mechanics", "Optics", "Thermodynamics"],
  Math: ["Algebra", "Geometry", "Calculus"],
  Chemistry: ["Organic", "Inorganic", "Physical"],
};

// Use when generating questions
const topics = SUBJECT_TOPICS[selectedSubject];
```

---

## 🧪 Testing Topic Analysis

### Test with Sample Data
```typescript
// Create a test with topics
const sampleTest = {
  subject: "Physics",
  questions: [
    { id: 1, topic: "Mechanics", correctAnswer: "A" },
    { id: 2, topic: "Mechanics", correctAnswer: "B" },
    { id: 3, topic: "Optics", correctAnswer: "C" },
  ]
};

// After submission, check database
const result = await ctx.db.query(api.testResults.getTestHistory, {
  userId: user.id
});

console.log(result[0].topicAnalysis);
// Should show: [
//   { topicName: "Mechanics", questionsAttempted: 2, correct: X, accuracy: Y },
//   { topicName: "Optics", questionsAttempted: 1, correct: X, accuracy: Y }
// ]
```

---

## 🎨 UI Integration Checklist

- [ ] Add topics to question generation (ChatBot or API)
- [ ] Verify topics are passed in `questionAnalysis`
- [ ] Check database for `topicAnalysis` field after test submission
- [ ] Add `TopicBreakdown` component to Result view
- [ ] Display topic analysis in Dashboard (already implemented)
- [ ] Test with and without topics (backward compatibility)
- [ ] Update user documentation

---

## 📈 Analytics Queries

### Get Topic Performance
```typescript
// Get all topics for a user
const topics = await ctx.db.query(api.testResults.getTopicAnalysis, {
  userId: user.id
});

// Get weak topics (< 50% accuracy)
const weakTopics = await ctx.db.query(api.testResults.getWeakTopics, {
  userId: user.id
});

// Use in UI
<div>
  <h3>Your Weak Areas</h3>
  {weakTopics.map(topic => (
    <div key={topic.topicName}>
      {topic.topicName}: {topic.accuracy}%
      <button>Practice More</button>
    </div>
  ))}
</div>
```

---

## 🚀 Next Steps

1. **Modify Question Generation**: Add topic field to Gemini prompts
2. **Test with Sample Data**: Create a test with topics and verify analytics
3. **Add UI Components**: Display topic breakdown in Result view
4. **Document Topics**: Create a master list of topics per subject
5. **Monitor Usage**: Track which topics students struggle with

---

## ✅ Verification

After implementation, verify:
1. ✅ Questions have `topic` field
2. ✅ Test results saved successfully
3. ✅ Database shows `topicAnalysis` array
4. ✅ Dashboard displays topic breakdown
5. ✅ Recent Tests tab shows topic analysis
6. ✅ Old tests (without topics) still work

---

**Note**: The topic field is optional. The system works perfectly fine without it, but adding topics unlocks powerful analytics for students to identify their weak areas!

