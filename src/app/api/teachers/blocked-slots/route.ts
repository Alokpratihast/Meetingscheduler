import { NextResponse } from "next/server";

import { apiError, getApiSession } from "@/lib/api-auth";
import { connectDB } from "@/lib/db";
import { Teacher } from "@/models/Teacher";

export async function POST(request: Request) {
  try {
    const session = await getApiSession();

    if (!session) {
      return apiError("Authentication required", 401);
    }

    if (
      session.user.role !== "teacher" &&
      session.user.role !== "admin"
    ) {
      return apiError("Unauthorized", 403);
    }

    const { date, startTime, endTime, reason } =
      await request.json();

    if (!date || !startTime || !endTime) {
      return apiError(
        "date, startTime and endTime are required",
        400
      );
    }

    await connectDB();

    const teacher = await Teacher.findOne({
      email: session.user.email.toLowerCase(),
    });

    if (!teacher) {
      return apiError("Teacher not found", 404);
    }

    teacher.blockedSlots.push({
      date,
      startTime,
      endTime,
      reason: reason || "",
    });

    await teacher.save();

    return NextResponse.json({
      success: true,
      message: "Blocked slot added successfully",
      blockedSlots: teacher.blockedSlots,
    });
  } catch (error) {
    console.error(error);

    return apiError(
      "Failed to add blocked slot",
      500
    );
  }
}