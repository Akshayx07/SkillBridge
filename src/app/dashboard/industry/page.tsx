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
  Briefcase,
  Target,
  Users,
  ArrowRight,
  Plus,
  Eye,
} from "lucide-react";
import Link from "next/link";

export default async function IndustryDashboard() {
  const session = await getServerSession(authOptions);

  const [jobs, applications, mentorships] = await Promise.all([
    prisma.job.findMany({
      where: { postedById: session!.user.id },
      include: { _count: { select: { applications: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.application.findMany({
      where: { job: { postedById: session!.user.id } },
      include: { user: { select: { name: true, email: true } }, job: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.mentorship.findMany({
      where: { mentorId: session!.user.id },
      include: { mentee: { select: { name: true } } },
    }),
  ]);

  const totalApplications = jobs.reduce(
    (sum, job) => sum + job._count.applications,
    0
  );

  const stats = [
    {
      label: "Job Postings",
      value: jobs.length,
      icon: Briefcase,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Applications",
      value: totalApplications,
      icon: Target,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Mentees",
      value: mentorships.length,
      icon: Users,
      color: "text-green-600",
      bg: "bg-green-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {session?.user.name} — Industry Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage your job postings and mentorship connections.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/industry/jobs/new">
            <Plus className="mr-2 h-4 w-4" /> Post a Job
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
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

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Job Postings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Your Job Postings</CardTitle>
              <CardDescription>Active positions you&apos;ve posted</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/industry/jobs">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {jobs.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No job postings yet. Create your first one to attract talent.
              </p>
            ) : (
              jobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{job.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {job.location || "Remote"} · {job._count.applications}{" "}
                      applicant{job._count.applications !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={job.isActive ? "success" : "secondary"}>
                      {job.isActive ? "Active" : "Closed"}
                    </Badge>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/dashboard/industry/jobs/${job.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Applications */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Recent Applications</CardTitle>
              <CardDescription>
                Latest candidates who applied
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/industry/applications">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {applications.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No applications received yet.
              </p>
            ) : (
              applications.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-sm">
                      {app.user.name || "Anonymous"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Applied for {app.job.title}
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
