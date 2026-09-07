import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);

    if (!session) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      include: {
        profile: true,
        lifestyle: true,
        roommatePref: true,
        dealBreakers: true,
        housingReq: true,
        verifications: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { status: true, type: true, createdAt: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Determine verification status
    let verificationStatus: "APPROVED" | "PENDING" | "REJECTED" | "UNSUBMITTED" = "UNSUBMITTED";
    if (user.isCollegeVerified) {
      verificationStatus = "APPROVED";
    } else if (user.verifications?.[0]?.status === "REJECTED") {
      verificationStatus = "REJECTED";
    } else if (user.verifications?.[0]?.status === "PENDING") {
      verificationStatus = "PENDING";
    }

    // Do not leak password hash
    const { passwordHash, ...safeUserData } = user;

    return NextResponse.json({
      user: {
        ...safeUserData,
        verificationStatus,
      },
    });
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
