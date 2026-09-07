import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkRateLimit, recordFailedAttempt } from "@/lib/rate-limiter";
import { z } from "zod";
import crypto from "crypto";

const forgotSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export async function POST(req: NextRequest) {
  try {
    const clientIp = req.headers.get("x-forwarded-for") || "unknown-client";
    const body = await req.json();
    const result = forgotSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }

    const { email } = result.data;
    const cleanEmail = email.toLowerCase().trim();
    const rateLimitKey = `forgot_pwd:${clientIp}:${cleanEmail}`;

    const rateCheck = checkRateLimit(rateLimitKey);
    if (rateCheck.isLocked) {
      return NextResponse.json(
        { error: "Too many password reset requests. Please wait 15 minutes before trying again." },
        { status: 429 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    // NON-ENUMERATION PRINCIPLE: Always return generic success message regardless of existence or role
    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex");
      // In production, save resetToken to verification/user table and send secure email
      console.log(`[SECURE RESET TOKEN GENERATED for ${cleanEmail}]: ${resetToken}`);
    }

    return NextResponse.json({
      message: "If an account exists with this email address, password reset instructions have been generated.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { message: "If an account exists with this email address, password reset instructions have been generated." },
      { status: 200 }
    );
  }
}
