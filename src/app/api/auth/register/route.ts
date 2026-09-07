import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, setAuthCookie } from "@/lib/auth";
import { UserSession } from "@/types";
import { z } from "zod";

const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]).default("PREFER_NOT_TO_SAY"),
  city: z.string().default("Kolkata"),
  dateOfBirth: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { fullName, email, password, phone, gender, city, dateOfBirth } = result.data;
    const cleanEmail = email.toLowerCase().trim();

    // Check if user or admin already exists with this email
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email address already exists. Please login." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    // Create real user with STRICT role = USER
    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        passwordHash,
        fullName,
        phone: phone || null,
        gender,
        city: city || "Kolkata",
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        role: "USER", // NEVER ALLOW ADMIN VIA PUBLIC REGISTRATION
        isEmailVerified: true, // Auto-verified for seamless testing / real onboarding
        profile: {
          create: {
            profileCompletion: 20,
          },
        },
        lifestyle: {
          create: {},
        },
        roommatePref: {
          create: {},
        },
        dealBreakers: {
          create: {},
        },
        housingReq: {
          create: {
            city: city || "Kolkata",
          },
        },
      },
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

    const response = NextResponse.json(
      {
        message: "Registration successful",
        user: sessionPayload,
      },
      { status: 201 }
    );

    setAuthCookie(response, sessionPayload, false);
    return response;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred during registration. Please try again." },
      { status: 500 }
    );
  }
}
