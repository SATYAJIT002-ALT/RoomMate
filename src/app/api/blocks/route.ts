import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { blockedId } = await req.json();
    if (!blockedId || blockedId === session.id) {
      return NextResponse.json({ error: "Invalid target to block" }, { status: 400 });
    }

    const existing = await prisma.block.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId: session.id,
          blockedId,
        },
      },
    });

    if (existing) {
      await prisma.block.delete({ where: { id: existing.id } });
      return NextResponse.json({ message: "User unblocked successfully", isBlocked: false });
    }

    await prisma.block.create({
      data: {
        blockerId: session.id,
        blockedId,
      },
    });

    return NextResponse.json({ message: "User blocked successfully", isBlocked: true });
  } catch (error) {
    console.error("Block error:", error);
    return NextResponse.json({ error: "Failed to update block state" }, { status: 500 });
  }
}
