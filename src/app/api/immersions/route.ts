import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const immersions = await prisma.industryImmersion.findMany({
    include: {
      _count: { select: { applications: true } },
      skills: { include: { skill: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(immersions);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, description, type, company, location, isRemote, duration, stipend, startDate, endDate, maxSeats, skillIds } = body;

  if (!title || !description || !company) {
    return NextResponse.json(
      { error: "title, description, and company are required" },
      { status: 400 }
    );
  }

  const immersion = await prisma.industryImmersion.create({
    data: {
      title,
      description,
      type: type || "INDUSTRY_IMMERSION",
      company,
      location: location || null,
      isRemote: isRemote || false,
      duration: duration || null,
      stipend: stipend || null,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      maxSeats: maxSeats || null,
      organizerId: session.user.id,
      skills: {
        create: skillIds?.map((skillId: string) => ({
          skill: { connect: { id: skillId } },
        })) || [],
      },
    },
    include: { skills: { include: { skill: true } } },
  });

  return NextResponse.json(immersion, { status: 201 });
}
