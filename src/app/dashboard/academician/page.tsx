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
  Users,
  GraduationCap,
  ArrowRight,
  Plus,
} from "lucide-react";
import Link from "next/link";

export default async function AcademicianDashboard() {
  const session = await getServerSession(authOptions);

  const [hackathons, mentorships, students] = await Promise.all([
    prisma.hackathon.findMany({
      where: { organizerId: session!.user.id },
      orderBy: { startDate: "desc" },
      take: 5,
    }),
    prisma.mentorship.findMany({
      where: { mentorId: session!.user.id },
      include: {
        mentee: { select: { name: true, profile: { select: { university: true } } } },
      },
    }),
    prisma.user.findMany({
      where: { role: "STUDENT" },
      include: {
        profile: { select: { university: true, headline: true } },
      },
      take: 10,
    }),
  ]);

  const stats = [
    {
      label: "Hackathons",
      value: hackathons.length,
      icon: Trophy,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Mentees",
      value: mentorships.length,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Students",
      value: students.length,
      icon: GraduationCap,
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
            {session?.user.name} — Academician Dashboard
          </h1>
          <p className="text-muted-foreground">
            Organize hackathons, mentor students, and track academic engagement.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/academician/hackathons/new">
            <Plus className="mr-2 h-4 w-4" /> Create Hackathon
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
        {/* Your Hackathons */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Your Hackathons</CardTitle>
              <CardDescription>Events you&apos;ve organized</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/academician/hackathons">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {hackathons.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No hackathons yet. Create one to engage students.
              </p>
            ) : (
              hackathons.map((h) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{h.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {h.startDate.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <Badge
                    variant={
                      h.status === "COMPLETED"
                        ? "secondary"
                        : h.status === "IN_PROGRESS"
                          ? "success"
                          : "outline"
                    }
                  >
                    {h.status}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Your Mentees */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg">Your Mentees</CardTitle>
              <CardDescription>Students you&apos;re mentoring</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/academician/mentorship">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {mentorships.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No mentees yet. Browse students to find mentees.
              </p>
            ) : (
              mentorships.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-sm">
                      {m.mentee.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {m.mentee.profile?.university || "University not specified"}
                    </p>
                  </div>
                  <Badge
                    variant={
                      m.status === "ACTIVE"
                        ? "success"
                        : m.status === "COMPLETED"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {m.status}
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
