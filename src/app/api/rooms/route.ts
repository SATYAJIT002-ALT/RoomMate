import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { calculateRoomCompatibility } from "@/lib/room-matching-engine";
import { UserFullData } from "@/types";
import { z } from "zod";

const listingSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  photos: z.array(z.string()).default([]),
  city: z.string().min(1, "City is required"),
  locality: z.string().min(1, "Locality is required"),
  approximateAddress: z.string().min(1, "Approximate area/landmark is required"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  monthlyRent: z.number().min(500, "Rent must be realistic"),
  securityDeposit: z.number().default(0),
  roomCount: z.number().default(1),
  currentRoommateCount: z.number().default(0),
  totalCapacity: z.number().default(1),
  availableFrom: z.string().optional(),
  furnishing: z.enum(["FURNISHED", "SEMI_FURNISHED", "UNFURNISHED", "ANY"]).default("SEMI_FURNISHED"),
  housingType: z.enum(["APARTMENT", "PG", "HOSTEL", "FLAT", "HOUSE", "SHARED_APARTMENT", "ANY"]).default("FLAT"),
  roomType: z.enum(["PRIVATE", "SHARED", "EITHER"]).default("PRIVATE"),
  amenities: z.array(z.string()).default([]),
  houseRules: z.array(z.string()).default([]),
  preferredGender: z.string().default("ANY"),
  preferredOccupation: z.string().default("ANY"),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    const { searchParams } = new URL(req.url);

    const city = searchParams.get("city") || undefined;
    const locality = searchParams.get("locality") || undefined;
    const maxRent = searchParams.get("maxRent") ? Number(searchParams.get("maxRent")) : undefined;
    const roomType = searchParams.get("roomType") || undefined;
    const furnishing = searchParams.get("furnishing") || undefined;
    const housingType = searchParams.get("housingType") || undefined;

    // Fetch user for room compatibility scoring if logged in
    let currentUser: UserFullData | null = null;
    if (session) {
      currentUser = (await prisma.user.findUnique({
        where: { id: session.id },
        include: { housingReq: true, profile: true, lifestyle: true },
      })) as unknown as UserFullData;
    }

    const listings = await prisma.roomListing.findMany({
      where: {
        isActive: true,
        ...(city ? { city: { contains: city, mode: "insensitive" } } : {}),
        ...(locality ? { locality: { contains: locality, mode: "insensitive" } } : {}),
        ...(maxRent ? { monthlyRent: { lte: maxRent } } : {}),
        ...(roomType && roomType !== "ALL" ? { roomType: roomType as "PRIVATE" | "SHARED" | "EITHER" } : {}),
        ...(furnishing && furnishing !== "ALL" ? { furnishing: furnishing as "FURNISHED" | "SEMI_FURNISHED" | "UNFURNISHED" | "ANY" } : {}),
        ...(housingType && housingType !== "ALL" ? { housingType: housingType as "APARTMENT" | "PG" | "HOSTEL" | "FLAT" | "HOUSE" | "SHARED_APARTMENT" | "ANY" } : {}),
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatarUrl: true,
            isCollegeVerified: true,
            isEmailVerified: true,
          },
        },
        _count: {
          select: {
            savedBy: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const listingsWithScores = listings.map((l) => {
      let compatibilityScore = 85;
      let scoreDetails = null;

      if (currentUser) {
        scoreDetails = calculateRoomCompatibility(currentUser, l as unknown as import("@/lib/room-matching-engine").ListingData);
        compatibilityScore = scoreDetails.overallScore;
      }

      return {
        ...l,
        compatibilityScore,
        scoreDetails,
      };
    });

    return NextResponse.json({
      listings: listingsWithScores,
      totalCount: listingsWithScores.length,
    });
  } catch (error) {
    console.error("Get listings error:", error);
    return NextResponse.json({ error: "Failed to retrieve room listings" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "You must be signed in to create a room listing" }, { status: 401 });
    }

    if (!session.isCollegeVerified) {
      return NextResponse.json(
        { error: "Verification required: You must have an approved Student or Employee ID to publish room listings on RoomMate." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const result = listingSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || "Invalid listing details" },
        { status: 400 }
      );
    }

    const listing = await prisma.roomListing.create({
      data: {
        ...result.data,
        userId: session.id,
        availableFrom: result.data.availableFrom ? new Date(result.data.availableFrom) : new Date(),
      },
    });

    return NextResponse.json({ message: "Room listing published successfully", listing }, { status: 201 });
  } catch (error) {
    console.error("Create listing error:", error);
    return NextResponse.json({ error: "Failed to create room listing" }, { status: 500 });
  }
}
