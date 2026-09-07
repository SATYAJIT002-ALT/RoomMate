import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession, setAuthCookie } from "@/lib/auth";
import { generateAiProfileSummary } from "@/lib/ai-service";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { passwordHash, ...safeUser } = user;
    return NextResponse.json({ user: safeUser });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json({ error: "Failed to retrieve profile" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      fullName,
      phone,
      gender,
      city,
      avatarUrl,
      profile,
      lifestyle,
      roommatePref,
      dealBreakers,
      housingReq,
    } = body;

    // Calculate profile completion score (0 - 100)
    let completion = 30; // base for registration
    if (profile?.bio) completion += 10;
    if (profile?.personalityTraits?.length > 0) completion += 10;
    if (profile?.hobbies?.length > 0) completion += 10;
    if (lifestyle?.sleepSchedule) completion += 10;
    if (lifestyle?.cleanliness) completion += 10;
    if (roommatePref?.preferredGender) completion += 10;
    if (housingReq?.budgetMax) completion += 10;
    completion = Math.min(100, completion);

    // Update user base
    if (fullName !== undefined || phone !== undefined || gender !== undefined || city !== undefined || avatarUrl !== undefined) {
      await prisma.user.update({
        where: { id: session.id },
        data: {
          fullName: fullName !== undefined ? fullName : undefined,
          phone: phone !== undefined ? phone : undefined,
          gender: gender !== undefined ? gender : undefined,
          city: city !== undefined ? city : undefined,
          avatarUrl: avatarUrl !== undefined ? avatarUrl : undefined,
        },
      });
    }

    // Update or create Profile
    if (profile !== undefined) {
      await prisma.profile.upsert({
        where: { userId: session.id },
        update: {
          bio: profile.bio !== undefined ? profile.bio : undefined,
          occupationStatus: profile.occupationStatus !== undefined ? profile.occupationStatus : undefined,
          collegeName: profile.collegeName !== undefined ? profile.collegeName : undefined,
          companyName: profile.companyName !== undefined ? profile.companyName : undefined,
          preferredArea: profile.preferredArea !== undefined ? profile.preferredArea : undefined,
          personalityTraits: profile.personalityTraits !== undefined ? profile.personalityTraits : undefined,
          preferredRoommateTraits: profile.preferredRoommateTraits !== undefined ? profile.preferredRoommateTraits : undefined,
          hobbies: profile.hobbies !== undefined ? profile.hobbies : undefined,
          profileCompletion: completion,
        },
        create: {
          user: { connect: { id: session.id } },
          bio: profile.bio || null,
          occupationStatus: profile.occupationStatus || "STUDENT",
          collegeName: profile.collegeName || null,
          companyName: profile.companyName || null,
          preferredArea: profile.preferredArea || null,
          personalityTraits: profile.personalityTraits || [],
          preferredRoommateTraits: profile.preferredRoommateTraits || [],
          hobbies: profile.hobbies || [],
          profileCompletion: completion,
        },
      });
    }

    // Update or create Lifestyle (Actual habits)
    if (lifestyle !== undefined) {
      const parseField = (val: any) => (val === "NOT_SET" || val === null || val === "" ? null : val);
      const parseNum = (val: any) => (val === null || val === undefined || val === "" ? null : Number(val));

      await prisma.lifestyle.upsert({
        where: { userId: session.id },
        update: {
          sleepSchedule: parseField(lifestyle.sleepSchedule),
          wakeUpSchedule: parseField(lifestyle.wakeUpSchedule),
          cleanliness: parseNum(lifestyle.cleanliness),
          noiseTolerance: parseField(lifestyle.noiseTolerance),
          guestFrequency: parseField(lifestyle.guestFrequency),
          wfhOrStudy: parseField(lifestyle.wfhOrStudy),
          cookingFrequency: parseField(lifestyle.cookingFrequency),
          foodPreference: parseField(lifestyle.foodPreference),
          smokingHabit: parseField(lifestyle.smokingHabit),
          drinkingHabit: parseField(lifestyle.drinkingHabit),
          petOwnership: parseField(lifestyle.petOwnership),
          acUsage: parseField(lifestyle.acUsage),
          socialBehavior: parseField(lifestyle.socialBehavior),
        },
        create: {
          user: { connect: { id: session.id } },
          sleepSchedule: parseField(lifestyle.sleepSchedule),
          wakeUpSchedule: parseField(lifestyle.wakeUpSchedule),
          cleanliness: parseNum(lifestyle.cleanliness),
          noiseTolerance: parseField(lifestyle.noiseTolerance),
          guestFrequency: parseField(lifestyle.guestFrequency),
          wfhOrStudy: parseField(lifestyle.wfhOrStudy),
          cookingFrequency: parseField(lifestyle.cookingFrequency),
          foodPreference: parseField(lifestyle.foodPreference),
          smokingHabit: parseField(lifestyle.smokingHabit),
          drinkingHabit: parseField(lifestyle.drinkingHabit),
          petOwnership: parseField(lifestyle.petOwnership),
          acUsage: parseField(lifestyle.acUsage),
          socialBehavior: parseField(lifestyle.socialBehavior),
        },
      });
    }

    // Update or create Roommate Preferences
    if (roommatePref !== undefined) {
      const parsePref = (val: any) => (val === "NOT_SET" || val === null || val === "" || val === undefined ? null : val);
      const parseNum = (val: any) => (val === null || val === undefined || val === "" ? null : Number(val));

      await prisma.roommatePreference.upsert({
        where: { userId: session.id },
        update: {
          preferredGender: parsePref(roommatePref.preferredGender),
          comfortableWithGender: roommatePref.comfortableWithGender || ["MALE", "FEMALE", "OTHER"],
          preferredSleepSchedule: parsePref(roommatePref.preferredSleepSchedule),
          preferredSmoking: parsePref(roommatePref.preferredSmoking),
          minCleanliness: parseNum(roommatePref.minCleanliness),
          preferredNoise: parsePref(roommatePref.preferredNoise),
          preferredGuests: parsePref(roommatePref.preferredGuests),
          preferredPets: parsePref(roommatePref.preferredPets),
          preferredFood: parsePref(roommatePref.preferredFood),
          preferredDrinking: parsePref(roommatePref.preferredDrinking),
          preferredOccupation: parsePref(roommatePref.preferredOccupation),
          ageMin: parseNum(roommatePref.ageMin),
          ageMax: parseNum(roommatePref.ageMax),
        },
        create: {
          user: { connect: { id: session.id } },
          preferredGender: parsePref(roommatePref.preferredGender),
          comfortableWithGender: roommatePref.comfortableWithGender || ["MALE", "FEMALE", "OTHER"],
          preferredSleepSchedule: parsePref(roommatePref.preferredSleepSchedule),
          preferredSmoking: parsePref(roommatePref.preferredSmoking),
          minCleanliness: parseNum(roommatePref.minCleanliness),
          preferredNoise: parsePref(roommatePref.preferredNoise),
          preferredGuests: parsePref(roommatePref.preferredGuests),
          preferredPets: parsePref(roommatePref.preferredPets),
          preferredFood: parsePref(roommatePref.preferredFood),
          preferredDrinking: parsePref(roommatePref.preferredDrinking),
          preferredOccupation: parsePref(roommatePref.preferredOccupation),
          ageMin: parseNum(roommatePref.ageMin),
          ageMax: parseNum(roommatePref.ageMax),
        },
      });
    }

    // Update or create Deal Breakers
    if (dealBreakers !== undefined) {
      await prisma.dealBreaker.upsert({
        where: { userId: session.id },
        update: {
          noSmoking: Boolean(dealBreakers.noSmoking),
          noDrinking: Boolean(dealBreakers.noDrinking),
          noPets: Boolean(dealBreakers.noPets),
          noFrequentGuests: Boolean(dealBreakers.noFrequentGuests),
          noOppositeGender: Boolean(dealBreakers.noOppositeGender),
          strictQuietHours: Boolean(dealBreakers.strictQuietHours),
          strictCleanlinessMin: dealBreakers.strictCleanlinessMin ? Number(dealBreakers.strictCleanlinessMin) : null,
          vegetarianKitchenOnly: Boolean(dealBreakers.vegetarianKitchenOnly),
          strictMaxBudget: dealBreakers.strictMaxBudget ? Number(dealBreakers.strictMaxBudget) : null,
        },
        create: {
          user: { connect: { id: session.id } },
          noSmoking: Boolean(dealBreakers.noSmoking),
          noDrinking: Boolean(dealBreakers.noDrinking),
          noPets: Boolean(dealBreakers.noPets),
          noFrequentGuests: Boolean(dealBreakers.noFrequentGuests),
          noOppositeGender: Boolean(dealBreakers.noOppositeGender),
          strictQuietHours: Boolean(dealBreakers.strictQuietHours),
          strictCleanlinessMin: dealBreakers.strictCleanlinessMin ? Number(dealBreakers.strictCleanlinessMin) : null,
          vegetarianKitchenOnly: Boolean(dealBreakers.vegetarianKitchenOnly),
          strictMaxBudget: dealBreakers.strictMaxBudget ? Number(dealBreakers.strictMaxBudget) : null,
        },
      });
    }

    // Update or create Housing Requirements
    if (housingReq !== undefined) {
      await prisma.housingRequirement.upsert({
        where: { userId: session.id },
        update: {
          city: housingReq.city || city || "Kolkata",
          targetLocalities: housingReq.targetLocalities || [],
          budgetMin: Number(housingReq.budgetMin) || 3000,
          budgetMax: Number(housingReq.budgetMax) || 15000,
          moveInDate: housingReq.moveInDate ? new Date(housingReq.moveInDate) : null,
          rentalDuration: housingReq.rentalDuration || "1 year",
          housingType: housingReq.housingType || "ANY",
          roomType: housingReq.roomType || "EITHER",
          requiredAmenities: housingReq.requiredAmenities || [],
          furnishing: housingReq.furnishing || "ANY",
        },
        create: {
          user: { connect: { id: session.id } },
          city: housingReq.city || city || "Kolkata",
          targetLocalities: housingReq.targetLocalities || [],
          budgetMin: Number(housingReq.budgetMin) || 3000,
          budgetMax: Number(housingReq.budgetMax) || 15000,
          moveInDate: housingReq.moveInDate ? new Date(housingReq.moveInDate) : null,
          rentalDuration: housingReq.rentalDuration || "1 year",
          housingType: housingReq.housingType || "ANY",
          roomType: housingReq.roomType || "EITHER",
          requiredAmenities: housingReq.requiredAmenities || [],
          furnishing: housingReq.furnishing || "ANY",
        },
      });
    }

    // Refresh full user data to generate updated AI Summary
    const updatedFullUser = await prisma.user.findUnique({
      where: { id: session.id },
      include: {
        profile: true,
        lifestyle: true,
        roommatePref: true,
        dealBreakers: true,
        housingReq: true,
      },
    });

    if (updatedFullUser) {
      const safeData = {
        ...updatedFullUser,
        role: updatedFullUser.role as "USER" | "ADMIN",
        gender: updatedFullUser.gender as "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY",
      };
      const aiSummary = generateAiProfileSummary(safeData as unknown as import("@/types").UserFullData);
      await prisma.profile.update({
        where: { userId: session.id },
        data: { aiSummary },
      });
    }

    const response = NextResponse.json({ message: "Profile updated successfully", profileCompletion: completion });

    if (updatedFullUser) {
      const sessionPayload = {
        id: updatedFullUser.id,
        email: updatedFullUser.email,
        role: updatedFullUser.role as "USER" | "ADMIN",
        fullName: updatedFullUser.fullName,
        gender: updatedFullUser.gender as any,
        city: updatedFullUser.city,
        avatarUrl: updatedFullUser.avatarUrl,
        isEmailVerified: updatedFullUser.isEmailVerified,
        isCollegeVerified: updatedFullUser.isCollegeVerified,
      };
      setAuthCookie(response, sessionPayload, updatedFullUser.role === "ADMIN");
    }

    return response;
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}

