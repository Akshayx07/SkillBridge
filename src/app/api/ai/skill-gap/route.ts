import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { jobId } = await req.json();
  if (!jobId) {
    return NextResponse.json({ error: "jobId is required" }, { status: 400 });
  }

  // Fetch student profile with skills
  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    include: {
      skills: {
        include: { skill: true },
      },
    },
  });

  if (!profile) {
    return NextResponse.json(
      { error: "Complete your profile first" },
      { status: 404 }
    );
  }

  // Fetch target job with required skills
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      skills: {
        include: { skill: true },
      },
    },
  });

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const studentSkillMap = new Map(
    profile.skills.map((s) => [s.skill.name.toLowerCase(), s.level || 0])
  );

  const requiredSkills = job.skills.map((s) => ({
    name: s.skill.name,
    category: s.skill.category,
  }));

  // Categorize skills
  const matched: { name: string; category: string | null; studentLevel: number; requiredLevel: number }[] = [];
  const gaps: { name: string; category: string | null; requiredLevel: number; recommendedResources: string[] }[] = [];
  const extras: { name: string; category: string | null; level: number }[] = [];

  const studentSkillNames = new Set(profile.skills.map((s) => s.skill.name.toLowerCase()));

  for (const req of requiredSkills) {
    const studentLevel = studentSkillMap.get(req.name.toLowerCase());
    if (studentLevel && studentLevel >= 3) {
      matched.push({
        name: req.name,
        category: req.category,
        studentLevel,
        requiredLevel: 3,
      });
    } else {
      gaps.push({
        name: req.name,
        category: req.category,
        requiredLevel: 3,
        recommendedResources: getRecommendedResources(req.name),
      });
    }
  }

  for (const s of profile.skills) {
    if (!studentSkillNames.has(s.skill.name.toLowerCase()) || 
        !requiredSkills.some((r) => r.name.toLowerCase() === s.skill.name.toLowerCase())) {
      extras.push({
        name: s.skill.name,
        category: s.skill.category,
        level: s.level || 0,
      });
    }
  }

  // Calculate match score
  const totalRequired = requiredSkills.length || 1;
  const matchScore = Math.round((matched.length / totalRequired) * 100);

  // Generate AI-style insights
  const insights = generateInsights(matched, gaps, extras, job.title, job.company);

  return NextResponse.json({
    job: { id: job.id, title: job.title, company: job.company },
    matchScore,
    matched,
    gaps,
    extras,
    insights,
  });
}

function getRecommendedResources(skill: string): string[] {
  const resourceMap: Record<string, string[]> = {
    typescript: ["TypeScript Handbook", "Total TypeScript Course", "Type Challenges"],
    react: ["React Official Docs", "Epic React Course", "React Patterns"],
    "next.js": ["Next.js Docs", "Next.js Learn Course", "Vercel Examples"],
    "node.js": ["Node.js Docs", "Node University", "Express.js Guide"],
    python: ["Python.org Tutorial", "Automate the Boring Stuff", "Real Python"],
    postgresql: ["PostgreSQL Tutorial", "Use The Index, Luke!", " pgExercises"],
    docker: ["Docker Docs", "Docker Curriculum", "KodeKloud Docker Course"],
    aws: ["AWS Skill Builder", "AWS Free Tier Labs", "Stephane Maarek Course"],
    graphql: ["GraphQL Official Docs", "How to GraphQL", "Apollo docs"],
    rust: ["The Rust Book", "Rustlings Exercises", "Rust by Example"],
    "machine learning": ["Coursera ML Specialization", "Fast.ai Course", "ML Crash Course"],
  };

  const lower = skill.toLowerCase();
  for (const [key, resources] of Object.entries(resourceMap)) {
    if (lower.includes(key)) return resources;
  }
  return [`${skill} documentation`, `${skill} tutorials on YouTube`, `Practice projects with ${skill}`];
}

function generateInsights(
  matched: { name: string }[],
  gaps: { name: string }[],
  extras: { name: string; level: number }[],
  jobTitle: string,
  company: string
): string[] {
  const insights: string[] = [];

  if (gaps.length === 0) {
    insights.push(
      `🎉 Excellent! You meet all the technical requirements for ${jobTitle} at ${company}.`
    );
  } else if (gaps.length <= 2) {
    insights.push(
      `📈 You're close! Just ${gaps.length} skill gap${gaps.length > 1 ? "s" : ""} to fill for ${jobTitle}.`
    );
  } else {
    insights.push(
      `🎯 Focus on building ${gaps.length} key skills to become a strong candidate for ${jobTitle}.`
    );
  }

  if (extras.length > 0) {
    insights.push(
      `✨ Your ${extras.map((e) => e.name).join(", ")} skills give you an edge beyond the requirements.`
    );
  }

  if (matched.length > 0) {
    const topSkills = matched.slice(0, 3).map((m) => m.name).join(", ");
    insights.push(`💪 Strong foundation in ${topSkills} — these are your key differentiators.`);
  }

  return insights;
}
