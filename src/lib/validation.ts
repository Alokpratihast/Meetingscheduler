import { z } from "zod";

export const meetingTypes = [
  "interview",
  "technical-assessment",
  "training",
  "classroom",
  "mentorship",
  "mock-interview",
  "group-discussion",
] as const;

export const meetingStatuses = [
  "pending",
  "approved",
  "rejected",
  "completed",
  "cancelled",
] as const;

export const teacherSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email().trim().toLowerCase(),
  department: z.string().trim().min(2).max(100),
  designation: z.string().trim().min(2).max(100),
  bio: z.string().trim().max(1000).optional().default(""),
  expertise: z.array(z.string().trim().min(1).max(80)).optional().default([]),
});

const meetingObjectSchema = z.object({
  title: z.string().trim().min(3).max(150),
  description: z.string().trim().max(2000).optional().default(""),
  meetingType: z.enum(meetingTypes).default("interview"),
  teacherId: z.string().trim().min(1),
  studentName: z.string().trim().min(2).max(100),
  studentEmail: z.email().trim().toLowerCase(),
  meetingDate: z.iso.date(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  notes: z.string().trim().max(2000).optional().default(""),
  timeZone: z.string().trim().min(1).default("Asia/Kolkata"),
});

export const meetingSchema = meetingObjectSchema
  .refine((data) => data.startTime < data.endTime, {
    message: "End time must be later than start time",
    path: ["endTime"],
  });

export const meetingUpdateSchema = meetingObjectSchema
  .partial()
  .extend({
    status: z.enum(meetingStatuses).optional(),
  })
  .refine(
    (data) =>
      !data.startTime ||
      !data.endTime ||
      data.startTime < data.endTime,
    {
      message: "End time must be later than start time",
      path: ["endTime"],
    }
  )
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export function firstValidationError(error: z.ZodError) {
  return error.issues[0]?.message || "Invalid request data";
}
