import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { UserSession, UserRole } from "@/types";
import prisma from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "roommate-super-secret-key-production-ready-2026";
const AUTH_COOKIE_NAME = "roommate_session";
const ADMIN_COOKIE_NAME = "roommate_admin_session";

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: UserSession, isAdminSession: boolean = false): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: isAdminSession ? "12h" : "30d",
  });
}

export function verifyToken(token: string): UserSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserSession;
  } catch {
    return null;
  }
}

/**
 * Gets the current session from request cookies or Next.js headers
 */
export async function getSession(req?: NextRequest): Promise<UserSession | null> {
  try {
    let token: string | undefined;

    if (req) {
      token = req.cookies.get(AUTH_COOKIE_NAME)?.value || req.cookies.get(ADMIN_COOKIE_NAME)?.value;
    } else {
      const cookieStore = await cookies();
      token = cookieStore.get(AUTH_COOKIE_NAME)?.value || cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    }

    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

/**
 * Gets the current admin session
 */
export async function getAdminSession(req?: NextRequest): Promise<UserSession | null> {
  try {
    let token: string | undefined;

    if (req) {
      token = req.cookies.get(ADMIN_COOKIE_NAME)?.value || req.cookies.get(AUTH_COOKIE_NAME)?.value;
    } else {
      const cookieStore = await cookies();
      token = cookieStore.get(ADMIN_COOKIE_NAME)?.value || cookieStore.get(AUTH_COOKIE_NAME)?.value;
    }

    if (!token) return null;
    const session = verifyToken(token);
    if (session && session.role === "ADMIN") {
      return session;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Sets auth cookie on a NextResponse
 */
export function setAuthCookie(
  response: NextResponse,
  session: UserSession,
  isAdmin: boolean = false
): void {
  const token = signToken(session, isAdmin);

  if (isAdmin) {
    // Set both admin and general session so Navbar & all pages immediately display the Admin profile
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 12 * 60 * 60,
    });
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 12 * 60 * 60,
    });
  } else {
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });
    // Clear any previous admin session cookie
    response.cookies.set({
      name: ADMIN_COOKIE_NAME,
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
  }
}

/**
 * Clears session cookies
 */
export function clearAuthCookies(response: NextResponse, isAdmin: boolean = false): void {
  const cookieName = isAdmin ? ADMIN_COOKIE_NAME : AUTH_COOKIE_NAME;
  response.cookies.set({
    name: cookieName,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
