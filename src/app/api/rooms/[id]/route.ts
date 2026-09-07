import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { calculateRoomCompatibility } from "@/lib/room-matching-engine";
import { UserFullData } from "@/types";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession(req);

    const listing = await prisma.roomListing.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            avatarUrl: true,
            city: true,
            gender: true,
            isCollegeVerified: true,
            isEmailVerified: true,
            profile: {
              select: {
                bio: true,
                occupationStatus: true,
                collegeName: true,
                companyName: true,
              },
            },
          },
        },
        reviews: {
          include: {
            author: {
              select: { id: true, fullName: true, avatarUrl: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: { savedBy: true },
        },
      },
    });

    if (!listing) {
      return NextResponse.json({ error: "Room listing not found" }, { status: 404 });
    }

    let compatibility = null;
    let isSaved = false;

    if (session) {
      const currentUser = await prisma.user.findUnique({
        where: { id: session.id },
        include: { housingReq: true, profile: true, lifestyle: true },
      });

      if (currentUser) {
        compatibility = calculateRoomCompatibility(
          currentUser as unknown as UserFullData,
          listing as unknown as import("@/lib/room-matching-engine").ListingData
        );
      }

      const saved = await prisma.savedRoom.findUnique({
        where: {
          userId_listingId: {
            userId: session.id,
            listingId: id,
          },
        },
      });
      isSaved = !!saved;
    }

    return NextResponse.json({
      listing,
      compatibility,
      isSaved,
      isOwner: session?.id === listing.userId,
    });
  } catch (error) {
    console.error("Get room error:", error);
    return NextResponse.json({ error: "Failed to retrieve room details" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const listing = await prisma.roomListing.findUnique({ where: { id } });
    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.userId !== session.id && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: You can only edit your own listings" }, { status: 403 });
    }

    const body = await req.json();
    const updated = await prisma.roomListing.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        photos: body.photos,
        city: body.city,
        locality: body.locality,
        approximateAddress: body.approximateAddress,
        monthlyRent: body.monthlyRent ? Number(body.monthlyRent) : undefined,
        securityDeposit: body.securityDeposit ? Number(body.securityDeposit) : undefined,
        roomCount: body.roomCount ? Number(body.roomCount) : undefined,
        currentRoommateCount: body.currentRoommateCount ? Number(body.currentRoommateCount) : undefined,
        totalCapacity: body.totalCapacity ? Number(body.totalCapacity) : undefined,
        furnishing: body.furnishing,
        housingType: body.housingType,
        roomType: body.roomType,
        amenities: body.amenities,
        houseRules: body.houseRules,
        preferredGender: body.preferredGender,
        preferredOccupation: body.preferredOccupation,
        isActive: body.isActive !== undefined ? body.isActive : undefined,
      },
    });

    return NextResponse.json({ message: "Listing updated successfully", listing: updated });
  } catch (error) {
    console.error("Update room error:", error);
    return NextResponse.json({ error: "Failed to update room listing" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const listing = await prisma.roomListing.findUnique({ where: { id } });
    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    if (listing.userId !== session.id && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: You can only delete your own listings" }, { status: 403 });
    }

    await prisma.roomListing.delete({ where: { id } });
    return NextResponse.json({ message: "Listing deleted successfully" });
  } catch (error) {
    console.error("Delete room error:", error);
    return NextResponse.json({ error: "Failed to delete room listing" }, { status: 500 });
  }
}
