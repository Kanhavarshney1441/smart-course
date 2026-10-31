/**
 * Comprehensive real-world educational course content provider
 * Delivers in-depth lecture notes, runnable code snippets, interactive quizzes,
 * and cheat sheet resources for enrolled students.
 */

export interface LessonQuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LessonResource {
  title: string;
  url: string;
  type: 'documentation' | 'github' | 'cheatsheet' | 'article';
}

export interface LessonContentDetails {
  lectureNotes: {
    heading: string;
    body: string;
    codeBlock?: string;
    tips?: string[];
  }[];
  keyTakeaways: string[];
  codeSnippet?: {
    language: string;
    filename: string;
    code: string;
    expectedOutput: string;
  };
  quiz: LessonQuizQuestion[];
  resources: LessonResource[];
}

/**
 * Real curated lesson contents for flagship courses
 */
const SPECIFIC_LESSON_CONTENT: Record<string, Record<string, Partial<LessonContentDetails>>> = {
  // Modern Full-Stack React & Node.js Masterclass
  'react-node-masterclass': {
    'Modern React Architecture & Component Composition': {
      lectureNotes: [
        {
          heading: '1. The Evolution of React Architecture (React 19 & Beyond)',
          body: 'Modern React focuses on unidirectional data flow, explicit state ownership, and component composition over inheritance. Rather than prop-drilling or monolithic global stores, scalable architecture splits responsibilities into presentational components, custom hooks for business logic, and server state management.',
          tips: [
            'Keep component trees shallow by leveraging composition (children props) instead of deeply nested props.',
            'Isolate side effects strictly inside custom hooks or framework data loaders.'
          ]
        },
        {
          heading: '2. Custom Hooks: Encapsulating Complex State Logic',
          body: 'A custom hook is a pure JavaScript function whose name starts with "use" and that can call other hooks. It allows you to extract component logic into reusable functions without altering the component hierarchy.',
          codeBlock: `// Example: Production useAsync hook with abort controller support
import { useState, useEffect } from 'react';

export function useAsync<T>(asyncFunction: () => Promise<T>, immediate = true) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(immediate);
  const [error, setError] = useState<Error | null>(null);

  const execute = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await asyncFunction();
      setData(response);
      return response;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, []);

  return { execute, loading, data, error };
}`
        },
        {
          heading: '3. State Invalidation & Reconciliation Strategies',
          body: 'React 19 introduces automatic batching across all asynchronous boundaries (promises, timeouts, and native event handlers). When architecting high-frequency UIs (such as live dashboards or search filters), use useTransition or useDeferredValue to prioritize responsiveness over background rendering.',
          tips: [
            'Use useTransition for non-urgent UI updates to maintain 60 FPS input responsiveness.',
            'Prefer local state when a value is only needed by a single subtree.'
          ]
        }
      ],
      keyTakeaways: [
        'Component composition prevents deep prop-drilling without adding complex global store boilerplate.',
        'Custom hooks decouple domain logic and API synchronization from UI layout.',
        'React 19 automatic batching eliminates unnecessary intermediate re-renders across async boundaries.',
        'Always clean up side effects (event listeners, timers, abort controllers) in effect cleanups.'
      ],
      codeSnippet: {
        language: 'typescript',
        filename: 'CounterWithReducer.tsx',
        code: `import React, { useReducer } from 'react';

type State = { count: number; history: number[] };
type Action = { type: 'increment' } | { type: 'decrement' } | { type: 'reset' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1, history: [...state.history, state.count + 1] };
    case 'decrement':
      return { count: state.count - 1, history: [...state.history, state.count - 1] };
    case 'reset':
      return { count: 0, history: [0] };
    default:
      return state;
  }
}

// Simulating state transitions
const initialState: State = { count: 0, history: [0] };
let current = reducer(initialState, { type: 'increment' });
current = reducer(current, { type: 'increment' });
current = reducer(current, { type: 'decrement' });

console.log(\`[State] Current Count: \${current.count}\`);
console.log(\`[Audit] Transition Log: \${JSON.stringify(current.history)}\`);`,
        expectedOutput: `[State] Current Count: 1\n[Audit] Transition Log: [0,1,2,1]`
      },
      quiz: [
        {
          question: 'What is the primary benefit of component composition over deep prop-drilling in React?',
          options: [
            'It forces all components to be class components.',
            'It allows passing pre-configured child elements directly, avoiding intermediate pass-through props.',
            'It disables React re-rendering completely.',
            'It stores state permanently in the browser cookies.'
          ],
          correctIndex: 1,
          explanation: 'Component composition lets parent components inject JSX elements directly into children via slots (children), bypassing intermediate layers.'
        },
        {
          question: 'When should you choose useReducer over useState in a complex component?',
          options: [
            'When you only have a single boolean flag.',
            'When state transitions depend on previous state and involve multiple related sub-values.',
            'Whenever using TypeScript.',
            'Only when fetching data from an external GraphQL server.'
          ],
          correctIndex: 1,
          explanation: 'useReducer is optimal for managing complex state objects where next state logic involves multiple sub-values and explicit action dispatching.'
        }
      ],
      resources: [
        { title: 'Official React 19 Architecture Guide', url: 'https://react.dev/learn', type: 'documentation' },
        { title: 'Custom Hook Design Patterns (GitHub)', url: 'https://github.com/reactjs', type: 'github' },
        { title: 'React Performance Optimization Cheatsheet', url: 'https://react.dev/reference/react', type: 'cheatsheet' }
      ]
    },
    'Server API Engineering with Express & Middleware': {
      lectureNotes: [
        {
          heading: '1. Architectural Principles of Production Express APIs',
          body: 'Production REST APIs require layered separation of concerns: Route Controllers (HTTP handling & status codes), Service Layers (business logic), Data Access Layers (SQL queries), and Middleware (auth, validation, logging, rate limiting).',
          tips: [
            'Never place raw database queries directly inside route callback functions.',
            'Always normalize error responses into a consistent JSON shape: { success: false, error: "message", code: 400 }.'
          ]
        },
        {
          heading: '2. Middleware Chains & Error Handlers',
          body: 'Express executes middleware in sequential FIFO order. Error-handling middleware must declare exactly four parameters: (err, req, res, next) so Express recognizes it as an error catcher.',
          codeBlock: `// Global Async Error Handling Middleware
export const errorHandler = (err: any, req: any, res: any, next: any) => {
  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  console.error(\`[Error] \${req.method} \${req.url}: \${message}\`);
  res.status(status).json({
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  });
};`
        }
      ],
      keyTakeaways: [
        'Always validate incoming req.body and req.params using a validation schema like Zod or Joi.',
        'Express error handlers require exactly 4 parameters (err, req, res, next) to catch errors.',
        'Store JWT secret keys in environment variables, never hardcoded in source control.',
        'Use helmet and rate-limiting headers in production.'
      ],
      codeSnippet: {
        language: 'typescript',
        filename: 'ExpressMiddlewareDemo.ts',
        code: `// Simulating Express pipeline execution
type Middleware = (req: any, res: any, next: () => void) => void;

const pipeline: Middleware[] = [
  (req, res, next) => {
    req.timestamp = Date.now();
    console.log(\`[Log] Incoming \${req.method} \${req.path}\`);
    next();
  },
  (req, res, next) => {
    if (!req.headers.authorization) {
      console.log('[Auth] Missing token, rejected 401');
      return;
    }
    req.user = { id: 101, name: 'Alex' };
    console.log(\`[Auth] Verified user: \${req.user.name}\`);
    next();
  },
  (req, res) => {
    console.log(\`[Handler] 200 OK -> Welcome \${req.user?.name}!\`);
  }
];

// Execute simulation
const mockReq = { method: 'GET', path: '/api/v1/courses', headers: { authorization: 'Bearer jwt_token_sample' } };
let step = 0;
function runNext() {
  if (step < pipeline.length) {
    const fn = pipeline[step++];
    fn(mockReq, {}, runNext);
  }
}
runNext();`,
        expectedOutput: `[Log] Incoming GET /api/v1/courses\n[Auth] Verified user: Alex\n[Handler] 200 OK -> Welcome Alex!`
      },
      quiz: [
        {
          question: 'How does Express differentiate between regular middleware and an error-handling middleware?',
          options: [
            'By checking if the function has exactly 4 arguments: (err, req, res, next).',
            'By the name of the file it is imported from.',
            'By checking if it uses the async keyword.',
            'By checking if it returns a boolean value.'
          ],
          correctIndex: 0,
          explanation: 'Express inspects the function arity (fn.length === 4) to identify error handling middleware.'
        }
      ],
      resources: [
        { title: 'Express.js Production Best Practices', url: 'https://expressjs.com/en/advanced/best-practice-security.html', type: 'documentation' },
        { title: 'RESTful API Specification Checklist', url: 'https://restfulapi.net/', type: 'cheatsheet' }
      ]
    }
  },

  // Python for Absolute Beginners: Zero to Hero
  'python-for-beginners': {
    'Introduction to Python & Variables': {
      lectureNotes: [
        {
          heading: '1. Why Python? Syntax, Interactivity & Clean Code',
          body: 'Python is a high-level, dynamically typed, interpreted language emphasizing readability through indentation. Everything in Python is an object, from primitive integers and strings to complex functions and classes.',
          tips: [
            'Follow PEP 8 naming conventions: snake_case for functions and variables, PascalCase for classes.',
            'Use f-strings for string interpolation: f"Hello, {name}!" is cleaner and faster than concatenation.'
          ]
        },
        {
          heading: '2. Variable Assignment & Data Types',
          body: 'In Python, variables are references to objects in memory rather than labeled boxes. Primitive types include int, float, str, and bool. Compound structures include list, tuple, dict, and set.',
          codeBlock: `# Python Variables & Type Introspection
student_name: str = "Priya Sharma"
enrolled_courses: int = 4
average_score: float = 94.5
is_graduated: bool = False

print(f"Student: {student_name} | Type: {type(student_name).__name__}")
print(f"GPA: {average_score} | Active: {not is_graduated}")`
        }
      ],
      keyTakeaways: [
        'Python uses indentation (4 spaces) rather than curly braces to define blocks.',
        'f-strings (f"Hello {name}") provide concise, performant formatting.',
        'Variables are dynamic object references.',
        'The type() function inspects runtime data types.'
      ],
      codeSnippet: {
        language: 'python',
        filename: 'data_types.py',
        code: `# Demonstration of Python fundamental operations
courses = ["Data Structures", "Web Architecture", "Linear Algebra"]
grades = {"Data Structures": 92, "Web Architecture": 88, "Linear Algebra": 95}

average = sum(grades.values()) / len(grades)

print(f"Enrolled Count: {len(courses)}")
print(f"Top Subject: {max(grades, key=grades.get)} ({max(grades.values())}%)")
print(f"Overall GPA: {average:.2f}%")`,
        expectedOutput: `Enrolled Count: 3\nTop Subject: Linear Algebra (95%)\nOverall GPA: 91.67%`
      },
      quiz: [
        {
          question: 'What is the output of type(42 / 2) in Python 3?',
          options: ['<class "int">', '<class "float">', '<class "number">', '<class "double">'],
          correctIndex: 1,
          explanation: 'In Python 3, the single slash division operator (/) always returns a float (21.0).'
        }
      ],
      resources: [
        { title: 'Official Python Tutorial', url: 'https://docs.python.org/3/tutorial/', type: 'documentation' },
        { title: 'Python Syntax & Built-in Types Cheatsheet', url: 'https://docs.python.org/3/library/stdtypes.html', type: 'cheatsheet' }
      ]
    }
  },

  // Deep Learning & Neural Networks with PyTorch
  'deep-learning-pytorch': {
    'Tensors, Autograd & GPU Acceleration in PyTorch': {
      lectureNotes: [
        {
          heading: '1. What is a PyTorch Tensor?',
          body: 'A Tensor is a multi-dimensional array similar to a NumPy ndarray, but with two key superpowers: hardware acceleration (CUDA on GPUs, MPS on Apple Silicon) and automated algorithmic differentiation via the Autograd engine.',
          tips: [
            'Always inspect tensor.shape and tensor.dtype when debugging model input mismatches.',
            'Avoid converting tensors to Python floats or NumPy arrays in the middle of training loops to prevent GPU synchronization bottlenecks.'
          ]
        },
        {
          heading: '2. How Autograd Computes Gradients with Computational Graphs',
          body: 'When you create a tensor with requires_grad=True, PyTorch tracks every operation executed on it. Calling .backward() on a scalar loss traverses this Directed Acyclic Graph (DAG) in reverse using the chain rule to accumulate partial derivatives.',
          codeBlock: `import torch

# Create a tensor and track computation
x = torch.tensor([2.0, 3.0], requires_grad=True)
y = x ** 2 + 3 * x + 5  # y = x^2 + 3x + 5
loss = y.sum()

# Compute gradients: dy/dx = 2x + 3
loss.backward()

print("Gradients dy/dx:", x.grad)
# For x = [2.0, 3.0]: dy/dx = [2(2)+3, 2(3)+3] = [7.0, 9.0]`
        }
      ],
      keyTakeaways: [
        'Tensors are the fundamental data structures of deep neural networks.',
        'Autograd builds a dynamic computational graph during the forward pass and executes reverse-mode differentiation on .backward().',
        'Always zero your optimizer gradients (.zero_grad()) before each training step to prevent accumulation.',
        'Use torch.no_grad() during inference and validation to conserve memory.'
      ],
      codeSnippet: {
        language: 'python',
        filename: 'autograd_demo.py',
        code: `# Demonstration of scalar loss differentiation
x = 3.0
# We simulate a forward pass: f(x) = 2x^2 + 4x + 1
# Analytical derivative: f'(x) = 4x + 4 -> at x=3: 4(3) + 4 = 16.0
val = 2 * (x**2) + 4 * x + 1
derivative = 4 * x + 4

print(f"Input x: {x}")
print(f"Forward Evaluation f(x): {val}")
print(f"Analytical Gradient f'(x): {derivative}")`,
        expectedOutput: `Input x: 3.0\nForward Evaluation f(x): 31.0\nAnalytical Gradient f'(x): 16.0`
      },
      quiz: [
        {
          question: 'Why must you call optimizer.zero_grad() at the beginning of every training loop iteration in PyTorch?',
          options: [
            'Because PyTorch crashes if gradients are not cleared.',
            'Because gradients accumulate by default in the .grad attribute on successive backward() calls.',
            'To reset the model weights back to random initialization.',
            'To flush the GPU VRAM cache completely.'
          ],
          correctIndex: 1,
          explanation: 'In PyTorch, tensor.grad accumulates on backward(). Zeroing gradients ensures previous batch gradients do not contaminate current step updates.'
        }
      ],
      resources: [
        { title: 'PyTorch Deep Learning Zero-to-Mastery', url: 'https://pytorch.org/tutorials/', type: 'documentation' },
        { title: 'PyTorch Tensor Operations Cheatsheet', url: 'https://pytorch.org/docs/stable/tensors.html', type: 'cheatsheet' }
      ]
    }
  }
};

