"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, X, Loader2 } from "lucide-react";
import Link from "next/link";

interface Skill {
  id: string;
  name: string;
  category: string | null;
}

export default function NewJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([]);
  const [skillSearch, setSkillSearch] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    company: "",
    location: "",
    isRemote: false,
    salary: "",
    jobType: "FULL_TIME",
  });

  useEffect(() => {
    fetch("/api/skills")
      .then((r) => r.json())
      .then(setAllSkills)
      .catch(() => {
        // fallback skills
        setAllSkills([
          { id: "1", name: "TypeScript", category: "Language" },
          { id: "2", name: "React", category: "Frontend" },
          { id: "3", name: "Next.js", category: "Framework" },
          { id: "4", name: "Node.js", category: "Backend" },
          { id: "5", name: "Python", category: "Language" },
          { id: "6", name: "PostgreSQL", category: "Database" },
          { id: "7", name: "Docker", category: "DevOps" },
          { id: "8", name: "AWS", category: "Cloud" },
          { id: "9", name: "Machine Learning", category: "AI" },
          { id: "10", name: "GraphQL", category: "API" },
          { id: "11", name: "Rust", category: "Language" },
          { id: "12", name: "UI/UX Design", category: "Design" },
        ]);
      });
  }, []);

  const filteredSkills = allSkills.filter(
    (s) =>
      s.name.toLowerCase().includes(skillSearch.toLowerCase()) &&
      !selectedSkills.some((sel) => sel.id === s.id)
  );

  function addSkill(skill: Skill) {
    setSelectedSkills((prev) => [...prev, skill]);
    setSkillSearch("");
  }

  function removeSkill(skillId: string) {
    setSelectedSkills((prev) => prev.filter((s) => s.id !== skillId));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          skillIds: selectedSkills.map((s) => s.id),
        }),
      });

      if (res.ok) {
        const job = await res.json();
        router.push(`/dashboard/industry/jobs/${job.id}`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/industry">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Post a New Job</h1>
          <p className="text-muted-foreground">
            Create a job, internship, or FDP posting
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="p-6 space-y-5">
            {/* Job Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Job Type</label>
              <div className="flex gap-2">
                {[
                  { value: "FULL_TIME", label: "Full-Time" },
                  { value: "PART_TIME", label: "Part-Time" },
                  { value: "INTERNSHIP", label: "Internship" },
                  { value: "FDP", label: "FDP" },
                ].map((t) => (
                  <Button
                    key={t.value}
                    type="button"
                    variant={form.jobType === t.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setForm((f) => ({ ...f, jobType: t.value }))}
                  >
                    {t.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Job Title *</label>
              <Input
                placeholder="e.g. Junior Full-Stack Engineer"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
            </div>

            {/* Company */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Company *</label>
              <Input
                placeholder="e.g. Stripe"
                value={form.company}
                onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Description *</label>
              <Textarea
                placeholder="Describe the role, responsibilities, and what you're looking for..."
                rows={5}
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                required
              />
            </div>

            {/* Location + Remote */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Input
                  placeholder="e.g. San Francisco, CA"
                  value={form.location}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, location: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Salary / Stipend</label>
                <Input
                  placeholder="e.g. $110k-$140k"
                  value={form.salary}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, salary: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remote"
                checked={form.isRemote}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isRemote: e.target.checked }))
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="remote" className="text-sm font-medium">
                Remote-friendly
              </label>
            </div>

            {/* Required Skills */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Required Skills</label>
              <div className="relative">
                <Input
                  placeholder="Search and add skills..."
                  value={skillSearch}
                  onChange={(e) => setSkillSearch(e.target.value)}
                />
                {skillSearch && filteredSkills.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md max-h-48 overflow-y-auto">
                    {filteredSkills.slice(0, 8).map((skill) => (
                      <button
                        key={skill.id}
                        type="button"
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-accent text-left"
                        onClick={() => addSkill(skill)}
                      >
                        <Plus className="h-3 w-3" />
                        {skill.name}
                        {skill.category && (
                          <span className="text-xs text-muted-foreground ml-auto">
                            {skill.category}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {selectedSkills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {selectedSkills.map((skill) => (
                    <Badge
                      key={skill.id}
                      variant="secondary"
                      className="gap-1 cursor-pointer hover:bg-destructive/10"
                      onClick={() => removeSkill(skill.id)}
                    >
                      {skill.name}
                      <X className="h-3 w-3" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/industry">Cancel</Link>
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Publish Job
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
