import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const collaborations = await prisma.researchCollaboration.findMany({
    include: {
      _count: { select: { applications: true } },
      skills: { include: { skill: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(collaborations);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, description, type, field, duration, budget } = body;

  if (!title || !description) {
    return NextResponse.json(
      { error: "title and description are required" },
      { status: 400 }
    );
  }

  const collaboration = await prisma.researchCollaboration.create({
    data: {
      title,
      description,
      type: type || "CONSULTANCY",
      field: field || null,
      duration: duration || null,
      budget: budget || null,
      organizerId: session.user.id,
    },
    include: {
      skills: { include: { skill: true } },
      _count: { select: { applications: true } },
    },
  });

  return NextResponse.json(collaboration, { status: 201 });
}
