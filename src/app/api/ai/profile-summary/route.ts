import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { generateAiProfileSummary } from "@/lib/ai-service";
import { UserFullData } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      include: {
        profile: true,
        lifestyle: true,
        roommatePref: true,
        dealBreakers: true,
        housingReq: true,
      },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const safeUser = {
      ...user,
      role: user.role as "USER" | "ADMIN",
      gender: user.gender as "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY",
    };

    const summary = generateAiProfileSummary(safeUser as unknown as UserFullData);

    await prisma.profile.update({
      where: { userId: session.id },
      data: { aiSummary: summary },
    });

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("AI summary error:", error);
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 });
  }
}
