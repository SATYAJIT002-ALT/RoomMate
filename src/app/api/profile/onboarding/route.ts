import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { generateAiProfileSummary } from "@/lib/ai-service";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    const {
      basic,
      verification,
      housing,
      lifestyle,
      roommatePref,
      personality,
      hobbies,
      genderCompatibility,
      dealBreakers,
    } = data;

    // 1. Update basic User info
    await prisma.user.update({
      where: { id: session.id },
      data: {
        fullName: basic?.fullName || session.fullName,
        city: basic?.city || session.city,
        gender: basic?.gender || session.gender,
        phone: basic?.phone || undefined,
        avatarUrl: basic?.avatarUrl || undefined,
      },
    });

    // 1.5. Save Student or Employee ID Verification document
    if (verification?.documentUrl && verification?.instituteName) {
      const formattedInstitute = verification.idNumber
        ? `${verification.instituteName.trim()} [ID: ${verification.idNumber.trim()}]`
        : verification.instituteName.trim();

      const existingVerif = await prisma.verification.findFirst({
        where: { userId: session.id, status: "PENDING" },
      });

      if (existingVerif) {
        await prisma.verification.update({
          where: { id: existingVerif.id },
          data: {
            type: verification.type === "COMPANY" ? "COMPANY" : "COLLEGE",
            instituteName: formattedInstitute,
            documentUrl: verification.documentUrl,
            status: "PENDING",
          },
        });
      } else {
        await prisma.verification.create({
          data: {
            userId: session.id,
            type: verification.type === "COMPANY" ? "COMPANY" : "COLLEGE",
            instituteName: formattedInstitute,
            documentUrl: verification.documentUrl,
            status: "PENDING",
          },
        });
      }
    }

    // 2. Update Profile (personality, hobbies, bio, occupation)
    await prisma.profile.upsert({
      where: { userId: session.id },
      update: {
        bio: basic?.bio || "",
        occupationStatus: basic?.occupationStatus || "STUDENT",
        collegeName: basic?.collegeName || null,
        companyName: basic?.companyName || null,
        preferredArea: basic?.preferredArea || null,
        personalityTraits: personality?.selfTraits || [],
        preferredRoommateTraits: personality?.preferredTraits || [],
        hobbies: hobbies?.items || [],
        profileCompletion: 100,
      },
      create: {
        userId: session.id,
        bio: basic?.bio || "",
        occupationStatus: basic?.occupationStatus || "STUDENT",
        collegeName: basic?.collegeName || null,
        companyName: basic?.companyName || null,
        preferredArea: basic?.preferredArea || null,
        personalityTraits: personality?.selfTraits || [],
        preferredRoommateTraits: personality?.preferredTraits || [],
        hobbies: hobbies?.items || [],
        profileCompletion: 100,
      },
    });

    // 3. Update Lifestyle (Actual habits)
    await prisma.lifestyle.upsert({
      where: { userId: session.id },
      update: {
        sleepSchedule: lifestyle?.sleepSchedule || "NORMAL",
        wakeUpSchedule: lifestyle?.wakeUpSchedule || "MORNING",
        cleanliness: Number(lifestyle?.cleanliness) || 7,
        noiseTolerance: lifestyle?.noiseTolerance || "MODERATE",
        guestFrequency: lifestyle?.guestFrequency || "SOMETIMES",
        wfhOrStudy: lifestyle?.wfhOrStudy || "SOMETIMES",
        cookingFrequency: lifestyle?.cookingFrequency || "SOMETIMES",
        foodPreference: lifestyle?.foodPreference || "NO_PREFERENCE",
        smokingHabit: lifestyle?.smokingHabit || "NEVER",
        drinkingHabit: lifestyle?.drinkingHabit || "NEVER",
        petOwnership: lifestyle?.petOwnership || "NO_PETS",
        acUsage: lifestyle?.acUsage || "SOMETIMES",
        socialBehavior: lifestyle?.socialBehavior || "BALANCED",
      },
      create: {
        user: { connect: { id: session.id } },
        sleepSchedule: lifestyle?.sleepSchedule || "NORMAL",
        wakeUpSchedule: lifestyle?.wakeUpSchedule || "MORNING",
        cleanliness: Number(lifestyle?.cleanliness) || 7,
        noiseTolerance: lifestyle?.noiseTolerance || "MODERATE",
        guestFrequency: lifestyle?.guestFrequency || "SOMETIMES",
        wfhOrStudy: lifestyle?.wfhOrStudy || "SOMETIMES",
        cookingFrequency: lifestyle?.cookingFrequency || "SOMETIMES",
        foodPreference: lifestyle?.foodPreference || "NO_PREFERENCE",
        smokingHabit: lifestyle?.smokingHabit || "NEVER",
        drinkingHabit: lifestyle?.drinkingHabit || "NEVER",
        petOwnership: lifestyle?.petOwnership || "NO_PETS",
        acUsage: lifestyle?.acUsage || "SOMETIMES",
        socialBehavior: lifestyle?.socialBehavior || "BALANCED",
      },
    });

    // 4. Update Roommate Preferences
    const parsePref = (val: any) => (val === "NOT_SET" || val === null || val === "" || val === undefined ? null : val);
    const parseNum = (val: any) => (val === null || val === undefined || val === "" ? null : Number(val));

    await prisma.roommatePreference.upsert({
      where: { userId: session.id },
      update: {
        preferredGender: parsePref(genderCompatibility?.preferredGender),
        comfortableWithGender: genderCompatibility?.comfortableWithGender || ["MALE", "FEMALE", "OTHER"],
        preferredSleepSchedule: parsePref(roommatePref?.preferredSleepSchedule),
        preferredSmoking: parsePref(roommatePref?.preferredSmoking),
        minCleanliness: parseNum(roommatePref?.minCleanliness),
        preferredNoise: parsePref(roommatePref?.preferredNoise),
        preferredGuests: parsePref(roommatePref?.preferredGuests),
        preferredPets: parsePref(roommatePref?.preferredPets),
        preferredFood: parsePref(roommatePref?.preferredFood),
        preferredDrinking: parsePref(roommatePref?.preferredDrinking),
        preferredOccupation: parsePref(roommatePref?.preferredOccupation),
        ageMin: parseNum(roommatePref?.ageMin),
        ageMax: parseNum(roommatePref?.ageMax),
      },
      create: {
        user: { connect: { id: session.id } },
        preferredGender: parsePref(genderCompatibility?.preferredGender),
        comfortableWithGender: genderCompatibility?.comfortableWithGender || ["MALE", "FEMALE", "OTHER"],
        preferredSleepSchedule: parsePref(roommatePref?.preferredSleepSchedule),
        preferredSmoking: parsePref(roommatePref?.preferredSmoking),
        minCleanliness: parseNum(roommatePref?.minCleanliness),
        preferredNoise: parsePref(roommatePref?.preferredNoise),
        preferredGuests: parsePref(roommatePref?.preferredGuests),
        preferredPets: parsePref(roommatePref?.preferredPets),
        preferredFood: parsePref(roommatePref?.preferredFood),
        preferredDrinking: parsePref(roommatePref?.preferredDrinking),
        preferredOccupation: parsePref(roommatePref?.preferredOccupation),
        ageMin: parseNum(roommatePref?.ageMin),
        ageMax: parseNum(roommatePref?.ageMax),
      },
    });

    // 5. Update Deal Breakers
    await prisma.dealBreaker.upsert({
      where: { userId: session.id },
      update: {
        noSmoking: Boolean(dealBreakers?.noSmoking),
        noDrinking: Boolean(dealBreakers?.noDrinking),
        noPets: Boolean(dealBreakers?.noPets),
        noFrequentGuests: Boolean(dealBreakers?.noFrequentGuests),
        noOppositeGender: Boolean(dealBreakers?.noOppositeGender),
        strictQuietHours: Boolean(dealBreakers?.strictQuietHours),
        strictCleanlinessMin: dealBreakers?.strictCleanlinessMin ? Number(dealBreakers.strictCleanlinessMin) : null,
        vegetarianKitchenOnly: Boolean(dealBreakers?.vegetarianKitchenOnly),
        strictMaxBudget: dealBreakers?.strictMaxBudget ? Number(dealBreakers.strictMaxBudget) : null,
      },
      create: {
        user: { connect: { id: session.id } },
        noSmoking: Boolean(dealBreakers?.noSmoking),
        noDrinking: Boolean(dealBreakers?.noDrinking),
        noPets: Boolean(dealBreakers?.noPets),
        noFrequentGuests: Boolean(dealBreakers?.noFrequentGuests),
        noOppositeGender: Boolean(dealBreakers?.noOppositeGender),
        strictQuietHours: Boolean(dealBreakers?.strictQuietHours),
        strictCleanlinessMin: dealBreakers?.strictCleanlinessMin ? Number(dealBreakers.strictCleanlinessMin) : null,
        vegetarianKitchenOnly: Boolean(dealBreakers?.vegetarianKitchenOnly),
        strictMaxBudget: dealBreakers?.strictMaxBudget ? Number(dealBreakers.strictMaxBudget) : null,
      },
    });

    // 6. Update Housing Requirements
    await prisma.housingRequirement.upsert({
      where: { userId: session.id },
      update: {
        city: housing?.city || basic?.city || "Kolkata",
        targetLocalities: housing?.targetLocalities || [],
        budgetMin: Number(housing?.budgetMin) || 3000,
        budgetMax: Number(housing?.budgetMax) || 15000,
        moveInDate: housing?.moveInDate ? new Date(housing.moveInDate) : null,
        rentalDuration: housing?.rentalDuration || "1 year",
        housingType: housing?.housingType || "ANY",
        roomType: housing?.roomType || "EITHER",
        requiredAmenities: housing?.requiredAmenities || [],
        furnishing: housing?.furnishing || "ANY",
      },
      create: {
        user: { connect: { id: session.id } },
        city: housing?.city || basic?.city || "Kolkata",
        targetLocalities: housing?.targetLocalities || [],
        budgetMin: Number(housing?.budgetMin) || 3000,
        budgetMax: Number(housing?.budgetMax) || 15000,
        moveInDate: housing?.moveInDate ? new Date(housing.moveInDate) : null,
        rentalDuration: housing?.rentalDuration || "1 year",
        housingType: housing?.housingType || "ANY",
        roomType: housing?.roomType || "EITHER",
        requiredAmenities: housing?.requiredAmenities || [],
        furnishing: housing?.furnishing || "ANY",
      },
    });

    // Generate AI Summary
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

    return NextResponse.json({
      message: "Onboarding completed successfully! Your roommate profile is ready.",
      profileCompletion: 100,
    });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json({ error: "Failed to save onboarding data" }, { status: 500 });
  }
}
