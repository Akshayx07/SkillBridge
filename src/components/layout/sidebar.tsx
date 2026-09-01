"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  GraduationCap,
  Settings,
  Trophy,
  BookOpen,
  BarChart3,
  Shield,
  Target,
  MessageSquare,
  GitBranch,
  Zap,
  FlaskConical,
  Building2,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { type Role } from "@/lib/auth";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

// ─── Role-specific navigation ──────────────────────────────────────────────
const ROLE_NAV: Record<Role, NavItem[]> = {
  STUDENT: [
    { label: "Dashboard", href: "/dashboard/student", icon: LayoutDashboard },
    { label: "Hackathons", href: "/dashboard/student/hackathons", icon: Trophy },
    { label: "Jobs", href: "/dashboard/student/jobs", icon: Briefcase },
    { label: "My Applications", href: "/dashboard/student/applications", icon: Target },
    { label: "Mentors", href: "/dashboard/student/mentors", icon: Users },
    { label: "Skill Gap Analyzer", href: "/dashboard/student/skill-gap", icon: GitBranch },
    { label: "Mock Interview", href: "/dashboard/student/interview", icon: Zap },
    { label: "Messages", href: "/dashboard/student/messages", icon: MessageSquare },
  ],
  INDUSTRY: [
    { label: "Dashboard", href: "/dashboard/industry", icon: LayoutDashboard },
    { label: "My Job Postings", href: "/dashboard/industry/jobs", icon: Briefcase },
    { label: "Applications", href: "/dashboard/industry/applications", icon: Target },
    { label: "Mentorship", href: "/dashboard/industry/mentorship", icon: Users },
    { label: "Hackathons", href: "/dashboard/industry/hackathons", icon: Trophy },
  ],
  ACADEMICIAN: [
    { label: "Dashboard", href: "/dashboard/academician", icon: LayoutDashboard },
    { label: "Immersion & FDP", href: "/dashboard/academician/immersions", icon: Building2 },
    { label: "Research Hub", href: "/dashboard/academician/research", icon: FlaskConical },
    { label: "Hackathons", href: "/dashboard/academician/hackathons", icon: Trophy },
    { label: "Mentorship", href: "/dashboard/academician/mentorship", icon: Users },
    { label: "Students", href: "/dashboard/academician/students", icon: GraduationCap },
    { label: "Resources", href: "/dashboard/academician/resources", icon: BookOpen },
  ],
  ADMIN: [
    { label: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard },
    { label: "Users", href: "/dashboard/admin/users", icon: Users },
    { label: "Hackathons", href: "/dashboard/admin/hackathons", icon: Trophy },
    { label: "Analytics", href: "/dashboard/admin/analytics", icon: BarChart3 },
    { label: "Credentials", href: "/dashboard/admin/credentials", icon: Award },
    { label: "Mentorships", href: "/dashboard/admin/mentorships", icon: MessageSquare },
    { label: "Settings", href: "/dashboard/admin/settings", icon: Settings },
  ],
};

// ─── Shared bottom items ───────────────────────────────────────────────────
const BOTTOM_NAV: NavItem[] = [
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role as Role | undefined;

  const navItems = role ? ROLE_NAV[role] : [];

  return (
    <aside className="hidden w-64 flex-col border-r bg-card lg:flex">
      {/* Brand */}
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
          SB
        </div>
        <span className="text-lg font-bold tracking-tight">SkillBridge</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        <div className="mb-3">
          <p className="px-3 text-xs font-semibold uppercase text-muted-foreground tracking-wider">
            {role === "ADMIN" ? "Administration" : "Menu"}
          </p>
        </div>

        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== `/dashboard/${role?.toLowerCase()}` &&
              pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom items */}
      <div className="border-t p-4 space-y-1">
        {BOTTOM_NAV.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
