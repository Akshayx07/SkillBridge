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
    return NextResponse.json({ error: "jobId required" }, { status: 400 });
  }

  // Fetch job with required skills
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      skills: { include: { skill: true } },
      applications: {
        include: {
          user: {
            include: {
              profile: {
                include: {
                  skills: { include: { skill: true } },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const requiredSkillNames = job.skills.map((s) => s.skill.name.toLowerCase());

  // Calculate compatibility for each applicant
  const candidates = job.applications.map((app) => {
    const profile = app.user.profile;
    const studentSkills = (profile?.skills || []).map((s) => ({
      name: s.skill.name.toLowerCase(),
      level: s.level || 0,
      category: s.skill.category,
    }));

    // Skill match calculation
    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];
    let skillScore = 0;

    for (const reqSkill of requiredSkillNames) {
      const found = studentSkills.find((s) => s.name === reqSkill);
      if (found) {
        matchedSkills.push(found.name);
        // Score based on proficiency level (1-5 maps to 20-100%)
        skillScore += (found.level / 5) * 100;
      } else {
        missingSkills.push(reqSkill);
      }
    }

    const skillMatchPercent =
      requiredSkillNames.length > 0
        ? Math.round(skillScore / requiredSkillNames.length)
        : 50;

    // Profile completeness bonus (0-15 points)
    let profileScore = 0;
    if (profile?.bio) profileScore += 3;
    if (profile?.headline) profileScore += 2;
    if (profile?.location) profileScore += 2;
    if (profile?.githubUrl) profileScore += 3;
    if (profile?.linkedinUrl) profileScore += 3;
    if (profile?.experience) profileScore += 2;

    // Total compatibility score (0-100)
    const compatibility = Math.min(100, Math.round(skillMatchPercent * 0.85 + profileScore));

    // Recommendation tier
    let tier: string;
    if (compatibility >= 80) tier = "STRONG_MATCH";
    else if (compatibility >= 60) tier = "GOOD_MATCH";
    else if (compatibility >= 40) tier = "PARTIAL_MATCH";
    else tier = "WEAK_MATCH";

    return {
      applicationId: app.id,
      userId: app.user.id,
      name: app.user.name,
      email: app.user.email,
      headline: profile?.headline || null,
      university: profile?.university || null,
      compatibility,
      tier,
      matchedSkills,
      missingSkills,
      skillMatchPercent,
      profileScore,
      status: app.status,
      appliedAt: app.createdAt,
    };
  });

  // Sort by compatibility descending
  candidates.sort((a, b) => b.compatibility - a.compatibility);

  return NextResponse.json({
    job: { id: job.id, title: job.title, company: job.company },
    totalApplicants: candidates.length,
    requiredSkills: requiredSkillNames,
    candidates,
  });
}
