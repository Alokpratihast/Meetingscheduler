"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import type { MeetingRecord } from "@/types/domain";

type Props = {
  meeting: MeetingRecord | null;
  isOpen: boolean;
  onClose: () => void;
  fetchMeetings: () => Promise<void>;
};

export default function MeetingDetailsModal({
  meeting,
  isOpen,
  onClose,
  fetchMeetings,
}: Props) {
  const { data: session } = useSession();
  const [actionLoading, setActionLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formState, setFormState] = useState({
    title: meeting?.title ?? "",
    description: meeting?.description ?? "",
    meetingType: meeting?.meetingType ?? "interview",
    studentName: meeting?.studentName ?? "",
    studentEmail: meeting?.studentEmail ?? "",
    meetingDate: meeting?.meetingDate ?? "",
    startTime: meeting?.startTime ?? "",
    endTime: meeting?.endTime ?? "",
    notes: meeting?.notes ?? "",
    timeZone: meeting?.timeZone ?? "Asia/Kolkata",
  });

  useEffect(() => {
    setIsEditing(false);
    setFormError(null);
    setFormState({
      title: meeting?.title ?? "",
      description: meeting?.description ?? "",
      meetingType: meeting?.meetingType ?? "interview",
      studentName: meeting?.studentName ?? "",
      studentEmail: meeting?.studentEmail ?? "",
      meetingDate: meeting?.meetingDate ?? "",
      startTime: meeting?.startTime ?? "",
      endTime: meeting?.endTime ?? "",
      notes: meeting?.notes ?? "",
      timeZone: meeting?.timeZone ?? "Asia/Kolkata",
    });
  }, [meeting]);

  if (!isOpen || !meeting) return null;

  const currentMeeting = meeting;

  const setField = (field: keyof typeof formState, value: string) => {
    setFormState((current) => ({ ...current, [field]: value }));
  };

  const saveMeeting = async () => {
    if (!currentMeeting?._id) return;
    setSaving(true);
    setFormError(null);

    try {
      const response = await fetch(`/api/meetings/${currentMeeting._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update meeting");
      }

      toast.success("Meeting updated successfully");
      setIsEditing(false);
      await fetchMeetings();
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Could not update meeting"
      );
    } finally {
      setSaving(false);
    }
  };

  const currentEmail = session?.user.email?.toLowerCase() ?? "";
  const canEdit = Boolean(
    session?.user.role === "admin" ||
      (session?.user.role === "teacher" &&
        currentEmail === currentMeeting.organizerEmail?.toLowerCase())
  );

  const getStatusColor = (
    status: string
  ) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700";

      case "completed":
        return "bg-blue-100 text-blue-700";

      case "rejected":
        return "bg-red-100 text-red-700";

      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const normalizedEmail = session?.user?.email?.toLowerCase() || "";
  const canRecordAttendance = Boolean(
    currentMeeting &&
      (normalizedEmail === currentMeeting.studentEmail.toLowerCase() ||
        (currentMeeting.organizerEmail ?? "").toLowerCase() === normalizedEmail ||
        session?.user.role === "admin")
  );

  const currentAttendance = meeting.attendance?.find(
    (entry) =>
      entry.userEmail.toLowerCase() === normalizedEmail &&
      !entry.leftAt
  );

  const recordAttendance = async (action: "join" | "leave") => {
    if (!meeting._id) return;

    const windowRef = action === "join" ? window.open("", "_blank") : null;
    setActionLoading(true);

    try {
      const response = await fetch(
        `/api/meetings/${meeting._id}/attendance`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        }
      );
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Attendance update failed");
      }

      // Refresh parent data so modal reflects updated attendance
      try {
        await fetchMeetings();
      } catch (e) {
        // ignore
      }

      if (action === "join") {
        const eventUrl = meeting.googleMeetLink ?? "";
        if (windowRef) {
          windowRef.location.href = eventUrl;
        } else if (eventUrl) {
          window.open(eventUrl, "_blank");
        }
      }

      toast.success(
        action === "join"
          ? "Attendance recorded. Joining meeting."
          : "Left meeting and attendance saved."
      );
    } catch (error) {
      if (windowRef) {
        windowRef.close();
      }
      toast.error(
        error instanceof Error ? error.message : "Failed to update attendance"
      );
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div
      className="
        fixed inset-0 z-50
        bg-black/50
        flex items-center justify-center
        p-4
      "
    >
      <div
        className="
          bg-white
          rounded-2xl
          shadow-xl
          w-full
          max-w-3xl
          max-h-[90vh]
          overflow-y-auto
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b p-6">
          <div>
            <h2 className="text-2xl font-bold">
              Meeting Details
            </h2>

            <p className="text-gray-500 text-sm mt-1">
              Complete meeting information
            </p>
          </div>

          <div className="flex items-center gap-3">
            {canEdit && (
              <button
                type="button"
                onClick={() => {
                  setIsEditing((current) => !current);
                  setFormError(null);
                }}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                {isEditing ? "Cancel edit" : "Edit meeting"}
              </button>
            )}
            <button
              onClick={onClose}
              className="
                w-10 h-10
                rounded-full
                hover:bg-gray-100
                text-xl
              "
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">

          {/* Title + Status */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h3 className="text-xl font-semibold">
                {meeting.title}
              </h3>
            </div>

            <span
              className={`
                px-4 py-2
                rounded-full
                text-sm
                font-medium
                ${getStatusColor(meeting.status)}
              `}
            >
              {meeting.status}
            </span>
          </div>

          {isEditing && (
            <div className="border rounded-xl p-5">
              <h4 className="font-semibold mb-4">Edit meeting</h4>
              {formError && (
                <p className="mb-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {formError}
                </p>
              )}
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Title
                  </span>
                  <input
                    type="text"
                    value={formState.title}
                    onChange={(event) => setField("title", event.target.value)}
                    className="form-control"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Meeting type
                  </span>
                  <select
                    value={formState.meetingType}
                    onChange={(event) => setField("meetingType", event.target.value)}
                    className="form-control"
                  >
                    <option value="interview">Interview</option>
                    <option value="technical-assessment">Technical assessment</option>
                    <option value="training">Training</option>
                    <option value="classroom">Classroom</option>
                    <option value="mentorship">Mentorship</option>
                    <option value="mock-interview">Mock interview</option>
                    <option value="group-discussion">Group discussion</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Candidate name
                  </span>
                  <input
                    type="text"
                    value={formState.studentName}
                    onChange={(event) => setField("studentName", event.target.value)}
                    className="form-control"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Candidate email
                  </span>
                  <input
                    type="email"
                    value={formState.studentEmail}
                    onChange={(event) => setField("studentEmail", event.target.value)}
                    className="form-control"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Meeting date
                  </span>
                  <input
                    type="date"
                    value={formState.meetingDate}
                    onChange={(event) => setField("meetingDate", event.target.value)}
                    className="form-control"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Start time
                  </span>
                  <input
                    type="time"
                    value={formState.startTime}
                    onChange={(event) => setField("startTime", event.target.value)}
                    className="form-control"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    End time
                  </span>
                  <input
                    type="time"
                    value={formState.endTime}
                    onChange={(event) => setField("endTime", event.target.value)}
                    className="form-control"
                  />
                </label>

                <label className="md:col-span-2 block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">
                    Notes
                  </span>
                  <textarea
                    rows={3}
                    value={formState.notes}
                    onChange={(event) => setField("notes", event.target.value)}
                    className="form-control resize-y"
                  />
                </label>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={saving}
                  onClick={saveMeeting}
                  className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setIsEditing(false)}
                  className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Teacher */}
          <div className="border rounded-xl p-5">
            <h4 className="font-semibold mb-4">
              Teacher Information
            </h4>

            <div className="grid md:grid-cols-2 gap-4">
              <InfoItem
                label="Name"
                value={
                  currentMeeting.teacherId?.name ||
                  "N/A"
                }
              />

              <InfoItem
                label="Email"
                value={
                  currentMeeting.teacherId?.email ||
                  "N/A"
                }
              />

              <InfoItem
                label="Department"
                value={
                  currentMeeting.teacherId
                    ?.department || "N/A"
                }
              />

              <InfoItem
                label="Designation"
                value={
                  currentMeeting.teacherId
                    ?.designation || "N/A"
                }
              />
            </div>
          </div>

          {/* Student */}
          <div className="border rounded-xl p-5">
            <h4 className="font-semibold mb-4">
              Student Information
            </h4>

            <div className="grid md:grid-cols-2 gap-4">
              <InfoItem
                label="Student Name"
                value={meeting.studentName}
              />

              <InfoItem
                label="Student Email"
                value={meeting.studentEmail}
              />
            </div>
          </div>

          {/* Schedule */}
          <div className="border rounded-xl p-5">
            <h4 className="font-semibold mb-4">
              Meeting Schedule
            </h4>

            <div className="grid md:grid-cols-2 gap-4">
              <InfoItem
                label="Date"
                value={new Date(
                  meeting.meetingDate
                ).toLocaleDateString()}
              />

              <InfoItem
                label="Time"
                value={`${meeting.startTime} - ${meeting.endTime}`}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="border rounded-xl p-5">
            <h4 className="font-semibold mb-3">
              Notes
            </h4>

            <p className="text-gray-700 whitespace-pre-wrap">
              {meeting.notes ||
                "No notes available"}
            </p>
          </div>

          {/* Meet Link */}
          {meeting.googleMeetLink && (
            <div className="border rounded-xl p-5">
              <h4 className="font-semibold mb-3">
                Google Meet
              </h4>

              <div className="flex flex-wrap gap-3">
                <button
                  disabled={actionLoading || !canRecordAttendance}
                  onClick={() => recordAttendance("join")}
                  className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg font-medium disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {actionLoading && currentAttendance ? "Working..." : "Join Meeting"}
                </button>
                {canRecordAttendance && currentAttendance && (
                  <button
                    disabled={actionLoading}
                    onClick={() => recordAttendance("leave")}
                    className="inline-flex items-center bg-slate-800 hover:bg-slate-900 text-white px-5 py-3 rounded-lg font-medium disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    Leave Meeting
                  </button>
                )}
              </div>

              {!canRecordAttendance && (
                <p className="mt-3 text-sm text-slate-500">
                  Only meeting participants can record attendance.
                </p>
              )}
            </div>
          )}

          {meeting.attendance?.length ? (
            <div className="border rounded-xl p-5">
              <h4 className="font-semibold mb-3">
                Attendance History
              </h4>
              <div className="space-y-3 text-sm text-slate-700">
                {meeting.attendance.map((entry, index) => (
                  <div key={`${entry.userEmail}-${index}`} className="rounded-xl border border-slate-200 p-3">
                    <p className="font-semibold">
                      {entry.userEmail} • {entry.role}
                    </p>
                    <p>
                      Joined: {new Date(entry.joinedAt).toLocaleString()}
                    </p>
                    <p>
                      Left: {entry.leftAt ? new Date(entry.leftAt).toLocaleString() : "Still in meeting"}
                    </p>
                    {entry.durationMinutes !== undefined && (
                      <p>Duration: {entry.durationMinutes} min</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* Metadata */}
          <div className="border rounded-xl p-5">
            <h4 className="font-semibold mb-3">
              Metadata
            </h4>

            <InfoItem
              label="Created"
              value={
                currentMeeting.createdAt
                  ? new Date(
                      currentMeeting.createdAt
                    ).toLocaleString()
                  : "N/A"
              }
            />
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-6 flex justify-end">
          <button
            onClick={onClose}
            className="
              bg-black
              text-white
              px-6 py-3
              rounded-lg
              hover:opacity-90
            "
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-sm text-gray-500">
        {label}
      </p>

      <p className="font-medium mt-1">
        {value}
      </p>
    </div>
  );
}
