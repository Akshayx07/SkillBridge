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
  Users,
  Trophy,
  Briefcase,
  Target,
  ArrowRight,
  Shield,
  TrendingUp,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart3,
  Award,
} from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  const [
    totalUsers,
    totalHackathons,
    totalJobs,
    totalApplications,
    usersByRole,
    recentUsers,
    recentApplications,
    acceptedApps,
    pendingCredentials,
    verifiedCredentials,
    immersions,
    researchCollabs,
    topMissingSkills,
    industryPartners,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.hackathon.count(),
    prisma.job.count(),
    prisma.application.count(),
    prisma.user.groupBy({ by: ["role"], _count: true }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    }),
    prisma.application.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        user: { select: { name: true } },
        job: { select: { title: true, company: true } },
      },
    }),
    // Hiring rate: accepted applications
    prisma.application.count({ where: { status: "ACCEPTED" } }),
    // Credential verification
    prisma.credentialVerification.count({ where: { status: "PENDING" } }),
    prisma.credentialVerification.count({ where: { status: "VERIFIED" } }),
    // Industry partnerships
    prisma.industryImmersion.findMany({
      select: {
        id: true,
        title: true,
        company: true,
        type: true,
        status: true,
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.researchCollaboration.findMany({
      select: {
        id: true,
        title: true,
        type: true,
        status: true,
        field: true,
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    // Top skills required by jobs but not in student profiles
    prisma.$queryRaw<
      { name: string; required_count: bigint }[]
    >`
      SELECT s.name, COUNT(DISTINCT sj."jobId") as required_count
      FROM "SkillOnJob" sj
      JOIN "Skill" s ON s.id = sj."skillId"
      LEFT JOIN "SkillOnProfile" sp ON sp."skillId" = s.id
      LEFT JOIN "profiles" p ON p.id = sp."profileId"
      LEFT JOIN "users" u ON u.id = p."userId" AND u.role = 'STUDENT'
      WHERE u.id IS NOT NULL
      GROUP BY s.name
      HAVING COUNT(DISTINCT sj."jobId") > 0
      ORDER BY required_count DESC
      LIMIT 8
    `,
    // Industry partners (companies that posted jobs or immersions)
    prisma.job.findMany({
      select: { company: true },
      distinct: ["company"],
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const hiringRate =
    totalApplications > 0
      ? Math.round((acceptedApps / totalApplications) * 100)
      : 0;

  const stats = [
    {
      label: "Total Users",
      value: totalUsers,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Hackathons",
      value: totalHackathons,
      icon: Trophy,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Job Postings",
      value: totalJobs,
      icon: Briefcase,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Applications",
      value: totalApplications,
      icon: Target,
      color: "text-orange-600",
      bg: "bg-orange-50",
    },
  ];

  const roleColors: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
    STUDENT: "default",
    INDUSTRY: "success",
    ACADEMICIAN: "warning",
    ADMIN: "destructive",
  };

  const immersionTypeLabels: Record<string, string> = {
    INDUSTRY_IMMERSION: "Immersion",
    FACULTY_DEVELOPMENT: "FDP",
    SUMMER_INTERNSHIP: "Internship",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Platform overview, analytics, and management controls.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/admin/analytics">
              <BarChart3 className="mr-2 h-4 w-4" /> Analytics
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/admin/credentials">
              <Award className="mr-2 h-4 w-4" /> Credentials
              {pendingCredentials > 0 && (
                <Badge variant="destructive" className="ml-2 text-[10px]">
                  {pendingCredentials}
                </Badge>
              )}
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`rounded-lg p-2 ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Cards Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Hiring Rate */}
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700">{hiringRate}%</p>
                <p className="text-xs text-green-600">Hiring Rate</p>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              {acceptedApps} of {totalApplications} applications accepted
            </p>
          </CardContent>
        </Card>

        {/* Pending Verifications */}
        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-yellow-100 p-2">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-700">{pendingCredentials}</p>
                <p className="text-xs text-yellow-600">Pending Verifications</p>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              {verifiedCredentials} credentials already verified
            </p>
          </CardContent>
        </Card>

        {/* Industry Partners */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-700">{industryPartners.length}</p>
                <p className="text-xs text-blue-600">Industry Partners</p>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground mt-2">
              Companies with active job or immersion postings
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Role Breakdown */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Users by Role</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {usersByRole.map((r) => (
              <div key={r.role} className="rounded-lg border p-3 text-center">
                <p className="text-2xl font-bold">{r._count}</p>
                <Badge variant={roleColors[r.role] || "secondary"} className="mt-1">
                  {r.role}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Skills in Demand (from job postings) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Top Skills in Demand</CardTitle>
              <CardDescription>Most requested skills across job postings</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {topMissingSkills.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No job skills data yet</p>
            ) : (
              topMissingSkills.map((s, i) => {
                const maxCount = Number(topMissingSkills[0]?.required_count || 1);
                const pct = Math.round((Number(s.required_count) / maxCount) * 100);
                return (
                  <div key={s.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">
                        {i + 1}. {s.name}
                      </span>
                      <span className="text-muted-foreground">
                        {String(s.required_count)} posting{String(s.required_count) !== "1" ? "s" : ""}
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Active Industry Partnerships */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Industry Immersions</CardTitle>
              <CardDescription>Active industry programs on the platform</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/academician/immersions">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {immersions.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No industry immersions yet
              </p>
            ) : (
              immersions.map((imm) => (
                <div key={imm.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div className="min-w-0 space-y-1">
                    <p className="font-medium text-sm truncate">{imm.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {imm.company} · {imm._count.applications} applicant{imm._count.applications !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant="outline" className="text-[10px]">
                      {immersionTypeLabels[imm.type] || imm.type}
                    </Badge>
                    <Badge
                      variant={
                        imm.status === "OPEN" ? "success" :
                        imm.status === "IN_PROGRESS" ? "warning" : "secondary"
                      }
                    >
                      {imm.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Users */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Recent Users</CardTitle>
              <CardDescription>Latest signups</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/admin/users">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-1">
                  <p className="font-medium text-sm">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <Badge variant={roleColors[user.role] || "secondary"}>
                  {user.role}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Applications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Recent Applications</CardTitle>
              <CardDescription>Latest job applications</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/admin/analytics">
                View Analytics <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentApplications.map((app) => (
              <div key={app.id} className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-1">
                  <p className="font-medium text-sm">{app.user.name || "Anonymous"}</p>
                  <p className="text-xs text-muted-foreground">
                    {app.job.title} @ {app.job.company}
                  </p>
                </div>
                <Badge
                  variant={
                    app.status === "ACCEPTED" ? "success" :
                    app.status === "REJECTED" ? "destructive" :
                    app.status === "REVIEWING" ? "warning" : "secondary"
                  }
                >
                  {app.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Credential Verification Quick Access */}
      {pendingCredentials > 0 && (
        <Card className="border-yellow-200 bg-yellow-50/30">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-yellow-100 p-2">
                <Award className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {pendingCredentials} credential{pendingCredentials !== 1 ? "s" : ""} pending verification
                </p>
                <p className="text-xs text-muted-foreground">
                  Review and approve student certifications and achievements.
                </p>
              </div>
            </div>
            <Button asChild>
              <Link href="/dashboard/admin/credentials">
                Review Now
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
