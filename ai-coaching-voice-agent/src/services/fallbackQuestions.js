// Fallback Question Bank
// Used when Gemini API fails to generate questions

export const FALLBACK_QUESTIONS = {
    "JavaScript": [
        { questionId: "fb_js_1", questionText: "Explain the difference between var, let, and const in JavaScript.", difficulty: "easy", source: "Common interview question" },
        { questionId: "fb_js_2", questionText: "What are closures in JavaScript and how do they work?", difficulty: "easy", source: "Common interview question" },
        { questionId: "fb_js_3", questionText: "Explain the concept of hoisting in JavaScript.", difficulty: "easy", source: "Common interview question" },
        { questionId: "fb_js_4", questionText: "What is the difference between == and === in JavaScript?", difficulty: "medium", source: "Common interview question" },
        { questionId: "fb_js_5", questionText: "How does the event loop work in JavaScript?", difficulty: "medium", source: "Common interview question" },
        { questionId: "fb_js_6", questionText: "Explain prototypal inheritance in JavaScript.", difficulty: "medium", source: "Common interview question" },
        { questionId: "fb_js_7", questionText: "What are promises and how do they differ from callbacks?", difficulty: "medium", source: "Common interview question" },
        { questionId: "fb_js_8", questionText: "Explain async/await and how it simplifies asynchronous code.", difficulty: "hard", source: "Common interview question" },
        { questionId: "fb_js_9", questionText: "What is the purpose of WeakMap and WeakSet in JavaScript?", difficulty: "hard", source: "Common interview question" },
        { questionId: "fb_js_10", questionText: "How would you implement debouncing and throttling in JavaScript?", difficulty: "hard", source: "Common interview question" }
    ],
    
    "React": [
        { questionId: "fb_react_1", questionText: "What is the virtual DOM and how does React use it?", difficulty: "easy", source: "Common interview question" },
        { questionId: "fb_react_2", questionText: "Explain the difference between functional and class components.", difficulty: "easy", source: "Common interview question" },
        { questionId: "fb_react_3", questionText: "What are React hooks and why were they introduced?", difficulty: "easy", source: "Common interview question" },
        { questionId: "fb_react_4", questionText: "Explain the useState hook with an example.", difficulty: "medium", source: "Common interview question" },
        { questionId: "fb_react_5", questionText: "What is useEffect and when would you use it?", difficulty: "medium", source: "Common interview question" },
        { questionId: "fb_react_6", questionText: "How does React Context API work?", difficulty: "medium", source: "Common interview question" },
        { questionId: "fb_react_7", questionText: "Explain the concept of prop drilling and how to avoid it.", difficulty: "medium", source: "Common interview question" },
        { questionId: "fb_react_8", questionText: "What are React keys and why are they important?", difficulty: "hard", source: "Common interview question" },
        { questionId: "fb_react_9", questionText: "How would you optimize performance in a React application?", difficulty: "hard", source: "Common interview question" },
        { questionId: "fb_react_10", questionText: "Explain React's reconciliation algorithm.", difficulty: "hard", source: "Common interview question" }
    ],
    
    "Python": [
        { questionId: "fb_py_1", questionText: "Explain the difference between lists and tuples in Python.", difficulty: "easy", source: "Common interview question" },
        { questionId: "fb_py_2", questionText: "What are decorators in Python?", difficulty: "easy", source: "Common interview question" },
        { questionId: "fb_py_3", questionText: "Explain the concept of list comprehension with examples.", difficulty: "easy", source: "Common interview question" },
        { questionId: "fb_py_4", questionText: "What is the difference between is and == in Python?", difficulty: "medium", source: "Common interview question" },
        { questionId: "fb_py_5", questionText: "Explain generators and the yield keyword.", difficulty: "medium", source: "Common interview question" },
        { questionId: "fb_py_6", questionText: "What are context managers and how do you use them?", difficulty: "medium", source: "Common interview question" },
        { questionId: "fb_py_7", questionText: "Explain the Global Interpreter Lock (GIL) in Python.", difficulty: "medium", source: "Common interview question" },
        { questionId: "fb_py_8", questionText: "What is monkey patching and when would you use it?", difficulty: "hard", source: "Common interview question" },
        { questionId: "fb_py_9", questionText: "Explain metaclasses in Python.", difficulty: "hard", source: "Common interview question" },
        { questionId: "fb_py_10", questionText: "How would you implement a singleton pattern in Python?", difficulty: "hard", source: "Common interview question" }
    ],
    
    "Node.js": [
        { questionId: "fb_node_1", questionText: "What is Node.js and how does it differ from traditional server-side technologies?", difficulty: "easy", source: "Common interview question" },
        { questionId: "fb_node_2", questionText: "Explain the event-driven architecture of Node.js.", difficulty: "easy", source: "Common interview question" },
        { questionId: "fb_node_3", questionText: "What is npm and what is its purpose?", difficulty: "easy", source: "Common interview question" },
        { questionId: "fb_node_4", questionText: "Explain the difference between process.nextTick() and setImmediate().", difficulty: "medium", source: "Common interview question" },
        { questionId: "fb_node_5", questionText: "What are streams in Node.js and why are they useful?", difficulty: "medium", source: "Common interview question" },
        { questionId: "fb_node_6", questionText: "How does middleware work in Express.js?", difficulty: "medium", source: "Common interview question" },
        { questionId: "fb_node_7", questionText: "Explain error handling in Node.js applications.", difficulty: "medium", source: "Common interview question" },
        { questionId: "fb_node_8", questionText: "What is clustering in Node.js and how does it improve performance?", difficulty: "hard", source: "Common interview question" },
        { questionId: "fb_node_9", questionText: "How would you handle memory leaks in Node.js?", difficulty: "hard", source: "Common interview question" },
        { questionId: "fb_node_10", questionText: "Explain the worker threads module and when to use it.", difficulty: "hard", source: "Common interview question" }
    ],
    
    "Java": [
        { questionId: "fb_java_1", questionText: "Explain the difference between JDK, JRE, and JVM.", difficulty: "easy", source: "Common interview question" },
        { questionId: "fb_java_2", questionText: "What is the difference between == and .equals() in Java?", difficulty: "easy", source: "Common interview question" },
        { questionId: "fb_java_3", questionText: "Explain the concepts of method overloading and overriding.", difficulty: "easy", source: "Common interview question" },
        { questionId: "fb_java_4", questionText: "What is the difference between abstract classes and interfaces?", difficulty: "medium", source: "Common interview question" },
        { questionId: "fb_java_5", questionText: "Explain the Java memory model and garbage collection.", difficulty: "medium", source: "Common interview question" },
        { questionId: "fb_java_6", questionText: "What are Java streams and how do they work?", difficulty: "medium", source: "Common interview question" },
        { questionId: "fb_java_7", questionText: "Explain the concept of multithreading in Java.", difficulty: "medium", source: "Common interview question" },
        { questionId: "fb_java_8", questionText: "What is the difference between synchronized method and synchronized block?", difficulty: "hard", source: "Common interview question" },
        { questionId: "fb_java_9", questionText: "Explain the Java reflection API and its use cases.", difficulty: "hard", source: "Common interview question" },
        { questionId: "fb_java_10", questionText: "How would you design a custom thread pool in Java?", difficulty: "hard", source: "Common interview question" }
    ],
    
    "SQL": [
        { questionId: "fb_sql_1", questionText: "Explain the difference between INNER JOIN and OUTER JOIN.", difficulty: "easy", source: "Common interview question" },
        { questionId: "fb_sql_2", questionText: "What is a primary key and why is it important?", difficulty: "easy", source: "Common interview question" },
        { questionId: "fb_sql_3", questionText: "Explain the difference between WHERE and HAVING clauses.", difficulty: "easy", source: "Common interview question" },
        { questionId: "fb_sql_4", questionText: "What are indexes and how do they improve query performance?", difficulty: "medium", source: "Common interview question" },
        { questionId: "fb_sql_5", questionText: "Explain database normalization and its different forms.", difficulty: "medium", source: "Common interview question" },
        { questionId: "fb_sql_6", questionText: "What is a transaction and what are ACID properties?", difficulty: "medium", source: "Common interview question" },
        { questionId: "fb_sql_7", questionText: "Explain the difference between clustered and non-clustered indexes.", difficulty: "medium", source: "Common interview question" },
        { questionId: "fb_sql_8", questionText: "What are stored procedures and when would you use them?", difficulty: "hard", source: "Common interview question" },
        { questionId: "fb_sql_9", questionText: "Explain query optimization techniques in SQL.", difficulty: "hard", source: "Common interview question" },
        { questionId: "fb_sql_10", questionText: "How would you handle deadlocks in a database?", difficulty: "hard", source: "Common interview question" }
    ],
    
    "default": [
        { questionId: "fb_gen_1", questionText: "Tell me about your background and experience in this field.", difficulty: "easy", source: "Common interview question" },
        { questionId: "fb_gen_2", questionText: "What motivates you in your work?", difficulty: "easy", source: "Common interview question" },
        { questionId: "fb_gen_3", questionText: "Describe a challenging project you worked on and how you overcame obstacles.", difficulty: "easy", source: "Common interview question" },
        { questionId: "fb_gen_4", questionText: "How do you stay updated with the latest technology trends?", difficulty: "medium", source: "Common interview question" },
        { questionId: "fb_gen_5", questionText: "Describe your problem-solving approach when facing a complex technical issue.", difficulty: "medium", source: "Common interview question" },
        { questionId: "fb_gen_6", questionText: "How do you handle conflicts within a team?", difficulty: "medium", source: "Common interview question" },
        { questionId: "fb_gen_7", questionText: "What is your experience with Agile methodologies?", difficulty: "medium", source: "Common interview question" },
        { questionId: "fb_gen_8", questionText: "How do you prioritize tasks when working on multiple projects?", difficulty: "hard", source: "Common interview question" },
        { questionId: "fb_gen_9", questionText: "Describe a time when you had to learn a new technology quickly.", difficulty: "hard", source: "Common interview question" },
        { questionId: "fb_gen_10", questionText: "Where do you see yourself in five years?", difficulty: "hard", source: "Common interview question" }
    ]
};

// Get fallback questions for a topic
export const getFallbackQuestions = (topic) => {
    const normalizedTopic = topic.toLowerCase().trim();
    
    // Try exact match first
    for (const key in FALLBACK_QUESTIONS) {
        if (key.toLowerCase() === normalizedTopic) {
            return FALLBACK_QUESTIONS[key];
        }
    }
    
    // Try partial match
    for (const key in FALLBACK_QUESTIONS) {
        if (normalizedTopic.includes(key.toLowerCase()) || key.toLowerCase().includes(normalizedTopic)) {
            return FALLBACK_QUESTIONS[key];
        }
    }
    
    // Return default questions
    return FALLBACK_QUESTIONS.default;
};
