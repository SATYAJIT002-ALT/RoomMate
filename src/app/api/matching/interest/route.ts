import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { calculateCompatibility } from "@/lib/matching-engine";
import { notifyUser } from "@/lib/real-time";
import { UserFullData } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { targetUserId, note } = body;

    if (!targetUserId || targetUserId === session.id) {
      return NextResponse.json({ error: "Invalid target user" }, { status: 400 });
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: {
        profile: true,
        lifestyle: true,
        roommatePref: true,
        dealBreakers: true,
        housingReq: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Target user not found" }, { status: 404 });
    }

    // Fetch current user
    const currentUser = await prisma.user.findUnique({
      where: { id: session.id },
      include: {
        profile: true,
        lifestyle: true,
        roommatePref: true,
        dealBreakers: true,
        housingReq: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "Current user not found" }, { status: 404 });
    }

    if (!currentUser.isCollegeVerified) {
      return NextResponse.json(
        { error: "Verification required: You must have an approved Student or Employee ID to connect with roommates." },
        { status: 403 }
      );
    }

    if (!targetUser.isCollegeVerified) {
      return NextResponse.json(
        { error: "Target user is not yet verified or active on the platform." },
        { status: 400 }
      );
    }

    // Check if the other user has already expressed interest
    const existingReceivedInterest = await prisma.interestRequest.findUnique({
      where: {
        senderId_receiverId: {
          senderId: targetUserId,
          receiverId: session.id,
        },
      },
    });

    let isMutualMatch = false;

    if (existingReceivedInterest && existingReceivedInterest.status === "PENDING") {
      // IT'S A MUTUAL MATCH!
      isMutualMatch = true;

      // Update both requests
      await prisma.interestRequest.update({
        where: { id: existingReceivedInterest.id },
        data: { status: "ACCEPTED" },
      });

      // Upsert current user's request as accepted
      await prisma.interestRequest.upsert({
        where: {
          senderId_receiverId: {
            senderId: session.id,
            receiverId: targetUserId,
          },
        },
        update: { status: "ACCEPTED" },
        create: {
          senderId: session.id,
          receiverId: targetUserId,
          status: "ACCEPTED",
          note: note || null,
        },
      });

      // Calculate official match scores
      const report = calculateCompatibility(
        currentUser as unknown as UserFullData,
        targetUser as unknown as UserFullData
      );

      // Create Match record
      await prisma.match.upsert({
        where: {
          user1Id_user2Id: {
            user1Id: session.id < targetUserId ? session.id : targetUserId,
            user2Id: session.id < targetUserId ? targetUserId : session.id,
          },
        },
        update: {
          compatibilityScore: report.overallScore,
          lifestyleScore: report.categoryScores.lifestyle,
          budgetLocationScore: report.categoryScores.budgetLocation,
          personalityScore: report.categoryScores.personality,
          habitsScore: report.categoryScores.habitsFood,
          hobbiesScore: report.categoryScores.hobbies,
          housingScore: report.categoryScores.housing,
          strengths: report.strengths,
          differences: report.differences,
          status: "ACCEPTED",
        },
        create: {
          user1Id: session.id < targetUserId ? session.id : targetUserId,
          user2Id: session.id < targetUserId ? targetUserId : session.id,
          compatibilityScore: report.overallScore,
          lifestyleScore: report.categoryScores.lifestyle,
          budgetLocationScore: report.categoryScores.budgetLocation,
          personalityScore: report.categoryScores.personality,
          habitsScore: report.categoryScores.habitsFood,
          hobbiesScore: report.categoryScores.hobbies,
          housingScore: report.categoryScores.housing,
          strengths: report.strengths,
          differences: report.differences,
          status: "ACCEPTED",
        },
      });

      // Find or create Conversation between them
      let conversation = await prisma.conversation.findFirst({
        where: {
          isGroup: false,
          AND: [
            { participants: { some: { userId: session.id } } },
            { participants: { some: { userId: targetUserId } } },
          ],
        },
      });

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            isGroup: false,
            participants: {
              create: [{ userId: session.id }, { userId: targetUserId }],
            },
          },
        });
      }

      // Create initial system celebration message
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: session.id,
          content: `🎉 You both mutually matched with a ${report.overallScore}% compatibility rating! Say hello and start coordinating your shared living plans.`,
        },
      });

      // Create in-app notifications
      await prisma.notification.createMany({
        data: [
          {
            userId: targetUserId,
            type: "MUTUAL_MATCH",
            title: "🎉 It's a Mutual Match!",
            message: `${session.fullName} also liked your profile! You can now message each other.`,
            linkUrl: `/messages`,
          },
          {
            userId: session.id,
            type: "MUTUAL_MATCH",
            title: "🎉 It's a Mutual Match!",
            message: `You and ${targetUser.fullName} are mutually matched! Start a conversation.`,
            linkUrl: `/messages`,
          },
        ],
      });

      // Dispatch real-time notification
      notifyUser(targetUserId, {
        type: "MUTUAL_MATCH",
        payload: {
          matchedUser: { id: session.id, name: session.fullName },
          compatibilityScore: report.overallScore,
          conversationId: conversation.id,
        },
      });

      return NextResponse.json({
        message: "🎉 It's a Mutual Match!",
        isMutualMatch: true,
        conversationId: conversation.id,
        compatibilityScore: report.overallScore,
      });
    } else {
      // Send regular interest request
      const request = await prisma.interestRequest.upsert({
        where: {
          senderId_receiverId: {
            senderId: session.id,
            receiverId: targetUserId,
          },
        },
        update: {
          status: "PENDING",
          note: note || null,
        },
        create: {
          senderId: session.id,
          receiverId: targetUserId,
          status: "PENDING",
          note: note || null,
        },
      });

      // Create notification for target user
      await prisma.notification.create({
        data: {
          userId: targetUserId,
          type: "INTEREST_RECEIVED",
          title: "New Roommate Interest",
          message: `${session.fullName} is interested in becoming your roommate!`,
          linkUrl: `/discover`,
        },
      });

      notifyUser(targetUserId, {
        type: "INTEREST_RECEIVED",
        payload: {
          sender: { id: session.id, name: session.fullName, city: session.city },
        },
      });

      return NextResponse.json({
        message: "Interest sent successfully",
        isMutualMatch: false,
        request,
      });
    }
  } catch (error) {
    console.error("Interest request error:", error);
    return NextResponse.json({ error: "Failed to send interest" }, { status: 500 });
  }
}
