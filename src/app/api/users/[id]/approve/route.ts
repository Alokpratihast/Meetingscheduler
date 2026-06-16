import { Types } from "mongoose";
import { NextResponse } from "next/server";

import { apiError, getApiSession } from "@/lib/api-auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

type Context = {
  params: Promise<{ id: string }>;
};

export async function POST(
  request: Request,
  { params }: Context
) {
  try {
    const session = await getApiSession();

    if (!session) {
      return apiError("Authentication required", 401);
    }

    if (session.user.role !== "admin") {
      return apiError("Only admins can approve users", 403);
    }

    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return apiError("Invalid user", 400);
    }

    await connectDB();

const update: Record<string, unknown> = {
  isApproved: true,
};



    const user = await User.findByIdAndUpdate(id, update, { new: true });

    if (!user) {
      return apiError("User not found", 404);
    }

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("Approve user error:", error);
    return apiError("Failed to approve user", 500);
  }
}
