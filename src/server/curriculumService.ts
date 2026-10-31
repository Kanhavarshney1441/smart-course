import Database from 'better-sqlite3';

export interface CurriculumLesson {
  id: number;
  title: string;
  chapter: string;
  duration_minutes: number;
  objectives: string[];
  exercises: string[];
}

export interface CurriculumModule {
  module_number: number;
  title: string;
  description: string;
  estimated_hours: number;
  lessons: CurriculumLesson[];
  mini_project?: {
    title: string;
    description: string;
    requirements: string[];
    tech_stack: string[];
  };
}

export interface CourseCurriculum {
  course_id: number;
  course_title: string;
  category: string;
  difficulty: string;
  modules: CurriculumModule[];
  capstone_project: {
    title: string;
    problem_statement: string;
    key_features: string[];
    tech_stack: string[];
    milestones: string[];
    evaluation_criteria: string[];
  };
}

export interface LearningResource {
  id: number;
  course_id: number;
  module_title: string;
  title: string;
  url: string;
  resource_type: 'documentation' | 'course' | 'video' | 'interactive' | 'cheatsheet';
  provider: string;
  duration_or_pages: string;
  difficulty: string;
}

export interface AssessmentQuestion {
  id: number;
  question: string;
  type: 'mcq' | 'true_false' | 'code_prediction';
  codeSnippet?: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

export interface ModuleAssessment {
  id: number;
  course_id: number;
  module_title: string;
  title: string;
  passing_score: number;
  questions: AssessmentQuestion[];
}

export interface RoadmapDay {
  day_number: number;
  week_number: number;
  title: string;
  task_type: 'Concept' | 'Coding' | 'Exercise' | 'Review' | 'Assessment' | 'Project';
  description: string;
  estimated_minutes: number;
  completed?: boolean;
}

export interface CourseRoadmap {
  course_id: number;
  weekly_study_hours: number;
  total_weeks: number;
  daily_study_mins: number;
  days: RoadmapDay[];
}

/**
 * Generate curriculum based on course details
 */
export function buildCourseCurriculum(course: any): CourseCurriculum {
  const isPython = course.title.toLowerCase().includes('python') || course.slug.includes('python');
  const isReact = course.title.toLowerCase().includes('react') || course.slug.includes('react');
  const isAWS = course.title.toLowerCase().includes('aws') || course.slug.includes('cloud');
  const isML = course.title.toLowerCase().includes('machine learning') || course.title.toLowerCase().includes('deep learning');
  const isDSA = course.title.toLowerCase().includes('data structure') || course.slug.includes('dsa');
  const isSecurity = course.title.toLowerCase().includes('security') || course.slug.includes('ethical-hacking');

  if (isPython) {
    return {
      course_id: course.id,
      course_title: course.title,
      category: course.category,
      difficulty: course.difficulty,
      modules: [
        {
          module_number: 1,
          title: 'Module 1: Introduction to Python & Environment Setup',
          description: 'Establish programming foundations, understand Python syntax, variables, data types, and interactive REPL workflows.',
          estimated_hours: 3,
          lessons: [
            {
              id: 1,
              title: 'What is Python & Setting Up the Development Environment',
              chapter: 'Chapter 1: Getting Started',
              duration_minutes: 30,
              objectives: ['Install Python 3 and VS Code', 'Understand interpreted languages vs compiled', 'Run your first Python script'],
              exercises: ['Print formatted student profile details', 'Execute Python in interactive terminal']
            },
            {
              id: 2,
              title: 'Variables, Dynamic Typing & Primitive Data Types',
              chapter: 'Chapter 1: Getting Started',
              duration_minutes: 35,
              objectives: ['Master integers, floats, strings, booleans', 'Understand type conversion and casting', 'Use f-strings for clean output'],
              exercises: ['Build a currency and temperature unit converter script']
            }
          ],
          mini_project: {
            title: 'Mini-Project 1: Interactive Student GPA Calculator',
            description: 'Write a command-line script that prompts a student for course names, credit weights, and letter grades, then calculates and prints their weighted GPA.',
            requirements: ['Validate user inputs', 'Perform float arithmetic accurately', 'Format output with 2 decimal places'],
            tech_stack: ['Python 3', 'Standard I/O']
          }
        },
        {
          module_number: 2,
          title: 'Module 2: Control Flow & Decision Making',
          description: 'Master conditional logic, Boolean algebra, while loops, for loops, and sequence traversal.',
          estimated_hours: 4,
          lessons: [
            {
              id: 3,
              title: 'Conditional Branching: if, elif, and else',
              chapter: 'Chapter 2: Logic & Decisions',
              duration_minutes: 40,
              objectives: ['Use logical operators (and, or, not)', 'Write nested conditions without spaghetti code', 'Implement match-case patterns'],
              exercises: ['Classify loan eligibility based on age, income, and credit score']
            },
            {
              id: 4,
              title: 'Loops, Iteration & Loop Control (break & continue)',
              chapter: 'Chapter 2: Logic & Decisions',
              duration_minutes: 45,
              objectives: ['Iterate using range(), enumerate(), and zip()', 'Prevent accidental infinite while loops', 'Use break and continue strategically'],
              exercises: ['Write a prime number finder between 1 and 100']
            }
          ],
          mini_project: {
            title: 'Mini-Project 2: Number Guessing Game with Feedback',
            description: 'Build a game where the computer picks a secret number and gives hot/cold feedback with limited attempt tracking.',
            requirements: ['Random module integration', 'While loop with sentinel break', 'Input sanitization for non-numeric input'],
            tech_stack: ['Python standard library `random`']
          }
        },
        {
          module_number: 3,
          title: 'Module 3: Data Structures (Lists, Tuples, Sets, Dictionaries)',
          description: 'Organize, transform, and query collections in memory with Pythonic idioms and list comprehensions.',
          estimated_hours: 5,
          lessons: [
            {
              id: 5,
              title: 'Lists & Tuples: Mutable vs Immutable Sequences',
              chapter: 'Chapter 3: Collections',
              duration_minutes: 45,
              objectives: ['Perform indexing, negative slicing, and methods (append, pop, sort)', 'Understand why tuples are immutable and hashable', 'Write concise list comprehensions'],
              exercises: ['Filter even squares from a dataset in one line']
            },
            {
              id: 6,
              title: 'Dictionaries & Sets: Key-Value Mapping & Fast Lookups',
              chapter: 'Chapter 3: Collections',
              duration_minutes: 50,
              objectives: ['Understand O(1) hash table lookup mechanics', 'Safely access keys with dict.get() and setdefault()', 'Perform set operations: union, intersection, difference'],
              exercises: ['Count word frequencies in a multi-paragraph text file']
            }
          ],
          mini_project: {
            title: 'Mini-Project 3: Student Enrollment & Gradebook Registry',
            description: 'A console tool that stores student records in nested dictionaries, computes top-performing students, and handles missing queries safely.',
            requirements: ['Dictionary of student IDs to grade lists', 'Query students by course code', 'Export summary statistics'],
            tech_stack: ['Python dictionaries & sets']
          }
        },
        {
          module_number: 4,
          title: 'Module 4: Functions, Modules & Clean Code',
          description: 'Package logic into testable, reusable functions with default arguments, *args/**kwargs, and modular files.',
          estimated_hours: 4,
          lessons: [
            {
              id: 7,
              title: 'Function Signatures, Scope & Docstrings',
              chapter: 'Chapter 4: Modular Code',
              duration_minutes: 45,
              objectives: ['Understand local vs global scope (LEGB rule)', 'Write pure functions with clear return statements', 'Document functions with Google/Sphinx docstrings'],
              exercises: ['Build a utility module of mathematical geometry helpers']
            },
            {
              id: 8,
              title: 'File Handling & Defensive Exception Management',
              chapter: 'Chapter 4: Modular Code',
              duration_minutes: 50,
              objectives: ['Use with open(...) context managers safely', 'Catch specific exceptions instead of bare except:', 'Read, parse, and write CSV/JSON datasets'],
              exercises: ['Parse a mock server access log and summarize HTTP status codes']
            }
          ],
          mini_project: {
            title: 'Mini-Project 4: CSV Data Cleaning & Report Generator',
            description: 'Read an unformatted CSV with missing fields, clean whitespace and numeric values, and output a validated CSV summary.',
            requirements: ['File context manager usage', 'Proper exception handling for missing files', 'Output formatting'],
            tech_stack: ['Python `csv` module', 'Exception hierarchy']
          }
        }
      ],
      capstone_project: {
        title: 'Capstone: Automated College Course Analytics & Report Engine',
        problem_statement: 'Academic departments receive thousands of raw exam and attendance records across heterogeneous CSV files. Build an automated end-to-end Python engine that ingests, cleans, calculates statistical percentiles, flags at-risk students, and outputs clean Markdown summaries.',
        key_features: [
          'Modular architecture separating I/O, statistical transformation, and report formatting',
          'Robust input validation and defensive error recovery for corrupt records',
          'Automated computation of mean, median, standard deviation, and letter grade distribution',
          'Generation of an executive summary report saved to disk'
        ],
        tech_stack: ['Python 3.12+', 'Standard Library (`csv`, `statistics`, `pathlib`, `json`)'],
        milestones: [
          'Milestone 1: Set up modular package structure with `__init__.py` and config',
          'Milestone 2: Implement CSV parser with validation checks and error logger',
          'Milestone 3: Build statistical calculation engine with test coverage',
          'Milestone 4: Generate Markdown report with summary tables'
        ],
        evaluation_criteria: [
          'Code readability and PEP 8 style adherence',
          'Graceful error handling without script crashes on malformed inputs',
          'Accuracy of statistical metrics',
          'Clean modular design with reusable functions'
        ]
      }
    };
  }

  if (isReact) {
    return {
      course_id: course.id,
      course_title: course.title,
      category: course.category,
      difficulty: course.difficulty,
      modules: [
        {
          module_number: 1,
          title: 'Module 1: Modern React 19 Architecture & Components',
          description: 'Deep dive into JSX, component composition, immutable state patterns, and custom hooks.',
          estimated_hours: 6,
          lessons: [
            {
              id: 1,
              title: 'Modern React Architecture & Component Composition',
              chapter: 'Chapter 1: Component Fundamentals',
              duration_minutes: 45,
              objectives: ['Understand unidirectional data flow', 'Master component composition over inheritance', 'Isolate state boundaries'],
              exercises: ['Build a flexible polymorphic Card component with Header, Body, and Footer sub-components']
            },
            {
              id: 2,
              title: 'Advanced State Management & Custom Hooks',
              chapter: 'Chapter 1: Component Fundamentals',
              duration_minutes: 50,
              objectives: ['Extract reusable asynchronous logic into custom hooks', 'Use useReducer for state machines', 'Avoid unnecessary re-renders'],
              exercises: ['Create a production-ready `useDebounce` and `useLocalStorage` hook']
            }
          ],
          mini_project: {
            title: 'Mini-Project 1: Interactive Filterable Course Catalog',
            description: 'Build a high-performance course explorer with faceted search, tag pills, sorting, and optimistic UI transitions.',
            requirements: ['Custom hook for API data fetching', 'Client-side query debounce', 'Zero prop-drilling with compound components'],
            tech_stack: ['React 19', 'TypeScript', 'Tailwind CSS']
          }
        },
        {
          module_number: 2,
          title: 'Module 2: Server API Engineering with Node.js & Express',
          description: 'Design production REST APIs, handle JSON payloads, implement middleware pipelines, and validate schemas.',
          estimated_hours: 6,
          lessons: [
            {
              id: 3,
              title: 'Express Routing, Controllers & Middleware Architecture',
              chapter: 'Chapter 2: Backend Architecture',
              duration_minutes: 50,
              objectives: ['Organize routes into clean controllers and services', 'Build logging and request-timing middleware', 'Implement centralized error handling'],
              exercises: ['Implement an error handler that transforms unhandled rejections into uniform JSON envelopes']
            },
            {
              id: 4,
              title: 'Database Integration, SQLite/PostgreSQL & Migrations',
              chapter: 'Chapter 2: Backend Architecture',
              duration_minutes: 55,
              objectives: ['Write prepared SQL statements to prevent injection', 'Design relational schemas with foreign keys and cascade rules', 'Perform indexing for high-speed queries'],
              exercises: ['Write an upsert transaction that recalculates progress percentage atomically']
            }
          ],
          mini_project: {
            title: 'Mini-Project 2: RESTful Student Progress Tracking API',
            description: 'Construct a complete Express API that manages course enrollments, tracks lesson progress, and computes completion metrics.',
            requirements: ['JWT token verification middleware', 'Input validation schema', 'Database transactions for progress updates'],
            tech_stack: ['Node.js', 'Express', 'SQLite/PostgreSQL', 'JWT']
          }
        },
        {
          module_number: 3,
          title: 'Module 3: Authentication, Security & Real-Time Patterns',
          description: 'Implement secure password hashing, JWT authorization, role-based access control (RBAC), and sanitization.',
          estimated_hours: 7,
          lessons: [
            {
              id: 5,
              title: 'End-to-End Authentication & Session Management',
              chapter: 'Chapter 3: Security & Auth',
              duration_minutes: 60,
              objectives: ['Hash passwords with bcrypt and optimal salt rounds', 'Issue and verify signed JWT tokens', 'Protect frontend private routes with React Context'],
              exercises: ['Build a token-refresher and auto-logout timer on expiry']
            },
            {
              id: 6,
              title: 'Security Hardening: CORS, XSS Defense & Rate Limiting',
              chapter: 'Chapter 3: Security & Auth',
              duration_minutes: 50,
              objectives: ['Configure restrictive CORS headers', 'Sanitize user-generated content', 'Prevent brute-force login attacks with rate limiters'],
              exercises: ['Implement IP-based rate limiting on sensitive auth endpoints']
            }
          ],
          mini_project: {
            title: 'Mini-Project 3: Multi-Role Authentication Gatekeeper',
            description: 'Implement a complete authentication workflow with Student and Admin roles, route guards, and protected administrative dashboards.',
            requirements: ['Bcrypt hashing', 'RBAC middleware', 'Auth token storage with clean logout'],
            tech_stack: ['React Router', 'Express', 'Bcrypt', 'JWT']
          }
        }
      ],
      capstone_project: {
        title: 'Capstone: Collaborative EdTech SaaS Classroom Platform',
        problem_statement: 'Modern learning requires seamless coordination between students, interactive exercises, code sandboxes, and instructor analytics. Build a full-stack production application where students can browse courses, track modular progress, take assessments, and consult an AI tutor.',
        key_features: [
          'Full-stack architecture with React 19 frontend and Express REST backend',
          'Personalized student dashboard with progress metrics, streaks, and roadmaps',
          'Interactive lesson viewer with code sandboxes and auto-graded assessments',
          'AI-powered personal tutor integrated server-side with fallback handling'
        ],
        tech_stack: ['React 19', 'TypeScript', 'Node.js', 'Express', 'SQLite/PostgreSQL', 'Tailwind CSS'],
        milestones: [
          'Milestone 1: Database schema & relationship migrations',
          'Milestone 2: Secure backend API endpoints with JWT & RBAC',
          'Milestone 3: Responsive client workspace with interactive tabs and video player',
          'Milestone 4: End-to-end integration and automated test verification'
        ],
        evaluation_criteria: [
          'Completeness of user workflows (enrollment, learning, assessment, notes)',
          'Code modularity and clean separation of concerns',
          'Responsive design across mobile, tablet, and desktop',
          'Test suite pass rate and type safety'
        ]
      }
    };
  }

  // Default dynamic curriculum for any other course (Data Science, Cloud, DevOps, CyberSecurity, etc.)
  return {
    course_id: course.id,
    course_title: course.title,
    category: course.category,
    difficulty: course.difficulty,
    modules: [
      {
        module_number: 1,
        title: `Module 1: Foundations of ${course.category}`,
        description: `Master core principles, architectural vocabulary, and tooling for ${course.title}.`,
        estimated_hours: 5,
        lessons: [
          {
            id: 1,
            title: `${course.title}: Core Architectural Principles`,
            chapter: 'Chapter 1: Foundational Theory',
            duration_minutes: 45,
            objectives: ['Understand high-level architecture', 'Master foundational mental models', 'Configure your professional environment'],
            exercises: ['Set up local development sandbox', 'Complete introductory concept mapping']
          },
          {
            id: 2,
            title: 'Hands-On Tooling & Core Workflow Pipelines',
            chapter: 'Chapter 1: Foundational Theory',
            duration_minutes: 50,
            objectives: ['Inspect real-world configuration files', 'Execute standard workflow commands', 'Verify system health and outputs'],
            exercises: ['Implement basic baseline configurations']
          }
        ],
        mini_project: {
          title: `Mini-Project 1: ${course.category} Baseline Setup & Audit`,
          description: `Construct a functional baseline environment with automated validation checks and logging.`,
          requirements: ['Environment verification script', 'Documented architecture diagram', 'Initial baseline test run'],
          tech_stack: [course.category, 'Modern Tooling']
        }
      },
      {
        module_number: 2,
        title: `Module 2: Practical Implementation & Problem Solving`,
        description: `Apply techniques directly on real-world scenarios with optimization and edge-case handling.`,
        estimated_hours: 6,
        lessons: [
          {
            id: 3,
            title: 'Applied Implementation Patterns & Case Studies',
            chapter: 'Chapter 2: Core Engineering',
            duration_minutes: 55,
            objectives: ['Design scalable solutions', 'Handle edge cases and asynchronous failures', 'Optimize throughput and latency'],
            exercises: ['Refactor a suboptimal prototype into an efficient production implementation']
          },
          {
            id: 4,
            title: 'Reliability, Error Handling & Industry Best Practices',
            chapter: 'Chapter 2: Core Engineering',
            duration_minutes: 60,
            objectives: ['Identify common anti-patterns', 'Implement defensive validation', 'Monitor and trace execution errors'],
            exercises: ['Write regression tests covering identified edge cases']
          }
        ],
        mini_project: {
          title: `Mini-Project 2: Resilient Production Implementation`,
          description: `Build an end-to-end working module incorporating defensive programming and error boundaries.`,
          requirements: ['Comprehensive input validation', 'Telemetry logging', 'Automated verification test'],
          tech_stack: [course.category, 'Testing Framework']
        }
      }
    ],
    capstone_project: {
      title: `Capstone: Production-Grade ${course.title} System`,
      problem_statement: `Design, construct, test, and document a complete, scalable solution demonstrating mastery of all core outcomes for ${course.title}.`,
      key_features: [
        'Modular, maintainable code architecture adhering to industry design standards',
        'Defensive error handling and boundary validation',
        'End-to-end integration and automated verification',
        'Comprehensive documentation and performance analysis'
      ],
      tech_stack: [course.category, 'Industry Standard Frameworks'],
      milestones: [
        'Milestone 1: System requirements & architecture specification',
        'Milestone 2: Core domain logic implementation',
        'Milestone 3: Integration and stress testing',
        'Milestone 4: Deployment documentation and performance benchmark'
      ],
      evaluation_criteria: [
        'Architectural correctness and code quality',
        'Handling of edge cases and fault tolerance',
        'Clarity of documentation and code comments'
      ]
    }
  };
}

/**
 * Return rich learning content tailored to skill level
 */
export function getAdaptiveLessonContent(
  course: any,
  lessonTitle: string,
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced' = 'Intermediate'
) {
  const isBeginner = skillLevel === 'Beginner';
  const isAdvanced = skillLevel === 'Advanced';

  return {
    lessonTitle,
    courseTitle: course.title,
    skillLevel,
    simpleDefinition: isBeginner
      ? `In simple terms, ${lessonTitle} is like a fundamental recipe in ${course.category} that allows your program to make decisions, remember information, or execute tasks without repeating code.`
      : isAdvanced
      ? `${lessonTitle} represents an architectural abstraction in ${course.category} focused on minimizing algorithmic complexity, decoupling responsibilities, and ensuring deterministic runtime execution under heavy loads.`
      : `${lessonTitle} is a core mechanism in ${course.category} designed to structure logic cleanly, manage state transitions, and build modular, testable software.`,

    detailedNotes: [
      {
        heading: '1. Theoretical Framework & Core Concepts',
        content: `When building software in ${course.category}, maintaining clarity and predictability is essential. ${lessonTitle} addresses the critical need for deterministic state changes and clean boundaries. By isolating logic into dedicated functions or components, developers eliminate unexpected side-effects and simplify debugging.`,
        tips: [
          'Always state the expected inputs and outputs before writing implementation logic.',
          'Separate data retrieval from presentation or calculation logic.'
        ]
      },
      {
        heading: '2. Step-by-Step Practical Implementation',
        content: `To apply ${lessonTitle} in practice, follow a disciplined three-step execution workflow:
1. **Initialize State/Context**: Establish unambiguous default values and schema definitions.
2. **Execute Core Operations**: Perform calculations, queries, or transformations using pure, testable functions.
3. **Handle Edge Cases & Fallbacks**: Provide defensive guards for null/undefined values, network timeouts, or malformed payloads.`,
        codeSnippet: {
          language: course.topics?.includes('Python') ? 'python' : 'typescript',
          code: course.topics?.includes('Python')
            ? `# Production Pattern for ${lessonTitle}
from typing import Dict, Any, Optional

def execute_operation(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Validates input payload and returns processed result with error boundaries."""
    if not payload or not isinstance(payload, dict):
        raise ValueError("Invalid payload provided: expected non-empty dictionary.")
    
    # Process transformation cleanly
    result = {
        "status": "success",
        "processed_keys": list(payload.keys()),
        "record_count": len(payload),
        "active": True
    }
    return result

# Example Execution
sample_data = {"id": 101, "course": "${course.title}", "active": True}
output = execute_operation(sample_data)
print("Execution Result:", output)`
            : `// Production Pattern for ${lessonTitle}
interface OperationPayload {
  id: number;
  courseTitle: string;
  metadata?: Record<string, unknown>;
}

export function executeOperation<T extends OperationPayload>(payload: T): { status: string; data: T; timestamp: string } {
  if (!payload || !payload.id) {
    throw new Error('Invalid payload: required ID parameter missing.');
  }

  // Pure transformation without mutating input
  return {
    status: 'success',
    data: Object.freeze({ ...payload }),
    timestamp: new Date().toISOString()
  };
}

// Verification
const result = executeOperation({ id: 1, courseTitle: '${course.title}' });
console.log('Result:', result.status, result.data.courseTitle);`,
          expectedOutput: course.topics?.includes('Python')
            ? `Execution Result: {'status': 'success', 'processed_keys': ['id', 'course', 'active'], 'record_count': 3, 'active': True}`
            : `Result: success ${course.title}`
        }
      },
      {
        heading: '3. Real-World Applications & Industry Context',
        content: `In production engineering, this pattern is used across mission-critical systems:
- **Scalable Microservices**: Decoupling API endpoints from underlying persistence engines.
- **Interactive Web Clients**: Eliminating UI lag and ensuring 60 FPS rendering through clean memoization.
- **Data Engineering**: Processing millions of rows through validated pipeline stages without silent crashes.`,
        tips: [
          'Profile performance bottlenecks before adding premature caching layers.',
          'Log structured metadata rather than raw unstructured strings for rapid observability.'
        ]
      }
    ],

    commonMistakes: [
      {
        pitfall: 'Mutating data structures directly in place',
        solution: 'Always create new references or immutable copies to prevent subtle multi-thread or re-render bugs.'
      },
      {
        pitfall: 'Ignoring error conditions or swallow exceptions with empty catch blocks',
        solution: 'Catch specific exception types, log them with context, and surface actionable error states.'
      },
      {
        pitfall: 'Deeply nested logic exceeding 3 levels of indentation',
        solution: 'Use early return statements (guard clauses) to reduce cognitive complexity.'
      }
    ],

    keyTakeaways: [
      `${lessonTitle} provides deterministic and testable code organization.`,
      `Defensive validation at entry points protects against corrupted data propagation.`,
      `Clarity and explicit state ownership always outweigh clever one-liners.`
    ],

    practiceQuestions: [
      {
        question: `What is the primary benefit of applying defensive validation within ${lessonTitle}?`,
        options: [
          'It completely eliminates the need for unit testing',
          'It catches invalid inputs immediately, preventing silent data corruption downstream',
          'It makes the code run 10x faster automatically',
          'It compiles the code to binary machine instructions'
        ],
        correctIndex: 1,
        explanation: 'Defensive validation ensures that faulty or malformed data is rejected at system boundaries before it can corrupt state or cause difficult-to-trace crashes.'
      },
      {
        question: `Why should pure functions be preferred when implementing ${lessonTitle}?`,
        options: [
          'They do not produce observable side effects and always produce the same output for identical inputs',
          'They can only be executed on supercomputers',
          'They allow global variables to be modified anywhere in the codebase',
          'They do not require a return statement'
        ],
        correctIndex: 0,
        explanation: 'Pure functions have no side effects and are deterministic, making them extraordinarily easy to test, reason about, and parallelize.'
      }
    ],

    summary: `In this lesson on ${lessonTitle}, you learned how to structure logic cleanly, avoid common mutable pitfalls, and implement defensive practices that ensure reliable, scalable code in ${course.category}.`
  };
}

/**
 * Curated high-quality learning resources with verified, authentic URLs
 */
export function getCuratedResources(course: any): LearningResource[] {
  const title = (course.title || '').toLowerCase();
  const slug = (course.slug || '').toLowerCase();

  const isPython = title.includes('python') || slug.includes('python');
  const isReact = title.includes('react') || slug.includes('react');
  const isAWS = title.includes('aws') || slug.includes('cloud');
  const isDocker = title.includes('docker') || slug.includes('kubernetes');
  const isDSA = title.includes('dsa') || title.includes('data structure') || slug.includes('algorithm');
  const isML = title.includes('machine learning') || title.includes('deep learning') || title.includes('pytorch');

  if (isPython) {
    return [
      {
        id: 1,
        course_id: course.id,
        module_title: 'Official Documentation',
        title: 'Python 3.12 Official Language Reference & Tutorial',
        url: 'https://docs.python.org/3/tutorial/index.html',
        resource_type: 'documentation',
        provider: 'Python Software Foundation',
        duration_or_pages: '12 chapters',
        difficulty: 'All Levels'
      },
      {
        id: 2,
        course_id: course.id,
        module_title: 'Interactive Coding Platform',
        title: 'Exercism Python Track: 140+ Mentor-Reviewed Exercises',
        url: 'https://exercism.org/tracks/python',
        resource_type: 'interactive',
        provider: 'Exercism',
        duration_or_pages: '140+ challenges',
        difficulty: 'Beginner to Advanced'
      },
      {
        id: 3,
        course_id: course.id,
        module_title: 'High-Quality Video Lecture',
        title: 'Harvard CS50P: Introduction to Programming with Python',
        url: 'https://www.youtube.com/watch?v=nLRL_NcnK-4',
        resource_type: 'video',
        provider: 'CS50 / freeCodeCamp',
        duration_or_pages: '16 hours',
        difficulty: 'Beginner'
      },
      {
        id: 4,
        course_id: course.id,
        module_title: 'Downloadable Revision Material',
        title: 'Comprehensive Python Syntax & Data Structures Cheat Sheet',
        url: 'https://www.pythoncheatsheet.org/',
        resource_type: 'cheatsheet',
        provider: 'Python Cheat Sheet Org',
        duration_or_pages: 'Quick Reference',
        difficulty: 'All Levels'
      }
    ];
  }

  if (isReact) {
    return [
      {
        id: 1,
        course_id: course.id,
        module_title: 'Official Documentation',
        title: 'React.dev Official Interactive Documentation & Quick Start',
        url: 'https://react.dev/learn',
        resource_type: 'documentation',
        provider: 'React Core Team',
        duration_or_pages: '15 chapters',
        difficulty: 'All Levels'
      },
      {
        id: 2,
        course_id: course.id,
        module_title: 'Web Standards Reference',
        title: 'MDN Web Docs: JavaScript Modern ES6+ & DOM APIs',
        url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
        resource_type: 'documentation',
        provider: 'Mozilla Developer Network',
        duration_or_pages: 'Reference Guide',
        difficulty: 'Intermediate'
      },
      {
        id: 3,
        course_id: course.id,
        module_title: 'Comprehensive Video Masterclass',
        title: 'Full Stack React & Express Development Course',
        url: 'https://www.youtube.com/watch?v=bMknfKXIFA8',
        resource_type: 'video',
        provider: 'freeCodeCamp.org',
        duration_or_pages: '12 hours',
        difficulty: 'Intermediate'
      },
      {
        id: 4,
        course_id: course.id,
        module_title: 'Interactive Coding Platform',
        title: 'Scrimba Interactive React Playground & Tutorials',
        url: 'https://scrimba.com/learn/learnreact',
        resource_type: 'interactive',
        provider: 'Scrimba',
        duration_or_pages: '140+ interactive lessons',
        difficulty: 'Beginner to Intermediate'
      }
    ];
  }

  if (isAWS) {
    return [
      {
        id: 1,
        course_id: course.id,
        module_title: 'Official Documentation',
        title: 'AWS Well-Architected Framework & Whitepapers',
        url: 'https://aws.amazon.com/architecture/well-architected/',
        resource_type: 'documentation',
        provider: 'Amazon Web Services',
        duration_or_pages: '6 Pillars Whitepaper',
        difficulty: 'Intermediate'
      },
      {
        id: 2,
        course_id: course.id,
        module_title: 'Certification Video Masterclass',
        title: 'AWS Certified Solutions Architect Associate Full Course',
        url: 'https://www.youtube.com/watch?v=Ia-UEYYR44s',
        resource_type: 'video',
        provider: 'freeCodeCamp / Andrew Brown',
        duration_or_pages: '14 hours',
        difficulty: 'Intermediate'
      },
      {
        id: 3,
        course_id: course.id,
        module_title: 'Architecture & Visual Guides',
        title: 'AWS Reference Architecture Diagrams & Solutions Library',
        url: 'https://aws.amazon.com/solutions/',
        resource_type: 'cheatsheet',
        provider: 'AWS Solutions',
        duration_or_pages: '100+ diagrams',
        difficulty: 'All Levels'
      }
    ];
  }

  // Default rich resources
  return [
    {
      id: 1,
      course_id: course.id,
      module_title: 'Official Documentation',
      title: `${course.category} Official Developer Standards & Specifications`,
      url: 'https://developer.mozilla.org/en-US/',
      resource_type: 'documentation',
      provider: 'MDN / Industry Consortium',
      duration_or_pages: 'Official Docs',
      difficulty: 'All Levels'
    },
    {
      id: 2,
      course_id: course.id,
      module_title: 'Free University Curriculum',
      title: 'MIT OpenCourseWare Computer Science & Engineering',
      url: 'https://ocw.mit.edu/courses/electrical-engineering-and-computer-science/',
      resource_type: 'course',
      provider: 'Massachusetts Institute of Technology',
      duration_or_pages: 'Semester Curriculum',
      difficulty: 'Intermediate to Advanced'
    },
    {
      id: 3,
      course_id: course.id,
      module_title: 'High-Quality Video Tutorial',
      title: `${course.title} Comprehensive Deep Dive`,
      url: 'https://www.youtube.com/@freecodecamp',
      resource_type: 'video',
      provider: 'freeCodeCamp.org',
      duration_or_pages: 'Full Course Series',
      difficulty: 'All Levels'
    }
  ];
}

/**
 * Generate Module Assessments with MCQs, True/False, and Code Prediction questions
 */
export function buildModuleAssessment(course: any, moduleNumber: number = 1): ModuleAssessment {
  const isPython = (course.title || '').toLowerCase().includes('python');
  const isReact = (course.title || '').toLowerCase().includes('react');

  if (isPython) {
    return {
      id: moduleNumber,
      course_id: course.id,
      module_title: `Module ${moduleNumber} Comprehensive Assessment`,
      title: 'Python Mastery Diagnostic & Proficiency Exam',
      passing_score: 75,
      questions: [
        {
          id: 1,
          question: 'What will be the output of the following Python expression?',
          type: 'code_prediction',
          codeSnippet: `x = [1, 2, 3]\ny = x\ny.append(4)\nprint(len(x))`,
          options: ['3', '4', 'Throws an AttributeError', 'Throws an IndexError'],
          correct_index: 1,
          explanation: 'In Python, assigning a list (`y = x`) copies the reference, not the underlying array. Therefore, mutating `y` also mutates `x`, making `len(x)` equal to 4.'
        },
        {
          id: 2,
          question: 'In Python, which of the following data structures is immutable and can be used as a dictionary key?',
          type: 'mcq',
          options: ['List (`[1, 2]`)', 'Dictionary (`{"a": 1}`)', 'Tuple (`(1, 2)`)', 'Set (`{1, 2}`)'],
          correct_index: 2,
          explanation: 'Tuples are immutable sequences in Python and are hashable (provided their elements are also hashable), allowing them to serve as dictionary keys.'
        },
        {
          id: 3,
          question: 'True or False: The `with open("data.txt") as f:` construct automatically closes the file even if an unhandled exception occurs inside the block.',
          type: 'true_false',
          options: ['True', 'False'],
          correct_index: 0,
          explanation: 'Python context managers (`with` statement) implement `__enter__` and `__exit__`. The `__exit__` method guarantees that file descriptors are safely released even when exceptions are raised.'
        },
        {
          id: 4,
          question: 'What is the time complexity of searching for a key in a standard Python dictionary?',
          type: 'mcq',
          options: ['O(n) linear time', 'O(log n) logarithmic time', 'O(1) average constant time', 'O(n^2) quadratic time'],
          correct_index: 2,
          explanation: 'Python dictionaries are implemented using optimized hash tables with open addressing, providing O(1) average time complexity for key lookups, insertions, and deletions.'
        }
      ]
    };
  }

  if (isReact) {
    return {
      id: moduleNumber,
      course_id: course.id,
      module_title: `Module ${moduleNumber} Full-Stack React & Node Assessment`,
      title: 'React Architecture & API Security Assessment',
      passing_score: 75,
      questions: [
        {
          id: 1,
          question: 'Why should you never mutate state variables directly in React (e.g., `state.count = 5`)?',
          type: 'mcq',
          options: [
            'Direct mutation prevents React from detecting state changes and scheduling a component re-render',
            'It immediately throws a compiler error in JavaScript',
            'It deletes the virtual DOM tree',
            'React only supports mutable class instances'
          ],
          correct_index: 0,
          explanation: 'React compares state references using shallow equality. If you mutate the object directly in place, the reference remains identical, causing React to skip the necessary re-rendering cycle.'
        },
        {
          id: 2,
          question: 'What will this React 19 hook behavior exhibit?',
          type: 'code_prediction',
          codeSnippet: `const [count, setCount] = useState(0);\n\nconst handleClick = () => {\n  setCount(c => c + 1);\n  setCount(c => c + 1);\n};\n// If count was 0, what is count after handleClick runs?`,
          options: ['1', '2', '0', 'undefined'],
          correct_index: 1,
          explanation: 'Using the updater function `c => c + 1` queues state transitions sequentially, reliably producing `0 + 1 + 1 = 2` regardless of asynchronous batching.'
        },
        {
          id: 3,
          question: 'True or False: In Express.js, error-handling middleware must explicitly take four arguments: `(err, req, res, next)`.',
          type: 'true_false',
          options: ['True', 'False'],
          correct_index: 0,
          explanation: 'Express inspects function arity (`fn.length`). Only functions with exactly four declared parameters are recognized and invoked as error-handling middleware.'
        },
        {
          id: 4,
          question: 'Which HTTP response header is essential for mitigating Cross-Site Scripting (XSS) attacks by restricting where scripts can execute from?',
          type: 'mcq',
          options: ['Content-Security-Policy', 'Access-Control-Allow-Origin', 'Cache-Control', 'X-Forwarded-For'],
          correct_index: 0,
          explanation: 'Content-Security-Policy (CSP) allows server operators to declare authorized domains and script hashes, neutralizing malicious inline script execution.'
        }
      ]
    };
  }

  // Default general assessment
  return {
    id: moduleNumber,
    course_id: course.id,
    module_title: `Module ${moduleNumber} Architectural Assessment`,
    title: `${course.title} Milestone Diagnostic Quiz`,
    passing_score: 75,
    questions: [
      {
        id: 1,
        question: `What is the primary architectural principle demonstrated in ${course.category}?`,
        type: 'mcq',
        options: [
          'Decoupling system components through clear interfaces and single responsibility',
          'Writing all logic into a single monolithic file for maximum speed',
          'Relying entirely on global variables across components',
          'Omitting all error logging to save disk space'
        ],
        correct_index: 0,
        explanation: 'Decoupling responsibilities ensures that individual modules can be tested, refactored, and scaled independently without cascading regressions.'
      },
      {
        id: 2,
        question: 'True or False: Automated unit tests and continuous integration detect regressions before deployment to production.',
        type: 'true_false',
        options: ['True', 'False'],
        correct_index: 0,
        explanation: 'Continuous integration executes automated test suites on every commit, catching breaking changes early in the development lifecycle.'
      },
      {
        id: 3,
        question: 'What is the most effective approach for handling unexpected runtime errors?',
        type: 'mcq',
        options: [
          'Catch specific exceptions, log structured diagnostic context, and return safe fallback states',
          'Silently ignore the exception with an empty catch block',
          'Hardcode a system shutdown command',
          'Disable type checking'
        ],
        correct_index: 0,
        explanation: 'Catching specific errors and logging actionable context enables rapid troubleshooting while keeping the overall application operational for users.'
      }
    ]
  };
}

/**
 * Generate a personalized day-by-day and week-by-week learning roadmap
 */
export function generatePersonalizedRoadmap(
  course: any,
  weeklyStudyHours: number = 6
): CourseRoadmap {
  const durationHours = course.duration_hours || 20;
  // Calculate total study weeks based on user available hours
  const totalWeeks = Math.max(2, Math.ceil(durationHours / Math.max(1, weeklyStudyHours)));
  const dailyMins = Math.round((weeklyStudyHours * 60) / 4); // 4 study days a week

  const days: RoadmapDay[] = [];
  let dayCounter = 1;

  for (let w = 1; w <= totalWeeks; w++) {
    // Day 1: Core concepts
    days.push({
      day_number: dayCounter++,
      week_number: w,
      title: `Week ${w} Foundations & Theory`,
      task_type: 'Concept',
      description: `Study key lecture notes, definitions, and mental models for Week ${w}.`,
      estimated_minutes: dailyMins,
      completed: w === 1
    });

    // Day 2: Hands-on coding
    days.push({
      day_number: dayCounter++,
      week_number: w,
      title: `Week ${w} Hands-On Coding Lab`,
      task_type: 'Coding',
      description: `Run interactive code snippets, experiment with edge cases, and inspect output.`,
      estimated_minutes: dailyMins,
      completed: false
    });

    // Day 3: Exercises & Deep Dive
    days.push({
      day_number: dayCounter++,
      week_number: w,
      title: `Week ${w} Practical Exercises`,
      task_type: 'Exercise',
      description: `Complete practice challenges, review common anti-patterns, and consult AI tutor.`,
      estimated_minutes: dailyMins,
      completed: false
    });

    // Day 4: Assessment & Milestone Check
    days.push({
      day_number: dayCounter++,
      week_number: w,
      title: `Week ${w} Assessment & Project Milestone`,
      task_type: w === totalWeeks ? 'Project' : 'Assessment',
      description: w === totalWeeks
        ? `Submit your final Capstone Project and verify evaluation criteria checklist.`
        : `Take the module interactive assessment to validate topic comprehension.`,
      estimated_minutes: dailyMins,
      completed: false
    });
  }

  return {
    course_id: course.id,
    weekly_study_hours: weeklyStudyHours,
    total_weeks: totalWeeks,
    daily_study_mins: dailyMins,
    days
  };
}
