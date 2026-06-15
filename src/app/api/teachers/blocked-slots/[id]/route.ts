import { NextResponse } from "next/server";

import { apiError, getApiSession } from "@/lib/api-auth";
import { connectDB } from "@/lib/db";
import { Teacher } from "@/models/Teacher";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getApiSession();

    if (!session) {
      return apiError("Authentication required", 401);
    }

    const { id } = await params;

    await connectDB();

    const teacher = await Teacher.findOne({
      email: session.user.email.toLowerCase(),
    });

    if (!teacher) {
      return apiError("Teacher not found", 404);
    }

    teacher.blockedSlots = teacher.blockedSlots.filter(
      (slot: any) => slot._id.toString() !== id
    );

    await teacher.save();

    return NextResponse.json({
      success: true,
      message: "Blocked slot removed",
    });
  } catch (error) {
    console.error(error);

    return apiError(
      "Failed to remove blocked slot",
      500
    );
  }
}