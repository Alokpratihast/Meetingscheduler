"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import MeetingForm from "@/components/meetings/MeetingForm";
import MeetingTable from "@/components/meetings/MeetingTable";
import type {
  MeetingRecord,
  MeetingStatus,
  TeacherRecord,
} from "@/types/domain";

export default function MeetingsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [meetings, setMeetings] = useState<MeetingRecord[]>([]);
  const [teachers, setTeachers] = useState<TeacherRecord[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    MeetingStatus | "all"
  >("all");
  const [loading, setLoading] = useState(true);

  const fetchMeetings = async () => {
    const response = await fetch("/api/meetings", {
      cache: "no-store",
    });
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Failed to load meetings");
    }

    setMeetings(data.meetings);
  };

  const fetchTeachers = async () => {
    const response = await fetch("/api/teachers", {
      cache: "no-store",
    });
    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Failed to load teachers");
    }

    setTeachers(data.data);
  };

  useEffect(() => {
    if (session?.user.role === "candidate" && session.user.isApproved === false) {
      router.replace("/dashboard/pending");
      return;
    }

    const load = async () => {
      try {
        await Promise.all([fetchMeetings(), fetchTeachers()]);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to load data"
        );
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [router, session]);

  const normalizedSearch = search.trim().toLowerCase();
  const filteredMeetings = meetings.filter((meeting) => {
    const matchesSearch =
      !normalizedSearch ||
      meeting.title.toLowerCase().includes(normalizedSearch) ||
      meeting.studentName.toLowerCase().includes(normalizedSearch) ||
      meeting.studentEmail.toLowerCase().includes(normalizedSearch);
    const matchesStatus =
      statusFilter === "all" || meeting.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const stats = [
    ["Total", meetings.length, "text-indigo-700 bg-indigo-50"],
    [
      "Upcoming",
      meetings.filter((meeting) => meeting.status === "approved").length,
      "text-emerald-700 bg-emerald-50",
    ],
    [
      "Completed",
      meetings.filter((meeting) => meeting.status === "completed").length,
      "text-blue-700 bg-blue-50",
    ],
    [
      "Cancelled",
      meetings.filter((meeting) => meeting.status === "cancelled").length,
      "text-rose-700 bg-rose-50",
    ],
  ] as const;

  return (
    <div className="mx-auto max-w-7xl space-y-7 pb-20 lg:pb-0">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold text-indigo-600">
            Calendar workspace
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            Meetings
          </h1>
          <p className="mt-2 text-slate-500">
            {session?.user.role === "admin"
              ? "Manage all meetings and teacher schedules from one place."
              : session?.user.role === "teacher"
              ? "Schedule, track, and manage candidate conversations."
              : "View your assigned meetings and join when it is time."}
          </p>
        </div>
        <span className="w-fit rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold capitalize text-slate-600 shadow-sm">
          {session?.user.role || "user"} view
        </span>
      </header>

      {(session?.user.role === "teacher" || session?.user.role === "admin") && (
        <>
          {teachers.length === 0 && !loading && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Your Google email does not have an active teacher profile.
              Add or activate the matching profile before scheduling.
            </div>
          )}
          <MeetingForm
            teachers={teachers}
            fetchMeetings={fetchMeetings}
          />
        </>
      )}

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(([label, value, color]) => (
          <article key={label} className="app-card p-5">
            <span
              className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-bold ${color}`}
            >
              {label}
            </span>
            <p className="mt-3 text-3xl font-bold text-slate-950">
              {value}
            </p>
          </article>
        ))}
      </section>

      <section className="app-card p-4 sm:p-6">
        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <input
            type="search"
            placeholder="Search title, candidate, or email..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="form-control"
          />
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as MeetingStatus | "all"
              )
            }
            className="form-control"
          >
            <option value="all">All statuses</option>
            <option value="approved">Upcoming</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </section>

      {loading ? (
        <div className="app-card p-12 text-center text-sm text-slate-500">
          Loading meetings...
        </div>
      ) : (
        <MeetingTable
          meetings={filteredMeetings}
          fetchMeetings={fetchMeetings}
          canManage={
            session?.user.role === "teacher" ||
            session?.user.role === "admin"
          }
        />
      )}
    </div>
  );
}
