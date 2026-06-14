import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { Meeting } from "@/models/Meeting";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  // Redirect unapproved candidate accounts to the pending approval page.
  // This page is the dashboard landing page, so it must guard itself.
  if (session.user.role === "candidate" && session.user.isApproved === false) {
    redirect("/dashboard/pending");
  }

  await connectDB();
  const email = session.user.email.toLowerCase();
  const query =
    session.user.role === "teacher"
      ? { organizerEmail: email }
      : { studentEmail: email };
  const meetings = await Meeting.find(query)
    .populate("teacherId", "name department")
    .sort({ meetingDate: 1, startTime: 1 })
    .lean();

  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const upcoming = meetings.filter(
    (meeting) =>
      meeting.status === "approved" &&
      new Date(meeting.meetingDate) >=
        new Date(`${today}T00:00:00`)
  );
  const completed = meetings.filter(
    (meeting) => meeting.status === "completed"
  ).length;
  const cancelled = meetings.filter(
    (meeting) => meeting.status === "cancelled"
  ).length;
  const todayMeetings = upcoming.filter(
    (meeting) =>
      new Date(meeting.meetingDate).toISOString().slice(0, 10) ===
      today
  );

  const stats = [
    {
      label: "Total meetings",
      value: meetings.length,
      note: "All scheduled records",
      color: "bg-indigo-50 text-indigo-700",
    },
    {
      label: "Upcoming",
      value: upcoming.length,
      note: "Ready on your calendar",
      color: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Completed",
      value: completed,
      note: "Successfully finished",
      color: "bg-blue-50 text-blue-700",
    },
    {
      label: "Cancelled",
      value: cancelled,
      note: "No longer active",
      color: "bg-rose-50 text-rose-700",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8 pb-20 lg:pb-0">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 px-6 py-8 text-white shadow-xl shadow-indigo-200 sm:px-9 sm:py-10">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-indigo-100">
            {new Intl.DateTimeFormat("en", {
              weekday: "long",
              month: "long",
              day: "numeric",
            }).format(now)}
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Welcome back, {session.user.name?.split(" ")[0] || "there"}
          </h1>
          <p className="mt-3 max-w-2xl text-indigo-100">
            {session.user.role === "admin"
              ? "Manage teacher profiles and approve organizers from one place."
              : session.user.role === "teacher"
              ? "Your schedule, candidate invitations, and meeting progress are ready in one place."
              : "Your upcoming teacher meetings and joining links are organized here."}
          </p>
          <Link
            href={
              session.user.role === "admin"
                ? "/dashboard/teachers"
                : "/dashboard/meetings"
            }
            className="mt-7 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-700 shadow-lg hover:-translate-y-0.5 hover:bg-indigo-50"
          >
            {session.user.role === "teacher"
              ? "Schedule a meeting"
              : session.user.role === "admin"
              ? "Manage teachers"
              : "View my meetings"}
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <article key={stat.label} className="app-card p-6">
            <span
              className={`inline-flex rounded-xl px-3 py-1 text-xs font-bold ${stat.color}`}
            >
              {stat.label}
            </span>
            <p className="mt-4 text-4xl font-bold tracking-tight text-slate-950">
              {stat.value}
            </p>
            <p className="mt-2 text-sm text-slate-500">{stat.note}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <div className="app-card p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-indigo-600">
                Next on your calendar
              </p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                Upcoming meetings
              </h2>
            </div>
            <Link
              href="/dashboard/meetings"
              className="text-sm font-bold text-indigo-600 hover:text-indigo-800"
            >
              View all
            </Link>
          </div>

          <div className="mt-6 space-y-3">
            {upcoming.slice(0, 4).map((meeting) => (
              <div
                key={meeting._id.toString()}
                className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-bold text-slate-900">
                    {meeting.title}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {session.user.role === "teacher"
                      ? meeting.studentName
                      : meeting.teacherId?.name || "Teacher"}{" "}
                    · {meeting.startTime} - {meeting.endTime}
                  </p>
                </div>
                <span className="whitespace-nowrap rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700">
                  {new Date(meeting.meetingDate).toLocaleDateString(
                    "en-IN",
                    {
                      day: "numeric",
                      month: "short",
                    }
                  )}
                </span>
              </div>
            ))}
            {upcoming.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 px-5 py-12 text-center">
                <p className="font-bold text-slate-700">
                  No upcoming meetings
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Your schedule is clear for now.
                </p>
              </div>
            )}
          </div>
        </div>

        <aside className="app-card p-6 sm:p-8">
          <p className="text-sm font-bold text-emerald-600">
            Today at a glance
          </p>
          <p className="mt-3 text-5xl font-bold text-slate-950">
            {todayMeetings.length}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {todayMeetings.length === 1
              ? "meeting scheduled today"
              : "meetings scheduled today"}
          </p>
          <div className="mt-8 rounded-2xl bg-slate-950 p-5 text-white">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Account role
            </p>
            <p className="mt-2 text-xl font-bold capitalize">
              {session.user.role}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              {session.user.role === "teacher"
                ? "You can organize and manage candidate meetings."
                : "You can view and join meetings assigned to your email."}
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}
