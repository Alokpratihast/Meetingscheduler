import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { Meeting } from "@/models/Meeting";

export default async function AnalyticsPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }

  await connectDB();

  const meetings = await Meeting.find().lean();

  const totalMeetings = meetings.length;

  const completedMeetings = meetings.filter(
    (meeting: any) => meeting.status === "completed"
  ).length;

  const cancelledMeetings = meetings.filter(
    (meeting: any) => meeting.status === "cancelled"
  ).length;

  const approvedMeetings = meetings.filter(
    (meeting: any) => meeting.status === "approved"
  ).length;

  const presentCount = meetings.filter(
    (meeting: any) =>
      meeting.attendanceStatus === "present"
  ).length;

  const noShowCount = meetings.filter(
    (meeting: any) =>
      meeting.attendanceStatus === "no-show"
  ).length;

  const lateJoinCount = meetings.reduce(
    (count: number, meeting: any) => {
      const lateEntries =
        meeting.attendance?.filter(
          (entry: any) => entry.isLate
        ).length || 0;

      return count + lateEntries;
    },
    0
  );

  const attendanceEntries = meetings.flatMap(
    (meeting: any) => meeting.attendance || []
  );

  const totalAttendanceRecords =
    attendanceEntries.length;

  const totalDuration =
    attendanceEntries.reduce(
      (sum: number, entry: any) =>
        sum + (entry.durationMinutes || 0),
      0
    );

  const averageDuration =
    totalAttendanceRecords > 0
      ? Math.round(
          totalDuration /
            totalAttendanceRecords
        )
      : 0;

  const attendancePercentage =
    completedMeetings > 0
      ? Math.round(
          (presentCount /
            completedMeetings) *
            100
        )
      : 0;

  const stats = [
    {
      title: "Total Meetings",
      value: totalMeetings,
    },
    {
      title: "Completed",
      value: completedMeetings,
    },
    {
      title: "Approved",
      value: approvedMeetings,
    },
    {
      title: "Cancelled",
      value: cancelledMeetings,
    },
    {
      title: "Attendance Records",
      value: totalAttendanceRecords,
    },
    {
      title: "Late Joins",
      value: lateJoinCount,
    },
    {
      title: "No Shows",
      value: noShowCount,
    },
    {
      title: "Attendance %",
      value: `${attendancePercentage}%`,
    },
    {
      title: "Avg Duration",
      value: `${averageDuration} min`,
    },
  ];

  const meetingTypes = meetings.reduce(
    (acc: Record<string, number>, meeting: any) => {
      acc[meeting.meetingType] =
        (acc[meeting.meetingType] || 0) + 1;

      return acc;
    },
    {}
  );

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Analytics Dashboard
        </h1>

        <p className="mt-2 text-slate-500">
          Meeting attendance and platform insights
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="app-card p-6"
          >
            <p className="text-sm font-medium text-slate-500">
              {stat.title}
            </p>

            <p className="mt-3 text-4xl font-bold text-slate-950">
              {stat.value}
            </p>
          </div>
        ))}
      </section>

      <section className="app-card p-6">
        <h2 className="text-xl font-bold">
          Meeting Types
        </h2>

        <div className="mt-6 space-y-3">
          {Object.entries(meetingTypes).map(
            ([type, count]) => (
              <div
                key={type}
                className="flex items-center justify-between rounded-xl border p-4"
              >
                <span className="capitalize">
                  {type}
                </span>

                <span className="font-bold">
                  {count}
                </span>
              </div>
            )
          )}
        </div>
      </section>
    </div>
  );
}