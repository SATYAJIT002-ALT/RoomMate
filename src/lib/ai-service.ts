import { CompatibilityReport, UserFullData } from "@/types";

/**
 * Generates an accurate AI profile summary strictly based on real user data
 */
export function generateAiProfileSummary(user: UserFullData): string {
  const profile = user.profile;
  const life = user.lifestyle;
  const house = user.housingReq;

  const parts: string[] = [];

  // Occupation & City
  if (profile?.occupationStatus === "STUDENT" && profile.collegeName) {
    parts.push(`A student at ${profile.collegeName}`);
  } else if (profile?.occupationStatus === "WORKING_PROFESSIONAL" && profile.companyName) {
    parts.push(`A professional working at ${profile.companyName}`);
  } else if (profile?.occupationStatus === "WORKING_PROFESSIONAL") {
    parts.push(`A working professional`);
  } else {
    parts.push(`An individual`);
  }

  parts.push(`based in ${user.city}`);

  // Lifestyle traits
  if (life) {
    const sleepMap: Record<string, string> = {
      NIGHT_OWL: "keeps a night owl routine",
      EARLY_SLEEPER: "prefers early mornings",
      NORMAL: "follows a regular daily schedule",
      FLEXIBLE: "has a flexible schedule",
      IRREGULAR: "has varied study/work hours",
    };
    parts.push(`who ${sleepMap[life.sleepSchedule] || "has a balanced schedule"}`);

    if (life.smokingHabit === "NEVER") {
      parts.push(`is a non-smoker`);
    } else if (life.smokingHabit === "OCCASIONALLY") {
      parts.push(`occasionally smokes`);
    }

    if (life.cleanliness >= 8) {
      parts.push(`values high cleanliness (${life.cleanliness}/10)`);
    } else if (life.cleanliness <= 5) {
      parts.push(`has a relaxed approach to tidiness`);
    }

    if (life.noiseTolerance === "QUIET" || life.noiseTolerance === "VERY_QUIET") {
      parts.push(`prefers a peaceful and quiet atmosphere`);
    }
  }

  // Personality traits
  if (profile?.personalityTraits && profile.personalityTraits.length > 0) {
    parts.push(`characterized as ${profile.personalityTraits.slice(0, 3).join(", ").toLowerCase()}`);
  }

  // Hobbies
  if (profile?.hobbies && profile.hobbies.length > 0) {
    parts.push(`enjoys ${profile.hobbies.slice(0, 3).join(", ").toLowerCase()}`);
  }

  // Housing requirements
  if (house) {
    parts.push(`seeking a ${house.roomType.toLowerCase()} room in ${house.city} within ₹${house.budgetMin.toLocaleString()} - ₹${house.budgetMax.toLocaleString()}/month.`);
  } else {
    parts.push(`looking for a compatible shared living space.`);
  }

  return parts.join(", ").replace(/, ([^,]*)$/, " and $1");
}

/**
 * Generates an explainable AI match narrative from real compatibility breakdown
 */
export function generateAiMatchNarrative(report: CompatibilityReport): string {
  const user = report.targetUser;
  if (report.isDealBreakerViolated) {
    return `Compatibility is flagged because of strict deal breaker criteria: ${report.dealBreakerReasons.join("; ")}. Direct matching is not recommended unless preferences are relaxed.`;
  }

  if (!report.isGenderCompatible) {
    return `This match does not align with mutual gender preferences (${report.genderCompatibilityReason}).`;
  }

  const lines: string[] = [];
  lines.push(`You and ${user.fullName} have a **${report.overallScore}% compatibility rating**.`);

  if (report.strengths.length > 0) {
    lines.push(`Your strongest points of alignment are: ${report.strengths.slice(0, 3).join(", ")}.`);
  }

  if (report.differences.length > 0) {
    lines.push(`Points to be mindful of: ${report.differences.slice(0, 2).join(", ")}.`);
  }

  if (report.categoryScores.lifestyle >= 80) {
    lines.push(`Your everyday living rhythms and home habits complement each other exceptionally well.`);
  }

  return lines.join(" ");
}

/**
 * Enhances listing descriptions based on real structured amenities
 */
export function generateListingDescription(data: {
  title: string;
  city: string;
  locality: string;
  roomType: string;
  housingType: string;
  monthlyRent: number;
  amenities: string[];
  houseRules: string[];
}): string {
  const amText = data.amenities.length > 0 ? `Amenities include ${data.amenities.join(", ")}.` : "";
  const ruleText = data.houseRules.length > 0 ? `House guidelines: ${data.houseRules.join(", ")}.` : "";
  
  return `Spacious ${data.roomType.toLowerCase()} room available in a well-maintained ${data.housingType.toLowerCase()} located in ${data.locality}, ${data.city}. 
Rent is ₹${data.monthlyRent.toLocaleString()}/month. ${amText} Looking for clean, respectful, and cooperative roommates. ${ruleText}`.trim();
}
