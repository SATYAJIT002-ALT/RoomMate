import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireAdmin(req);
  if (errorResponse) return errorResponse;

  try {
    const listings = await prisma.roomListing.findMany({
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            isCollegeVerified: true,
          },
        },
        _count: {
          select: {
            reports: true,
            savedBy: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ listings });
  } catch (error) {
    console.error("Admin get listings error:", error);
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { errorResponse } = await requireAdmin(req);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const { listingId, isActive, isFeatured } = body;

    if (!listingId) {
      return NextResponse.json({ error: "Listing ID is required" }, { status: 400 });
    }

    const updated = await prisma.roomListing.update({
      where: { id: listingId },
      data: {
        ...(isActive !== undefined ? { isActive } : {}),
        ...(isFeatured !== undefined ? { isFeatured } : {}),
      },
    });

    return NextResponse.json({ message: "Listing updated", listing: updated });
  } catch (error) {
    console.error("Admin patch listing error:", error);
    return NextResponse.json({ error: "Failed to moderate listing" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { errorResponse } = await requireAdmin(req);
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const listingId = searchParams.get("id");

    if (!listingId) {
      return NextResponse.json({ error: "Listing ID is required" }, { status: 400 });
    }

    await prisma.roomListing.delete({
      where: { id: listingId },
    });

    return NextResponse.json({ message: "Listing deleted by administrator" });
  } catch (error) {
    console.error("Admin delete listing error:", error);
    return NextResponse.json({ error: "Failed to delete listing" }, { status: 500 });
  }
}
