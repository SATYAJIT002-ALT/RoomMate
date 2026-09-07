import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { z } from "zod";

const reviewSchema = z.object({
  targetUserId: z.string().optional(),
  targetListingId: z.string().optional(),
  cleanlinessRating: z.number().min(1).max(5).default(5),
  communicationRating: z.number().min(1).max(5).default(5),
  reliabilityRating: z.number().min(1).max(5).default(5),
  respectfulnessRating: z.number().min(1).max(5).default(5),
  accuracyRating: z.number().min(1).max(5).default(5),
  content: z.string().min(5, "Review comment must be at least 5 characters"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const result = reviewSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0]?.message || "Invalid review data" }, { status: 400 });
    }

    const {
      targetUserId,
      targetListingId,
      cleanlinessRating,
      communicationRating,
      reliabilityRating,
      respectfulnessRating,
      accuracyRating,
      content,
    } = result.data;

    if (!targetUserId && !targetListingId) {
      return NextResponse.json({ error: "Review target is required" }, { status: 400 });
    }

    if (targetUserId === session.id) {
      return NextResponse.json({ error: "You cannot review your own profile" }, { status: 400 });
    }

    const overallRating = Number(
      ((cleanlinessRating + communicationRating + reliabilityRating + respectfulnessRating + accuracyRating) / 5).toFixed(1)
    );

    const review = await prisma.review.create({
      data: {
        authorId: session.id,
        targetUserId: targetUserId || null,
        targetListingId: targetListingId || null,
        cleanlinessRating,
        communicationRating,
        reliabilityRating,
        respectfulnessRating,
        accuracyRating,
        overallRating,
        content,
      },
    });

    return NextResponse.json({ message: "Review posted successfully", review }, { status: 201 });
  } catch (error) {
    console.error("Create review error:", error);
    return NextResponse.json({ error: "Failed to post review" }, { status: 500 });
  }
}
