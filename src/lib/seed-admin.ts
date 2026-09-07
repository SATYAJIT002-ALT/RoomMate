import prisma from "./prisma";
import { hashPassword } from "./auth";

export const OWNER_USER_EMAIL = "satyajitsasmal780@gmail.com";
export const OWNER_USER_PASSWORD = "UserPass2026";
export const OWNER_ADMIN_EMAIL = "satyajitsasmal022@gmail.com";
export const OWNER_ADMIN_PASSWORD = "AdminPass2026";

/**
 * Ensures both the platform Owner Admin account and the permanent Owner User account
 * are safely provisioned in the database with their correct credentials.
 */
export async function ensureAdminInitialized(): Promise<{ created: boolean; email: string | null }> {
  const adminEmail = process.env.ADMIN_EMAIL || OWNER_ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD || OWNER_ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME || "Satyajit Sasmal";

  try {
    // 1. Ensure Admin Account
    const cleanAdminEmail = adminEmail.toLowerCase().trim();
    const existingAdmin = await prisma.user.findUnique({
      where: { email: cleanAdminEmail },
    });

    const adminHash = await hashPassword(adminPassword);

    if (!existingAdmin) {
      await prisma.user.create({
        data: {
          email: cleanAdminEmail,
          passwordHash: adminHash,
          role: "ADMIN",
          fullName: adminName,
          city: "Kolkata",
          gender: "PREFER_NOT_TO_SAY",
          isEmailVerified: true,
          isPhoneVerified: true,
          isCollegeVerified: true,
        },
      });
    } else {
      await prisma.user.update({
        where: { id: existingAdmin.id },
        data: {
          role: "ADMIN",
          passwordHash: adminHash,
          fullName: adminName,
        },
      });
    }

    // 2. Ensure Permanent Owner User Account (satyajitsasmal780@gmail.com)
    const cleanUserEmail = OWNER_USER_EMAIL.toLowerCase().trim();
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanUserEmail },
      include: { profile: true },
    });

    const userHash = await hashPassword(OWNER_USER_PASSWORD);

    if (!existingUser) {
      await prisma.user.create({
        data: {
          email: cleanUserEmail,
          passwordHash: userHash,
          role: "USER",
          fullName: "Satyajit Sasmal",
          city: "Kolkata",
          gender: "MALE",
          isEmailVerified: true,
          isPhoneVerified: true,
          isCollegeVerified: true,
          profile: {
            create: {
              bio: "RoomMate Platform Owner & Developer",
              occupationStatus: "WORKING_PROFESSIONAL",
              preferredArea: "Kolkata",
              personalityTraits: ["Responsible", "Tech-savvy", "Clean", "Friendly"],
              profileCompletion: 100,
            },
          },
        },
      });
    } else {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          role: "USER",
          passwordHash: userHash,
          fullName: "Satyajit Sasmal",
        },
      });
    }

    return { created: true, email: cleanAdminEmail };
  } catch (error) {
    console.error("Admin/User accounts initialization error:", error);
    return { created: false, email: null };
  }
}

