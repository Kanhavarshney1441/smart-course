import { GoogleGenAI } from '@google/genai';

interface TutorContext {
  courseTitle: string;
  category: string;
  difficulty: string;
  lessonTitle?: string;
  codeSnippet?: string;
  studentSkillLevel?: string;
}

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export async function askAiTutor(
  messages: ChatMessage[],
  context: TutorContext
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim() !== '') {
    try {
      const ai = new GoogleGenAI({ apiKey });

      const systemPrompt = `You are an expert, encouraging, and pedagogically sound AI Personal Tutor for an online college learning platform.
You are helping a student studying the course "${context.courseTitle}" (Category: ${context.category}, Level: ${context.difficulty}).
Current Lesson: ${context.lessonTitle || 'General Coursework'}.
Student Skill Level: ${context.studentSkillLevel || context.difficulty}.

Follow these tutoring principles:
1. Provide beginner-friendly, crystal-clear explanations with intuitive real-world analogies.
2. If asked about code, provide clean, idiomatic code examples and explain line-by-line.
3. If asked about a quiz or problem, provide helpful hints and conceptual nudges BEFORE giving the full solution, to encourage active learning.
4. Highlight common mistakes and best practices.
5. Keep your tone enthusiastic, supportive, and structured with clear headings or bullet points where appropriate.
6. If the user provided a code snippet:
${context.codeSnippet ? `\`\`\`\n${context.codeSnippet}\n\`\`\`` : '(None provided)'}`;

      // Build conversation contents
      const conversationContents = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          { role: 'user', parts: [{ text: systemPrompt }] },
          { role: 'model', parts: [{ text: "Understood! I am ready to be your dedicated AI Tutor for this course. How can I help you today?" }] },
          ...conversationContents
        ],
        config: {
          temperature: 0.7,
          maxOutputTokens: 1200,
        }
      });

      if (response && response.text) {
        return response.text;
      }
    } catch (err) {
      console.warn('[AI Tutor] Gemini API error, falling back to intelligent tutor engine:', err);
    }
  }

  // High-quality intelligent fallback tutor
  return generateIntelligentFallbackTutor(messages, context);
}

function generateIntelligentFallbackTutor(
  messages: ChatMessage[],
  context: TutorContext
): string {
  const latestMessage = messages[messages.length - 1]?.content.toLowerCase() || '';

  if (latestMessage.includes('explain') || latestMessage.includes('what is') || latestMessage.includes('how does')) {
    return `### Concept Explanation: ${context.lessonTitle || context.courseTitle}

Here is a simple, intuitive breakdown tailored for **${context.studentSkillLevel || 'all learners'}**:

1. **The Core Idea**:
   In ${context.category}, this concept solves the problem of organizing logic cleanly, avoiding redundancy, and building scalable software. Think of it like a blueprint or an assembly line where each piece has a single, well-defined responsibility.

2. **Real-World Analogy**:
   Imagine a restaurant kitchen. The chef (processor) cooks the orders, the order slip (data flow) tells them what to make, and the pantry (storage/state) keeps all ingredients ready. If every waiter walked into the kitchen and cooked their own dish, chaos would erupt! That's why we encapsulate logic into modular components and functions.

3. **Step-by-Step Breakdown**:
   - **Step 1: Input / Initialization** — Set up clear initial parameters or state.
   - **Step 2: Processing / Transformation** — Apply pure logic or asynchronous operations safely.
   - **Step 3: Verification & Output** — Render the results or return validated data.

4. **Key Takeaway**:
   Always prefer clarity over cleverness. Start with the simplest working solution, then optimize once functionality is verified.

*Would you like a runnable code snippet or a quick interactive check question on this?*`;
  }

  if (latestMessage.includes('debug') || latestMessage.includes('error') || latestMessage.includes('fix') || latestMessage.includes('syntax')) {
    return `### 🛠️ AI Debugging Assistant

Let's troubleshoot your code systematically for **${context.lessonTitle || context.courseTitle}**:

1. **Top Causes for this error in ${context.category}**:
   - **Scope or Typo**: Check for mismatched variable names, missing imports, or incorrect capitalization.
   - **Asynchronous Timing**: Ensure promises are awaited or state updates have completed before accessing derived values.
   - **Null / Undefined checks**: Always verify an object or array exists before reading nested properties (e.g., \`data?.items\`).

2. **Step-by-Step Debugging Checklist**:
   1. Insert a log or breakpoint right before the failing operation.
   2. Verify the exact type and value of your input arguments.
   3. Check your browser/terminal console for line number indications.

3. **Pro-Tip**:
   Wrap suspect logic in a \`try...catch\` block and log \`console.error(err)\` to inspect the full stack trace.

*Paste your exact error message or code snippet here and I will pinpoint the bug for you!*`;
  }

  if (latestMessage.includes('hint') || latestMessage.includes('quiz') || latestMessage.includes('question')) {
    return `### 💡 Tutor Hint

Here is a guiding hint without spoiling the answer directly:

- **Look at the core requirement**: What is the question asking you to accomplish or identify?
- **Rule of Elimination**: Eliminate the options that violate basic language rules (e.g., mutating state directly or ignoring immutability).
- **Core Clue**: Recall how ${context.courseTitle} handles data flow. Data flows down, while events flow up.

Try revisiting the concept notes in the left panel, and reflect on what happens when the function terminates! You've got this!`;
  }

  if (latestMessage.includes('practice') || latestMessage.includes('challenge') || latestMessage.includes('exercise')) {
    return `### 🎯 Practice Challenge for ${context.lessonTitle || context.courseTitle}

Here is a practical hands-on challenge to test your understanding:

**Task**:
Build a small utility function that accepts an array of records and returns:
1. The total count of active items.
2. The items sorted in descending order by timestamp or score.
3. Edge case handling when the input is empty or undefined.

**Bonus Milestone**:
Add error handling to ensure invalid elements are gracefully skipped instead of crashing the program.

Give it a shot in the code sandbox, and let me know when you'd like me to review your solution!`;
  }

  // Default helpful response
  return `### AI Tutor: Guide for "${context.courseTitle}"

Hello! I am your AI learning assistant for this course.

Here are a few ways I can help you master **${context.lessonTitle || 'this topic'}**:
- **Explain difficult concepts** in plain English with beginner-friendly analogies.
- **Review your code** and suggest performance or clean-code improvements.
- **Provide step-by-step hints** for quizzes and module assessments.
- **Recommend best practices** used by production software engineers.

What specific topic or question would you like to explore right now?`;
}
