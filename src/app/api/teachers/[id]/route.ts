import { Types } from "mongoose";
import { NextResponse } from "next/server";

import { apiError, getApiSession } from "@/lib/api-auth";
import { connectDB } from "@/lib/db";
import {
  firstValidationError,
  teacherSchema,
} from "@/lib/validation";
import { Meeting } from "@/models/Meeting";
import { Teacher } from "@/models/Teacher";
import { User } from "@/models/User";

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: Context) {
  try {
    const session = await getApiSession();

    if (!session) {
      return apiError("Authentication required", 401);
    }

    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return apiError("Invalid teacher", 400);
    }

    await connectDB();
    const teacher = await Teacher.findById(id).lean();

    if (!teacher) {
      return apiError("Teacher not found", 404);
    }

    return NextResponse.json({
      success: true,
      data: teacher,
    });
  } catch (error) {
    console.error("Get teacher error:", error);
    return apiError("Failed to fetch teacher", 500);
  }
}

export async function PUT(request: Request, { params }: Context) {
  try {
    const session = await getApiSession();

    if (!session) {
      return apiError("Authentication required", 401);
    }

    if (
      session.user.role !== "teacher" &&
      session.user.role !== "admin"
    ) {
      return apiError("Only teachers and admins can update profiles", 403);
    }

    const { id } = await params;
    const parsed = teacherSchema.safeParse(await request.json());

    if (!Types.ObjectId.isValid(id)) {
      return apiError("Invalid teacher", 400);
    }

    if (!parsed.success) {
      return apiError(firstValidationError(parsed.error), 400);
    }

    if (
      session.user.role === "teacher" &&
      parsed.data.email !== session.user.email.toLowerCase()
    ) {
      return apiError("You can only update your own profile", 403);
    }

    await connectDB();
    const query: Record<string, unknown> = { _id: id };

    if (session.user.role === "teacher") {
      query.email = session.user.email.toLowerCase();
    }

    const teacher = await Teacher.findOneAndUpdate(
      query,
      parsed.data,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!teacher) {
      return apiError("Teacher not found", 404);
    }

    return NextResponse.json({
      success: true,
      data: teacher,
    });
  } catch (error) {
    console.error("Update teacher error:", error);
    return apiError("Failed to update teacher", 500);
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  try {
    const session = await getApiSession();

    if (!session) {
      return apiError("Authentication required", 401);
    }

    if (
      session.user.role !== "teacher" &&
      session.user.role !== "admin"
    ) {
      return apiError("Only teachers and admins can deactivate profiles", 403);
    }

    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return apiError("Invalid teacher", 400);
    }

    await connectDB();
    const activeMeetings = await Meeting.exists({
      teacherId: id,
      status: { $in: ["pending", "approved"] },
    });

    if (activeMeetings) {
      return apiError(
        "Cancel active meetings before deactivating this profile",
        409
      );
    }

    const query: Record<string, unknown> = { _id: id };
    if (session.user.role === "teacher") {
      query.email = session.user.email.toLowerCase();
    }

    const teacher = await Teacher.findOneAndUpdate(
      query,
      { $set: { isActive: false } },
      { new: true }
    );

    if (!teacher) {
      return apiError("Teacher not found", 404);
    }

    await User.updateOne(
      { email: teacher.email.toLowerCase() },
      { $set: { role: "candidate" } }
    );

    return NextResponse.json({
      success: true,
      message: "Teacher profile deactivated",
    });
  } catch (error) {
    console.error("Deactivate teacher error:", error);
    return apiError("Failed to deactivate teacher", 500);
  }
}
