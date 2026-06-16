import { NextResponse } from "next/server";

import { apiError, getApiSession } from "@/lib/api-auth";
import { connectDB } from "@/lib/db";
import { AuditLog } from "@/models/AuditLog";

export async function GET() {
  try {
    const session = await getApiSession();

    if (!session) {
      return apiError("Authentication required", 401);
    }

    if (session.user.role !== "admin") {
      return apiError("Only admins can view audit logs", 403);
    }

    await connectDB();

    const logs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(200)
      .lean();

    return NextResponse.json({
      success: true,
      logs,
    });
  } catch (error) {
    console.error(error);

    return apiError(
      "Failed to fetch audit logs",
      500
    );
  }
}