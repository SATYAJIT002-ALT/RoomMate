import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        isCollegeVerified: true,
        profile: {
          select: {
            occupationStatus: true,
            collegeName: true,
            companyName: true,
          },
        },
      },
    });

    const activeVerification = await prisma.verification.findFirst({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        type: true,
        status: true,
        instituteName: true,
        verifiedAt: true,
        createdAt: true,
      },
    });

    const isCompanyVerified = activeVerification?.type === "COMPANY" && activeVerification?.status === "VERIFIED";

    return NextResponse.json({
      user,
      verification: activeVerification,
      isCollegeVerified: user?.isCollegeVerified || false,
      isCompanyVerified,
    });
  } catch (error) {
    console.error("Get user verification error:", error);
    return NextResponse.json({ error: "Failed to load verification status" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { type, instituteName, idNumber, documentUrl } = body;

    if (!type || !instituteName || !documentUrl) {
      return NextResponse.json(
        { error: "Verification type, institute/company name, and ID card photo are required." },
        { status: 400 }
      );
    }

    const formattedInstitute = idNumber
      ? `${instituteName.trim()} [ID: ${idNumber.trim()}]`
      : instituteName.trim();

    // Check existing pending request
    const existing = await prisma.verification.findFirst({
      where: { userId: session.id, status: "PENDING" },
    });

    let verification;
    if (existing) {
      verification = await prisma.verification.update({
        where: { id: existing.id },
        data: {
          type: type === "COMPANY" ? "COMPANY" : "COLLEGE",
          instituteName: formattedInstitute,
          documentUrl,
          status: "PENDING",
        },
      });
    } else {
      verification = await prisma.verification.create({
        data: {
          userId: session.id,
          type: type === "COMPANY" ? "COMPANY" : "COLLEGE",
          instituteName: formattedInstitute,
          documentUrl,
          status: "PENDING",
        },
      });
    }

    // Update profile college or company name
    if (type === "COMPANY") {
      await prisma.profile.upsert({
        where: { userId: session.id },
        update: { companyName: instituteName.trim(), occupationStatus: "WORKING_PROFESSIONAL" },
        create: {
          userId: session.id,
          companyName: instituteName.trim(),
          occupationStatus: "WORKING_PROFESSIONAL",
          personalityTraits: [],
          preferredRoommateTraits: [],
          hobbies: [],
        },
      });
    } else {
      await prisma.profile.upsert({
        where: { userId: session.id },
        update: { collegeName: instituteName.trim(), occupationStatus: "STUDENT" },
        create: {
          userId: session.id,
          collegeName: instituteName.trim(),
          occupationStatus: "STUDENT",
          personalityTraits: [],
          preferredRoommateTraits: [],
          hobbies: [],
        },
      });
    }

    return NextResponse.json({
      message: "ID Document submitted successfully. Admin review is pending.",
      verification: {
        id: verification.id,
        type: verification.type,
        status: verification.status,
        instituteName: verification.instituteName,
        createdAt: verification.createdAt,
      },
    });
  } catch (error) {
    console.error("Submit verification error:", error);
    return NextResponse.json({ error: "Failed to submit verification request" }, { status: 500 });
  }
}
