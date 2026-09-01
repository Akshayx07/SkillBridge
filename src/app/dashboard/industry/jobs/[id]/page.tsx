"use client";

import { useState, useEffect, use } from "react";
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
  ArrowLeft,
  Loader2,
  Users,
  TrendingUp,
  MapPin,
  DollarSign,
  Briefcase,
  CheckCircle2,
  XCircle,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

interface Candidate {
  applicationId: string;
  userId: string;
  name: string | null;
  email: string | null;
  headline: string | null;
  university: string | null;
  compatibility: number;
  tier: string;
  matchedSkills: string[];
  missingSkills: string[];
  skillMatchPercent: number;
  profileScore: number;
  status: string;
  appliedAt: string;
}

interface JobDetail {
  id: string;
  title: string;
  company: string;
  location: string | null;
  isRemote: boolean;
  salary: string | null;
  jobType: string | null;
  description: string;
  skills: { skill: { name: string; category: string | null } }[];
}

export default function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [job, setJob] = useState<JobDetail | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [scoring, setScoring] = useState(false);

  useEffect(() => {
    async function load() {
      // Fetch job details
      const jobRes = await fetch(`/api/jobs/${id}`);
      if (jobRes.ok) {
        const jobData = await jobRes.json();
        setJob(jobData);
      }

      // Fetch compatibility scores
      setScoring(true);
      const compRes = await fetch("/api/ai/compatibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId: id }),
      });
      if (compRes.ok) {
        const data = await compRes.json();
        setCandidates(data.candidates);
        setRequiredSkills(data.requiredSkills);
      }
      setScoring(false);
      setLoading(false);
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Job not found.
      </div>
    );
  }

  const tierConfig: Record<string, { label: string; color: string; variant: "default" | "success" | "warning" | "destructive" | "secondary" }> = {
    STRONG_MATCH: { label: "Strong Match", color: "text-green-600", variant: "success" },
    GOOD_MATCH: { label: "Good Match", color: "text-blue-600", variant: "default" },
    PARTIAL_MATCH: { label: "Partial", color: "text-yellow-600", variant: "warning" },
    WEAK_MATCH: { label: "Weak", color: "text-red-600", variant: "destructive" },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/industry">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{job.title}</h1>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
            <span className="flex items-center gap-1">
              <Briefcase className="h-3.5 w-3.5" /> {job.company}
            </span>
            {job.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {job.location}
              </span>
            )}
            {job.isRemote && <Badge variant="outline" className="text-xs">Remote</Badge>}
            {job.salary && (
              <span className="flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5" /> {job.salary}
              </span>
            )}
            {job.jobType && <Badge variant="secondary" className="text-xs">{job.jobType}</Badge>}
          </div>
        </div>
      </div>

      {/* Required Skills */}
      {job.skills.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">Required Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {job.skills.map((s, i) => (
                <Badge key={i} variant="outline">{s.skill.name}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Candidate Shortlisting Engine */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                Candidate Shortlisting Engine
              </CardTitle>
              <CardDescription>
                AI-powered compatibility scoring for {candidates.length} applicant{candidates.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
            {scoring && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Scoring...
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {candidates.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">
                No applications received yet.
              </p>
            </div>
          ) : (
            candidates.map((c, i) => {
              const tier = tierConfig[c.tier] || tierConfig.WEAK_MATCH;
              return (
                <div
                  key={c.applicationId}
                  className="rounded-lg border p-4 space-y-3 hover:bg-muted/30 transition-colors"
                >
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                        {c.name?.charAt(0) || "?"}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{c.name}</p>
                          {i < 3 && (
                            <Badge variant="outline" className="text-[10px] px-1 py-0 text-yellow-600 border-yellow-300">
                              Top {i + 1}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {c.headline || c.email}
                          {c.university && ` · ${c.university}`}
                        </p>
                      </div>
                    </div>

                    {/* Compatibility score */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${tier.color}`}>
                          {c.compatibility}
                        </div>
                        <p className="text-[10px] text-muted-foreground">/ 100</p>
                      </div>
                      <Badge variant={tier.variant} className="text-xs">
                        {tier.label}
                      </Badge>
                    </div>
                  </div>

                  {/* Score breakdown bar */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Skill Match</span>
                        <span className="font-medium">{c.skillMatchPercent}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${c.skillMatchPercent}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Profile</span>
                        <span className="font-medium">{c.profileScore}/15</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-green-500 transition-all"
                          style={{ width: `${(c.profileScore / 15) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Skills breakdown */}
                  <div className="flex flex-wrap gap-3 text-xs">
                    {c.matchedSkills.length > 0 && (
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                        <span className="text-muted-foreground">Matched:</span>
                        {c.matchedSkills.map((s) => (
                          <Badge key={s} variant="secondary" className="text-[10px] px-1 py-0">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {c.missingSkills.length > 0 && (
                      <div className="flex items-center gap-1">
                        <XCircle className="h-3 w-3 text-red-400" />
                        <span className="text-muted-foreground">Missing:</span>
                        {c.missingSkills.map((s) => (
                          <Badge key={s} variant="outline" className="text-[10px] px-1 py-0 text-red-500">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-muted-foreground">
                      Applied {new Date(c.appliedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                    <Badge
                      variant={
                        c.status === "ACCEPTED" ? "success" :
                        c.status === "REJECTED" ? "destructive" :
                        c.status === "REVIEWING" ? "warning" : "secondary"
                      }
                    >
                      {c.status}
                    </Badge>
                  </div>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
