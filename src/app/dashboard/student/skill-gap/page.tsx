"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GitBranch,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  BookOpen,
  Loader2,
  ArrowLeft,
  BarChart3,
} from "lucide-react";
import Link from "next/link";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string | null;
  skills: { skill: { name: string; category: string | null } }[];
}

interface GapAnalysis {
  job: { id: string; title: string; company: string };
  matchScore: number;
  matched: { name: string; category: string | null; studentLevel: number }[];
  gaps: { name: string; category: string | null; recommendedResources: string[] }[];
  extras: { name: string; category: string | null; level: number }[];
  insights: string[];
}

export default function SkillGapPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [analysis, setAnalysis] = useState<GapAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const res = await fetch("/api/jobs");
        if (res.ok) {
          const data = await res.json();
          setJobs(data);
        }
      } catch {
        // Fallback: hardcoded jobs for demo
        setJobs([
          {
            id: "demo-1",
            title: "Junior Full-Stack Engineer",
            company: "Stripe",
            location: "Seattle, WA",
            skills: [
              { skill: { name: "TypeScript", category: "Language" } },
              { skill: { name: "React", category: "Frontend" } },
              { skill: { name: "Node.js", category: "Backend" } },
              { skill: { name: "PostgreSQL", category: "Database" } },
            ],
          },
          {
            id: "demo-2",
            title: "ML Engineer",
            company: "Google",
            location: "Mountain View, CA",
            skills: [
              { skill: { name: "Python", category: "Language" } },
              { skill: { name: "Machine Learning", category: "AI" } },
              { skill: { name: "Docker", category: "DevOps" } },
              { skill: { name: "AWS", category: "Cloud" } },
            ],
          },
        ]);
      } finally {
        setLoadingJobs(false);
      }
    }
    fetchJobs();
  }, []);

  async function analyze() {
    if (!selectedJobId) return;
    setLoading(true);
    try {
      const res = await fetch("/api/ai/skill-gap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: selectedJobId }),
      });
      if (res.ok) {
        const data = await res.json();
        setAnalysis(data);
      }
    } finally {
      setLoading(false);
    }
  }

  const selectedJob = jobs.find((j) => j.id === selectedJobId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/student">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <GitBranch className="h-6 w-6 text-purple-600" />
            AI Skill Gap Analyzer
          </h1>
          <p className="text-muted-foreground">
            Compare your skills against job requirements and get personalized recommendations.
          </p>
        </div>
      </div>

      {/* Job Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Target Job</CardTitle>
          <CardDescription>
            Choose a job role to analyze your skill alignment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="text-sm font-medium mb-1.5 block">Job Position</label>
              <Select
                value={selectedJobId}
                onValueChange={setSelectedJobId}
                disabled={loadingJobs}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={loadingJobs ? "Loading jobs..." : "Select a job..."}
                  />
                </SelectTrigger>
                <SelectContent>
                  {jobs.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title} — {job.company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={analyze} disabled={!selectedJobId || loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Analyze
            </Button>
          </div>

          {/* Show required skills for selected job */}
          {selectedJob && (
            <div className="rounded-lg bg-muted/50 p-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Required Skills
              </p>
              <div className="flex flex-wrap gap-1.5">
                {selectedJob.skills.map((s, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {s.skill.name}
                    {s.skill.category && (
                      <span className="ml-1 text-muted-foreground">
                        ({s.skill.category})
                      </span>
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Match Score */}
          <Card className="border-primary/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                {/* Circular score */}
                <div className="relative h-28 w-28 flex-shrink-0">
                  <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-muted"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeDasharray={`${(analysis.matchScore / 100) * 264} 264`}
                      strokeLinecap="round"
                      className={
                        analysis.matchScore >= 80
                          ? "text-green-500"
                          : analysis.matchScore >= 50
                            ? "text-yellow-500"
                            : "text-red-500"
                      }
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold">{analysis.matchScore}%</span>
                    <span className="text-[10px] text-muted-foreground">Match</span>
                  </div>
                </div>

                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold">
                    {analysis.job.title} @ {analysis.job.company}
                  </h3>
                  {analysis.insights.map((insight, i) => (
                    <p key={i} className="text-sm text-muted-foreground">
                      {insight}
                    </p>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Three-column breakdown */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Matched Skills */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-1.5 text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  Matched ({analysis.matched.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {analysis.matched.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-2">
                    No matched skills yet
                  </p>
                ) : (
                  analysis.matched.map((s, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-md border border-green-200 bg-green-50 p-2"
                    >
                      <span className="text-xs font-medium">{s.name}</span>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className={`h-1 w-3 rounded-full ${
                              i <= s.studentLevel ? "bg-green-500" : "bg-green-200"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Skill Gaps */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-1.5 text-red-600">
                  <XCircle className="h-4 w-4" />
                  Gaps ({analysis.gaps.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analysis.gaps.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-2">
                    🎉 No skill gaps — you&apos;re fully qualified!
                  </p>
                ) : (
                  analysis.gaps.map((s, i) => (
                    <div
                      key={i}
                      className="rounded-md border border-red-200 bg-red-50 p-2 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">{s.name}</span>
                        {s.category && (
                          <Badge variant="outline" className="text-[10px] px-1">
                            {s.category}
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-0.5">
                        {s.recommendedResources.slice(0, 2).map((r, j) => (
                          <p key={j} className="text-[11px] text-muted-foreground flex items-start gap-1">
                            <BookOpen className="h-3 w-3 mt-0.5 flex-shrink-0" />
                            {r}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Bonus Skills */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-1.5 text-blue-600">
                  <AlertCircle className="h-4 w-4" />
                  Bonus Skills ({analysis.extras.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {analysis.extras.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-2">
                    No extra skills beyond requirements
                  </p>
                ) : (
                  analysis.extras.map((s, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-md border border-blue-200 bg-blue-50 p-2"
                    >
                      <span className="text-xs font-medium">{s.name}</span>
                      <span className="text-[10px] text-muted-foreground">
                        Lvl {s.level}/5
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Visual Comparison */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4" />
                Skill Comparison
              </CardTitle>
              <CardDescription>
                Your skill levels vs. required levels for this position
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.matched.map((s, i) => (
                  <div key={`matched-${i}`} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">{s.name}</span>
                      <span className="text-green-600">
                        {s.studentLevel}/5 ✓
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-green-500 transition-all"
                        style={{ width: `${(s.studentLevel / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
                {analysis.gaps.map((s, i) => (
                  <div key={`gap-${i}`} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">{s.name}</span>
                      <span className="text-red-600">Not acquired ✗</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div className="h-2 w-0 rounded-full bg-red-400" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">Ready to practice?</p>
                  <p className="text-xs text-muted-foreground">
                    Take an AI mock interview tailored to this role.
                  </p>
                </div>
              </div>
              <Button asChild>
                <Link href="/dashboard/student/interview">
                  Start Interview
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
