import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "./auth";
import { UserSession } from "@/types";

export async function requireAdmin(req?: NextRequest): Promise<{
  session: UserSession | null;
  errorResponse?: NextResponse;
}> {
  const session = await getAdminSession(req);

  if (!session || session.role !== "ADMIN") {
    return {
      session: null,
      errorResponse: NextResponse.json(
        { error: "403 Forbidden: Administrator authorization required" },
        { status: 403 }
      ),
    };
  }

  return { session };
}
