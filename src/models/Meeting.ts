import { Schema, model, models } from "mongoose";

const MeetingSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },

    meetingType: {
      type: String,
      enum: [
        "interview",
        "technical-assessment",
        "training",
        "classroom",
        "mentorship",
        "mock-interview",
        "group-discussion",
      ],
      default: "interview",
    },

    teacherId: {
      type: Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
    },

    studentName: {
      type: String,
      required: true,
    },

    studentEmail: {
      type: String,
      required: true,
    },

    meetingDate: {
      type: Date,
      required: true,
    },

    startTime: {
      type: String,
      required: true,
    },

    endTime: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },

    notes: {
      type: String,
      default: "",
    },

    googleMeetLink: {
      type: String,
      default: "",
    },

    googleEventId: {
      type: String,
      default: "",
    },

    attendance: [
      {
        userEmail: {
          type: String,
          required: true,
          lowercase: true,
          trim: true,
        },
        role: {
          type: String,
          enum: ["admin", "teacher", "candidate"],
          required: true,
        },
        joinedAt: {
          type: Date,
          required: true,
        },
        leftAt: {
          type: Date,
        },
        durationMinutes: {
          type: Number,
          default: 0,
        },
      },
    ],

    organizerEmail: {
      type: String,
      required: true,
      index: true,
    },

    timeZone: {
      type: String,
      default: "Asia/Kolkata",
    },
  },
  {
    timestamps: true,
  }
);

MeetingSchema.index({
  teacherId: 1,
  meetingDate: 1,
  startTime: 1,
  endTime: 1,
});
MeetingSchema.index({
  studentEmail: 1,
  meetingDate: 1,
  startTime: 1,
  endTime: 1,
});

export const Meeting =
  models.Meeting ||
  model("Meeting", MeetingSchema);
