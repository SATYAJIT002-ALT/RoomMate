export type UserRole = "USER" | "ADMIN";
export type Gender = "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";
export type OccupationStatus = "STUDENT" | "WORKING_PROFESSIONAL" | "FREELANCER" | "OTHER";
export type SleepSchedule = "EARLY_SLEEPER" | "NORMAL" | "NIGHT_OWL" | "IRREGULAR" | "FLEXIBLE";
export type WakeUpSchedule = "EARLY_MORNING" | "MORNING" | "AFTERNOON" | "VARIABLE";
export type NoiseTolerance = "VERY_QUIET" | "QUIET" | "MODERATE" | "DOESNT_MATTER";
export type Frequency = "NEVER" | "RARELY" | "SOMETIMES" | "FREQUENTLY";
export type FoodPreference = "VEGETARIAN" | "NON_VEGETARIAN" | "VEGAN" | "EGGETARIAN" | "NO_PREFERENCE" | "OTHER";
export type SmokingHabit = "NEVER" | "OCCASIONALLY" | "FREQUENTLY";
export type DrinkingHabit = "NEVER" | "OCCASIONALLY" | "SOCIALLY" | "FREQUENTLY";
export type PetOwnership = "NO_PETS" | "HAVE_DOG" | "HAVE_CAT" | "HAVE_OTHER";
export type SocialBehavior = "VERY_INTROVERTED" | "INTROVERTED" | "BALANCED" | "EXTROVERTED" | "VERY_EXTROVERTED";
export type HousingType = "APARTMENT" | "PG" | "HOSTEL" | "FLAT" | "HOUSE" | "SHARED_APARTMENT" | "ANY";
export type RoomType = "PRIVATE" | "SHARED" | "EITHER";
export type FurnishingStatus = "FURNISHED" | "SEMI_FURNISHED" | "UNFURNISHED" | "ANY";

export interface UserSession {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  gender: Gender;
  city: string;
  avatarUrl?: string | null;
  isEmailVerified: boolean;
  isCollegeVerified: boolean;
  isCompanyVerified?: boolean;
}

export interface UserFullData {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  dateOfBirth?: string | Date | null;
  gender: Gender;
  city: string;
  avatarUrl?: string | null;
  role: UserRole;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isCollegeVerified: boolean;
  isCompanyVerified?: boolean;
  createdAt: string | Date;
  profile?: {
    bio?: string | null;
    occupationStatus: OccupationStatus;
    collegeName?: string | null;
    companyName?: string | null;
    preferredArea?: string | null;
    personalityTraits: string[];
    preferredRoommateTraits: string[];
    hobbies: string[];
    profileCompletion: number;
    aiSummary?: string | null;
  } | null;
  lifestyle?: {
    sleepSchedule: SleepSchedule;
    wakeUpSchedule: WakeUpSchedule;
    cleanliness: number;
    noiseTolerance: NoiseTolerance;
    guestFrequency: Frequency;
    wfhOrStudy: Frequency;
    cookingFrequency: Frequency;
    foodPreference: FoodPreference;
    smokingHabit: SmokingHabit;
    drinkingHabit: DrinkingHabit;
    petOwnership: PetOwnership;
    acUsage: Frequency;
    socialBehavior: SocialBehavior;
  } | null;
  roommatePref?: {
    preferredGender: string;
    comfortableWithGender: string[];
    preferredSleepSchedule: string;
    preferredSmoking: string;
    minCleanliness: number;
    preferredNoise: string;
    preferredGuests: string;
    preferredPets: string;
    preferredFood: string;
    preferredDrinking: string;
    preferredOccupation: string;
    ageMin?: number | null;
    ageMax?: number | null;
  } | null;
  dealBreakers?: {
    noSmoking: boolean;
    noDrinking: boolean;
    noPets: boolean;
    noFrequentGuests: boolean;
    noOppositeGender: boolean;
    strictQuietHours: boolean;
    strictCleanlinessMin?: number | null;
    vegetarianKitchenOnly: boolean;
    strictMaxBudget?: number | null;
  } | null;
  housingReq?: {
    city: string;
    targetLocalities: string[];
    budgetMin: number;
    budgetMax: number;
    moveInDate?: string | Date | null;
    rentalDuration: string;
    housingType: HousingType;
    roomType: RoomType;
    requiredAmenities: string[];
    furnishing: FurnishingStatus;
  } | null;
}

export interface CompatibilityCategoryScores {
  lifestyle: number;        // 25%
  budgetLocation: number;   // 20%
  personality: number;      // 15%
  habitsFood: number;       // 15%
  housing: number;          // 15%
  hobbies: number;          // 10%
}

export interface CompatibilityReport {
  targetUserId: string;
  targetUser: UserFullData;
  overallScore: number;
  isDealBreakerViolated: boolean;
  dealBreakerReasons: string[];
  isGenderCompatible: boolean;
  genderCompatibilityReason: string;
  categoryScores: CompatibilityCategoryScores;
  strengths: string[];
  differences: string[];
  directionAtoBScore: number;
  directionBtoAScore: number;
  mutualLifestyleScore: number;
}

export interface RoomCompatibilityReport {
  listingId: string;
  overallScore: number;
  isWithinBudget: boolean;
  isLocationMatched: boolean;
  isHousingTypeMatched: boolean;
  isRoomTypeMatched: boolean;
  matchedAmenities: string[];
  missingAmenities: string[];
  strengths: string[];
  notes: string[];
}

export interface AdminAnalyticsData {
  totalUsers: number;
  totalListings: number;
  totalMatches: number;
  totalConversations: number;
  totalReports: number;
  pendingReports: number;
  pendingVerifications: number;
  usersByRole: { user: number; admin: number };
  usersByGender: { male: number; female: number; other: number };
  cityDistribution: { city: string; count: number }[];
  recentActivity: {
    type: string;
    description: string;
    timestamp: string;
  }[];
}
