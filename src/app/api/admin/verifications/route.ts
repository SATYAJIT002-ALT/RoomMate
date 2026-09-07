import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireAdmin(req);
  if (errorResponse) return errorResponse;

  try {
    // 1. Fetch only verification submissions that have an uploaded document (or active verified request)
    const verifications = await prisma.verification.findMany({
      where: {
        documentUrl: { not: null },
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            city: true,
            isCollegeVerified: true,
            profile: {
              select: {
                collegeName: true,
                companyName: true,
                occupationStatus: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ verifications });
  } catch (error) {
    console.error("Admin get verifications error:", error);
    return NextResponse.json({ error: "Failed to fetch verification requests" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { errorResponse, session } = await requireAdmin(req);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const { verificationId, userId, action, reason } = body;

    let targetUserId = userId;
    let targetVerifId = verificationId;

    if (verificationId) {
      const v = await prisma.verification.findUnique({ where: { id: verificationId } });
      if (v) targetUserId = v.userId;
    }

    if (!targetUserId) {
      return NextResponse.json({ error: "User ID or Verification ID is required" }, { status: 400 });
    }

    if (action === "APPROVE_STUDENT") {
      // Award Student Verified Badge
      await prisma.user.update({
        where: { id: targetUserId },
        data: { isCollegeVerified: true },
      });

      if (targetVerifId) {
        await prisma.verification.update({
          where: { id: targetVerifId },
          data: {
            type: "COLLEGE",
            status: "VERIFIED",
            verifiedAt: new Date(),
            reviewerId: session?.id,
          },
        });
      }

      await prisma.notification.create({
        data: {
          userId: targetUserId,
          type: "VERIFICATION_STATUS",
          title: "Student Verification Approved! 🎓",
          message: "Congratulations! Your college/school ID has been verified. The Student Verified Badge is now live on your profile.",
          linkUrl: "/profile",
        },
      });

      return NextResponse.json({ message: "Student Verified badge granted successfully" });
    }

    if (action === "APPROVE_EMPLOYEE") {
      // Award Employee Verified Badge
      await prisma.user.update({
        where: { id: targetUserId },
        data: { isCollegeVerified: true },
      });

      if (targetVerifId) {
        await prisma.verification.update({
          where: { id: targetVerifId },
          data: {
            type: "COMPANY",
            status: "VERIFIED",
            verifiedAt: new Date(),
            reviewerId: session?.id,
          },
        });
      }

      await prisma.notification.create({
        data: {
          userId: targetUserId,
          type: "VERIFICATION_STATUS",
          title: "Employee Verification Approved! 💼",
          message: "Congratulations! Your work/company ID has been verified. The Employee Verified Badge is now live on your profile.",
          linkUrl: "/profile",
        },
      });

      return NextResponse.json({ message: "Employee Verified badge granted successfully" });
    }

    if (action === "REJECT") {
      // Reject submission & remove any badge
      await prisma.user.update({
        where: { id: targetUserId },
        data: { isCollegeVerified: false },
      });

      if (targetVerifId) {
        await prisma.verification.update({
          where: { id: targetVerifId },
          data: {
            status: "REJECTED",
            reviewerId: session?.id,
          },
        });
      }

      await prisma.notification.create({
        data: {
          userId: targetUserId,
          type: "VERIFICATION_STATUS",
          title: "Verification Needs Re-submission",
          message: reason
            ? `Your ID verification request was not approved: ${reason}. Please re-upload a clear photo in your profile.`
            : "Your ID verification request could not be validated. Please re-upload a clear photo in your profile.",
          linkUrl: "/profile",
        },
      });

      return NextResponse.json({ message: "Verification rejected" });
    }

    if (action === "REVOKE") {
      // Revoke badge completely
      await prisma.user.update({
        where: { id: targetUserId },
        data: { isCollegeVerified: false },
      });

      if (targetVerifId) {
        await prisma.verification.update({
          where: { id: targetVerifId },
          data: {
            status: "REJECTED",
          },
        });
      }

      return NextResponse.json({ message: "Verification badge revoked" });
    }

    if (action === "DELETE") {
      // Delete verification record completely
      if (targetVerifId) {
        await prisma.verification.delete({
          where: { id: targetVerifId },
        });
      }
      return NextResponse.json({ message: "Verification record removed" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Admin patch verification error:", error);
    return NextResponse.json({ error: "Failed to update verification status" }, { status: 500 });
  }
}
