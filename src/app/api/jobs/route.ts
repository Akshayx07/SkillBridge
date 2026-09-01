import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const jobs = await prisma.job.findMany({
    where: { isActive: true },
    include: {
      skills: {
        include: { skill: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(jobs);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, description, company, location, isRemote, salary, jobType, skillIds } = body;

  if (!title || !description || !company) {
    return NextResponse.json(
      { error: "title, description, and company are required" },
      { status: 400 }
    );
  }

  const job = await prisma.job.create({
    data: {
      title,
      description,
      company,
      location: location || null,
      isRemote: isRemote || false,
      salary: salary || null,
      jobType: jobType || "FULL_TIME",
      postedById: session.user.id,
      skills: {
        create:
          skillIds?.map((skillId: string) => ({
            skill: { connect: { id: skillId } },
          })) || [],
      },
    },
    include: { skills: { include: { skill: true } } },
  });

  return NextResponse.json(job, { status: 201 });
}
