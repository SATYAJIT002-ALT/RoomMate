import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword, setAuthCookie, getSession } from "@/lib/auth";
import { UserSession } from "@/types";
import { z } from "zod";

const switchSchema = z.object({
  targetEmail: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required for secure account switching"),
});

const OWNER_USER_EMAIL = "satyajitsasmal780@gmail.com";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized session." }, { status: 401 });
    }

    const body = await req.json();
    const result = switchSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { targetEmail, password } = result.data;
    const cleanEmail = targetEmail.toLowerCase().trim();

    // Find the separate target account
    const targetUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!targetUser) {
      return NextResponse.json(
        { error: `No account exists with email "${cleanEmail}". Please check the email and try again.` },
        { status: 404 }
      );
    }

    // STRICT OWNER AUTHORIZATION: Standard users CANNOT switch into an ADMIN account!
    if (targetUser.role === "ADMIN") {
      const isAuthorizedOwner =
        session.role === "ADMIN" || session.email.toLowerCase() === OWNER_USER_EMAIL.toLowerCase();

      if (!isAuthorizedOwner) {
        return NextResponse.json(
          { error: "Access Denied: Only the platform owner is authorized to switch to an administrator account." },
          { status: 403 }
        );
      }
    }

    const isValid = await verifyPassword(password, targetUser.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: `Incorrect password for "${cleanEmail}". Please check your password and try again.` },
        { status: 401 }
      );
    }

    const sessionPayload: UserSession = {
      id: targetUser.id,
      email: targetUser.email,
      role: targetUser.role, // Kept completely separate in DB
      fullName: targetUser.fullName,
      gender: targetUser.gender,
      city: targetUser.city,
      avatarUrl: targetUser.avatarUrl,
      isEmailVerified: targetUser.isEmailVerified,
      isCollegeVerified: targetUser.isCollegeVerified,
    };

    const response = NextResponse.json({
      message: `Switched to account: ${targetUser.email} (${targetUser.role})`,
      targetRole: targetUser.role,
      user: sessionPayload,
    });

    setAuthCookie(response, sessionPayload, targetUser.role === "ADMIN");
    return response;
  } catch (error) {
    console.error("Account switch error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during account switch." },
      { status: 500 }
    );
  }
}