/**
 * Intelligent topic & category fallbacks providing rich, realistic lecture content
 * for every course in the catalog, including custom admin-added courses.
 */
export function getLessonDetails(
  courseSlug: string,
  lessonTitle: string,
  courseTitle: string,
  category: string,
  difficulty: string
): LessonContentDetails {
  // Check exact course + lesson match first
  if (SPECIFIC_LESSON_CONTENT[courseSlug]?.[lessonTitle]) {
    const specific = SPECIFIC_LESSON_CONTENT[courseSlug][lessonTitle];
    return {
      lectureNotes: specific.lectureNotes || [],
      keyTakeaways: specific.keyTakeaways || [],
      codeSnippet: specific.codeSnippet,
      quiz: specific.quiz || [],
      resources: specific.resources || []
    };
  }

  // Domain-aware intelligent content generation
  const cat = category.toLowerCase();
  
  if (cat.includes('web') || cat.includes('frontend') || cat.includes('backend') || cat.includes('full-stack')) {
    return {
      lectureNotes: [
        {
          heading: `1. Core Architecture of ${lessonTitle}`,
          body: `In modern web development, ${lessonTitle} addresses modularity, predictable data flow, and runtime performance. By enforcing separation of concerns, production applications remain maintainable across large engineering teams.`,
          tips: [
            'Prioritize declarative code patterns over imperative DOM mutations.',
            'Design APIs and interfaces with backward-compatibility and strict type contracts in mind.'
          ]
        },
        {
          heading: '2. Industry Best Practices & Design Patterns',
          body: `When implementing ${lessonTitle}, adhere to the Single Responsibility Principle. Structure components and service utilities so they can be unit-tested without needing mock browser runtimes or live databases.`,
          codeBlock: `// Scalable Pattern Example for ${lessonTitle}
interface Result<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export async function processModuleRequest<T>(payload: any): Promise<Result<T>> {
  try {
    // Validate payload and perform idempotent execution
    console.log("[Execution] Validating parameters for ${lessonTitle}...");
    return { success: true, data: payload as T };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}`
        },
        {
          heading: '3. Performance, Security & Edge Cases',
          body: 'Pay close attention to memory allocations, asynchronous event handling, and cross-site scripting vulnerabilities. Always sanitize external data and throttle high-frequency events.'
        }
      ],
      keyTakeaways: [
        `Understand the fundamental architectural trade-offs behind ${lessonTitle}.`,
        'Enforce strict input validation and explicit error handling on both client and server boundaries.',
        'Use automated linting, type-checking, and CI integration to prevent production regressions.',
        'Profile runtime bottlenecks using browser DevTools or server APM telemetry.'
      ],
      codeSnippet: {
        language: 'typescript',
        filename: `${lessonTitle.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}.ts`,
        code: `// Practical demonstration for: ${lessonTitle}
function executeWorkflow(taskName: string, items: string[]) {
  console.log(\`=== Initiating \${taskName} ===\`);
  const processed = items.map((item, index) => \`[\${index + 1}] \${item.trim().toUpperCase()}\`);
  return processed;
}

const sampleList = ['configuration', 'dependency_injection', 'state_synchronization'];
const output = executeWorkflow("${lessonTitle}", sampleList);
output.forEach(line => console.log(line));
console.log('✓ Pipeline executed with zero errors');`,
        expectedOutput: `=== Initiating ${lessonTitle} ===\n[1] CONFIGURATION\n[2] DEPENDENCY_INJECTION\n[3] STATE_SYNCHRONIZATION\n✓ Pipeline executed with zero errors`
      },
      quiz: [
        {
          question: `What is the primary design objective when implementing ${lessonTitle}?`,
          options: [
            'Minimizing code readability to save disk space.',
            'Achieving high cohesion, loose coupling, and predictable state transitions.',
            'Avoiding automated testing to speed up releases.',
            'Hardcoding sensitive credentials directly in source files.'
          ],
          correctIndex: 1,
          explanation: 'Modern software engineering emphasizes high cohesion and loose coupling to facilitate testing, refactoring, and team collaboration.'
        },
        {
          question: 'Which tool provides compile-time guarantee of interface adherence in modern web codebases?',
          options: ['TypeScript type definitions', 'CSS stylesheets', 'HTML comments', 'Browser cookies'],
          correctIndex: 0,
          explanation: 'TypeScript static analysis verifies types and contracts during compilation before code ever hits production.'
        }
      ],
      resources: [
        { title: `${lessonTitle} Official Guide & Documentation`, url: 'https://developer.mozilla.org/en-US/', type: 'documentation' },
        { title: 'Full-Stack Architecture Starter (GitHub)', url: 'https://github.com', type: 'github' },
        { title: 'Engineering Cheatsheet & Best Practices', url: 'https://roadmap.sh', type: 'cheatsheet' }
      ]
    };
  }

  if (cat.includes('data') || cat.includes('ai') || cat.includes('machine learning')) {
    return {
      lectureNotes: [
        {
          heading: `1. Mathematical Foundations & Intuition for ${lessonTitle}`,
          body: `Machine learning models optimize objective loss functions over high-dimensional parameter spaces. In ${lessonTitle}, the focus is on data representation, gradient propagation, and generalization across unseen test distributions.`,
          tips: [
            'Always inspect dataset distributions for class imbalances or missing features before modeling.',
            'Maintain a strict train/validation/test split to prevent data leakage.'
          ]
        },
        {
          heading: '2. Implementation Strategy & Hyperparameter Tuning',
          body: 'Select appropriate learning rates, batch sizes, and regularization techniques (weight decay, dropout). Monitor both training loss and validation metrics to detect overfitting early.',
          codeBlock: `# Model Evaluation Pipeline for ${lessonTitle}
import numpy as np

def compute_metrics(y_true, y_pred):
    accuracy = np.mean(y_true == y_pred)
    return {"accuracy": float(accuracy)}`
        }
      ],
      keyTakeaways: [
        'Data preprocessing and feature scaling are as critical as model architecture choice.',
        'Always validate on independent holdout sets to measure real-world generalization.',
        'Use learning rate schedulers to stabilize convergence in later epochs.'
      ],
      codeSnippet: {
        language: 'python',
        filename: `${lessonTitle.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}.py`,
        code: `# Demonstration for: ${lessonTitle}
import math

def sigmoid(z):
    return 1.0 / (1.0 + math.exp(-z))

# Compute sample logits
logits = [-2.0, 0.0, 2.5]
probabilities = [round(sigmoid(x), 4) for x in logits]

print(f"Logits: {logits}")
print(f"Probabilities: {probabilities}")
print(f"Classification threshold (>0.5): {[p >= 0.5 for p in probabilities]}")`,
        expectedOutput: `Logits: [-2.0, 0.0, 2.5]\nProbabilities: [0.1192, 0.5, 0.9241]\nClassification threshold (>0.5): [False, True, True]`
      },
      quiz: [
        {
          question: 'What is the main danger of evaluating a model on the same data it was trained on?',
          options: [
            'The training will run too slowly.',
            'Overfitting cannot be detected because the model may merely memorize training samples.',
            'It consumes too much GPU memory.',
            'It forces the model into binary classification only.'
          ],
          correctIndex: 1,
          explanation: 'Training evaluation hides overfitting; an independent validation set is essential to measure true generalization.'
        }
      ],
      resources: [
        { title: 'Scientific Machine Learning Documentation', url: 'https://scikit-learn.org/stable/', type: 'documentation' },
        { title: 'Neural Networks & Deep Learning Cheat Sheet', url: 'https://github.com', type: 'cheatsheet' }
      ]
    };
  }

  if (cat.includes('cloud') || cat.includes('devops') || cat.includes('security') || cat.includes('cyber')) {
    return {
      lectureNotes: [
        {
          heading: `1. Infrastructure & System Overview: ${lessonTitle}`,
          body: `Production cloud architecture requires immutability, automated health monitoring, and defense-in-depth security. In this lesson, we analyze how ${lessonTitle} safeguards uptime, automates deployments, and mitigates risks.`,
          tips: [
            'Follow the Principle of Least Privilege (PoLP) for all IAM roles and service accounts.',
            'Declare infrastructure declaratively via code (IaC) rather than manual console clicks.'
          ]
        },
        {
          heading: '2. Continuous Integration & Resilient Delivery',
          body: 'Automate build artifacts, security scanning, unit test runs, and staged canary deployments. Ensure rapid rollback capability in the event of production health-check failures.'
        }
      ],
      keyTakeaways: [
        'Automate all deployments via reproducible CI/CD pipelines.',
        'Enforce encryption in-transit (TLS 1.3) and at-rest (AES-256).',
        'Monitor system health using proactive telemetry, health checks, and alerting thresholds.'
      ],
      codeSnippet: {
        language: 'yaml',
        filename: 'deploy-config.yml',
        code: `# Infrastructure Specification for: ${lessonTitle}
version: '3.8'
services:
  app-service:
    image: company/production-node:latest
    deploy:
      replicas: 3
      restart_policy:
        condition: on-failure
    ports:
      - "8080:3000"
    environment:
      NODE_ENV: production
      PORT: 3000
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3`,
        expectedOutput: `Health check configured: interval=30s, timeout=10s, retries=3\nReplication policy: 3 replicas initialized with on-failure restart.`
      },
      quiz: [
        {
          question: 'What is the Principle of Least Privilege in cloud and application security?',
          options: [
            'Granting admin rights to every developer so they can fix bugs quickly.',
            'Granting each user or service only the minimum permissions required to perform their specific job.',
            'Disabling all passwords across company computers.',
            'Storing database credentials in public GitHub repositories.'
          ],
          correctIndex: 1,
          explanation: 'Least Privilege minimizes blast radius by restricting access to only the necessary resources.'
        }
      ],
      resources: [
        { title: 'Cloud Infrastructure Architecture Whitepaper', url: 'https://aws.amazon.com/architecture/', type: 'documentation' },
        { title: 'DevSecOps & Kubernetes Deployment Cheatsheet', url: 'https://kubernetes.io/docs/', type: 'cheatsheet' }
      ]
    };
  }

  // Default fallback for CS, Algorithms, Mobile, UI/UX
  return {
    lectureNotes: [
      {
        heading: `1. Conceptual Fundamentals of ${lessonTitle}`,
        body: `Mastering ${lessonTitle} is foundational to developing scalable, high-quality software. This module covers core definitions, algorithm mechanics, and real-world system implementations.`,
        tips: [
          'Break complex problems down into modular sub-tasks.',
          'Consider Big-O time and space complexity before choosing data structures or algorithms.'
        ]
      },
      {
        heading: '2. Practical Application & Code Patterns',
        body: `Apply ${lessonTitle} using idiomatic conventions. Test with boundary cases including empty inputs, null pointers, and large datasets to verify resilience.`
      }
    ],
    keyTakeaways: [
      `Grasp the core theoretical mechanics of ${lessonTitle}.`,
      'Analyze computational complexity and algorithmic trade-offs.',
      'Write clean, modular, and self-documenting code.'
    ],
    codeSnippet: {
      language: 'typescript',
      filename: 'algorithm_demo.ts',
      code: `// Algorithm demonstration for: ${lessonTitle}
function runAlgorithm(dataset: number[]): { processed: number; sum: number } {
  console.log(\`Analyzing dataset of \${dataset.length} items for ${lessonTitle}...\`);
  const sum = dataset.reduce((acc, curr) => acc + curr, 0);
  return { processed: dataset.length, sum };
}

const data = [12, 45, 68, 92, 104];
const result = runAlgorithm(data);
console.log(\`Result: Processed \${result.processed} elements with Total = \${result.sum}\`);`,
      expectedOutput: `Analyzing dataset of 5 items for ${lessonTitle}...\nResult: Processed 5 elements with Total = 321`
    },
    quiz: [
      {
        question: `Why is thorough testing critical when implementing ${lessonTitle}?`,
        options: [
          'It is not critical; testing is optional in production.',
          'It reveals edge-case failures, memory leaks, and logic errors early before deployment.',
          'It automatically makes code run 10x faster.',
          'It deletes unwanted code automatically.'
        ],
        correctIndex: 1,
        explanation: 'Testing verifies correctness against boundary conditions and ensures maintainability during future refactors.'
      }
    ],
    resources: [
      { title: `${lessonTitle} Reference Guide`, url: 'https://en.wikipedia.org/wiki/Computer_science', type: 'documentation' },
      { title: 'Computer Science Curated Roadmap', url: 'https://roadmap.sh/computer-science', type: 'cheatsheet' }
    ]
  };
}
