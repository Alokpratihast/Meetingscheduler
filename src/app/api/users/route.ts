import { NextResponse } from "next/server";

import { apiError, getApiSession } from "@/lib/api-auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export async function GET(request: Request) {
  try {
    const session = await getApiSession();

    if (!session) {
      return apiError("Authentication required", 401);
    }

    if (session.user.role !== "admin") {
      return apiError("Only admins can view users", 403);
    }

    await connectDB();
    const url = new URL(request.url);
    const pending = url.searchParams.get("pending") === "true";
    const query: Record<string, unknown> = {};

    if (pending) {
      query.role = "candidate";
      query.isApproved = false;
    }

    const users = await User.find(query).select("name email role isApproved").lean();

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error("Get users error:", error);
    return apiError("Failed to fetch users", 500);
  }
}
