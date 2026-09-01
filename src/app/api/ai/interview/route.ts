import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ─── Question Bank ──────────────────────────────────────────────────────────
// Organized by skill category with difficulty levels
const QUESTION_BANK: Record<
  string,
  { question: string; difficulty: "easy" | "medium" | "hard"; expectedPoints: string[] }[]
> = {
  typescript: [
    {
      question: "What is the difference between `interface` and `type` in TypeScript? When would you use each?",
      difficulty: "medium",
      expectedPoints: [
        "Interfaces support declaration merging",
        "Types can represent unions, intersections, and primitives",
        "Interfaces are generally preferred for object shapes",
        "Types can be used for mapped types and conditional types",
      ],
    },
    {
      question: "Explain how TypeScript generics work. Give a practical example of a generic function.",
      difficulty: "medium",
      expectedPoints: [
        "Generics provide type parameterization",
        "They enable writing reusable, type-safe code",
        "Can use constraints with extends keyword",
        "Example: function identity<T>(arg: T): T { return arg; }",
      ],
    },
    {
      question: "What are discriminated unions in TypeScript and why are they useful?",
      difficulty: "hard",
      expectedPoints: [
        "A union of types that share a common literal property",
        "Enable exhaustive type checking in switch statements",
        "Improve type narrowing and code safety",
        "Pattern: type Shape = { kind: 'circle'; radius: number } | { kind: 'rect'; width: number }",
      ],
    },
  ],
  react: [
    {
      question: "What is the difference between `useState` and `useReducer`? When would you choose one over the other?",
      difficulty: "medium",
      expectedPoints: [
        "useState is for simple state, useReducer for complex state logic",
        "useReducer is preferred when state transitions depend on previous state",
        "useReducer provides better predictability with action dispatching",
        "Both are hooks that trigger re-renders on state change",
      ],
    },
    {
      question: "Explain React's reconciliation process (virtual DOM diffing). How does it decide what to re-render?",
      difficulty: "hard",
      expectedPoints: [
        "React compares the new virtual DOM tree with the previous one",
        "Uses key prop to identify elements in lists",
        "Only re-renders components whose props or state changed",
        "Bailout optimization via React.memo and useMemo",
      ],
    },
    {
      question: "What are React Server Components? How do they differ from Client Components?",
      difficulty: "hard",
      expectedPoints: [
        "Server Components run only on the server, no client-side JS sent",
        "Client Components use 'use client' directive, run in browser",
        "Server Components can directly access databases and file system",
        "Server Components cannot use hooks or browser APIs",
      ],
    },
  ],
  "next.js": [
    {
      question: "Explain the App Router file conventions in Next.js. What is the purpose of `layout.tsx`, `loading.tsx`, and `error.tsx`?",
      difficulty: "medium",
      expectedPoints: [
        "layout.tsx wraps child routes, persists across navigations",
        "loading.tsx shows loading UI while route segment loads (Suspense)",
        "error.tsx catches errors in the route segment, enables recovery",
        "They are nested and compose the page UI progressively",
      ],
    },
    {
      question: "When would you use `server actions` vs API routes in Next.js?",
      difficulty: "medium",
      expectedPoints: [
        "Server Actions are form mutations called directly from components",
        "API Routes are REST endpoints for broader client-side data fetching",
        "Server Actions are simpler for form submissions and mutations",
        "API Routes better for external consumers and complex responses",
      ],
    },
  ],
  "node.js": [
    {
      question: "Explain the Node.js event loop. What are the different phases?",
      difficulty: "hard",
      expectedPoints: [
        "Event loop has phases: timers, pending callbacks, idle/prepare, poll, check, close",
        "Microtasks (Promise callbacks) run between each phase",
        "setTimeout is in the timers phase, setImmediate is in the check phase",
        "Process.nextTick and queueMicrotask run before the next phase",
      ],
    },
    {
      question: "How do you handle errors in an Express.js application? What is an error-handling middleware?",
      difficulty: "medium",
      expectedPoints: [
        "Error-handling middleware has 4 parameters: (err, req, res, next)",
        "Use try-catch in async route handlers",
        "Centralized error handler middleware at the end of the middleware chain",
        "Custom error classes for different HTTP status codes",
      ],
    },
  ],
  python: [
    {
      question: "Explain Python's GIL (Global Interpreter Lock). How does it affect multithreading?",
      difficulty: "hard",
      expectedPoints: [
        "GIL allows only one thread to execute Python bytecode at a time",
        "Makes CPU-bound multithreading less effective",
        "IO-bound tasks still benefit from threading",
        "multiprocessing bypasses GIL by using separate processes",
      ],
    },
    {
      question: "What are decorators in Python? Give an example of a practical use case.",
      difficulty: "medium",
      expectedPoints: [
        "Decorators are functions that modify other functions or classes",
        "They use the @decorator syntax above a function definition",
        "Common uses: logging, authentication, caching, retry logic",
        "They wrap the original function, can add behavior before/after",
      ],
    },
  ],
  postgresql: [
    {
      question: "What is the difference between INNER JOIN, LEFT JOIN, and FULL OUTER JOIN? When would you use each?",
      difficulty: "medium",
      expectedPoints: [
        "INNER JOIN returns only matching rows from both tables",
        "LEFT JOIN returns all left table rows, with NULLs for non-matching right rows",
        "FULL OUTER JOIN returns all rows from both tables",
        "Use LEFT JOIN when you need all records from one table regardless of matches",
      ],
    },
  ],
  docker: [
    {
      question: "What is the difference between a Docker image and a container? How does a multi-stage build help?",
      difficulty: "medium",
      expectedPoints: [
        "An image is a read-only template, a container is a running instance",
        "Images are built from Dockerfiles in layers",
        "Multi-stage builds reduce final image size by separating build and runtime",
        "They allow copying only necessary artifacts to the final stage",
      ],
    },
  ],
};

