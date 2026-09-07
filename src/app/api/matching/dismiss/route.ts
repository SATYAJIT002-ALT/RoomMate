import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// POST: Permanently hide / dismiss a roommate from Discover feed
export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { targetUserId, action } = body;

    if (!targetUserId) {
      return NextResponse.json({ error: "Target user ID required" }, { status: 400 });
    }

    if (action === "UNHIDE") {
      // Delete dismissal record so user appears again
      await prisma.interestRequest.deleteMany({
        where: {
          senderId: session.id,
          receiverId: targetUserId,
          status: "DECLINED",
        },
      });
      return NextResponse.json({ message: "Roommate unhidden successfully" });
    }

    if (action === "RESET_ALL") {
      // Reset all hidden roommates
      await prisma.interestRequest.deleteMany({
        where: {
          senderId: session.id,
          status: "DECLINED",
        },
      });
      return NextResponse.json({ message: "All hidden roommates reset successfully" });
    }

    // Default: Record persistent dismissal (status: DECLINED)
    await prisma.interestRequest.upsert({
      where: {
        senderId_receiverId: {
          senderId: session.id,
          receiverId: targetUserId,
        },
      },
      update: {
        status: "DECLINED",
        updatedAt: new Date(),
      },
      create: {
        senderId: session.id,
        receiverId: targetUserId,
        status: "DECLINED",
      },
    });

    return NextResponse.json({
      message: "Roommate permanently hidden from Discover feed",
    });
  } catch (error) {
    console.error("Dismiss match error:", error);
    return NextResponse.json({ error: "Failed to dismiss roommate" }, { status: 500 });
  }
}

// GET: Get count and list of hidden roommates for current user
export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hiddenRequests = await prisma.interestRequest.findMany({
      where: {
        senderId: session.id,
        status: "DECLINED",
      },
      include: {
        receiver: {
          select: {
            id: true,
            fullName: true,
            email: true,
            city: true,
            avatarUrl: true,
            isCollegeVerified: true,
            profile: {
              select: {
                occupationStatus: true,
                collegeName: true,
                companyName: true,
                preferredArea: true,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const hiddenUsers = hiddenRequests.map((r) => ({
      ...r.receiver,
      hiddenAt: r.updatedAt,
    }));

    return NextResponse.json({
      hiddenCount: hiddenUsers.length,
      hiddenUsers,
    });
  } catch (error) {
    console.error("Get hidden count error:", error);
    return NextResponse.json({ error: "Failed to fetch hidden users" }, { status: 500 });
  }
}
