import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const saved = await prisma.savedUser.findMany({
      where: { userId: session.id },
      include: {
        targetUser: {
          include: {
            profile: true,
            lifestyle: true,
            roommatePref: true,
            housingReq: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const safeUsers = saved.map((s) => {
      const { passwordHash, ...safe } = s.targetUser;
      return safe;
    });

    return NextResponse.json({ savedUsers: safeUsers });
  } catch (error) {
    console.error("Get saved users error:", error);
    return NextResponse.json({ error: "Failed to retrieve saved roommates" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { targetUserId } = await req.json();
    if (!targetUserId || targetUserId === session.id) {
      return NextResponse.json({ error: "Invalid target user" }, { status: 400 });
    }

    const existing = await prisma.savedUser.findUnique({
      where: {
        userId_targetUserId: {
          userId: session.id,
          targetUserId,
        },
      },
    });

    if (existing) {
      await prisma.savedUser.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ message: "User removed from saved list", isSaved: false });
    }

    await prisma.savedUser.create({
      data: {
        userId: session.id,
        targetUserId,
      },
    });

    return NextResponse.json({ message: "User saved to favorites", isSaved: true });
  } catch (error) {
    console.error("Save user error:", error);
    return NextResponse.json({ error: "Failed to save user" }, { status: 500 });
  }
}
