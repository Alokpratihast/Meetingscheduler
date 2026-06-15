import { NextResponse } from "next/server";

import { apiError, getApiSession } from "@/lib/api-auth";
import { connectDB } from "@/lib/db";
import { Teacher } from "@/models/Teacher";

export async function GET() {
  try {
    const session = await getApiSession();

    if (!session) {
      return apiError("Authentication required", 401);
    }

    await connectDB();

    const teacher = await Teacher.findOne({
      email: session.user.email.toLowerCase(),
    }).lean();

    if (!teacher) {
      return apiError("Teacher not found", 404);
    }

    return NextResponse.json({
      success: true,
      availability: {
        workingHours: teacher.workingHours,
        workingDays: teacher.workingDays,
        blockedSlots: teacher.blockedSlots,
      },
    });
  } catch (error) {
    console.error(error);

    return apiError(
      "Failed to fetch availability",
      500
    );
  }
}