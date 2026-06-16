import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";
import { createAuditLog } from "@/lib/audit";

import { apiError, getApiSession } from "@/lib/api-auth";
import {
  deleteCalendarEvent,
  updateCalendarEvent,
} from "@/lib/calendar";
import { connectDB } from "@/lib/db";
import {
  firstValidationError,
  meetingUpdateSchema,
} from "@/lib/validation";
import { Meeting } from "@/models/Meeting";

type Context = {
  params: Promise<{ id: string }>;
};

function canAccess(
  meeting: {
    organizerEmail: string;
    studentEmail: string;
  },
  email: string
) {
  return (
    meeting.organizerEmail === email ||
    meeting.studentEmail === email
  );
}

export async function GET(_request: NextRequest, { params }: Context) {
  try {
    const session = await getApiSession();

    if (!session) {
      return apiError("Authentication required", 401);
    }

    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return apiError("Invalid meeting", 400);
    }

    await connectDB();
    const meeting = await Meeting.findById(id).populate(
      "teacherId",
      "name email department designation"
    );

    if (!meeting) {
      return apiError("Meeting not found", 404);
    }

    const email = session.user.email.toLowerCase();

    if (!canAccess(meeting, email)) {
      return apiError("You cannot access this meeting", 403);
    }

    return NextResponse.json({ success: true, meeting });
  } catch (error) {
    console.error("Get meeting error:", error);
    return apiError("Failed to fetch meeting", 500);
  }
}

export async function PATCH(request: NextRequest, { params }: Context) {
  try {
    const session = await getApiSession();

    if (!session) {
      return apiError("Authentication required", 401);
    }

    if (session.user.role !== "teacher" && session.user.role !== "admin") {
      return apiError("Only teachers or admins can update meetings", 403);
    }

    const { id } = await params;

    let body: any;
    try {
      body = await request.json();
    } catch (e) {
      return apiError("Invalid or missing JSON body", 400);
    }

    const parsed = meetingUpdateSchema.safeParse(body);

    if (!Types.ObjectId.isValid(id)) {
      return apiError("Invalid meeting", 400);
    }

    if (!parsed.success) {
      return apiError(firstValidationError(parsed.error), 400);
    }

    await connectDB();
    const meeting =
      session.user.role === "admin"
        ? await Meeting.findById(id)
        : await Meeting.findOne({
            _id: id,
            organizerEmail: session.user.email.toLowerCase(),
          });

    if (!meeting) {
      return apiError("Meeting not found", 404);
    }

    const next = {
      title: parsed.data.title ?? meeting.title,
      description: parsed.data.description ?? meeting.description,
      notes: parsed.data.notes ?? meeting.notes,
      studentEmail:
        parsed.data.studentEmail ?? meeting.studentEmail,
      meetingDate:
        parsed.data.meetingDate ??
        meeting.meetingDate.toISOString().slice(0, 10),
      startTime: parsed.data.startTime ?? meeting.startTime,
      endTime: parsed.data.endTime ?? meeting.endTime,
      timeZone: parsed.data.timeZone ?? meeting.timeZone,
    };

    const scheduleChanged = [
      "title",
      "description",
      "notes",
      "studentEmail",
      "meetingDate",
      "startTime",
      "endTime",
      "timeZone",
    ].some((key) => key in parsed.data);

    if (scheduleChanged) {
      if (!session.accessToken || !meeting.googleEventId) {
        return apiError(
          "Google Calendar access is required to reschedule",
          400
        );
      }

      const conflict = await Meeting.findOne({
        _id: { $ne: meeting._id },
        meetingDate: new Date(`${next.meetingDate}T00:00:00`),
        status: { $in: ["pending", "approved"] },
        startTime: { $lt: next.endTime },
        endTime: { $gt: next.startTime },
        $or: [
          { teacherId: meeting.teacherId },
          { studentEmail: next.studentEmail },
        ],
      }).lean();

      if (conflict) {
        return apiError("The rescheduled time has a conflict", 409);
      }

      await updateCalendarEvent(
        session.accessToken,
        meeting.googleEventId,
        next
      );
    }

    Object.assign(meeting, parsed.data);

    if (
  parsed.data.status === "completed" &&
  Array.isArray(meeting.attendance)
) {
  const now = new Date();

  meeting.attendance.forEach((entry: any) => {
    if (!entry.leftAt) {
      entry.leftAt = now;

      const durationMs =
        now.getTime() -
        new Date(entry.joinedAt).getTime();

      entry.durationMinutes = Math.max(
        1,
        Math.round(durationMs / 60000)
      );
    }
  });
   if (meeting.attendance.length === 0) {
    meeting.attendanceStatus = "no-show";
  } else {
    meeting.attendanceStatus = "present";
  }
}

    await meeting.save();
    await meeting.populate(
      "teacherId",
      "name email department designation"
    );


    if (scheduleChanged) {
  await createAuditLog({
    action: "MEETING_UPDATED",
    performedBy: session.user.email.toLowerCase(),
    role: session.user.role,
    entityType: "meeting",
    entityId: meeting._id.toString(),
    details: {
      title: meeting.title,
      meetingDate: meeting.meetingDate,
      startTime: meeting.startTime,
      endTime: meeting.endTime,
    },
  });
}

if (parsed.data.status === "completed") {
  await createAuditLog({
    action: "MEETING_COMPLETED",
    performedBy: session.user.email.toLowerCase(),
    role: session.user.role,
    entityType: "meeting",
    entityId: meeting._id.toString(),
    details: {
      title: meeting.title,
      studentEmail: meeting.studentEmail,
    },
  });
}

    return NextResponse.json({
      success: true,
      message: "Meeting updated successfully",
      meeting,
    });
  } catch (error) {
    console.error("Update meeting error:", error);
    return apiError("Failed to update meeting", 500);
  }
}

export async function DELETE(_request: NextRequest, { params }: Context) {
  try {
    const session = await getApiSession();

    if (!session) {
      return apiError("Authentication required", 401);
    }

    if (session.user.role !== "teacher" && session.user.role !== "admin") {
      return apiError("Only teachers or admins can cancel meetings", 403);
    }

    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return apiError("Invalid meeting", 400);
    }

    await connectDB();
    const meeting =
      session.user.role === "admin"
        ? await Meeting.findById(id)
        : await Meeting.findOne({
            _id: id,
            organizerEmail: session.user.email.toLowerCase(),
          });

    if (!meeting) {
      return apiError("Meeting not found", 404);
    }

    if (
      meeting.googleEventId &&
      session.accessToken &&
      meeting.status !== "cancelled"
    ) {
      await deleteCalendarEvent(
        session.accessToken,
        meeting.googleEventId
      );
    }

    meeting.status = "cancelled";
    await meeting.save();

    await createAuditLog({
  action: "MEETING_CANCELLED",
  performedBy: session.user.email.toLowerCase(),
  role: session.user.role,
  entityType: "meeting",
  entityId: meeting._id.toString(),
  details: {
    title: meeting.title,
    studentEmail: meeting.studentEmail,
  },
});

    return NextResponse.json({
      success: true,
      message: "Meeting cancelled and participants notified",
    });
  } catch (error) {
    console.error("Cancel meeting error:", error);
    return apiError("Failed to cancel meeting", 500);
  }
}
