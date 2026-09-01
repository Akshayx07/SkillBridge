"use client";

import { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Zap,
  Send,
  ArrowLeft,
  Loader2,
  Bot,
  User,
  Trophy,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

interface Question {
  index: number;
  question: string;
  difficulty: string;
  skill: string;
}

interface Evaluation {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  matchedPoints: string[];
  missedPoints: string[];
}

interface ChatMessage {
  role: "assistant" | "user";
  content: string;
  evaluation?: Evaluation;
  questionIndex?: number;
}

type Phase = "intro" | "interview" | "results";

export default function InterviewPage() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [scores, setScores] = useState<number[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function startInterview() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start" }),
      });

      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions);
        setCurrentQuestionIndex(0);
        setPhase("interview");
        setMessages([
          {
            role: "assistant",
            content: `Welcome to your AI Mock Interview! 🎤\n\nI've prepared 3 technical questions based on your profile skills. Take your time to think before answering.\n\n**Question 1 of 3**\n${data.questions[0].question}`,
            questionIndex: 0,
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  }

  async function submitAnswer() {
    if (!input.trim() || loading) return;

    const answer = input.trim();
    const currentQuestion = questions[currentQuestionIndex];

    // Add user message
    const userMsg: ChatMessage = { role: "user", content: answer };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "evaluate",
          answer,
          questionIndex: currentQuestionIndex,
          question: currentQuestion.question,
          skill: currentQuestion.skill,
        }),
      });

      if (res.ok) {
        const evaluation: Evaluation = await res.json();
        setScores((prev) => [...prev, evaluation.score]);

        const isLastQuestion = currentQuestionIndex >= questions.length - 1;

        // Build feedback message
        let feedbackContent = `**Score: ${evaluation.score}/100**\n\n`;
        feedbackContent += `${evaluation.feedback}\n\n`;

        if (evaluation.strengths.length > 0) {
          feedbackContent += `✅ **Strengths:**\n`;
          evaluation.strengths.forEach((s) => {
            feedbackContent += `  • ${s}\n`;
          });
        }

        if (evaluation.improvements.length > 0) {
          feedbackContent += `\n💡 **Areas to improve:**\n`;
          evaluation.improvements.forEach((s) => {
            feedbackContent += `  • ${s}\n`;
          });
        }

        if (!isLastQuestion) {
          const nextQ = questions[currentQuestionIndex + 1];
          feedbackContent += `\n---\n\n**Question ${currentQuestionIndex + 2} of 3**\n${nextQ.question}`;
        }

        const assistantMsg: ChatMessage = {
          role: "assistant",
          content: feedbackContent,
          evaluation,
          questionIndex: currentQuestionIndex,
        };

        setMessages((prev) => [...prev, assistantMsg]);

        if (isLastQuestion) {
          setTimeout(() => setPhase("results"), 1500);
        } else {
          setCurrentQuestionIndex((prev) => prev + 1);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitAnswer();
    }
  }

  const averageScore =
    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

  // ─── Intro Phase ─────────────────────────────────────────────────────────
  if (phase === "intro") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/student">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Zap className="h-6 w-6 text-blue-600" />
              AI Mock Interview
            </h1>
            <p className="text-muted-foreground">
              Practice technical interviews with AI-generated questions based on your skills.
            </p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardContent className="p-8 text-center space-y-6">
              <div className="mx-auto h-16 w-16 rounded-2xl bg-blue-50 flex items-center justify-center">
                <Bot className="h-8 w-8 text-blue-600" />
              </div>

              <div>
                <h2 className="text-xl font-bold">How It Works</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  The AI interviewer will ask you 3 technical questions tailored to your profile.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 text-left">
                <div className="rounded-lg border p-3 space-y-1">
                  <Target className="h-4 w-4 text-blue-600" />
                  <p className="text-xs font-medium">Personalized</p>
                  <p className="text-[11px] text-muted-foreground">
                    Questions based on your actual skills
                  </p>
                </div>
                <div className="rounded-lg border p-3 space-y-1">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <p className="text-xs font-medium">Scored</p>
                  <p className="text-[11px] text-muted-foreground">
                    Get a 1-100 readiness score
                  </p>
                </div>
                <div className="rounded-lg border p-3 space-y-1">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  <p className="text-xs font-medium">Feedback</p>
                  <p className="text-[11px] text-muted-foreground">
                    Detailed strengths & improvements
                  </p>
                </div>
              </div>

              <Button onClick={startInterview} size="lg" disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Zap className="mr-2 h-4 w-4" />
                )}
                Start Interview
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ─── Results Phase ───────────────────────────────────────────────────────
  if (phase === "results") {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/student">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Trophy className="h-6 w-6 text-yellow-600" />
              Interview Results
            </h1>
          </div>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Overall Score */}
          <Card className="border-primary/20">
            <CardContent className="p-8">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative h-32 w-32">
                  <svg className="h-32 w-32 -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50" cy="50" r="42"
                      fill="none" stroke="currentColor" strokeWidth="8"
                      className="text-muted"
                    />
                    <circle
                      cx="50" cy="50" r="42"
                      fill="none" stroke="currentColor" strokeWidth="8"
                      strokeDasharray={`${(averageScore / 100) * 264} 264`}
                      strokeLinecap="round"
                      className={
                        averageScore >= 80 ? "text-green-500" :
                        averageScore >= 60 ? "text-yellow-500" : "text-red-500"
                      }
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold">{averageScore}</span>
                    <span className="text-xs text-muted-foreground">/ 100</span>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-bold">
                    {averageScore >= 80
                      ? "Excellent Performance! 🎉"
                      : averageScore >= 60
                        ? "Good Job! Keep Practicing 💪"
                        : "Room for Improvement 📚"}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    You answered {questions.length} questions across your skill areas.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Per-question breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Question Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {scores.map((score, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-8 text-center">
                    <span className="text-sm font-medium text-muted-foreground">
                      Q{i + 1}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium truncate max-w-[80%]">
                        {questions[i]?.skill}
                      </span>
                      <span className="text-xs font-bold">{score}/100</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full transition-all ${
                          score >= 80 ? "bg-green-500" :
                          score >= 60 ? "bg-yellow-500" : "bg-red-500"
                        }`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Strengths & Improvements Summary */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-1.5 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {messages
                    .filter((m) => m.evaluation)
                    .flatMap((m) => m.evaluation!.strengths)
                    .filter((v, i, a) => a.indexOf(v) === i)
                    .slice(0, 5)
                    .map((s, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <span className="text-green-500 mt-0.5">✓</span> {s}
                      </li>
                    ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-1.5 text-orange-600">
                  <XCircle className="h-4 w-4" />
                  To Improve
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {messages
                    .filter((m) => m.evaluation)
                    .flatMap((m) => m.evaluation!.improvements)
                    .filter((v, i, a) => a.indexOf(v) === i)
                    .slice(0, 5)
                    .map((s, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <span className="text-orange-500 mt-0.5">→</span> {s}
                      </li>
                    ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={() => { setPhase("intro"); setMessages([]); setScores([]); setCurrentQuestionIndex(0); setQuestions([]); }}>
              <RotateCcw className="mr-2 h-4 w-4" /> Try Again
            </Button>
            <Button asChild>
              <Link href="/dashboard/student/skill-gap">
                <TrendingUp className="mr-2 h-4 w-4" /> Analyze Skill Gaps
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Interview Phase (Chat) ──────────────────────────────────────────────
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/student">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              Mock Interview
            </h1>
            <p className="text-xs text-muted-foreground">
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {questions[currentQuestionIndex]?.difficulty}
          </Badge>
          <Badge variant="secondary">
            {questions[currentQuestionIndex]?.skill}
          </Badge>
        </div>
      </div>

      {/* Progress bar */}
      <div className="py-2">
        <div className="h-1.5 w-full rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{
              width: `${((currentQuestionIndex) / questions.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto space-y-4 py-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.role === "assistant" && (
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Bot className="h-4 w-4 text-primary" />
              </div>
            )}

            <div
              className={`max-w-[75%] rounded-xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              <div className="text-sm whitespace-pre-wrap leading-relaxed">
                {msg.content.split("**").map((part, j) =>
                  j % 2 === 1 ? (
                    <strong key={j}>{part}</strong>
                  ) : (
                    <span key={j}>{part}</span>
                  )
                )}
              </div>

              {msg.evaluation && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`text-lg font-bold ${
                        msg.evaluation.score >= 80
                          ? "text-green-600"
                          : msg.evaluation.score >= 60
                            ? "text-yellow-600"
                            : "text-red-600"
                      }`}
                    >
                      {msg.evaluation.score}
                    </span>
                    <span className="text-xs text-muted-foreground">/ 100</span>
                  </div>
                </div>
              )}
            </div>

            {msg.role === "user" && (
              <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div className="bg-muted rounded-xl px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      {currentQuestionIndex < questions.length && (
        <div className="border-t pt-4">
          <div className="flex gap-2">
            <Textarea
              ref={textareaRef}
              placeholder="Type your answer... (Shift+Enter for new line)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              rows={3}
              className="resize-none"
            />
            <Button
              onClick={submitAnswer}
              disabled={!input.trim() || loading}
              size="icon"
              className="h-auto"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1.5">
            Press Enter to submit · Shift+Enter for new line
          </p>
        </div>
      )}
    </div>
  );
}
