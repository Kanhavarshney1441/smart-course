export type QuestionDomain =
  | 'Web Development'
  | 'Data Science & AI'
  | 'Cloud & DevOps'
  | 'Computer Science'
  | 'Cybersecurity';

export type QuestionDifficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface QuizQuestion {
  id: string;
  domain: QuestionDomain;
  difficulty: QuestionDifficulty;
  points: number;
  question: string;
  codeSnippet?: string;
  options: {
    text: string;
    explanation: string;
  }[];
  correctAnswer: number; // 0-indexed
  concept: string;
}

export interface LearningPath {
  id: string;
  title: string;
  tagline: string;
  description: string;
  targetSkillLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  focusTopics: string[];
  suggestedGoal: string;
  priorityCourseSlugs: string[];
  rationale: string;
}

export interface DomainScore {
  domain: QuestionDomain;
  totalQuestions: number;
  correctQuestions: number;
  pointsEarned: number;
  totalPoints: number;
  percentage: number;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface QuizEvaluationResult {
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  totalPointsEarned: number;
  maxPoints: number;
  percentage: number;
  overallSkillLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  domainScores: Record<QuestionDomain, DomainScore>;
  strengths: string[];
  growthAreas: string[];
  recommendedPath: LearningPath;
  detailedReview: {
    questionId: string;
    question: string;
    domain: QuestionDomain;
    difficulty: QuestionDifficulty;
    userAnswerIndex: number | null;
    userAnswerText: string;
    correctAnswerIndex: number;
    correctAnswerText: string;
    isCorrect: boolean;
    explanation: string;
    concept: string;
  }[];
}

export const DIAGNOSTIC_QUESTIONS: QuizQuestion[] = [
  {
    id: 'web-1',
    domain: 'Web Development',
    difficulty: 'Beginner',
    points: 10,
    question: 'In modern JavaScript and React, which array method returns a brand-new array with elements transformed by a callback function without mutating the original array?',
    options: [
      { text: 'Array.prototype.forEach()', explanation: 'forEach executes a callback for each element but returns undefined.' },
      { text: 'Array.prototype.map()', explanation: 'Correct. map returns a new array with the results of calling the function on every element, preserving immutability.' },
      { text: 'Array.prototype.push()', explanation: 'push mutates the existing array by appending elements.' },
      { text: 'Array.prototype.splice()', explanation: 'splice mutates the original array in place by adding/removing elements.' }
    ],
    correctAnswer: 1,
    concept: 'Functional Array Transformation & Immutability'
  },
  {
    id: 'web-2',
    domain: 'Web Development',
    difficulty: 'Intermediate',
    points: 20,
    question: 'Why is modifying React state directly (e.g. `state.items.push(newItem)`) discouraged compared to updating state immutably (e.g. `setItems([...items, newItem])`)?',
    options: [
      { text: 'Direct mutation creates a memory leak in browser V8 engine.', explanation: 'Direct mutation does not inherently leak memory.' },
      { text: 'React compares object references (shallow equality) to determine if a re-render is necessary.', explanation: 'Correct. If the object reference remains the same, React reconciler cannot detect state changes and will skip re-rendering.' },
      { text: 'JavaScript does not allow pushing elements to arrays stored in variables.', explanation: 'JavaScript arrays support push natively.' },
      { text: 'Direct mutation converts JavaScript objects into read-only JSON.', explanation: 'Objects remain mutable in JavaScript unless frozen.' }
    ],
    correctAnswer: 1,
    concept: 'React Reconciliation & State Immutability'
  },
  {
    id: 'web-3',
    domain: 'Web Development',
    difficulty: 'Advanced',
    points: 30,
    question: 'In HTTP/REST API design, which of the following HTTP methods is specified by RFC 9110 to be IDEMPOTENT?',
    options: [
      { text: 'POST only', explanation: 'POST creates new resources and is intentionally non-idempotent; repeated requests create duplicate records.' },
      { text: 'PUT and DELETE', explanation: 'Correct. Multiple identical PUT or DELETE requests result in the same server state as a single request.' },
      { text: 'PATCH only', explanation: 'PATCH is not guaranteed to be idempotent because relative operations (e.g. increment counter) alter state on repeated calls.' },
      { text: 'POST and PATCH', explanation: 'Neither POST nor PATCH are guaranteed idempotent by HTTP specifications.' }
    ],
    correctAnswer: 1,
    concept: 'HTTP Semantics & API Idempotency'
  },
  {
    id: 'ds-1',
    domain: 'Data Science & AI',
    difficulty: 'Beginner',
    points: 10,
    question: 'In supervised machine learning, what is the key difference between Regression and Classification tasks?',
    options: [
      { text: 'Regression handles image data while Classification only works on numeric tabular data.', explanation: 'Both can operate on images, audio, and tabular data.' },
      { text: 'Regression predicts continuous numerical values, whereas Classification predicts categorical class labels.', explanation: 'Correct. Regression outputs continuous quantities (e.g. house prices), while classification predicts discrete classes (e.g. spam vs ham).' },
      { text: 'Regression requires neural networks, whereas Classification requires linear equations.', explanation: 'Both tasks can use linear models or deep neural networks.' },
      { text: 'Regression is unsupervised learning while Classification is supervised learning.', explanation: 'Both are foundational supervised learning paradigms.' }
    ],
    correctAnswer: 1,
    concept: 'Supervised Learning Problem Types'
  },
  {
    id: 'ds-2',
    domain: 'Data Science & AI',
    difficulty: 'Intermediate',
    points: 20,
    question: 'What is the primary purpose of the Backpropagation algorithm in training Artificial Neural Networks?',
    options: [
      { text: 'To randomly initialize connection weights before starting training.', explanation: 'Weight initialization is performed prior to training (e.g. He/Xavier initialization).' },
      { text: 'To calculate the gradient of the loss function with respect to each network weight using the chain rule.', explanation: 'Correct. Backpropagation applies the calculus chain rule backwards through network layers to compute weight gradients for optimization.' },
      { text: 'To compress model weights so they fit on mobile devices.', explanation: 'Model compression is achieved through quantization or pruning, not backpropagation.' },
      { text: 'To normalize inputs between 0 and 1.', explanation: 'Feature scaling/normalization is done during data preprocessing.' }
    ],
    correctAnswer: 1,
    concept: 'Neural Network Optimization & Gradient Backpropagation'
  },
  {
    id: 'ds-3',
    domain: 'Data Science & AI',
    difficulty: 'Advanced',
    points: 30,
    question: 'In the Transformer architecture (Vaswani et al.), what computational role does Scaled Dot-Product Attention serve?',
    options: [
      { text: 'It enforces strict sequential left-to-right recurrence like an LSTM.', explanation: 'Transformers eliminated sequential recurrence in favor of parallel self-attention.' },
      { text: 'It computes dynamic pairwise relevance weights between all tokens in a sequence using Query, Key, and Value projections.', explanation: 'Correct. Attention maps token relationships regardless of sentence distance, scaling by sqrt(d_k) to prevent vanishing gradients in softmax.' },
      { text: 'It quantizes floating-point parameters to 8-bit integers during inference.', explanation: 'Attention is an architectural component, not post-training quantization.' },
      { text: 'It acts as an on-disk caching layer for model weights.', explanation: 'Attention is an in-memory matrix computation mechanism.' }
    ],
    correctAnswer: 1,
    concept: 'Self-Attention & Transformer Mechanisms'
  },
  {
    id: 'cs-1',
    domain: 'Computer Science',
    difficulty: 'Beginner',
    points: 10,
    question: 'What is the worst-case time complexity of searching for an element in an unsorted array of size N?',
    options: [
      { text: 'O(1)', explanation: 'O(1) is constant time, which is only possible if you already know the exact index or in a hash table lookup.' },
      { text: 'O(log N)', explanation: 'Binary search O(log N) requires the array to be pre-sorted.' },
      { text: 'O(N)', explanation: 'Correct. In an unsorted array, linear search must examine up to every element in the worst-case scenario.' },
      { text: 'O(N^2)', explanation: 'Linear search takes linear O(N) time, not quadratic time.' }
    ],
    correctAnswer: 2,
    concept: 'Asymptotic Time Complexity & Linear Search'
  },
  {
    id: 'cs-2',
    domain: 'Computer Science',
    difficulty: 'Intermediate',
    points: 20,
    question: 'Which of the following data structures operates on a Last-In, First-Out (LIFO) discipline and is fundamentally used to manage program function call stacks?',
    options: [
      { text: 'Queue', explanation: 'A Queue operates on First-In, First-Out (FIFO).' },
      { text: 'Stack', explanation: 'Correct. A Stack operates on LIFO order, where the most recently pushed call frame is popped first when returning.' },
      { text: 'Hash Map', explanation: 'A Hash Map is an associative key-value mapping structure.' },
      { text: 'Binary Search Tree', explanation: 'A BST organizes sorted nodes hierarchically.' }
    ],
    correctAnswer: 1,
    concept: 'Stack Data Structure & Execution Call Stack'
  },
  {
    id: 'cs-3',
    domain: 'Computer Science',
    difficulty: 'Advanced',
    points: 30,
    question: 'According to the CAP Theorem for distributed systems, what tradeoff must a distributed database make in the presence of a network Partition (P)?',
    options: [
      { text: 'It must sacrifice both Consistency and Availability.', explanation: 'The system can still guarantee either Consistency or Availability, not both.' },
      { text: 'It can guarantee all three (Consistency, Availability, Partition tolerance) simultaneously.', explanation: 'The CAP theorem mathematically proves you cannot achieve both C and A during a network partition.' },
      { text: 'It must choose between Consistency (CP) or Availability (AP).', explanation: 'Correct. When network partitions occur, a distributed system must choose between returning consistent errors/stalls (CP) or stale available responses (AP).' },
      { text: 'It must switch from SQL to NoSQL data format.', explanation: 'CAP theorem applies to all distributed systems regardless of query language.' }
    ],
    correctAnswer: 2,
    concept: 'CAP Theorem & Distributed Systems Tradeoffs'
  },
  {
    id: 'cloud-1',
    domain: 'Cloud & DevOps',
    difficulty: 'Beginner',
    points: 10,
    question: 'What is the core distinction between a virtual machine (VM) and a Docker container?',
    options: [
      { text: 'Containers package an entire guest operating system kernel, whereas VMs share the host kernel.', explanation: 'This is the opposite: VMs contain a guest OS kernel, whereas containers share the host kernel.' },
      { text: 'Containers share the host operating system kernel and isolate processes in user space, making them lightweight and fast to start.', explanation: 'Correct. Containers avoid guest OS virtualization overhead, leveraging Linux namespaces and cgroups.' },
      { text: 'Containers can only run Python scripts, while VMs can run any programming language.', explanation: 'Containers can execute any binary or language runtime.' },
      { text: 'VMs require cloud servers, while Docker containers only work locally on laptop computers.', explanation: 'Both VMs and containers run locally and in public clouds.' }
    ],
    correctAnswer: 1,
    concept: 'Operating System Virtualization vs Containerization'
  },
  {
    id: 'cloud-2',
    domain: 'Cloud & DevOps',
    difficulty: 'Intermediate',
    points: 20,
    question: 'In modern CI/CD delivery pipelines, what does the principle of "Continuous Deployment" entail?',
    options: [
      { text: 'Developers manually copy zip files over SSH to production servers once a month.', explanation: 'Manual file transfer is an anti-pattern prone to downtime and human error.' },
      { text: 'Every code change that passes automated tests and linting stages is automatically deployed to production without manual gatekeeping.', explanation: 'Correct. Continuous Deployment automates release all the way to production upon passing test suites.' },
      { text: 'Storing database backups on external USB flash drives.', explanation: 'Backup storage is a disaster recovery practice, not deployment automation.' },
      { text: 'Running servers without any firewall or network monitoring.', explanation: 'DevOps practices prioritize security automation (DevSecOps).' }
    ],
    correctAnswer: 1,
    concept: 'Automated CI/CD Delivery Pipelines'
  },
  {
    id: 'sec-1',
    domain: 'Cybersecurity',
    difficulty: 'Intermediate',
    points: 20,
    question: 'What is the most effective and universal defense against SQL Injection (SQLi) vulnerabilities in web applications?',
    options: [
      { text: 'Escaping single quote characters using string replace functions.', explanation: 'String escaping is brittle and can be bypassed by encoding tricks or numeric injection.' },
      { text: 'Using Parameterized Queries (Prepared Statements) or an ORM that separates SQL command logic from user-supplied data.', explanation: 'Correct. Prepared statements treat user input strictly as parameters/literals rather than executable SQL syntax.' },
      { text: 'Hiding database error messages from browser users.', explanation: 'Hiding errors prevents error-based SQLi discovery, but blind and union SQLi remain fully exploitable.' },
      { text: 'Limiting form text input lengths to under 20 characters.', explanation: 'Length limits can easily be bypassed by direct HTTP requests and do not fix the flaw.' }
    ],
    correctAnswer: 1,
    concept: 'Defensive Coding & SQL Injection Remediation'
  }
];

export const PREDEFINED_LEARNING_PATHS: LearningPath[] = [
  {
    id: 'full-stack-architect',
    title: 'Modern Full-Stack & Cloud Architect',
    tagline: 'Master scalable web applications, server components, and production deployment',
    description: 'Designed for students building complete SaaS web applications with robust backends, database schemas, and microservice infrastructure.',
    targetSkillLevel: 'Intermediate',
    focusTopics: ['React', 'TypeScript', 'Node.js', 'Next.js', 'PostgreSQL', 'Docker'],
    suggestedGoal: 'career_transition',
    priorityCourseSlugs: [
      'react-node-masterclass',
      'nextjs-server-components',
      'modern-typescript-patterns',
      'docker-and-kubernetes'
    ],
    rationale: 'Your answers indicate strong web and backend interest. This roadmap strengthens API design, state architecture, and containerized deployment.'
  },
  {
    id: 'ai-deep-learning-specialist',
    title: 'AI & Deep Learning Specialist',
    tagline: 'From machine learning fundamentals to neural networks, transformers, and LLM engineering',
    description: 'Tailored for students eager to build state-of-the-art intelligent systems, computer vision classifiers, and generative AI pipelines.',
    targetSkillLevel: 'Intermediate',
    focusTopics: ['Python', 'Machine Learning', 'Deep Learning', 'PyTorch', 'Generative AI', 'Computer Vision'],
    suggestedGoal: 'skill_advancement',
    priorityCourseSlugs: [
      'deep-learning-pytorch',
      'practical-machine-learning',
      'nlp-transformers-huggingface',
      'prompt-engineering-genai'
    ],
    rationale: 'You demonstrate high aptitude for mathematical and machine learning concepts. This path accelerates you into neural networks and transformer architectures.'
  },
  {
    id: 'algorithms-distributed-systems',
    title: 'Algorithms & Distributed Systems Engineer',
    tagline: 'Conquer tech coding interviews and design internet-scale resilient distributed architectures',
    description: 'Focused on core computer science foundations: algorithmic time/space analysis, dynamic programming, database internals, and high-throughput systems.',
    targetSkillLevel: 'Advanced',
    focusTopics: ['Algorithms', 'Data Structures', 'System Design', 'Distributed Systems', 'Databases', 'Python'],
    suggestedGoal: 'academic_exam_prep',
    priorityCourseSlugs: [
      'dsa-in-python',
      'system-design-distributed-systems',
      'database-internals-sql',
      'cs-operating-systems-memory'
    ],
    rationale: 'Your responses highlight an aptitude for computational complexity and systems trade-offs. This path prepares you for high-tier technical interviews and backend scale.'
  },
  {
    id: 'cloud-devops-security',
    title: 'Cloud, DevOps & Security Engineer',
    tagline: 'Build resilient cloud infrastructure, automated CI/CD pipelines, and defensible architectures',
    description: 'Learn modern infrastructure as code, container orchestration with Kubernetes, AWS cloud solutions, and ethical web penetration testing.',
    targetSkillLevel: 'Intermediate',
    focusTopics: ['Cloud Computing', 'AWS', 'Docker', 'Kubernetes', 'DevOps', 'Cybersecurity'],
    suggestedGoal: 'certification',
    priorityCourseSlugs: [
      'aws-solutions-architect',
      'docker-and-kubernetes',
      'ethical-hacking-web-security',
      'cicd-github-actions'
    ],
    rationale: 'Bridging infrastructure, deployment automation, and defensive security. Prepares you for cloud engineering and solutions architecture certification.'
  },
  {
    id: 'foundational-cs-engineer',
    title: 'Foundations of Software Engineering',
    tagline: 'Build rock-solid programming problem solving, clean code practices, and core computer science',
    description: 'Ideal starting roadmap focusing on programming foundations, logic building, clean syntax, and practical hands-on projects.',
    targetSkillLevel: 'Beginner',
    focusTopics: ['Python', 'Programming Fundamentals', 'Data Structures', 'Web Development'],
    suggestedGoal: 'hobby_building',
    priorityCourseSlugs: [
      'python-for-beginners',
      'dsa-in-python',
      'cybersecurity-fundamentals',
      'ui-ux-design-figma'
    ],
    rationale: 'Provides structured, accessible fundamentals to build your confidence and establish high-yield programming foundations.'
  }
];

/**
 * Pure evaluation function assessing quiz answers
 */
export function evaluateQuiz(
  answers: Record<string, number>,
  questions: QuizQuestion[] = DIAGNOSTIC_QUESTIONS
): QuizEvaluationResult {
  const totalQuestions = questions.length;
  let correctCount = 0;
  let totalPointsEarned = 0;
  let maxPoints = 0;

  const domainMap: Record<QuestionDomain, { total: number; correct: number; pointsEarned: number; maxPoints: number }> = {
    'Web Development': { total: 0, correct: 0, pointsEarned: 0, maxPoints: 0 },
    'Data Science & AI': { total: 0, correct: 0, pointsEarned: 0, maxPoints: 0 },
    'Cloud & DevOps': { total: 0, correct: 0, pointsEarned: 0, maxPoints: 0 },
    'Computer Science': { total: 0, correct: 0, pointsEarned: 0, maxPoints: 0 },
    'Cybersecurity': { total: 0, correct: 0, pointsEarned: 0, maxPoints: 0 },
  };

  const detailedReview = questions.map((q) => {
    maxPoints += q.points;
    domainMap[q.domain].total += 1;
    domainMap[q.domain].maxPoints += q.points;

    const userAnswerIndex = answers[q.id] !== undefined ? answers[q.id] : null;
    const isCorrect = userAnswerIndex !== null && userAnswerIndex === q.correctAnswer;

    if (isCorrect) {
      correctCount += 1;
      totalPointsEarned += q.points;
      domainMap[q.domain].correct += 1;
      domainMap[q.domain].pointsEarned += q.points;
    }

    const userAnswerText =
      userAnswerIndex !== null && q.options[userAnswerIndex]
        ? q.options[userAnswerIndex].text
        : 'Not Answered';
    const correctAnswerText = q.options[q.correctAnswer].text;
    const explanation = q.options[q.correctAnswer].explanation;

    return {
      questionId: q.id,
      question: q.question,
      domain: q.domain,
      difficulty: q.difficulty,
      userAnswerIndex,
      userAnswerText,
      correctAnswerIndex: q.correctAnswer,
      correctAnswerText,
      isCorrect,
      explanation,
      concept: q.concept,
    };
  });

  const percentage = maxPoints > 0 ? Math.round((totalPointsEarned / maxPoints) * 100) : 0;

  // Determine overall skill level
  let overallSkillLevel: 'Beginner' | 'Intermediate' | 'Advanced' = 'Beginner';
  if (percentage >= 75) {
    overallSkillLevel = 'Advanced';
  } else if (percentage >= 40) {
    overallSkillLevel = 'Intermediate';
  }

  // Construct domain breakdown
  const domainScores: Record<QuestionDomain, DomainScore> = {} as any;
  const strengths: string[] = [];
  const growthAreas: string[] = [];

  for (const [dom, stat] of Object.entries(domainMap) as [QuestionDomain, typeof domainMap[QuestionDomain]][]) {
    const dPct = stat.maxPoints > 0 ? Math.round((stat.pointsEarned / stat.maxPoints) * 100) : 0;
    let dLevel: 'Beginner' | 'Intermediate' | 'Advanced' = 'Beginner';
    if (dPct >= 75) dLevel = 'Advanced';
    else if (dPct >= 40) dLevel = 'Intermediate';

    domainScores[dom] = {
      domain: dom,
      totalQuestions: stat.total,
      correctQuestions: stat.correct,
      pointsEarned: stat.pointsEarned,
      totalPoints: stat.maxPoints,
      percentage: dPct,
      level: dLevel,
    };

    if (dPct >= 70) {
      strengths.push(`${dom} (${dPct}%)`);
    } else if (dPct < 60) {
      growthAreas.push(`${dom} (${dPct}%)`);
    }
  }

  // Map to recommended learning path based on performance & detected domain affinity
  const recommendedPath = mapToLearningPath(overallSkillLevel, domainScores, percentage);

  return {
    totalQuestions,
    answeredCount: Object.keys(answers).length,
    correctCount,
    totalPointsEarned,
    maxPoints,
    percentage,
    overallSkillLevel,
    domainScores,
    strengths: strengths.length > 0 ? strengths : ['Broad Foundations Established'],
    growthAreas: growthAreas.length > 0 ? growthAreas : ['Ready for Capstone Mastery'],
    recommendedPath,
    detailedReview,
  };
}

/**
 * Maps performance metrics to one of the structured learning paths
 */
export function mapToLearningPath(
  overallSkillLevel: 'Beginner' | 'Intermediate' | 'Advanced',
  domainScores: Record<QuestionDomain, DomainScore>,
  overallPercentage: number
): LearningPath {
  // Compare domain percentages
  const aiScore = domainScores['Data Science & AI']?.percentage || 0;
  const webScore = domainScores['Web Development']?.percentage || 0;
  const csScore = domainScores['Computer Science']?.percentage || 0;
  const cloudScore = domainScores['Cloud & DevOps']?.percentage || 0;
  const secScore = domainScores['Cybersecurity']?.percentage || 0;

  // Find dominant interest or high domain proficiency first
  if (aiScore >= 65 && aiScore >= webScore && aiScore >= cloudScore) {
    return PREDEFINED_LEARNING_PATHS.find(p => p.id === 'ai-deep-learning-specialist')!;
  }

  if (csScore >= 65 && csScore >= webScore) {
    return PREDEFINED_LEARNING_PATHS.find(p => p.id === 'algorithms-distributed-systems')!;
  }

  if ((cloudScore + secScore) / 2 >= 60 && cloudScore >= webScore) {
    return PREDEFINED_LEARNING_PATHS.find(p => p.id === 'cloud-devops-security')!;
  }

  if (webScore >= 60) {
    return PREDEFINED_LEARNING_PATHS.find(p => p.id === 'full-stack-architect')!;
  }

  // If overall beginner and no domain stands out, foundational software engineering is ideal
  if (overallSkillLevel === 'Beginner' || overallPercentage < 40) {
    return PREDEFINED_LEARNING_PATHS.find(p => p.id === 'foundational-cs-engineer') || PREDEFINED_LEARNING_PATHS[4];
  }

  // Fallback based on skill level
  if (overallSkillLevel === 'Advanced') {
    return PREDEFINED_LEARNING_PATHS.find(p => p.id === 'algorithms-distributed-systems')!;
  } else if (overallSkillLevel === 'Intermediate') {
    return PREDEFINED_LEARNING_PATHS.find(p => p.id === 'full-stack-architect')!;
  } else {
    return PREDEFINED_LEARNING_PATHS.find(p => p.id === 'foundational-cs-engineer')!;
  }
}
