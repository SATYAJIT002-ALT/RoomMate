import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireAdmin(req);
  if (errorResponse) return errorResponse;

  try {
    const reports = await prisma.report.findMany({
      include: {
        reporter: {
          select: { id: true, fullName: true, email: true },
        },
        reportedUser: {
          select: { id: true, fullName: true, email: true, isSuspended: true, isBanned: true },
        },
        reportedListing: {
          select: { id: true, title: true, city: true, locality: true, isActive: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ reports });
  } catch (error) {
    console.error("Admin get reports error:", error);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { errorResponse, session } = await requireAdmin(req);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const { reportId, status, adminNotes } = body;

    if (!reportId) {
      return NextResponse.json({ error: "Report ID is required" }, { status: 400 });
    }

    const updated = await prisma.report.update({
      where: { id: reportId },
      data: {
        status,
        adminNotes,
        resolvedById: session?.id,
        resolvedAt: status === "RESOLVED" || status === "DISMISSED" ? new Date() : null,
      },
    });

    return NextResponse.json({ message: "Report updated", report: updated });
  } catch (error) {
    console.error("Admin patch report error:", error);
    return NextResponse.json({ error: "Failed to resolve report" }, { status: 500 });
  }
}
