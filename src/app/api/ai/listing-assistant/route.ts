import { NextRequest, NextResponse } from "next/server";
import { generateListingDescription } from "@/lib/ai-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, city, locality, roomType, housingType, monthlyRent, amenities, houseRules } = body;

    const description = generateListingDescription({
      title: title || "Room Available",
      city: city || "Kolkata",
      locality: locality || "Salt Lake",
      roomType: roomType || "PRIVATE",
      housingType: housingType || "FLAT",
      monthlyRent: Number(monthlyRent) || 8000,
      amenities: amenities || [],
      houseRules: houseRules || [],
    });

    return NextResponse.json({ description });
  } catch (error) {
    console.error("AI listing assistant error:", error);
    return NextResponse.json({ error: "Failed to generate description" }, { status: 500 });
  }
}
