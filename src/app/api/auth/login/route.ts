import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword, setAuthCookie } from "@/lib/auth";
import { ensureAdminInitialized } from "@/lib/seed-admin";
import { UserSession } from "@/types";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: NextRequest) {
  try {
    // Ensure owner admin is provisioned/synced
    await ensureAdminInitialized();

    const body = await req.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { email, password } = result.data;
    const cleanEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        profile: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email address. Please create an account to get started." },
        { status: 404 }
      );
    }

    if (user.isBanned) {
      return NextResponse.json(
        { error: "Your account has been permanently suspended due to violation of platform policies." },
        { status: 403 }
      );
    }

    if (user.isSuspended) {
      return NextResponse.json(
        { error: "Your account is temporarily suspended. Please contact support." },
        { status: 403 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Incorrect password. Please verify your credentials and try again." },
        { status: 401 }
      );
    }

    // Update last login timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const sessionPayload: UserSession = {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      gender: user.gender,
      city: user.city,
      avatarUrl: user.avatarUrl,
      isEmailVerified: user.isEmailVerified,
      isCollegeVerified: user.isCollegeVerified,
    };

    const response = NextResponse.json({
      message: "Login successful",
      user: sessionPayload,
      profileCompletion: user.profile?.profileCompletion || 20,
    });

    setAuthCookie(response, sessionPayload, user.role === "ADMIN");
    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during login. Please try again." },
      { status: 500 }
    );
  }
}
