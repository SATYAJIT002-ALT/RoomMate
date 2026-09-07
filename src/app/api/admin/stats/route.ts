import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireAdmin(req);
  if (errorResponse) return errorResponse;

  try {
    const [
      totalUsers,
      totalListings,
      totalMatches,
      totalConversations,
      totalReports,
      pendingReports,
      pendingVerifications,
      users,
      listings,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.roomListing.count(),
      prisma.match.count(),
      prisma.conversation.count(),
      prisma.report.count(),
      prisma.report.count({ where: { status: "PENDING" } }),
      prisma.verification.count({ where: { status: "PENDING" } }),
      prisma.user.findMany({ select: { role: true, gender: true, city: true, createdAt: true } }),
      prisma.roomListing.findMany({ select: { city: true, monthlyRent: true } }),
    ]);

    const usersByRole = {
      user: users.filter((u) => u.role === "USER").length,
      admin: users.filter((u) => u.role === "ADMIN").length,
    };

    const usersByGender = {
      male: users.filter((u) => u.gender === "MALE").length,
      female: users.filter((u) => u.gender === "FEMALE").length,
      other: users.filter((u) => u.gender === "OTHER" || u.gender === "PREFER_NOT_TO_SAY").length,
    };

    const cityMap: Record<string, number> = {};
    users.forEach((u) => {
      cityMap[u.city] = (cityMap[u.city] || 0) + 1;
    });

    const cityDistribution = Object.entries(cityMap).map(([city, count]) => ({
      city,
      count,
    }));

    return NextResponse.json({
      stats: {
        totalUsers,
        totalListings,
        totalMatches,
        totalConversations,
        totalReports,
        pendingReports,
        pendingVerifications,
        usersByRole,
        usersByGender,
        cityDistribution,
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Failed to fetch platform analytics" }, { status: 500 });
  }
}
