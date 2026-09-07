import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const notifications = await prisma.notification.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: session.id, isRead: false },
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error("Get notifications error:", error);
    return NextResponse.json({ error: "Failed to retrieve notifications" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { notificationId, markAllRead } = body;

    if (markAllRead) {
      await prisma.notification.updateMany({
        where: { userId: session.id, isRead: false },
        data: { isRead: true },
      });
      return NextResponse.json({ message: "All notifications marked as read" });
    }

    if (notificationId) {
      await prisma.notification.update({
        where: { id: notificationId, userId: session.id },
        data: { isRead: true },
      });
      return NextResponse.json({ message: "Notification marked as read" });
    }

    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  } catch (error) {
    console.error("Patch notifications error:", error);
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const notificationId = searchParams.get("id");
    const clearAll = searchParams.get("all");

    if (clearAll === "true") {
      await prisma.notification.deleteMany({
        where: { userId: session.id },
      });
      return NextResponse.json({ message: "All notifications cleared" });
    }

    if (notificationId) {
      await prisma.notification.delete({
        where: { id: notificationId, userId: session.id },
      });
      return NextResponse.json({ message: "Notification deleted" });
    }

    try {
      const body = await req.json();
      if (body.notificationId) {
        await prisma.notification.delete({
          where: { id: body.notificationId, userId: session.id },
        });
        return NextResponse.json({ message: "Notification deleted" });
      }
      if (body.clearAll) {
        await prisma.notification.deleteMany({
          where: { userId: session.id },
        });
        return NextResponse.json({ message: "All notifications cleared" });
      }
    } catch {}

    return NextResponse.json({ error: "Missing notification ID" }, { status: 400 });
  } catch (error) {
    console.error("Delete notifications error:", error);
    return NextResponse.json({ error: "Failed to delete notification" }, { status: 500 });
  }
}
