import { NextResponse } from "next/server";

import {
  apiError,
  getApiSession,
} from "@/lib/api-auth";
import { connectDB } from "@/lib/db";
import {
  firstValidationError,
  teacherSchema,
} from "@/lib/validation";
import { Teacher } from "@/models/Teacher";
import { User } from "@/models/User";

export async function GET() {
  try {
    const session = await getApiSession();

    if (!session) {
      return apiError("Authentication required", 401);
    }

    await connectDB();
    const query =
      session.user.role === "teacher"
        ? { email: session.user.email.toLowerCase() }
        : { isActive: true };
    const teachers = await Teacher.find(query)
      .sort({ name: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: teachers,
    });
  } catch (error) {
    console.error("Get teachers error:", error);
    return apiError("Failed to fetch teachers", 500);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getApiSession();

    if (!session) {
      return apiError("Authentication required", 401);
    }

    if (session.user.role === "candidate") {
      return apiError("Only teachers and admins can create profiles", 403);
    }

    const parsed = teacherSchema.safeParse(await request.json());

    if (!parsed.success) {
      return apiError(firstValidationError(parsed.error), 400);
    }

    if (
      session.user.role === "teacher" &&
      parsed.data.email !== session.user.email.toLowerCase()
    ) {
      return apiError(
        "Teacher profile email must match your Google account",
        403
      );
    }

    await connectDB();
    const existingTeacher = await Teacher.findOne({
      email: parsed.data.email,
    });

    if (existingTeacher) {
      return apiError("Teacher profile already exists", 409);
    }

    const teacher = await Teacher.create(parsed.data);
    await User.updateOne(
      { email: parsed.data.email },
      { $set: { role: "teacher" } }
    );

    return NextResponse.json(
      {
        success: true,
        data: teacher,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create teacher error:", error);
    return apiError("Failed to create teacher", 500);
  }
}
