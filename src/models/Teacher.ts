import { Schema, model, models } from "mongoose";



const TeacherSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    department: {
      type: String,
      required: true,
    },

    designation: {
      type: String,
      required: true,
    },

    bio: String,

    expertise: [String],

    isActive: {
      type: Boolean,
      default: true,
    },

    // NEW FIELDS

    workingHours: {
      start: {
        type: String,
        default: "09:00",
      },

      end: {
        type: String,
        default: "18:00",
      },
    },

    workingDays: {
      type: [String],
      default: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
      ],
    },

    blockedSlots: [
      {
        date: {
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

        reason: {
          type: String,
          default: "",
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Teacher =
  models.Teacher || model("Teacher", TeacherSchema);