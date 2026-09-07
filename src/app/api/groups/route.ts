import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { z } from "zod";

const groupSchema = z.object({
  name: z.string().min(2, "Group name is required"),
  description: z.string().optional(),
  city: z.string().default("Kolkata"),
  locality: z.string().optional(),
  targetBudgetTotal: z.number().optional(),
  targetMoveInDate: z.string().optional(),
  housingType: z.enum(["APARTMENT", "PG", "HOSTEL", "FLAT", "HOUSE", "SHARED_APARTMENT", "ANY"]).default("APARTMENT"),
  requiredBedrooms: z.number().default(3),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city") || undefined;

    const groups = await prisma.roommateGroup.findMany({
      where: {
        ...(city ? { city: { contains: city, mode: "insensitive" } } : {}),
      },
      include: {
        creator: {
          select: { id: true, fullName: true, avatarUrl: true, isCollegeVerified: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, fullName: true, avatarUrl: true, isCollegeVerified: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ groups });
  } catch (error) {
    console.error("Get groups error:", error);
    return NextResponse.json({ error: "Failed to retrieve roommate groups" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.isCollegeVerified) {
      return NextResponse.json(
        { error: "Verification required: You must have an approved Student or Employee ID to create roommate groups." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const result = groupSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0]?.message || "Invalid group details" }, { status: 400 });
    }

    const group = await prisma.roommateGroup.create({
      data: {
        name: result.data.name,
        description: result.data.description || null,
        city: result.data.city,
        locality: result.data.locality || null,
        targetBudgetTotal: result.data.targetBudgetTotal ? Number(result.data.targetBudgetTotal) : null,
        targetMoveInDate: result.data.targetMoveInDate ? new Date(result.data.targetMoveInDate) : null,
        housingType: result.data.housingType,
        requiredBedrooms: result.data.requiredBedrooms,
        creatorId: session.id,
        members: {
          create: {
            userId: session.id,
            role: "ADMIN",
          },
        },
      },
      include: {
        members: {
          include: { user: { select: { id: true, fullName: true, avatarUrl: true } } },
        },
      },
    });

    return NextResponse.json({ message: "Roommate group created", group }, { status: 201 });
  } catch (error) {
    console.error("Create group error:", error);
    return NextResponse.json({ error: "Failed to create roommate group" }, { status: 500 });
  }
}
