import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId: session.id },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                avatarUrl: true,
                city: true,
                isCollegeVerified: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const formatted = conversations.map((conv) => {
      const otherParticipant = conv.participants.find((p) => p.userId !== session.id);
      const lastMessage = conv.messages[0] || null;

      return {
        id: conv.id,
        isGroup: conv.isGroup,
        name: conv.name || otherParticipant?.user.fullName || "Chat",
        avatarUrl: otherParticipant?.user.avatarUrl || null,
        otherUser: otherParticipant?.user || null,
        lastMessage: lastMessage ? {
          content: lastMessage.content,
          createdAt: lastMessage.createdAt,
          isRead: lastMessage.isRead,
          isMine: lastMessage.senderId === session.id,
        } : null,
        updatedAt: conv.updatedAt,
      };
    });

    return NextResponse.json({ conversations: formatted });
  } catch (error) {
    console.error("Get conversations error:", error);
    return NextResponse.json({ error: "Failed to retrieve conversations" }, { status: 500 });
  }
}
