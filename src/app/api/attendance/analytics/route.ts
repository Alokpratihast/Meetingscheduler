import { NextResponse } from "next/server";

import { apiError, getApiSession } from "@/lib/api-auth";
import { connectDB } from "@/lib/db";
import { Meeting } from "@/models/Meeting";

export async function GET() {
  try {
    const session = await getApiSession();

    if (!session) {
      return apiError(
        "Authentication required",
        401
      );
    }

    await connectDB();

    const meetings = await Meeting.find().lean();

    const totalMeetings = meetings.length;

    const presentCount = meetings.filter(
      (meeting) =>
        meeting.attendanceStatus === "present"
    ).length;

    const noShowCount = meetings.filter(
      (meeting) =>
        meeting.attendanceStatus === "no-show"
    ).length;

    const lateJoinCount = meetings.reduce(
      (count, meeting) => {
        const lateEntries =
          meeting.attendance?.filter(
            (entry: any) => entry.isLate
          ).length || 0;

        return count + lateEntries;
      },
      0
    );

    const attendanceEntries = meetings.flatMap(
      (meeting) => meeting.attendance || []
    );

    const totalDuration =
      attendanceEntries.reduce(
        (sum, entry: any) =>
          sum + (entry.durationMinutes || 0),
        0
      );

    const averageDuration =
      attendanceEntries.length > 0
        ? Math.round(
            totalDuration /
              attendanceEntries.length
          )
        : 0;

    const attendancePercentage =
      totalMeetings > 0
        ? Math.round(
            (presentCount / totalMeetings) *
              100
          )
        : 0;

    return NextResponse.json({
      success: true,

      analytics: {
        totalMeetings,

        presentCount,

        absentCount: noShowCount,

        noShowCount,

        lateJoinCount,

        attendancePercentage,

        averageDuration,
      },
    });
  } catch (error) {
    console.error(error);

    return apiError(
      "Failed to fetch attendance analytics",
      500
    );
  }
}