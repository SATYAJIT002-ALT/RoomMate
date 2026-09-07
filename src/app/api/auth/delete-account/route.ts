import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession, verifyPassword, clearAuthCookies } from "@/lib/auth";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const body = await req.json();
    const { password, confirmationText } = body;

    if (!password) {
      return NextResponse.json({ error: "Password is required to confirm account deletion." }, { status: 400 });
    }

    if (confirmationText !== "DELETE") {
      return NextResponse.json({ error: "Please type DELETE to confirm permanent account deletion." }, { status: 400 });
    }

    // Fetch user with password hash
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      include: {
        verifications: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Protect primary administrative accounts
    if (user.role === "ADMIN") {
      return NextResponse.json(
        { error: "Administrative accounts cannot be deleted through the user portal." },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Incorrect password. Please enter your valid account password." },
        { status: 400 }
      );
    }

    // Clean up local uploaded verification files if any
    try {
      if (user.verifications && user.verifications.length > 0) {
        for (const v of user.verifications) {
          if (v.documentUrl && v.documentUrl.startsWith("/uploads/")) {
            const filePath = path.join(process.cwd(), "public", v.documentUrl);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
            }
          }
        }
      }
    } catch (storageErr) {
      console.warn("Storage cleanup warning during account deletion:", storageErr);
    }

    // Delete user from database (Cascades to profile, lifestyle, roommatePref, dealBreakers, matches, messages, verifications, notifications, etc.)
    await prisma.user.delete({
      where: { id: session.id },
    });

    // Prepare response and clear session cookies immediately
    const response = NextResponse.json({
      success: true,
      message: "Your account and all associated personal data have been permanently deleted.",
    });

    clearAuthCookies(response, false);
    clearAuthCookies(response, true);

    return response;
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json(
      { error: "Failed to delete account. Please try again or contact support." },
      { status: 500 }
    );
  }
}
