import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword, setAuthCookie } from "@/lib/auth";
import { ensureAdminInitialized } from "@/lib/seed-admin";
import { checkRateLimit, recordFailedAttempt, recordSuccessfulAttempt } from "@/lib/rate-limiter";
import { UserSession } from "@/types";
import { z } from "zod";

const adminLoginSchema = z.object({
  email: z.string().email("Invalid admin email"),
  password: z.string().min(1, "Password is required"),
  twoFactorCode: z.string().optional(), // Prepared for optional MFA/2FA
});

export async function POST(req: NextRequest) {
  try {
    // Ensure owner admin is initialized
    await ensureAdminInitialized();

    const clientIp = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown-client";
    const body = await req.json();
    const result = adminLoginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { email, password, twoFactorCode } = result.data;
    const cleanEmail = email.toLowerCase().trim();
    const rateLimitKey = `admin_login:${clientIp}:${cleanEmail}`;

    // 1. Check Rate Limiting & Account Lockout
    const rateCheck = checkRateLimit(rateLimitKey);
    if (rateCheck.isLocked) {
      return NextResponse.json(
        {
          error: `Too many failed authentication attempts. Account access is temporarily throttled. Please try again in ${rateCheck.remainingSeconds} seconds.`,
        },
        { status: 429 }
      );
    }

    const adminUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    // 2. Reject if non-existent or password mismatch
    if (!adminUser) {
      recordFailedAttempt(rateLimitKey);
      return NextResponse.json(
        { error: "Invalid administrator credentials." },
        { status: 401 }
      );
    }

    // 3. Strict Role Verification: Only ADMIN accounts permitted
    if (adminUser.role !== "ADMIN") {
      recordFailedAttempt(rateLimitKey);
      return NextResponse.json(
        { error: "Access Denied: This account does not possess administrator privileges." },
        { status: 403 }
      );
    }

    // 4. Secure Bcrypt Password Hash Verification
    const isValid = await verifyPassword(password, adminUser.passwordHash);
    if (!isValid) {
      const failStatus = recordFailedAttempt(rateLimitKey);
      const attemptsMsg = failStatus.remainingAttempts > 0
        ? ` (${failStatus.remainingAttempts} attempts remaining before temporary lockout)`
        : " (Account access is now throttled for 15 minutes)";

      return NextResponse.json(
        { error: `Invalid administrator credentials.${attemptsMsg}` },
        { status: 401 }
      );
    }

    // 5. MFA / 2FA Extensible Check (Placeholder for optional TOTP token)
    // If two-factor is enabled in the future, verify token here:
    if (twoFactorCode && twoFactorCode !== "000000" && twoFactorCode.length < 6) {
      return NextResponse.json(
        { error: "Invalid two-factor authentication code." },
        { status: 401 }
      );
    }

    // Clear failed attempts upon successful authentication
    recordSuccessfulAttempt(rateLimitKey);

    // Update last login
    await prisma.user.update({
      where: { id: adminUser.id },
      data: { lastLoginAt: new Date() },
    });

    const sessionPayload: UserSession = {
      id: adminUser.id,
      email: adminUser.email,
      role: "ADMIN",
      fullName: adminUser.fullName,
      gender: adminUser.gender,
      city: adminUser.city,
      avatarUrl: adminUser.avatarUrl,
      isEmailVerified: adminUser.isEmailVerified,
      isCollegeVerified: adminUser.isCollegeVerified,
    };

    const response = NextResponse.json({
      message: "Admin authentication successful",
      user: sessionPayload,
      redirectUrl: "/admin",
    });

    setAuthCookie(response, sessionPayload, true);
    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during admin authentication." },
      { status: 500 }
    );
  }
}
