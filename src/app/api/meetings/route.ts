import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

import { apiError, getApiSession } from "@/lib/api-auth";
import { createCalendarEvent } from "@/lib/calendar";
import { connectDB } from "@/lib/db";
import {
  firstValidationError,
  meetingSchema,
} from "@/lib/validation";
import { Meeting } from "@/models/Meeting";
import { Teacher } from "@/models/Teacher";

import { createAuditLog } from "@/lib/audit";

type BlockedSlot = {
  date: Date;
  startTime: string;
  endTime: string;
  reason?: string;
};

const activeStatuses = ["pending", "approved"];

export async function GET(request: NextRequest) {
  try {
    const session = await getApiSession();

    if (!session) {
      return apiError("Authentication required", 401);
    }

    await connectDB();
    const status = request.nextUrl.searchParams.get("status");
    const query: Record<string, unknown> = {};

    if (session.user.role === "candidate") {
      query.studentEmail = session.user.email.toLowerCase();
    } else if (session.user.role === "teacher") {
      query.organizerEmail = session.user.email.toLowerCase();
    }

    if (status) {
      query.status = status;
    }

    const meetings = await Meeting.find(query)
      .populate("teacherId", "name email department designation")
      .sort({ meetingDate: 1, startTime: 1 })
      .lean();

    return NextResponse.json({
      success: true,
      meetings,
    });
  } catch (error) {
    console.error("GET meetings error:", error);
    return apiError("Failed to fetch meetings", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getApiSession();

    if (!session) {
      return apiError("Authentication required", 401);
    }

    if (
      session.user.role !== "teacher" &&
      session.user.role !== "admin"
    ) {
      return apiError("Only teachers and admins can create meetings", 403);
    }

    if (!session.accessToken) {
      return apiError(
        "Google Calendar permission is missing. Please sign in again.",
        401
      );
    }

    const parsed = meetingSchema.safeParse(await request.json());

    if (!parsed.success) {
      return apiError(firstValidationError(parsed.error), 400);
    }

    const data = parsed.data;
    const selectedStart = new Date(
      `${data.meetingDate}T${data.startTime}:00`
    );

    if (selectedStart <= new Date()) {
      return apiError("Meeting must be scheduled in the future", 400);
    }

    if (!Types.ObjectId.isValid(data.teacherId)) {
      return apiError("Invalid teacher", 400);
    }

    await connectDB();
    const teacherQuery: Record<string, unknown> = {
      _id: data.teacherId,
      isActive: true,
    };

    if (session.user.role === "teacher") {
      teacherQuery.email = session.user.email.toLowerCase();
    }

    const teacher = await Teacher.findOne(teacherQuery);

    if (!teacher) {
      return apiError(
        session.user.role === "teacher"
          ? "Your teacher profile was not found for this meeting"
          : "Selected teacher profile was not found or inactive",
        403
      );
    }


    const meetingDay = new Date(
  `${data.meetingDate}T00:00:00`
).toLocaleDateString("en-US", {
  weekday: "long",
});

if (
  !teacher.workingDays ||
  !teacher.workingDays.includes(meetingDay)
) {
  return apiError(
    `Teacher is unavailable on ${meetingDay}`,
    400
  );
}

if (
  !teacher.workingHours ||
  data.startTime < teacher.workingHours.start ||
  data.endTime > teacher.workingHours.end
) {
  return apiError(
    `Meeting must be between ${teacher.workingHours.start} and ${teacher.workingHours.end}`,
    400
  );
}

const blocked = teacher.blockedSlots?.find(
  (slot: BlockedSlot) => {
    const slotDate =
      new Date(slot.date)
        .toISOString()
        .split("T")[0];

    return (
      slotDate === data.meetingDate &&
      slot.startTime < data.endTime &&
      slot.endTime > data.startTime
    );
  }
);

if (blocked) {
  return apiError(
    "Teacher has blocked this time slot",
    409
  );
}

    const conflict = await Meeting.findOne({
      meetingDate: new Date(`${data.meetingDate}T00:00:00`),
      status: { $in: activeStatuses },
      startTime: { $lt: data.endTime },
      endTime: { $gt: data.startTime },
      $or: [
        { teacherId: teacher._id },
        { studentEmail: data.studentEmail },
      ],
    }).lean();

    if (conflict) {
      return apiError(
        "This time overlaps with an existing teacher or candidate meeting",
        409
      );
    }

    const calendarEvent = await createCalendarEvent(
      session.accessToken,
      data
    );

    const meeting = await Meeting.create({
      ...data,
      teacherId: teacher._id,
      organizerEmail: session.user.email.toLowerCase(),
      status: "approved",
      googleEventId: calendarEvent.eventId,
      googleMeetLink: calendarEvent.meetLink,
    });

    await meeting.populate(
      "teacherId",
      "name email department designation"
    );

    await createAuditLog({
  action: "MEETING_CREATED",
  performedBy: session.user.email.toLowerCase(),
  role: session.user.role,
  entityType: "meeting",
  entityId: meeting._id.toString(),
  details: {
    title: meeting.title,
    studentEmail: meeting.studentEmail,
    teacherId: teacher._id.toString(),
    meetingDate: meeting.meetingDate,
    startTime: meeting.startTime,
    endTime: meeting.endTime,
  },
});
    return NextResponse.json(
      {
        success: true,
        message: "Meeting scheduled and invitation sent",
        meeting,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create meeting error:", error);
    return apiError(
      "Could not schedule the meeting. Check Google Calendar access.",
      500
    );
  }
}
