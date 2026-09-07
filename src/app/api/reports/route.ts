import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { z } from "zod";

const reportSchema = z.object({
  reportedUserId: z.string().optional(),
  reportedListingId: z.string().optional(),
  reason: z.string().min(2, "Reason is required"),
  description: z.string().min(5, "Please provide description details for moderation"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const result = reportSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0]?.message || "Invalid report data" }, { status: 400 });
    }

    const { reportedUserId, reportedListingId, reason, description } = result.data;

    if (!reportedUserId && !reportedListingId) {
      return NextResponse.json({ error: "Report target required" }, { status: 400 });
    }

    const report = await prisma.report.create({
      data: {
        reporterId: session.id,
        reportedUserId: reportedUserId || null,
        reportedListingId: reportedListingId || null,
        reason,
        description,
        status: "PENDING",
      },
    });

    return NextResponse.json({
      message: "Report submitted successfully. Our safety team will review it shortly.",
      report,
    }, { status: 201 });
  } catch (error) {
    console.error("Create report error:", error);
    return NextResponse.json({ error: "Failed to submit report" }, { status: 500 });
  }
}
