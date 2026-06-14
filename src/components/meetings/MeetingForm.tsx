"use client";

import { useState } from "react";
import { toast } from "sonner";

import type { TeacherRecord } from "@/types/domain";

type Props = {
  teachers: TeacherRecord[];
  fetchMeetings: () => Promise<void>;
};

const initialForm = {
  title: "",
  description: "",
  meetingType: "interview",
  teacherId: "",
  studentName: "",
  studentEmail: "",
  meetingDate: "",
  startTime: "",
  endTime: "",
  notes: "",
  timeZone: "Asia/Kolkata",
};

export default function MeetingForm({
  teachers,
  fetchMeetings,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(initialForm);

  const setField = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setLoading(true);
      const response = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to create meeting");
      }

      toast.success("Meeting scheduled and invitation sent");
      setForm(initialForm);
      await fetchMeetings();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="app-card overflow-hidden">
      <div className="border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-white px-6 py-5 sm:px-8">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-indigo-600">
          Organizer tools
        </p>
        <h2 className="mt-1 text-2xl font-bold text-slate-900">
          Schedule a new meeting
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          A Google Meet link and calendar invitation will be created
          automatically.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 sm:p-8">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Meeting title">
            <input
              required
              value={form.title}
              onChange={(event) => setField("title", event.target.value)}
              className="form-control"
              placeholder="Frontend technical interview"
            />
          </Field>

          <Field label="Meeting type">
            <select
              value={form.meetingType}
              onChange={(event) =>
                setField("meetingType", event.target.value)
              }
              className="form-control"
            >
              <option value="interview">Interview</option>
              <option value="technical-assessment">
                Technical assessment
              </option>
              <option value="training">Training</option>
              <option value="classroom">Classroom</option>
              <option value="mentorship">Mentorship</option>
              <option value="mock-interview">Mock interview</option>
              <option value="group-discussion">Group discussion</option>
            </select>
          </Field>

          <Field label="Teacher profile">
            <select
              required
              value={form.teacherId}
              onChange={(event) =>
                setField("teacherId", event.target.value)
              }
              className="form-control"
            >
              <option value="">Select your profile</option>
              {teachers.map((teacher) => (
                <option key={teacher._id} value={teacher._id}>
                  {teacher.name} · {teacher.department}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Candidate name">
            <input
              required
              value={form.studentName}
              onChange={(event) =>
                setField("studentName", event.target.value)
              }
              className="form-control"
              placeholder="Candidate full name"
            />
          </Field>

          <Field label="Candidate email">
            <input
              required
              type="email"
              value={form.studentEmail}
              onChange={(event) =>
                setField("studentEmail", event.target.value)
              }
              className="form-control"
              placeholder="candidate@example.com"
            />
          </Field>

          <Field label="Meeting date">
            <input
              required
              type="date"
              min={new Date().toISOString().slice(0, 10)}
              value={form.meetingDate}
              onChange={(event) =>
                setField("meetingDate", event.target.value)
              }
              className="form-control"
            />
          </Field>

          <Field label="Start time">
            <input
              required
              type="time"
              value={form.startTime}
              onChange={(event) =>
                setField("startTime", event.target.value)
              }
              className="form-control"
            />
          </Field>

          <Field label="End time">
            <input
              required
              type="time"
              value={form.endTime}
              onChange={(event) =>
                setField("endTime", event.target.value)
              }
              className="form-control"
            />
          </Field>

          <div className="md:col-span-2">
            <Field label="Description">
              <textarea
                rows={3}
                value={form.description}
                onChange={(event) =>
                  setField("description", event.target.value)
                }
                className="form-control resize-y"
                placeholder="What will this meeting cover?"
              />
            </Field>
          </div>

          <div className="md:col-span-2">
            <Field label="Private organizer notes">
              <textarea
                rows={3}
                value={form.notes}
                onChange={(event) =>
                  setField("notes", event.target.value)
                }
                className="form-control resize-y"
                placeholder="Optional preparation notes"
              />
            </Field>
          </div>
        </div>

        <div className="mt-7 flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            Time zone: Asia/Kolkata · Conflicts are checked automatically
          </p>
          <button
            type="submit"
            disabled={loading || teachers.length === 0}
            className="rounded-xl bg-indigo-600 px-6 py-3 font-bold text-white shadow-lg shadow-indigo-200 hover:-translate-y-0.5 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Scheduling..." : "Schedule meeting"}
          </button>
        </div>
      </form>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}
