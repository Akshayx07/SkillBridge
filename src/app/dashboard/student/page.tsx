import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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
  Trophy,
  Briefcase,
  Target,
  Users,
  ArrowRight,
  MapPin,
  Building2,
  GraduationCap,
  ExternalLink,
  Zap,
  GitBranch,
} from "lucide-react";
import Link from "next/link";

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions);

  const user = await prisma.user.findUnique({
    where: { id: session!.user.id },
    include: {
      profile: {
        include: {
          skills: {
            include: { skill: true },
            orderBy: { level: "desc" },
          },
        },
      },
      applications: {
        include: { job: true },
        orderBy: { createdAt: "desc" },
      },
      mentorships: {
        where: { status: "ACTIVE" },
        include: {
          mentor: { select: { name: true, profile: { select: { company: true } } } },
        },
      },
    },
  });

  const profile = user?.profile;
  const skills = profile?.skills || [];
  const applications = user?.applications || [];
  const activeMentorships = user?.mentorships || [];

  const stats = [
    {
      label: "Applications",
      value: applications.length,
      icon: Target,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Skills",
      value: skills.length,
      icon: Zap,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Active Jobs",
      value: applications.filter((a) => a.status === "PENDING" || a.status === "REVIEWING").length,
      icon: Briefcase,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Mentors",
      value: activeMentorships.length,
      icon: Users,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  // Application pipeline counts
  const pipeline = {
    pending: applications.filter((a) => a.status === "PENDING").length,
    reviewing: applications.filter((a) => a.status === "REVIEWING").length,
    accepted: applications.filter((a) => a.status === "ACCEPTED").length,
    rejected: applications.filter((a) => a.status === "REJECTED").length,
  };

  return (
    <div className="space-y-6">
      {/* Welcome + Profile Card */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Overview */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary mb-3">
                {user?.name?.charAt(0) || "?"}
              </div>
              <h2 className="text-xl font-bold">{user?.name}</h2>
              {profile?.headline && (
                <p className="text-sm text-muted-foreground mt-1">
                  {profile.headline}
                </p>
              )}
              <div className="flex flex-wrap items-center justify-center gap-3 mt-3 text-xs text-muted-foreground">
                {profile?.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {profile.location}
                  </span>
                )}
                {profile?.university && (
                  <span className="flex items-center gap-1">
                    <GraduationCap className="h-3 w-3" /> {profile.university}
                  </span>
                )}
                {profile?.company && (
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3 w-3" /> {profile.company}
                  </span>
                )}
              </div>

              {/* Social Links */}
              <div className="flex gap-2 mt-4">
                {profile?.githubUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer">
                      <GitBranch className="mr-1 h-3 w-3" /> GitHub
                    </a>
                  </Button>
                )}
                {profile?.linkedinUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-1 h-3 w-3" /> LinkedIn
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right side: Bio + Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <div className={`rounded-md p-1.5 ${stat.bg}`}>
                      <stat.icon className={`h-4 w-4 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-lg font-bold leading-tight">{stat.value}</p>
                      <p className="text-[11px] text-muted-foreground">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Bio */}
          {profile?.bio && (
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {profile.bio}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Link href="/dashboard/student/skill-gap">
              <Card className="hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer h-full">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="rounded-lg bg-purple-50 p-2">
                    <GitBranch className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">AI Skill Gap Analyzer</p>
                    <p className="text-xs text-muted-foreground">Compare skills vs job requirements</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/dashboard/student/interview">
              <Card className="hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer h-full">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="rounded-lg bg-blue-50 p-2">
                    <Zap className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">AI Mock Interview</p>
                    <p className="text-xs text-muted-foreground">Practice with AI-powered questions</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>

      {/* Skills + Application Pipeline */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Skills */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Your Skills</CardTitle>
              <CardDescription>
                {skills.length} skill{skills.length !== 1 ? "s" : ""} in your profile
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/student/skill-gap">
                Analyze Gaps <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {skills.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No skills added yet. Complete your profile to showcase your abilities.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {skills.map((s) => {
                  const levelLabel = ["", "Beginner", "Elementary", "Intermediate", "Advanced", "Expert"][s.level || 0];
                  const levelColor = (s.level || 0) >= 4
                    ? "bg-green-100 text-green-800"
                    : (s.level || 0) >= 3
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800";

                  return (
                    <div key={s.skillId} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-medium">
                          {s.skill.name}
                        </Badge>
                        {s.skill.category && (
                          <span className="text-[11px] text-muted-foreground">
                            {s.skill.category}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div
                              key={i}
                              className={`h-1.5 w-6 rounded-full ${
                                i <= (s.level || 0) ? "bg-primary" : "bg-muted"
                              }`}
                            />
                          ))}
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${levelColor}`}>
                          {levelLabel}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Application Pipeline */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Application Pipeline</CardTitle>
              <CardDescription>Status of your job applications</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/student/applications">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Pipeline bars */}
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { label: "Pending", value: pipeline.pending, color: "bg-yellow-400" },
                { label: "Reviewing", value: pipeline.reviewing, color: "bg-blue-400" },
                { label: "Accepted", value: pipeline.accepted, color: "bg-green-400" },
                { label: "Rejected", value: pipeline.rejected, color: "bg-red-400" },
              ].map((p) => (
                <div key={p.label} className="space-y-1">
                  <p className="text-2xl font-bold">{p.value}</p>
                  <p className="text-[11px] text-muted-foreground">{p.label}</p>
                  <div className="mx-auto h-1 w-full rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${p.color} transition-all`}
                      style={{
                        width: `${
                          applications.length > 0
                            ? (p.value / applications.length) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Recent applications */}
            <div className="space-y-2">
              {applications.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No applications yet.
                </p>
              ) : (
                applications.slice(0, 5).map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{app.job.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {app.job.company} ·{" "}
                        {app.createdAt.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <Badge
                      variant={
                        app.status === "ACCEPTED"
                          ? "success"
                          : app.status === "REJECTED"
                            ? "destructive"
                            : app.status === "REVIEWING"
                              ? "warning"
                              : "secondary"
                      }
                    >
                      {app.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Mentorships */}
      {activeMentorships.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Active Mentorships</CardTitle>
            <CardDescription>Your current mentor connections</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {activeMentorships.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-3 rounded-lg border p-3"
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                    {m.mentor.name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{m.mentor.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {m.mentor.profile?.company || "Mentor"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
