import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { notifyConversation, notifyUser } from "@/lib/real-time";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const conversationId = searchParams.get("conversationId");

    if (!conversationId) {
      return NextResponse.json({ error: "Conversation ID is required" }, { status: 400 });
    }

    // Verify user is a participant
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: session.id,
        },
      },
    });

    if (!participant) {
      return NextResponse.json({ error: "Forbidden: You are not in this conversation" }, { status: 403 });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
      take: 100,
    });

    // Mark unread messages as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: session.id },
        isRead: false,
      },
      data: { isRead: true },
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Get messages error:", error);
    return NextResponse.json({ error: "Failed to retrieve messages" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { conversationId, content, imageUrl } = body;

    if (!conversationId || (!content?.trim() && !imageUrl)) {
      return NextResponse.json({ error: "Message content or image is required" }, { status: 400 });
    }

    // Verify participation
    const participants = await prisma.conversationParticipant.findMany({
      where: { conversationId },
    });

    const isParticipant = participants.some((p) => p.userId === session.id);
    if (!isParticipant) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if recipient has blocked sender
    const recipient = participants.find((p) => p.userId !== session.id);
    if (recipient) {
      const isBlocked = await prisma.block.findFirst({
        where: {
          OR: [
            { blockerId: recipient.userId, blockedId: session.id },
            { blockerId: session.id, blockedId: recipient.userId },
          ],
        },
      });

      if (isBlocked) {
        return NextResponse.json({ error: "Cannot send message: Communication is blocked" }, { status: 403 });
      }
    }

    // Create real message in database
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: session.id,
        content: content?.trim() || "",
        imageUrl: imageUrl || null,
      },
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    // Broadcast in real-time
    notifyConversation(conversationId, {
      type: "NEW_MESSAGE",
      payload: message,
    });

    if (recipient) {
      notifyUser(recipient.userId, {
        type: "MESSAGE_NOTIFICATION",
        payload: {
          conversationId,
          message,
          senderName: session.fullName,
        },
      });
    }

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
