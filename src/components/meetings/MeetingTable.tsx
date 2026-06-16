"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import MeetingDetailsModal from "./MeetingDetailsModal";
import type {
  MeetingRecord,
  MeetingStatus,
} from "@/types/domain";

type Props = {
  meetings: MeetingRecord[];
  fetchMeetings: () => Promise<void>;
  canManage: boolean;
};

const statusStyles: Record<MeetingStatus, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-rose-50 text-rose-700 border-rose-200",
  completed: "bg-blue-50 text-blue-700 border-blue-200",
  cancelled: "bg-slate-100 text-slate-600 border-slate-200",
};

export default function MeetingTable({
  meetings,
  fetchMeetings,
  canManage,
}: Props) {
  const { data: session } = useSession();
  const [selectedMeeting, setSelectedMeeting] =
    useState<MeetingRecord | null>(null);
  const [workingId, setWorkingId] = useState<string | null>(null);

  const completeMeeting = async (id: string) => {
    try {
      setWorkingId(id);
      const response = await fetch(`/api/meetings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to complete meeting");
      }

      toast.success("Meeting marked as completed");
      await fetchMeetings();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setWorkingId(null);
    }
  };

  const cancelMeeting = async (id: string) => {
    if (
      !window.confirm(
        "Cancel this meeting and notify the participant?"
      )
    ) {
      return;
    }

    try {
      setWorkingId(id);
      const response = await fetch(`/api/meetings/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to cancel meeting");
      }

      toast.success("Meeting cancelled");
      await fetchMeetings();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setWorkingId(null);
    }
  };


  const canJoinMeeting = (meeting: MeetingRecord) => {
  const now = new Date();

  const meetingDate = new Date(meeting.meetingDate);

  const [startHour, startMinute] = meeting.startTime
    .split(":")
    .map(Number);

  const [endHour, endMinute] = meeting.endTime
    .split(":")
    .map(Number);

  const start = new Date(meetingDate);
  start.setHours(startHour, startMinute, 0, 0);

  const end = new Date(meetingDate);
  end.setHours(endHour, endMinute, 0, 0);

  // Join allowed 5 minutes before meeting
  const joinStart = new Date(
    start.getTime() - 5 * 60 * 1000
  );

  

  return now >= joinStart && now <= end;
};

  if (meetings.length === 0) {
    return (
      <div className="app-card border-dashed p-14 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-indigo-50 font-bold text-indigo-600">
          0
        </div>
        <h2 className="mt-5 text-xl font-bold text-slate-900">
          No meetings found
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Try another filter or schedule a new meeting.
        </p>
      </div>
    );
  }

  return (
    <>
      <section className="space-y-3">
        {meetings.map((meeting) => (
          <article
            key={meeting._id}
            className="app-card grid gap-5 p-5 lg:grid-cols-[1.3fr_0.9fr_0.8fr_auto] lg:items-center"
          >
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full border px-2.5 py-1 text-xs font-bold capitalize ${statusStyles[meeting.status]}`}
                >
                  {meeting.status}
                </span>
                {meeting.meetingType && (
                  <span className="text-xs font-semibold capitalize text-slate-400">
                    {meeting.meetingType.replaceAll("-", " ")}
                  </span>
                )}
              </div>
              <h3 className="mt-3 text-lg font-bold text-slate-950">
                {meeting.title}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {meeting.studentName} · {meeting.studentEmail}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Teacher
              </p>
              <p className="mt-1 font-semibold text-slate-800">
                {meeting.teacherId?.name || "Teacher"}
              </p>
              <p className="text-sm text-slate-500">
                {meeting.teacherId?.department}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Schedule
              </p>
              <p className="mt-1 font-semibold text-slate-800">
                {new Date(meeting.meetingDate).toLocaleDateString(
                  "en-IN",
                  {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  }
                )}
              </p>
              <p className="text-sm text-slate-500">
                {meeting.startTime} - {meeting.endTime}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 lg:justify-end">
              {meeting.googleMeetLink &&
  meeting.status === "approved" &&
  canJoinMeeting(meeting) && (
    <button
      type="button"
      onClick={async () => {
        const email = session?.user.email?.toLowerCase();

        const isAllowed =
          email === meeting.studentEmail.toLowerCase() ||
          email === meeting.organizerEmail?.toLowerCase() ||
          session?.user.role === "admin";

        if (!isAllowed) {
          toast.error("Only meeting participants can join.");
          return;
        }

        const windowRef = window.open("", "_blank");

        try {
          const response = await fetch(
            `/api/meetings/${meeting._id}/attendance`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                action: "join",
              }),
            }
          );

          const result = await response.json();

          if (!response.ok || !result.success) {
            throw new Error(
              result.message ||
                "Failed to record attendance"
            );
          }

          if (
  windowRef &&
  meeting.googleMeetLink
) {
  windowRef.location.href =
    meeting.googleMeetLink;
}

          toast.success(
            
            "Attendance recorded and meeting opened."
          );
        } catch (error) {
          if (windowRef) {
            windowRef.close();
          }

          toast.error(
            error instanceof Error
              ? error.message
              : "Could not join meeting"
          );
        }
      }}
      className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700"
    >
      Join Meet
    </button>
)}
              <button
                type="button"
                onClick={() => setSelectedMeeting(meeting)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Details
              </button>
              {canManage && meeting.status === "approved" && (
                <>
                  <button
                    type="button"
                    disabled={workingId === meeting._id}
                    onClick={() => completeMeeting(meeting._id)}
                    className="rounded-xl bg-indigo-50 px-4 py-2.5 text-sm font-bold text-indigo-700 hover:bg-indigo-100 disabled:opacity-50"
                  >
                    Complete
                  </button>
                  <button
                    type="button"
                    disabled={workingId === meeting._id}
                    onClick={() => cancelMeeting(meeting._id)}
                    className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm font-bold text-rose-700 hover:bg-rose-100 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </article>
        ))}
      </section>

      <MeetingDetailsModal
        meeting={selectedMeeting}
        isOpen={Boolean(selectedMeeting)}
        onClose={() => setSelectedMeeting(null)}
        fetchMeetings={fetchMeetings}
      />
    </>
  );
}
