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
  Building2,
  Calendar,
  MapPin,
  Users,
  Plus,
  Loader2,
  Briefcase,
  GraduationCap,
  Search,
} from "lucide-react";
import Link from "next/link";

interface Immersion {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  company: string;
  location: string | null;
  isRemote: boolean;
  duration: string | null;
  stipend: string | null;
  startDate: string | null;
  endDate: string | null;
  maxSeats: number | null;
  _count: { applications: number };
  skills: { skill: { name: string } }[];
}

export default function ImmersionsPage() {
  const [immersions, setImmersions] = useState<Immersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/immersions")
      .then((r) => r.json())
      .then(setImmersions)
      .catch(() => {
        // Demo data for preview
        setImmersions([
          {
            id: "1",
            title: "Summer Research Internship — Cloud Infrastructure",
            description: "Join our cloud infrastructure team for a 10-week summer research internship. Work on real-world distributed systems projects.",
            type: "INDUSTRY_IMMERSION",
            status: "OPEN",
            company: "Amazon Web Services",
            location: "Seattle, WA",
            isRemote: false,
            duration: "10 weeks",
            stipend: "$6,000",
            startDate: "2026-06-01T00:00:00Z",
            endDate: "2026-08-10T00:00:00Z",
            maxSeats: 5,
            _count: { applications: 12 },
            skills: [{ skill: { name: "Docker" } }, { skill: { name: "AWS" } }, { skill: { name: "Python" } }],
          },
          {
            id: "2",
            title: "Faculty Development Program — AI/ML in Healthcare",
            description: "A 2-week intensive FDP for faculty members to learn about AI applications in healthcare diagnostics and drug discovery.",
            type: "FACULTY_DEVELOPMENT",
            status: "OPEN",
            company: "Google Research",
            location: "Virtual",
            isRemote: true,
            duration: "2 weeks",
            stipend: null,
            startDate: "2026-07-15T00:00:00Z",
            endDate: "2026-07-28T00:00:00Z",
            maxSeats: 30,
            _count: { applications: 8 },
            skills: [{ skill: { name: "Machine Learning" } }, { skill: { name: "Python" } }],
          },
          {
            id: "3",
            title: "Industry Immersion — FinTech Product Development",
            description: "Spend 6 weeks embedded in a product team at a leading FinTech startup. Learn product engineering, API design, and regulatory compliance.",
            type: "INDUSTRY_IMMERSION",
            status: "IN_PROGRESS",
            company: "Razorpay",
            location: "Bangalore, India",
            isRemote: false,
            duration: "6 weeks",
            stipend: "₹50,000",
            startDate: "2026-05-01T00:00:00Z",
            endDate: "2026-06-12T00:00:00Z",
            maxSeats: 8,
            _count: { applications: 22 },
            skills: [{ skill: { name: "TypeScript" } }, { skill: { name: "Node.js" } }],
          },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const typeLabels: Record<string, string> = {
    INDUSTRY_IMMERSION: "Industry Immersion",
    FACULTY_DEVELOPMENT: "FDP",
    SUMMER_INTERNSHIP: "Summer Internship",
  };

  const statusVariant: Record<string, "default" | "success" | "warning" | "secondary"> = {
    OPEN: "success",
    IN_PROGRESS: "warning",
    CLOSED: "secondary",
    COMPLETED: "secondary",
  };

  const filteredImmersions = immersions.filter((imm) => {
    if (filter !== "all" && imm.type !== filter) return false;
    if (searchQuery && !imm.title.toLowerCase().includes(searchQuery.toLowerCase()) && !imm.company.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

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
            <Building2 className="h-6 w-6 text-blue-600" />
            Industry Immersion & FDP Board
          </h1>
          <p className="text-muted-foreground">
            Browse industry programs and faculty development opportunities.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex gap-2">
          {[
            { value: "all", label: "All" },
            { value: "INDUSTRY_IMMERSION", label: "Immersion" },
            { value: "FACULTY_DEVELOPMENT", label: "FDP" },
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

      {/* Immersion Cards */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filteredImmersions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">
              No programs found matching your criteria.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredImmersions.map((imm) => (
            <Card key={imm.id} className="hover:border-primary/30 transition-colors">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-[10px]">
                        {typeLabels[imm.type] || imm.type}
                      </Badge>
                      <Badge variant={statusVariant[imm.status] || "secondary"}>
                        {imm.status}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-sm leading-tight">{imm.title}</h3>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2">
                  {imm.description}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" /> {imm.company}
                  </span>
                  {imm.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {imm.location}
                    </span>
                  )}
                  {imm.duration && (
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {imm.duration}
                    </span>
                  )}
                  {imm.stipend && (
                    <Badge variant="secondary" className="text-[10px]">
                      {imm.stipend}
                    </Badge>
                  )}
                </div>

                {/* Skills */}
                {imm.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {imm.skills.map((s, i) => (
                      <Badge key={i} variant="outline" className="text-[10px] px-1.5 py-0">
                        {s.skill.name}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-1 border-t">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    {imm._count.applications} applicant{imm._count.applications !== 1 ? "s" : ""}
                    {imm.maxSeats && ` / ${imm.maxSeats} seats`}
                  </span>
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
