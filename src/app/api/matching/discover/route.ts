import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { calculateCompatibility } from "@/lib/matching-engine";
import { UserFullData } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city") || undefined;
    const gender = searchParams.get("gender") || undefined;
    const minCleanliness = searchParams.get("minCleanliness") ? Number(searchParams.get("minCleanliness")) : undefined;
    const sleepSchedule = searchParams.get("sleepSchedule") || undefined;
    const smoking = searchParams.get("smoking") || undefined;
    const hideDealBreakers = searchParams.get("hideDealBreakers") === "true";

    // 1. Fetch current user's complete profile
    const currentUser = await prisma.user.findUnique({
      where: { id: session.id },
      include: {
        profile: true,
        lifestyle: true,
        roommatePref: true,
        dealBreakers: true,
        housingReq: true,
        blockedUsers: { select: { blockedId: true } },
        blockedByOthers: { select: { blockerId: true } },
        sentInterests: true,
        receivedInterests: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // MANDATORY BACKEND ENFORCEMENT: Unverified users cannot access matching engine
    if (!currentUser.isCollegeVerified) {
      const activeVerif = await prisma.verification.findFirst({
        where: { userId: session.id },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({
        error: activeVerif?.status === "REJECTED"
          ? "Identity verification rejected. Please re-upload your ID to participate in roommate matching."
          : "Verification required. Your profile will remain private until an administrator verifies your Student or Employee ID.",
        verificationStatus: activeVerif?.status || "PENDING",
        submittedAt: activeVerif?.createdAt || null,
        rejectionReason: activeVerif?.status === "REJECTED" ? (activeVerif.instituteName?.includes("Reason:") ? activeVerif.instituteName : "Document unreadable or invalid") : null,
        matches: [],
        totalCount: 0,
      }, { status: 403 });
    }

    const blockedIds = [
      ...currentUser.blockedUsers.map((b) => b.blockedId),
      ...currentUser.blockedByOthers.map((b) => b.blockerId),
    ];

    // Exclude persistently hidden/dismissed users
    const dismissedIds = currentUser.sentInterests
      .filter((i) => i.status === "DECLINED" || i.status === "IGNORED")
      .map((i) => i.receiverId);

    const excludeIds = Array.from(new Set([session.id, ...blockedIds, ...dismissedIds]));

    // 2. Fetch all other real users in the platform (STRICT: ONLY VERIFIED USERS, EXCLUDE ADMIN, SELF, BLOCKED, DISMISSED)
    const otherUsers = await prisma.user.findMany({
      where: {
        id: { notIn: excludeIds },
        role: "USER", // NEVER INCLUDE ADMIN ACCOUNTS IN ROOMMATE DISCOVERY
        isCollegeVerified: true, // STRICT MANDATORY: ONLY APPROVED USERS CAN BE SEEN
        isSuspended: false,
        isBanned: false,
        ...(city ? { city: { contains: city, mode: "insensitive" } } : {}),
        ...(gender && gender !== "ALL" ? { gender: gender as "MALE" | "FEMALE" | "OTHER" } : {}),
      },
      include: {
        profile: true,
        lifestyle: true,
        roommatePref: true,
        dealBreakers: true,
        housingReq: true,
      },
      take: 50,
    });

    const userAData = currentUser as unknown as UserFullData;

    // 3. Evaluate bidirectional compatibility against every real user
    const reports = otherUsers
      .map((userB) => {
        const userBData = userB as unknown as UserFullData;
        const report = calculateCompatibility(userAData, userBData);

        // Check if interest has already been sent
        const sentInterest = currentUser.sentInterests.find((i) => i.receiverId === userB.id);
        const receivedInterest = currentUser.receivedInterests.find((i) => i.senderId === userB.id);

        let interestStatus: "NONE" | "SENT" | "RECEIVED" | "MUTUAL" = "NONE";
        if (sentInterest?.status === "ACCEPTED" || receivedInterest?.status === "ACCEPTED") {
          interestStatus = "MUTUAL";
        } else if (sentInterest) {
          interestStatus = "SENT";
        } else if (receivedInterest) {
          interestStatus = "RECEIVED";
        }

        return {
          ...report,
          interestStatus,
        };
      })
      .filter((r) => {
        // Optional client filters
        if (hideDealBreakers && (r.isDealBreakerViolated || !r.isGenderCompatible)) {
          return false;
        }
        if (minCleanliness && r.targetUser.lifestyle && r.targetUser.lifestyle.cleanliness < minCleanliness) {
          return false;
        }
        if (sleepSchedule && r.targetUser.lifestyle && r.targetUser.lifestyle.sleepSchedule !== sleepSchedule) {
          return false;
        }
        if (smoking && r.targetUser.lifestyle && r.targetUser.lifestyle.smokingHabit !== smoking) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        // Sort: Non-dealbreakers first, then highest overallScore
        if (a.isDealBreakerViolated !== b.isDealBreakerViolated) {
          return a.isDealBreakerViolated ? 1 : -1;
        }
        return b.overallScore - a.overallScore;
      });

    return NextResponse.json({
      matches: reports,
      totalCount: reports.length,
      hiddenCount: dismissedIds.length,
    });
  } catch (error) {
    console.error("Match discovery error:", error);
    return NextResponse.json({ error: "Failed to discover matches" }, { status: 500 });
  }
}
