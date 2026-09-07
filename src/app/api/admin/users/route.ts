import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";
import { hashPassword } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireAdmin(req);
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || "";
    const role = searchParams.get("role") || undefined;

    const users = await prisma.user.findMany({
      where: {
        AND: [
          query
            ? {
                OR: [
                  { fullName: { contains: query, mode: "insensitive" } },
                  { email: { contains: query, mode: "insensitive" } },
                  { city: { contains: query, mode: "insensitive" } },
                ],
              }
            : {},
          role ? { role: role as "USER" | "ADMIN" } : {},
        ],
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        gender: true,
        city: true,
        isEmailVerified: true,
        isCollegeVerified: true,
        isSuspended: true,
        isBanned: true,
        createdAt: true,
        lastLoginAt: true,
        profile: {
          select: {
            profileCompletion: true,
            occupationStatus: true,
            collegeName: true,
            companyName: true,
          },
        },
        verifications: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            type: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Admin get users error:", error);
    return NextResponse.json({ error: "Failed to retrieve user list" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { errorResponse } = await requireAdmin(req);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const { userId, role, isSuspended, isBanned, isCollegeVerified, isEmailVerified } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const target = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // IMMUTABLE ROOT ADMIN: satyajitsasmal022@gmail.com cannot be demoted or banned
    if (target.email.toLowerCase() === "satyajitsasmal022@gmail.com") {
      if (role && role !== "ADMIN") {
        return NextResponse.json(
          { error: "Access Denied: The Platform Root Owner account cannot be demoted from ADMIN." },
          { status: 403 }
        );
      }
      if (isBanned || isSuspended) {
        return NextResponse.json(
          { error: "Access Denied: The Platform Root Owner account cannot be suspended or banned." },
          { status: 403 }
        );
      }
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(role !== undefined ? { role } : {}),
        ...(isSuspended !== undefined ? { isSuspended } : {}),
        ...(isBanned !== undefined ? { isBanned } : {}),
        ...(isCollegeVerified !== undefined ? { isCollegeVerified } : {}),
        ...(isEmailVerified !== undefined ? { isEmailVerified } : {}),
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        city: true,
        isSuspended: true,
        isBanned: true,
        isCollegeVerified: true,
      },
    });

    if (isCollegeVerified !== undefined) {
      const existing = await prisma.verification.findFirst({
        where: { userId, type: "COLLEGE" },
      });
      if (isCollegeVerified) {
        if (existing) {
          await prisma.verification.update({
            where: { id: existing.id },
            data: { status: "VERIFIED", verifiedAt: new Date() },
          });
        } else {
          await prisma.verification.create({
            data: {
              userId,
              type: "COLLEGE",
              instituteName: target.city ? `Student (${target.city})` : "Verified College",
              status: "VERIFIED",
              verifiedAt: new Date(),
            },
          });
        }
      } else if (existing) {
        await prisma.verification.update({
          where: { id: existing.id },
          data: { status: "REJECTED" },
        });
      }
    }

    return NextResponse.json({ message: "User status updated", user: updated });
  } catch (error) {
    console.error("Admin patch user error:", error);
    return NextResponse.json({ error: "Failed to update user moderation state" }, { status: 500 });
  }
}

// POST endpoint to allow existing authenticated admins to create another admin
export async function POST(req: NextRequest) {
  const { errorResponse } = await requireAdmin(req);
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const { fullName, email, password, city } = body;

    if (!fullName || !email || !password) {
      return NextResponse.json(
        { error: "Full name, email, and password are required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    const newAdmin = await prisma.user.create({
      data: {
        fullName,
        email: cleanEmail,
        passwordHash,
        role: "ADMIN",
        city: city || "Kolkata",
        gender: "PREFER_NOT_TO_SAY",
        isEmailVerified: true,
        isPhoneVerified: true,
        isCollegeVerified: true,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      message: "Administrator account created successfully",
      admin: newAdmin,
    });
  } catch (error) {
    console.error("Create admin error:", error);
    return NextResponse.json(
      { error: "Failed to create administrator account" },
      { status: 500 }
    );
  }
}
