import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status"); // PENDING, VERIFIED, REJECTED, or null for all

  const where = status ? { status: status as "PENDING" | "VERIFIED" | "REJECTED" } : {};

  const credentials = await prisma.credentialVerification.findMany({
    where,
    include: {
      holder: { select: { id: true, name: true, email: true, profile: { select: { university: true, headline: true } } } },
      verifiedBy: { select: { name: true } },
    },
    orderBy: [
      { status: "asc" }, // PENDING first
      { createdAt: "desc" },
    ],
  });

  return NextResponse.json(credentials);
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { id, status, rejectReason } = body;

  if (!id || !status) {
    return NextResponse.json({ error: "id and status are required" }, { status: 400 });
  }

  if (!["VERIFIED", "REJECTED"].includes(status)) {
    return NextResponse.json({ error: "status must be VERIFIED or REJECTED" }, { status: 400 });
  }

  const credential = await prisma.credentialVerification.update({
    where: { id },
    data: {
      status,
      verifiedById: session.user.id,
      verifiedAt: new Date(),
      rejectReason: status === "REJECTED" ? rejectReason : null,
    },
    include: {
      holder: { select: { name: true, email: true } },
    },
  });

  return NextResponse.json(credential);
}