// DELETE endpoint to clear or reset preferences once a user has found their roommate
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Reset preferences, lifestyle, and housing requirements back to clean default state
    await prisma.$transaction([
      prisma.profile.update({
        where: { userId: session.id },
        data: {
          bio: "",
          personalityTraits: [],
          preferredRoommateTraits: [],
          hobbies: [],
          aiSummary: null,
          profileCompletion: 30,
        },
      }),
      prisma.lifestyle.update({
        where: { userId: session.id },
        data: {
          cleanliness: 7,
          noiseTolerance: "MODERATE",
          smokingHabit: "NEVER",
          drinkingHabit: "NEVER",
          socialBehavior: "BALANCED",
        },
      }),
      prisma.roommatePreference.update({
        where: { userId: session.id },
        data: {
          preferredGender: "ANY",
          minCleanliness: 5,
          preferredSmoking: "NO_PREFERENCE",
        },
      }),
      prisma.dealBreaker.update({
        where: { userId: session.id },
        data: {
          noSmoking: false,
          noDrinking: false,
          noPets: false,
          noFrequentGuests: false,
          strictQuietHours: false,
          vegetarianKitchenOnly: false,
        },
      }),
    ]);

    return NextResponse.json({ message: "Preferences cleared and reset successfully." });
  } catch (error) {
    console.error("Reset profile error:", error);
    return NextResponse.json({ error: "Failed to reset preferences" }, { status: 500 });
  }
}
