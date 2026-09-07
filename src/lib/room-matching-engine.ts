import { RoomCompatibilityReport, UserFullData } from "@/types";

export interface ListingData {
  id: string;
  title: string;
  description: string;
  photos: string[];
  city: string;
  locality: string;
  monthlyRent: number;
  securityDeposit: number;
  roomCount: number;
  currentRoommateCount: number;
  totalCapacity: number;
  availableFrom: string | Date;
  furnishing: string;
  housingType: string;
  roomType: string;
  amenities: string[];
  houseRules: string[];
  preferredGender: string;
  preferredOccupation: string;
  isActive: boolean;
}

/**
 * Calculates deterministic compatibility between a User's housing preferences and a Room Listing
 */
export function calculateRoomCompatibility(
  user: UserFullData,
  listing: ListingData
): RoomCompatibilityReport {
  const req = user.housingReq;
  const strengths: string[] = [];
  const notes: string[] = [];

  if (!req) {
    return {
      listingId: listing.id,
      overallScore: 70,
      isWithinBudget: true,
      isLocationMatched: true,
      isHousingTypeMatched: true,
      isRoomTypeMatched: true,
      matchedAmenities: listing.amenities,
      missingAmenities: [],
      strengths: ["✓ Available immediately"],
      notes: ["Complete your housing requirements for precise match scoring"],
    };
  }

  let totalPoints = 0;
  let maxPoints = 100;

  // 1. Budget check (30 pts)
  let isWithinBudget = false;
  if (listing.monthlyRent <= req.budgetMax) {
    isWithinBudget = true;
    totalPoints += 30;
    strengths.push(`✓ Within your budget (₹${listing.monthlyRent.toLocaleString()}/mo vs Max ₹${req.budgetMax.toLocaleString()})`);
  } else {
    const diff = listing.monthlyRent - req.budgetMax;
    if (diff <= 2000) {
      totalPoints += 15;
      notes.push(`⚠ Slightly above your max budget (+₹${diff.toLocaleString()}/mo)`);
    } else {
      totalPoints += 5;
      notes.push(`⚠ ₹${diff.toLocaleString()} higher than your target budget limit`);
    }
  }

  // 2. Location & Locality match (25 pts)
  let isLocationMatched = false;
  if (listing.city.toLowerCase().trim() === req.city.toLowerCase().trim()) {
    totalPoints += 15;
    const localityMatch = req.targetLocalities.some((loc) =>
      listing.locality.toLowerCase().includes(loc.toLowerCase()) ||
      loc.toLowerCase().includes(listing.locality.toLowerCase())
    );

    if (localityMatch) {
      isLocationMatched = true;
      totalPoints += 10;
      strengths.push(`✓ Located in your target area: ${listing.locality}, ${listing.city}`);
    } else {
      strengths.push(`✓ In your target city: ${listing.city}`);
      notes.push(`⚠ Located in ${listing.locality} (not in your saved target localities)`);
    }
  } else {
    notes.push(`⚠ In ${listing.city}, different from your target city (${req.city})`);
  }

  // 3. Housing Type (15 pts)
  let isHousingTypeMatched = false;
  if (req.housingType === "ANY" || listing.housingType === "ANY" || req.housingType === listing.housingType) {
    isHousingTypeMatched = true;
    totalPoints += 15;
    strengths.push(`✓ Matching property style (${listing.housingType.toLowerCase()})`);
  } else {
    totalPoints += 5;
    notes.push(`⚠ Property is a ${listing.housingType.toLowerCase()} (you preferred ${req.housingType.toLowerCase()})`);
  }

  // 4. Room Type (15 pts)
  let isRoomTypeMatched = false;
  if (req.roomType === "EITHER" || listing.roomType === "EITHER" || req.roomType === listing.roomType) {
    isRoomTypeMatched = true;
    totalPoints += 15;
    strengths.push(`✓ Matching room configuration (${listing.roomType.toLowerCase()} room)`);
  } else {
    totalPoints += 4;
    notes.push(`⚠ Listing is for a ${listing.roomType.toLowerCase()} room`);
  }

  // 5. Amenities match (15 pts)
  const matchedAmenities: string[] = [];
  const missingAmenities: string[] = [];

  for (const amenity of req.requiredAmenities || []) {
    if (listing.amenities.some((a) => a.toLowerCase() === amenity.toLowerCase())) {
      matchedAmenities.push(amenity);
    } else {
      missingAmenities.push(amenity);
    }
  }

  if (req.requiredAmenities && req.requiredAmenities.length > 0) {
    const amenityRatio = matchedAmenities.length / req.requiredAmenities.length;
    totalPoints += Math.round(amenityRatio * 15);
    if (matchedAmenities.length > 0) {
      strengths.push(`✓ Includes requested amenities: ${matchedAmenities.slice(0, 3).join(", ")}`);
    }
    if (missingAmenities.length > 0) {
      notes.push(`⚠ Missing requested amenities: ${missingAmenities.join(", ")}`);
    }
  } else {
    totalPoints += 15;
  }

  const overallScore = Math.min(100, Math.round((totalPoints / maxPoints) * 100));

  return {
    listingId: listing.id,
    overallScore,
    isWithinBudget,
    isLocationMatched,
    isHousingTypeMatched,
    isRoomTypeMatched,
    matchedAmenities,
    missingAmenities,
    strengths,
    notes,
  };
}
