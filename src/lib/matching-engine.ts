import { UserFullData, CompatibilityReport, CompatibilityCategoryScores } from "@/types";

/**
 * CORE BIDIRECTIONAL MATCHING ENGINE FOR ROOMMATE
 * Evaluates compatibility from both directions:
 * Direction 1: User A's preferences -> User B's actual lifestyle
 * Direction 2: User B's preferences -> User A's actual lifestyle
 * Direction 3: User A's lifestyle <-> User B's lifestyle
 * Direction 4: Mutual Gender Comfort
 * Direction 5: Deal Breakers (Hard Disqualifier)
 * Direction 6: Housing & Budget alignment
 * Direction 7: Personality & Hobbies
 */
export function calculateCompatibility(
  userA: UserFullData,
  userB: UserFullData
): CompatibilityReport {
  const strengths: string[] = [];
  const differences: string[] = [];
  const dealBreakerReasons: string[] = [];

  // ==========================================
  // 1. GENDER COMPATIBILITY (MUTUAL)
  // ==========================================
  let isGenderCompatible = true;
  let genderCompatibilityReason = "Mutually compatible gender preferences";

  const genderA = userA.gender;
  const genderB = userB.gender;

  const prefA = userA.roommatePref;
  const prefB = userB.roommatePref;

  // Check A's comfort with B's gender
  if (prefA && genderB !== "PREFER_NOT_TO_SAY") {
    if (prefA.preferredGender !== "ANY" && prefA.preferredGender !== genderB) {
      isGenderCompatible = false;
      genderCompatibilityReason = `${userA.fullName} prefers ${prefA.preferredGender.toLowerCase()} roommates.`;
    }
    if (prefA.comfortableWithGender && prefA.comfortableWithGender.length > 0) {
      if (!prefA.comfortableWithGender.includes(genderB) && !prefA.comfortableWithGender.includes("ANY")) {
        isGenderCompatible = false;
        genderCompatibilityReason = `${userA.fullName} is not comfortable sharing with ${genderB.toLowerCase()} roommates.`;
      }
    }
  }

  // Check B's comfort with A's gender
  if (prefB && genderA !== "PREFER_NOT_TO_SAY") {
    if (prefB.preferredGender !== "ANY" && prefB.preferredGender !== genderA) {
      isGenderCompatible = false;
      genderCompatibilityReason = `${userB.fullName} prefers ${prefB.preferredGender.toLowerCase()} roommates.`;
    }
    if (prefB.comfortableWithGender && prefB.comfortableWithGender.length > 0) {
      if (!prefB.comfortableWithGender.includes(genderA) && !prefB.comfortableWithGender.includes("ANY")) {
        isGenderCompatible = false;
        genderCompatibilityReason = `${userB.fullName} is not comfortable sharing with ${genderA.toLowerCase()} roommates.`;
      }
    }
  }

  if (isGenderCompatible) {
    strengths.push("✓ Mutually compatible gender preferences");
  }

  // ==========================================
  // 2. DEAL BREAKERS (HARD FILTER)
  // ==========================================
  const dbA = userA.dealBreakers;
  const dbB = userB.dealBreakers;
  const lifeA = userA.lifestyle;
  const lifeB = userB.lifestyle;
  const houseA = userA.housingReq;
  const houseB = userB.housingReq;

  let isDealBreakerViolated = false;

  // Check User A's Deal Breakers against User B's actual habits
  if (dbA && lifeB) {
    if (dbA.noSmoking && lifeB.smokingHabit !== "NEVER") {
      isDealBreakerViolated = true;
      dealBreakerReasons.push(`${userA.fullName} has a strict no-smoking deal breaker.`);
    }
    if (dbA.noDrinking && lifeB.drinkingHabit !== "NEVER") {
      isDealBreakerViolated = true;
      dealBreakerReasons.push(`${userA.fullName} has a strict no-alcohol deal breaker.`);
    }
    if (dbA.noPets && lifeB.petOwnership !== "NO_PETS") {
      isDealBreakerViolated = true;
      dealBreakerReasons.push(`${userA.fullName} cannot live with pets.`);
    }
    if (dbA.noFrequentGuests && lifeB.guestFrequency === "FREQUENTLY") {
      isDealBreakerViolated = true;
      dealBreakerReasons.push(`${userA.fullName} cannot accommodate frequent guests.`);
    }
    if (dbA.strictQuietHours && lifeB.noiseTolerance === "DOESNT_MATTER") {
      isDealBreakerViolated = true;
      dealBreakerReasons.push(`${userA.fullName} requires strict quiet study hours.`);
    }
    if (dbA.strictCleanlinessMin && lifeB.cleanliness < dbA.strictCleanlinessMin) {
      isDealBreakerViolated = true;
      dealBreakerReasons.push(`${userA.fullName} requires minimum cleanliness of ${dbA.strictCleanlinessMin}/10 (User is ${lifeB.cleanliness}/10).`);
    }
    if (dbA.vegetarianKitchenOnly) {
      if (lifeB.foodPreference === "NON_VEGETARIAN" && !dbB?.vegetarianKitchenOnly) {
        isDealBreakerViolated = true;
        dealBreakerReasons.push(`${userA.fullName} requires a strictly vegetarian kitchen.`);
      } else if (lifeB.foodPreference === "VEGETARIAN" || lifeB.foodPreference === "VEGAN" || dbB?.vegetarianKitchenOnly) {
        strengths.push("✓ Mutually agree on a strictly vegetarian kitchen");
      }
    }
  }

  // Check User B's Deal Breakers against User A's actual habits
  if (dbB && lifeA) {
    if (dbB.noSmoking && lifeA.smokingHabit !== "NEVER") {
      isDealBreakerViolated = true;
      dealBreakerReasons.push(`${userB.fullName} has a strict no-smoking deal breaker.`);
    }
    if (dbB.noDrinking && lifeA.drinkingHabit !== "NEVER") {
      isDealBreakerViolated = true;
      dealBreakerReasons.push(`${userB.fullName} has a strict no-alcohol deal breaker.`);
    }
    if (dbB.noPets && lifeA.petOwnership !== "NO_PETS") {
      isDealBreakerViolated = true;
      dealBreakerReasons.push(`${userB.fullName} cannot live with pets.`);
    }
    if (dbB.noFrequentGuests && lifeA.guestFrequency === "FREQUENTLY") {
      isDealBreakerViolated = true;
      dealBreakerReasons.push(`${userB.fullName} cannot accommodate frequent guests.`);
    }
    if (dbB.strictQuietHours && lifeA.noiseTolerance === "DOESNT_MATTER") {
      isDealBreakerViolated = true;
      dealBreakerReasons.push(`${userB.fullName} requires strict quiet study hours.`);
    }
    if (dbB.strictCleanlinessMin && lifeA.cleanliness < dbB.strictCleanlinessMin) {
      isDealBreakerViolated = true;
      dealBreakerReasons.push(`${userB.fullName} requires minimum cleanliness of ${dbB.strictCleanlinessMin}/10.`);
    }
    if (dbB.vegetarianKitchenOnly) {
      if (lifeA.foodPreference === "NON_VEGETARIAN" && !dbA?.vegetarianKitchenOnly) {
        isDealBreakerViolated = true;
        dealBreakerReasons.push(`${userB.fullName} requires a strictly vegetarian kitchen.`);
      }
    }
  }

  // Deal breaker for opposite gender
  if (dbA?.noOppositeGender && genderA !== genderB && genderB !== "PREFER_NOT_TO_SAY") {
    isDealBreakerViolated = true;
    dealBreakerReasons.push(`${userA.fullName} specified same-gender roommates only.`);
  }
  if (dbB?.noOppositeGender && genderA !== genderB && genderA !== "PREFER_NOT_TO_SAY") {
    isDealBreakerViolated = true;
    dealBreakerReasons.push(`${userB.fullName} specified same-gender roommates only.`);
  }

  // ==========================================
  // 3. LIFESTYLE COMPATIBILITY (25% WEIGHT)
  // Evaluates both directions + mutual lifestyle coexistence
  // ==========================================
  let lifestyleScore = 80;
  let directionAtoBScore = 80;
  let directionBtoAScore = 80;

  if (lifeA && lifeB) {
    let rawLifestylePoints = 0;
    let maxLifestylePoints = 0;

    // Sleep schedule similarity
    if (lifeA.sleepSchedule && lifeB.sleepSchedule) {
      maxLifestylePoints += 25;
      if (lifeA.sleepSchedule === lifeB.sleepSchedule) {
        rawLifestylePoints += 25;
        strengths.push(`✓ Synchronized sleep schedule (${lifeA.sleepSchedule.replace(/_/g, " ").toLowerCase()})`);
      } else if (
        lifeA.sleepSchedule === "FLEXIBLE" ||
        lifeB.sleepSchedule === "FLEXIBLE" ||
        (lifeA.sleepSchedule === "NORMAL" && (lifeB.sleepSchedule === "EARLY_SLEEPER" || lifeB.sleepSchedule === "NIGHT_OWL"))
      ) {
        rawLifestylePoints += 18;
      } else {
        rawLifestylePoints += 6;
        differences.push(`⚠ Different sleep schedules (${lifeA.sleepSchedule.replace(/_/g, " ").toLowerCase()} vs ${lifeB.sleepSchedule.replace(/_/g, " ").toLowerCase()})`);
      }
    }

    // Cleanliness compatibility (1-10)
    if (lifeA.cleanliness != null && lifeB.cleanliness != null) {
      maxLifestylePoints += 25;
      const cleanDiff = Math.abs(lifeA.cleanliness - lifeB.cleanliness);
      if (cleanDiff <= 1) {
        rawLifestylePoints += 25;
        strengths.push(`✓ Very close cleanliness expectations (${lifeA.cleanliness}/10 vs ${lifeB.cleanliness}/10)`);
      } else if (cleanDiff <= 3) {
        rawLifestylePoints += 18;
      } else {
        rawLifestylePoints += Math.max(0, 25 - cleanDiff * 4);
        differences.push(`⚠ Noticeable cleanliness difference (${lifeA.cleanliness}/10 vs ${lifeB.cleanliness}/10)`);
      }
    }

    // Noise tolerance
    if (lifeA.noiseTolerance && lifeB.noiseTolerance) {
      maxLifestylePoints += 20;
      if (lifeA.noiseTolerance === lifeB.noiseTolerance) {
        rawLifestylePoints += 20;
        if (lifeA.noiseTolerance === "QUIET" || lifeA.noiseTolerance === "VERY_QUIET") {
          strengths.push("✓ Both prefer a quiet, calm living environment");
        }
      } else if (
        (lifeA.noiseTolerance === "MODERATE" && lifeB.noiseTolerance === "QUIET") ||
        (lifeB.noiseTolerance === "MODERATE" && lifeA.noiseTolerance === "QUIET")
      ) {
        rawLifestylePoints += 15;
      } else {
        rawLifestylePoints += 5;
        differences.push("⚠ Noise sensitivity preferences differ");
      }
    }

    // Social behavior (Introversion / Extroversion balance)
    if (lifeA.socialBehavior && lifeB.socialBehavior) {
      maxLifestylePoints += 15;
      if (lifeA.socialBehavior === lifeB.socialBehavior) {
        rawLifestylePoints += 15;
        strengths.push(`✓ Complementary social nature (${lifeA.socialBehavior.replace(/_/g, " ").toLowerCase()})`);
      } else {
        rawLifestylePoints += 10;
      }
    }

    // AC usage & Work from home
    if (lifeA.acUsage && lifeB.acUsage) {
      maxLifestylePoints += 8;
      if (lifeA.acUsage === lifeB.acUsage) rawLifestylePoints += 8;
      else rawLifestylePoints += 4;
    }

    if (lifeA.wfhOrStudy && lifeB.wfhOrStudy) {
      maxLifestylePoints += 7;
      if (lifeA.wfhOrStudy === lifeB.wfhOrStudy) rawLifestylePoints += 7;
      else rawLifestylePoints += 4;
    }

    lifestyleScore = maxLifestylePoints > 0 ? Math.round((rawLifestylePoints / maxLifestylePoints) * 100) : 80;

    // Direction A -> B Preference Check
    let dirAtoBPoints = 0;
    let dirAtoBMax = 0;
    if (prefA) {
      if (prefA.preferredSleepSchedule && prefA.preferredSleepSchedule !== "NOT_SET") {
        dirAtoBMax += 20;
        if (prefA.preferredSleepSchedule === "ANY" || prefA.preferredSleepSchedule === "NO_PREFERENCE" || prefA.preferredSleepSchedule === "DOESNT_MATTER") {
          dirAtoBPoints += 20;
        } else if (lifeB.sleepSchedule) {
          if (prefA.preferredSleepSchedule === lifeB.sleepSchedule) dirAtoBPoints += 20;
          else if (prefA.preferredSleepSchedule === "FLEXIBLE" || lifeB.sleepSchedule === "FLEXIBLE") dirAtoBPoints += 12;
          else dirAtoBPoints += 5;
        } else {
          dirAtoBPoints += 15;
        }
      }
      if (prefA.minCleanliness != null) {
        dirAtoBMax += 20;
        if (lifeB.cleanliness != null) {
          if (lifeB.cleanliness >= prefA.minCleanliness) dirAtoBPoints += 20;
          else dirAtoBPoints += Math.max(0, 20 - (prefA.minCleanliness - lifeB.cleanliness) * 6);
        } else {
          dirAtoBPoints += 15;
        }
      }
      if (prefA.preferredSmoking && prefA.preferredSmoking !== "NOT_SET") {
        dirAtoBMax += 20;
        if (prefA.preferredSmoking === "ANY" || prefA.preferredSmoking === "NO_PREFERENCE" || prefA.preferredSmoking === "DOESNT_MATTER") {
          dirAtoBPoints += 20;
        } else if (prefA.preferredSmoking === "NON_SMOKER_ONLY" && lifeB.smokingHabit === "NEVER") {
          dirAtoBPoints += 20;
        } else if (prefA.preferredSmoking === "OCCASIONAL_OK" && lifeB.smokingHabit !== "FREQUENTLY") {
          dirAtoBPoints += 18;
        } else if (prefA.preferredSmoking === "SMOKER_OK") {
          dirAtoBPoints += 20;
        } else {
          dirAtoBPoints += 5;
        }
      }
    }
    directionAtoBScore = dirAtoBMax > 0 ? Math.round((dirAtoBPoints / dirAtoBMax) * 100) : lifestyleScore;

    // Direction B -> A Preference Check
    let dirBtoAPoints = 0;
    let dirBtoAMax = 0;
    if (prefB) {
      if (prefB.preferredSleepSchedule && prefB.preferredSleepSchedule !== "NOT_SET") {
        dirBtoAMax += 20;
        if (prefB.preferredSleepSchedule === "ANY" || prefB.preferredSleepSchedule === "NO_PREFERENCE" || prefB.preferredSleepSchedule === "DOESNT_MATTER") {
          dirBtoAPoints += 20;
        } else if (lifeA.sleepSchedule) {
          if (prefB.preferredSleepSchedule === lifeA.sleepSchedule) dirBtoAPoints += 20;
          else if (prefB.preferredSleepSchedule === "FLEXIBLE" || lifeA.sleepSchedule === "FLEXIBLE") dirBtoAPoints += 12;
          else dirBtoAPoints += 5;
        } else {
          dirBtoAPoints += 15;
        }
      }
      if (prefB.minCleanliness != null) {
        dirBtoAMax += 20;
        if (lifeA.cleanliness != null) {
          if (lifeA.cleanliness >= prefB.minCleanliness) dirBtoAPoints += 20;
          else dirBtoAPoints += Math.max(0, 20 - (prefB.minCleanliness - lifeA.cleanliness) * 6);
        } else {
          dirBtoAPoints += 15;
        }
      }
      if (prefB.preferredSmoking && prefB.preferredSmoking !== "NOT_SET") {
        dirBtoAMax += 20;
        if (prefB.preferredSmoking === "ANY" || prefB.preferredSmoking === "NO_PREFERENCE" || prefB.preferredSmoking === "DOESNT_MATTER") {
          dirBtoAPoints += 20;
        } else if (prefB.preferredSmoking === "NON_SMOKER_ONLY" && lifeA.smokingHabit === "NEVER") {
          dirBtoAPoints += 20;
        } else if (prefB.preferredSmoking === "OCCASIONAL_OK" && lifeA.smokingHabit !== "FREQUENTLY") {
          dirBtoAPoints += 18;
        } else if (prefB.preferredSmoking === "SMOKER_OK") {
          dirBtoAPoints += 20;
        } else {
          dirBtoAPoints += 5;
        }
      }
    }
    directionBtoAScore = dirBtoAMax > 0 ? Math.round((dirBtoAPoints / dirBtoAMax) * 100) : lifestyleScore;

    // Blend bidirectional evaluations with mutual lifestyle
    lifestyleScore = Math.round((lifestyleScore * 0.4) + (directionAtoBScore * 0.3) + (directionBtoAScore * 0.3));
  }

  // ==========================================
  // 4. BUDGET & LOCATION COMPATIBILITY (20% WEIGHT)
  // ==========================================
  let budgetLocationScore = 75;
  if (houseA && houseB) {
    let bPts = 0;
    let bMax = 100;

    // City match
    if (houseA.city.toLowerCase().trim() === houseB.city.toLowerCase().trim()) {
      bPts += 40;
      strengths.push(`✓ Same target city (${houseA.city})`);
      
      // Locality intersection
      const commonLocalities = houseA.targetLocalities.filter((loc) =>
        houseB.targetLocalities.some((l2) => l2.toLowerCase().trim() === loc.toLowerCase().trim())
      );
      if (commonLocalities.length > 0) {
        bPts += 20;
        strengths.push(`✓ Overlapping target localities: ${commonLocalities.join(", ")}`);
      } else {
        bPts += 10;
      }
    } else {
      bPts += 5;
      differences.push(`⚠ Different preferred cities (${houseA.city} vs ${houseB.city})`);
    }

    // Budget overlap calculation
    const minOverlap = Math.max(houseA.budgetMin, houseB.budgetMin);
    const maxOverlap = Math.min(houseA.budgetMax, houseB.budgetMax);

    if (minOverlap <= maxOverlap) {
      bPts += 40;
      strengths.push(`✓ Highly compatible budgets (Overlapping range ₹${minOverlap.toLocaleString()} - ₹${maxOverlap.toLocaleString()})`);
    } else {
      const gap = minOverlap - maxOverlap;
      if (gap <= 3000) {
        bPts += 20;
        differences.push(`⚠ Slight budget difference (Approx. ₹${gap.toLocaleString()} gap)`);
      } else {
        bPts += 5;
        differences.push(`⚠ Significant budget mismatch (₹${houseA.budgetMin}-₹${houseA.budgetMax} vs ₹${houseB.budgetMin}-₹${houseB.budgetMax})`);
      }
    }

    budgetLocationScore = Math.min(100, Math.round((bPts / bMax) * 100));
  }

  // ==========================================
  // 5. PERSONALITY & NATURE (15% WEIGHT)
  // ==========================================
  let personalityScore = 70;
  const pA = userA.profile?.personalityTraits || [];
  const pB = userB.profile?.personalityTraits || [];
  const wantA = userA.profile?.preferredRoommateTraits || [];
  const wantB = userB.profile?.preferredRoommateTraits || [];

  let pPoints = 0;
  let pMax = 50;

  // Does B match what A wants?
  const aWantsMatched = wantA.filter((w) => pB.some((b) => b.toLowerCase() === w.toLowerCase()));
  if (aWantsMatched.length > 0) {
    pPoints += Math.min(25, aWantsMatched.length * 8);
    strengths.push(`✓ Matches your preferred traits: ${aWantsMatched.join(", ")}`);
  } else {
    pPoints += 10;
  }

  // Does A match what B wants?
  const bWantsMatched = wantB.filter((w) => pA.some((a) => a.toLowerCase() === w.toLowerCase()));
  if (bWantsMatched.length > 0) {
    pPoints += Math.min(25, bWantsMatched.length * 8);
  } else {
    pPoints += 10;
  }

  personalityScore = Math.min(100, Math.round((pPoints / pMax) * 100));

  // ==========================================
  // 6. HABITS / FOOD / PETS / GUESTS (15% WEIGHT)
  // ==========================================
  let habitsFoodScore = 80;
  if (lifeA && lifeB) {
    let hPts = 0;
    let hMax = 80;

    // Smoking
    if (lifeA.smokingHabit === "NEVER" && lifeB.smokingHabit === "NEVER") {
      hPts += 20;
      strengths.push("✓ Both non-smokers");
    } else if (lifeA.smokingHabit === lifeB.smokingHabit) {
      hPts += 16;
    } else {
      hPts += 8;
      differences.push("⚠ Different smoking habits");
    }

    // Food Preference
    if (lifeA.foodPreference === lifeB.foodPreference) {
      hPts += 20;
      if (lifeA.foodPreference === "VEGETARIAN") {
        strengths.push("✓ Both prefer a vegetarian diet");
      }
    } else if (lifeA.foodPreference === "NO_PREFERENCE" || lifeB.foodPreference === "NO_PREFERENCE") {
      hPts += 16;
    } else {
      hPts += 10;
    }

    // Guests
    if (lifeA.guestFrequency === lifeB.guestFrequency) {
      hPts += 20;
    } else if (
      (lifeA.guestFrequency === "SOMETIMES" && lifeB.guestFrequency === "RARELY") ||
      (lifeB.guestFrequency === "SOMETIMES" && lifeA.guestFrequency === "RARELY")
    ) {
      hPts += 15;
    } else {
      hPts += 6;
      differences.push("⚠ Different expectations around having guests over");
    }

    // Pets
    if (lifeA.petOwnership === "NO_PETS" && lifeB.petOwnership === "NO_PETS") {
      hPts += 20;
    } else if (lifeA.petOwnership === lifeB.petOwnership) {
      hPts += 20;
      strengths.push("✓ Both comfortable with pets");
    } else {
      hPts += 12;
    }

    habitsFoodScore = Math.min(100, Math.round((hPts / hMax) * 100));
  }

  // ==========================================
  // 7. HOUSING REQUIREMENTS (15% WEIGHT)
  // ==========================================
  let housingScore = 75;
  if (houseA && houseB) {
    let hrPts = 0;
    let hrMax = 60;

    // Housing type (Apartment, PG, Flat, etc.)
    if (houseA.housingType === "ANY" || houseB.housingType === "ANY" || houseA.housingType === houseB.housingType) {
      hrPts += 20;
      if (houseA.housingType === houseB.housingType && houseA.housingType !== "ANY") {
        strengths.push(`✓ Both looking for ${houseA.housingType.toLowerCase()}`);
      }
    } else {
      hrPts += 8;
    }

    // Room type (Private vs Shared)
    if (houseA.roomType === "EITHER" || houseB.roomType === "EITHER" || houseA.roomType === houseB.roomType) {
      hrPts += 20;
      if (houseA.roomType === houseB.roomType && houseA.roomType !== "EITHER") {
        strengths.push(`✓ Agreed on ${houseA.roomType.toLowerCase()} room preference`);
      }
    } else {
      hrPts += 6;
      differences.push(`⚠ Room preference difference (${houseA.roomType.toLowerCase()} vs ${houseB.roomType.toLowerCase()})`);
    }

    // Amenities overlap
    const commonAmenities = (houseA.requiredAmenities || []).filter((am) =>
      (houseB.requiredAmenities || []).includes(am)
    );
    if (commonAmenities.length > 0) {
      hrPts += 20;
    } else {
      hrPts += 12;
    }

    housingScore = Math.min(100, Math.round((hrPts / hrMax) * 100));
  }

  // ==========================================
  // 8. HOBBIES & INTERESTS (10% WEIGHT - SOFT BONUS)
  // ==========================================
  let hobbiesScore = 50;
  const hA = userA.profile?.hobbies || [];
  const hB = userB.profile?.hobbies || [];

  const commonHobbies = hA.filter((hobby) =>
    hB.some((hb) => hb.toLowerCase().trim() === hobby.toLowerCase().trim())
  );

  if (commonHobbies.length > 0) {
    hobbiesScore = Math.min(100, 50 + commonHobbies.length * 15);
    strengths.push(`✓ Shared hobbies & interests: ${commonHobbies.join(", ")}`);
  } else {
    hobbiesScore = 50; // Neutral base score, not penalized harshly
  }

  // ==========================================
  // 9. OVERALL WEIGHTED CALCULATION
  // Formula:
  // Lifestyle (25%) + Budget/Location (20%) + Personality (15%) + Habits (15%) + Housing (15%) + Hobbies (10%)
  // ==========================================
  const categoryScores: CompatibilityCategoryScores = {
    lifestyle: Math.round(lifestyleScore),
    budgetLocation: Math.round(budgetLocationScore),
    personality: Math.round(personalityScore),
    habitsFood: Math.round(habitsFoodScore),
    housing: Math.round(housingScore),
    hobbies: Math.round(hobbiesScore),
  };

  let overallScore = Math.round(
    categoryScores.lifestyle * 0.25 +
    categoryScores.budgetLocation * 0.20 +
    categoryScores.personality * 0.15 +
    categoryScores.habitsFood * 0.15 +
    categoryScores.housing * 0.15 +
    categoryScores.hobbies * 0.10
  );

  // Proportional adjustment if deal breaker is flagged
  if (isDealBreakerViolated) {
    overallScore = Math.max(15, overallScore - 10);
  }
  if (!isGenderCompatible) {
    overallScore = Math.max(10, overallScore - 10);
  }

  return {
    targetUserId: userB.id,
    targetUser: userB,
    overallScore,
    isDealBreakerViolated,
    dealBreakerReasons,
    isGenderCompatible,
    genderCompatibilityReason,
    categoryScores,
    strengths,
    differences,
    directionAtoBScore,
    directionBtoAScore,
    mutualLifestyleScore: lifestyleScore,
  };
}
