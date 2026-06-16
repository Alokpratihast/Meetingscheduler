import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

import { apiError, getApiSession } from "@/lib/api-auth";
import { connectDB } from "@/lib/db";
import { Meeting } from "@/models/Meeting";

type Context = {
  params: Promise<{ id: string }>;
};

export async function POST(
  request: NextRequest,
  { params }: Context
) {
  try {
    const session = await getApiSession();

    if (!session) {
      return apiError("Authentication required", 401);
    }

    const body = await request.json().catch(() => ({}));
    const action = body?.action;
    if (action !== "join" && action !== "leave") {
      return apiError("Invalid attendance action", 400);
    }

    const { id } = await params;
    if (!Types.ObjectId.isValid(id)) {
      return apiError("Invalid meeting id", 400);
    }

    await connectDB();
    const meeting = await Meeting.findById(id);
    if (!meeting) {
      return apiError("Meeting not found", 404);
    }

    const email = session.user.email.toLowerCase();
    const allowedEmails = [
      meeting.studentEmail.toLowerCase(),
      (meeting.organizerEmail ?? "").toLowerCase(),
    ];

    if (
      !allowedEmails.includes(email) &&
      session.user.role !== "admin"
    ) {
      return apiError("Only meeting participants can record attendance", 403);
    }

    const now = new Date();
    const role = session.user.role;
    const entries = meeting.attendance as
      | {
          userEmail: string;
          leftAt?: Date;
          joinedAt: Date;
          durationMinutes?: number;
        }[]
      | undefined;

    const activeEntry = entries?.find(
      (entry) =>
        entry.userEmail.toLowerCase() === email &&
        !entry.leftAt
    );

    if (action === "join") {
      if (activeEntry) {
        return NextResponse.json({ success: true });
      }

      meeting.attendance = meeting.attendance || [];

      const meetingStart = new Date(
  `${meeting.meetingDate
    .toISOString()
    .split("T")[0]}T${meeting.startTime}:00`
);

const lateMinutes = Math.floor(
  (now.getTime() -
    meetingStart.getTime()) /
    60000
);

const isLate = lateMinutes > 5;

      meeting.attendance.push({
        userEmail: email,
        role,
        joinedAt: now,
        durationMinutes: 0,
        isLate,
        lateMinutes: isLate ? lateMinutes : 0,
        
      });
    } else {
      if (!activeEntry) {
        return apiError("No active attendance session found", 400);
      }

      activeEntry.leftAt = now;
      const durationMs = now.getTime() - activeEntry.joinedAt.getTime();
      activeEntry.durationMinutes = Math.round(durationMs / 60000);
    }

    await meeting.save();

    return NextResponse.json({ success: true, meeting });
  } catch (error) {
    console.error("Attendance error:", error);
    return apiError("Failed to record attendance", 500);
  }
}
