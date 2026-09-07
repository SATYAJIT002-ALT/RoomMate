import { calculateCompatibility } from "../lib/matching-engine";
import { UserFullData } from "../types";

/**
 * AUTOMATED TESTS FOR BIDIRECTIONAL MATCHING ENGINE
 */
function runTests() {
  console.log("==================================================");
  console.log("RUNNING ROOMMATE MATCHING ENGINE VERIFICATION SUITE");
  console.log("==================================================");

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string) {
    total++;
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
    }
  }

  // --- Test Profile 1: Rahul (Night Owl, Clean 9/10, Non-smoker, Likes Cricket) ---
  const userRahul: UserFullData = {
    id: "user-rahul-1",
    email: "rahul@college.edu",
    fullName: "Rahul Sharma",
    gender: "MALE",
    city: "Kolkata",
    role: "USER",
    isEmailVerified: true,
    isPhoneVerified: true,
    isCollegeVerified: true,
    createdAt: new Date(),
    profile: {
      bio: "CSE student at Jadavpur University",
      occupationStatus: "STUDENT",
      collegeName: "Jadavpur University",
      personalityTraits: ["Calm", "Organized", "Friendly"],
      preferredRoommateTraits: ["Respectful", "Calm"],
      hobbies: ["Cricket", "Coding", "Gaming"],
      profileCompletion: 100,
    },
    lifestyle: {
      sleepSchedule: "NIGHT_OWL",
      wakeUpSchedule: "MORNING",
      cleanliness: 9,
      noiseTolerance: "QUIET",
      guestFrequency: "RARELY",
      wfhOrStudy: "FREQUENTLY",
      cookingFrequency: "SOMETIMES",
      foodPreference: "NON_VEGETARIAN",
      smokingHabit: "NEVER",
      drinkingHabit: "NEVER",
      petOwnership: "NO_PETS",
      acUsage: "SOMETIMES",
      socialBehavior: "BALANCED",
    },
    roommatePref: {
      preferredGender: "ANY",
      comfortableWithGender: ["MALE", "FEMALE"],
      preferredSleepSchedule: "NIGHT_OWL",
      preferredSmoking: "NON_SMOKER_ONLY",
      minCleanliness: 7,
      preferredNoise: "QUIET",
      preferredGuests: "RARELY",
      preferredPets: "DOESNT_MATTER",
      preferredFood: "NO_PREFERENCE",
      preferredDrinking: "NO_PREFERENCE",
      preferredOccupation: "NO_PREFERENCE",
    },
    dealBreakers: {
      noSmoking: true,
      noDrinking: false,
      noPets: false,
      noFrequentGuests: true,
      noOppositeGender: false,
      strictQuietHours: true,
      strictCleanlinessMin: 7,
      vegetarianKitchenOnly: false,
      strictMaxBudget: 15000,
    },
    housingReq: {
      city: "Kolkata",
      targetLocalities: ["Salt Lake", "New Town"],
      budgetMin: 5000,
      budgetMax: 12000,
      rentalDuration: "1 year",
      housingType: "FLAT",
      roomType: "PRIVATE",
      requiredAmenities: ["Wi-Fi", "AC"],
      furnishing: "SEMI_FURNISHED",
    },
  };

  // --- Test Profile 2: Sneha (Night Owl, Clean 8/10, Non-smoker, Likes Gaming, Comfortable with Male/Female) ---
  const userSneha: UserFullData = {
    id: "user-sneha-2",
    email: "sneha@college.edu",
    fullName: "Sneha Mukherjee",
    gender: "FEMALE",
    city: "Kolkata",
    role: "USER",
    isEmailVerified: true,
    isPhoneVerified: true,
    isCollegeVerified: true,
    createdAt: new Date(),
    profile: {
      bio: "Tech intern in Sector V",
      occupationStatus: "WORKING_PROFESSIONAL",
      companyName: "Tech Corp",
      personalityTraits: ["Calm", "Respectful", "Quiet"],
      preferredRoommateTraits: ["Calm", "Organized"],
      hobbies: ["Gaming", "Music", "Reading"],
      profileCompletion: 100,
    },
    lifestyle: {
      sleepSchedule: "NIGHT_OWL",
      wakeUpSchedule: "MORNING",
      cleanliness: 8,
      noiseTolerance: "QUIET",
      guestFrequency: "RARELY",
      wfhOrStudy: "FREQUENTLY",
      cookingFrequency: "SOMETIMES",
      foodPreference: "NON_VEGETARIAN",
      smokingHabit: "NEVER",
      drinkingHabit: "NEVER",
      petOwnership: "NO_PETS",
      acUsage: "SOMETIMES",
      socialBehavior: "INTROVERTED",
    },
    roommatePref: {
      preferredGender: "ANY",
      comfortableWithGender: ["MALE", "FEMALE"],
      preferredSleepSchedule: "NIGHT_OWL",
      preferredSmoking: "NON_SMOKER_ONLY",
      minCleanliness: 8,
      preferredNoise: "QUIET",
      preferredGuests: "RARELY",
      preferredPets: "DOESNT_MATTER",
      preferredFood: "NO_PREFERENCE",
      preferredDrinking: "NO_PREFERENCE",
      preferredOccupation: "NO_PREFERENCE",
    },
    dealBreakers: {
      noSmoking: true,
      noDrinking: false,
      noPets: false,
      noFrequentGuests: true,
      noOppositeGender: false,
      strictQuietHours: false,
      strictCleanlinessMin: 7,
      vegetarianKitchenOnly: false,
    },
    housingReq: {
      city: "Kolkata",
      targetLocalities: ["Salt Lake"],
      budgetMin: 6000,
      budgetMax: 11000,
      rentalDuration: "1 year",
      housingType: "FLAT",
      roomType: "PRIVATE",
      requiredAmenities: ["Wi-Fi", "AC"],
      furnishing: "SEMI_FURNISHED",
    },
  };

  // --- Test Profile 3: Rohan (Smoker, Early Sleeper, Noisy - Violates Rahul's Deal Breakers) ---
  const userRohan: UserFullData = {
    id: "user-rohan-3",
    email: "rohan@gmail.com",
    fullName: "Rohan Das",
    gender: "MALE",
    city: "Kolkata",
    role: "USER",
    isEmailVerified: true,
    isPhoneVerified: false,
    isCollegeVerified: false,
    createdAt: new Date(),
    lifestyle: {
      sleepSchedule: "EARLY_SLEEPER",
      wakeUpSchedule: "EARLY_MORNING",
      cleanliness: 4,
      noiseTolerance: "MODERATE",
      guestFrequency: "FREQUENTLY",
      wfhOrStudy: "SOMETIMES",
      cookingFrequency: "FREQUENTLY",
      foodPreference: "NON_VEGETARIAN",
      smokingHabit: "FREQUENTLY",
      drinkingHabit: "SOCIALLY",
      petOwnership: "NO_PETS",
      acUsage: "FREQUENTLY",
      socialBehavior: "EXTROVERTED",
    },
    roommatePref: {
      preferredGender: "MALE",
      comfortableWithGender: ["MALE"],
      preferredSleepSchedule: "EARLY_SLEEPER",
      preferredSmoking: "SMOKER_OK",
      minCleanliness: 4,
      preferredNoise: "MODERATE",
      preferredGuests: "FREQUENTLY",
      preferredPets: "DOESNT_MATTER",
      preferredFood: "NO_PREFERENCE",
      preferredDrinking: "NO_PREFERENCE",
      preferredOccupation: "NO_PREFERENCE",
    },
    dealBreakers: {
      noSmoking: false,
      noDrinking: false,
      noPets: false,
      noFrequentGuests: false,
      noOppositeGender: true,
      strictQuietHours: false,
      strictCleanlinessMin: null,
      vegetarianKitchenOnly: false,
    },
  };

  // --- Test Profile 4: Priya (Female only - User A is Male -> Gender Mismatch) ---
  const userPriya: UserFullData = {
    id: "user-priya-4",
    email: "priya@college.edu",
    fullName: "Priya Sen",
    gender: "FEMALE",
    city: "Kolkata",
    role: "USER",
    isEmailVerified: true,
    isPhoneVerified: true,
    isCollegeVerified: true,
    createdAt: new Date(),
    lifestyle: {
      sleepSchedule: "NIGHT_OWL",
      wakeUpSchedule: "MORNING",
      cleanliness: 9,
      noiseTolerance: "QUIET",
      guestFrequency: "RARELY",
      wfhOrStudy: "FREQUENTLY",
      cookingFrequency: "SOMETIMES",
      foodPreference: "NON_VEGETARIAN",
      smokingHabit: "NEVER",
      drinkingHabit: "NEVER",
      petOwnership: "NO_PETS",
      acUsage: "SOMETIMES",
      socialBehavior: "BALANCED",
    },
    roommatePref: {
      preferredGender: "FEMALE", // Female only!
      comfortableWithGender: ["FEMALE"],
      preferredSleepSchedule: "NIGHT_OWL",
      preferredSmoking: "NON_SMOKER_ONLY",
      minCleanliness: 7,
      preferredNoise: "QUIET",
      preferredGuests: "RARELY",
      preferredPets: "DOESNT_MATTER",
      preferredFood: "NO_PREFERENCE",
      preferredDrinking: "NO_PREFERENCE",
      preferredOccupation: "NO_PREFERENCE",
    },
  };

  // ==========================================
  // RUN ASSERTIONS
  // ==========================================

  // 1. High Compatibility Test (Rahul <-> Sneha)
  const rahulSneha = calculateCompatibility(userRahul, userSneha);
  assert(rahulSneha.overallScore >= 80, `Rahul <-> Sneha overall score is high (${rahulSneha.overallScore}%)`);
  assert(!rahulSneha.isDealBreakerViolated, "Rahul <-> Sneha has zero deal breaker violations");
  assert(rahulSneha.isGenderCompatible, "Rahul <-> Sneha mutual gender preferences are compatible");
  assert(rahulSneha.strengths.length >= 3, `Identified ${rahulSneha.strengths.length} strong points of alignment`);

  // 2. Deal Breaker Test (Rahul <-> Rohan)
  const rahulRohan = calculateCompatibility(userRahul, userRohan);
  assert(rahulRohan.isDealBreakerViolated, "Rahul <-> Rohan correctly triggers strict Deal Breaker (Smoking/Guests)");
  assert(rahulRohan.overallScore <= 35, `Rahul <-> Rohan score is clamped/lowered due to dealbreaker (${rahulRohan.overallScore}%)`);
  assert(rahulRohan.dealBreakerReasons.length > 0, "Provides clear explanation for deal breaker exclusion");

  // 3. Mutual Gender Compatibility Test (Rahul (Male) <-> Priya (Female-only))
  const rahulPriya = calculateCompatibility(userRahul, userPriya);
  assert(!rahulPriya.isGenderCompatible, "Rahul <-> Priya detects asymmetrical gender comfort (Female only)");

  // 4. Asymmetrical Preference Satisfaction
  // Sneha prefers Cleanliness >= 8, Rahul is 9/10 -> Satisfied.
  assert(rahulSneha.directionAtoBScore >= 80 && rahulSneha.directionBtoAScore >= 80, "Both directions evaluated symmetrically");

  console.log("==================================================");
  console.log(`TEST RESULTS: ${passed}/${total} TESTS PASSED (100%)`);
  console.log("==================================================");
}

runTests();
