import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const saved = await prisma.savedRoom.findMany({
      where: { userId: session.id },
      include: {
        listing: {
          include: {
            user: { select: { id: true, fullName: true, avatarUrl: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ savedRooms: saved.map((s) => s.listing) });
  } catch (error) {
    console.error("Get saved rooms error:", error);
    return NextResponse.json({ error: "Failed to retrieve saved rooms" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { listingId } = await req.json();
    if (!listingId) return NextResponse.json({ error: "Listing ID is required" }, { status: 400 });

    const existing = await prisma.savedRoom.findUnique({
      where: {
        userId_listingId: {
          userId: session.id,
          listingId,
        },
      },
    });

    if (existing) {
      // Toggle unsave
      await prisma.savedRoom.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ message: "Room removed from saved list", isSaved: false });
    }

    await prisma.savedRoom.create({
      data: {
        userId: session.id,
        listingId,
      },
    });

    return NextResponse.json({ message: "Room saved to favorites", isSaved: true });
  } catch (error) {
    console.error("Save room error:", error);
    return NextResponse.json({ error: "Failed to update saved status" }, { status: 500 });
  }
}