// ─── Fallback questions ─────────────────────────────────────────────────────
const FALLBACK_QUESTIONS = [
  {
    question: "Describe a challenging project you worked on. What was your approach and what did you learn?",
    difficulty: "medium" as const,
    expectedPoints: [
      "Clear problem description",
      "Technical approach and decisions made",
      "Challenges faced and how they were overcome",
      "Lessons learned or improvements identified",
    ],
  },
  {
    question: "How do you approach debugging a complex issue in production?",
    difficulty: "medium" as const,
    expectedPoints: [
      "Reproduce the issue first",
      "Check logs, monitoring, and metrics",
      "Isolate the problem using systematic elimination",
      "Implement fix with tests to prevent regression",
    ],
  },
  {
    question: "Explain the concept of SOLID principles. How do you apply them in your code?",
    difficulty: "hard" as const,
    expectedPoints: [
      "Single Responsibility, Open/Closed, Liskov Substitution",
      "Interface Segregation, Dependency Inversion",
      "Practical examples of applying each principle",
      "Understanding trade-offs between strict adherence and pragmatism",
    ],
  },
];

interface Message {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { action, answer, questionIndex, conversationHistory } = await req.json();

  // ─── Generate Questions ────────────────────────────────────────────────
  if (action === "start") {
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
      include: { skills: { include: { skill: true } } },
    });

    const skillNames = (profile?.skills || []).map((s) => s.skill.name.toLowerCase());

    // Pick questions based on student's skills
    const selectedQuestions: { question: string; difficulty: string; expectedPoints: string[]; skill: string }[] = [];

    for (const skillName of skillNames) {
      const questions = QUESTION_BANK[skillName];
      if (questions) {
        for (const q of questions) {
          if (selectedQuestions.length < 2) {
            selectedQuestions.push({ ...q, skill: skillName });
          }
        }
      }
    }

    // Fill remaining with fallback
    while (selectedQuestions.length < 3) {
      const fallback = FALLBACK_QUESTIONS[selectedQuestions.length % FALLBACK_QUESTIONS.length];
      if (!selectedQuestions.some((q) => q.question === fallback.question)) {
        selectedQuestions.push({ ...fallback, skill: "general" });
      }
    }

    // Shuffle and take 3
    const shuffled = selectedQuestions.sort(() => Math.random() - 0.5).slice(0, 3);

    return NextResponse.json({
      questions: shuffled.map((q, i) => ({
        index: i,
        question: q.question,
        difficulty: q.difficulty,
        skill: q.skill,
      })),
    });
  }

  // ─── Evaluate Answer ───────────────────────────────────────────────────
  if (action === "evaluate") {
    const { question, skill } = await req.json();

    // Find the question in our bank to get expected points
    let expectedPoints = FALLBACK_QUESTIONS[0].expectedPoints;
    let difficulty = "medium";

    for (const [, questions] of Object.entries(QUESTION_BANK)) {
      const found = questions.find((q) => q.question === question);
      if (found) {
        expectedPoints = found.expectedPoints;
        difficulty = found.difficulty;
        break;
      }
    }

    const evaluation = evaluateAnswer(answer, question, expectedPoints, difficulty);

    return NextResponse.json(evaluation);
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

// ─── Answer Evaluator ───────────────────────────────────────────────────────
function evaluateAnswer(
  answer: string,
  question: string,
  expectedPoints: string[],
  difficulty: string
): {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  matchedPoints: string[];
  missedPoints: string[];
} {
  const lowerAnswer = answer.toLowerCase();
  const words = lowerAnswer.split(/\s+/).length;

  // Score based on multiple factors
  let score = 0;
  const matchedPoints: string[] = [];
  const missedPoints: string[] = [];

  // Check for expected concepts
  for (const point of expectedPoints) {
    const keywords = point.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
    const matched = keywords.some((kw) => lowerAnswer.includes(kw));
    if (matched) {
      matchedPoints.push(point);
      score += 25;
    } else {
      missedPoints.push(point);
    }
  }

  // Length bonus/penalty
  if (words < 15) {
    score = Math.max(1, score - 15); // Too brief
  } else if (words > 30) {
    score = Math.min(100, score + 5); // Detailed answer
  }

  // Technical keyword bonus
  const techPatterns = [
    /example/i,
    /because/i,
    /therefore/i,
    /however/i,
    /in contrast/i,
    /specifically/i,
    /for instance/i,
    /in my experience/i,
    /typically/i,
    /generally/i,
  ];

  const techBonus = techPatterns.filter((p) => p.test(answer)).length * 2;
  score = Math.min(100, score + techBonus);

  // Difficulty adjustment
  if (difficulty === "hard") {
    score = Math.round(score * 0.9); // Slightly harder scoring for hard questions
  }

  score = Math.max(1, Math.min(100, score));

  // Generate feedback
  const strengths: string[] = [];
  const improvements: string[] = [];

  if (matchedPoints.length > 0) {
    strengths.push(`Covered ${matchedPoints.length} key concept${matchedPoints.length > 1 ? "s" : ""}`);
  }
  if (words > 30) {
    strengths.push("Good detail and explanation");
  }
  if (techBonus >= 4) {
    strengths.push("Strong use of technical reasoning");
  }

  if (missedPoints.length > 0) {
    improvements.push(`Could address: ${missedPoints[0].substring(0, 60)}`);
  }
  if (words < 20) {
    improvements.push("Try providing more detail with examples");
  }
  if (score < 40) {
    improvements.push("Review the core concepts of this topic");
  }

  // Build feedback message
  let feedback: string;
  if (score >= 80) {
    feedback = "Excellent answer! You demonstrated strong understanding of the topic with clear, well-structured explanations.";
  } else if (score >= 60) {
    feedback = "Good answer! You covered the main points. Consider adding more specific examples or technical details.";
  } else if (score >= 40) {
    feedback = "Decent attempt. You touched on some concepts but missed key aspects. Review the topic and try to be more specific.";
  } else {
    feedback = "This answer needs improvement. Focus on understanding the fundamental concepts and practice explaining them with examples.";
  }

  return {
    score,
    feedback,
    strengths,
    improvements,
    matchedPoints,
    missedPoints,
  };
}
