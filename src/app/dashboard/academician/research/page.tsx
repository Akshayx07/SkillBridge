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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  FlaskConical,
  Users,
  Plus,
  Loader2,
  Search,
  BookOpen,
  Lightbulb,
  FileText,
  GraduationCap,
  Target,
  X,
} from "lucide-react";
import Link from "next/link";

interface Collaboration {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  field: string | null;
  duration: string | null;
  budget: string | null;
  _count: { applications: number };
  skills: { skill: { name: string } }[];
}

export default function ResearchPage() {
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Form state
  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "CONSULTANCY",
    field: "",
    duration: "",
    budget: "",
  });

  useEffect(() => {
    fetch("/api/research")
      .then((r) => r.json())
      .then(setCollaborations)
      .catch(() => {
        // Demo data
        setCollaborations([
          {
            id: "1",
            title: "Cloud Architecture Consultancy for Smart Campus IoT",
            description: "Seeking consultancy on designing a scalable IoT architecture for campus-wide sensor networks. Need expertise in edge computing and real-time data pipelines.",
            type: "CONSULTANCY",
            status: "OPEN",
            field: "IoT / Edge Computing",
            duration: "3 months",
            budget: "$15,000",
            _count: { applications: 4 },
            skills: [{ skill: { name: "AWS" } }, { skill: { name: "Python" } }, { skill: { name: "Docker" } }],
          },
          {
            id: "2",
            title: "Student Capstone — NLP-based Research Paper Summarizer",
            description: "Guide a team of 4 senior CS students in building an NLP system that automatically summarizes academic research papers. Focus on transformer architectures and fine-tuning.",
            type: "STUDENT_PROJECT",
            status: "IN_PROGRESS",
            field: "NLP / Deep Learning",
            duration: "1 semester",
            budget: null,
            _count: { applications: 7 },
            skills: [{ skill: { name: "Python" } }, { skill: { name: "Machine Learning" } }],
          },
          {
            id: "3",
            title: "Joint Research — Federated Learning for Healthcare Data",
            description: "Collaborative research opportunity on privacy-preserving machine learning for medical data. Looking for faculty with experience in distributed ML systems.",
            type: "RESEARCH_JOINT",
            status: "OPEN",
            field: "Distributed ML / Healthcare",
            duration: "1 year",
            budget: "$50,000 (grant funded)",
            _count: { applications: 2 },
            skills: [{ skill: { name: "Python" } }, { skill: { name: "Machine Learning" } }, { skill: { name: "PostgreSQL" } }],
          },
          {
            id: "4",
            title: "PhD Thesis Guidance — Blockchain Consensus Algorithms",
            description: "Offering guidance for PhD students working on novel consensus mechanisms. Expertise in distributed systems, cryptography, and formal verification.",
            type: "THESIS_GUIDANCE",
            status: "OPEN",
            field: "Blockchain / Cryptography",
            duration: "Ongoing",
            budget: null,
            _count: { applications: 1 },
            skills: [{ skill: { name: "Rust" } }],
          },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const typeConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
    CONSULTANCY: { label: "Consultancy", icon: Lightbulb, color: "text-yellow-600" },
    STUDENT_PROJECT: { label: "Student Project", icon: GraduationCap, color: "text-blue-600" },
    RESEARCH_JOINT: { label: "Joint Research", icon: FlaskConical, color: "text-purple-600" },
    THESIS_GUIDANCE: { label: "Thesis Guidance", icon: BookOpen, color: "text-green-600" },
  };

  const statusVariant: Record<string, "default" | "success" | "warning" | "secondary" | "destructive"> = {
    OPEN: "success",
    IN_PROGRESS: "warning",
    COMPLETED: "secondary",
    CANCELLED: "destructive",
  };

  const filtered = collaborations.filter((c) => {
    if (filter !== "all" && c.type !== filter) return false;
    if (searchQuery && !c.title.toLowerCase().includes(searchQuery.toLowerCase()) && !(c.field || "").toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const newCollab = await res.json();
        setCollaborations((prev) => [newCollab, ...prev]);
        setShowForm(false);
        setForm({ title: "", description: "", type: "CONSULTANCY", field: "", duration: "", budget: "" });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/academician">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-purple-600" />
            Research Collaboration Hub
          </h1>
          <p className="text-muted-foreground">
            Publish consultancy requests, guide student projects, and initiate joint research.
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
          {showForm ? "Cancel" : "New Collaboration"}
        </Button>
      </div>

      {/* Create Form */}
      {showForm && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-lg">Publish New Collaboration</CardTitle>
            <CardDescription>Post a consultancy request, student project, or research opportunity</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <div className="flex gap-2">
                  {Object.entries(typeConfig).map(([key, cfg]) => (
                    <Button
                      key={key}
                      type="button"
                      variant={form.type === key ? "default" : "outline"}
                      size="sm"
                      onClick={() => setForm((f) => ({ ...f, type: key }))}
                    >
                      <cfg.icon className="mr-1 h-3 w-3" />
                      {cfg.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title *</label>
                  <Input
                    placeholder="e.g. Cloud Architecture Consultancy"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Field / Domain</label>
                  <Input
                    placeholder="e.g. IoT, NLP, Blockchain"
                    value={form.field}
                    onChange={(e) => setForm((f) => ({ ...f, field: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description *</label>
                <Textarea
                  placeholder="Describe the collaboration opportunity, requirements, and expected outcomes..."
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Duration</label>
                  <Input
                    placeholder="e.g. 3 months, 1 semester"
                    value={form.duration}
                    onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Budget / Funding</label>
                  <Input
                    placeholder="e.g. $15,000, Grant-funded"
                    value={form.budget}
                    onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Publish
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title or field..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { value: "all", label: "All" },
            { value: "CONSULTANCY", label: "Consultancy" },
            { value: "STUDENT_PROJECT", label: "Student Projects" },
            { value: "RESEARCH_JOINT", label: "Joint Research" },
            { value: "THESIS_GUIDANCE", label: "Thesis" },
          ].map((f) => (
            <Button
              key={f.value}
              variant={filter === f.value ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Collaboration Cards */}
      {loading && !showForm ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FlaskConical className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">
              No collaborations found. Create one to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((collab) => {
            const cfg = typeConfig[collab.type] || typeConfig.CONSULTANCY;
            const Icon = cfg.icon;
            return (
              <Card key={collab.id} className="hover:border-primary/30 transition-colors">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`rounded-md p-1.5 bg-muted`}>
                        <Icon className={`h-4 w-4 ${cfg.color}`} />
                      </div>
                      <div>
                        <Badge variant="outline" className="text-[10px] mb-1">
                          {cfg.label}
                        </Badge>
                        <h3 className="font-semibold text-sm leading-tight">{collab.title}</h3>
                      </div>
                    </div>
                    <Badge variant={statusVariant[collab.status] || "secondary"}>
                      {collab.status}
                    </Badge>
                  </div>

                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {collab.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {collab.field && (
                      <span className="flex items-center gap-1">
                        <Target className="h-3 w-3" /> {collab.field}
                      </span>
                    )}
                    {collab.duration && (
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" /> {collab.duration}
                      </span>
                    )}
                    {collab.budget && (
                      <Badge variant="secondary" className="text-[10px]">
                        {collab.budget}
                      </Badge>
                    )}
                  </div>

                  {collab.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {collab.skills.map((s, i) => (
                        <Badge key={i} variant="outline" className="text-[10px] px-1.5 py-0">
                          {s.skill.name}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      {collab._count.applications} applicant{collab._count.applications !== 1 ? "s" : ""}
                    </span>
                    <Button size="sm" variant="outline">
                      View & Manage
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
