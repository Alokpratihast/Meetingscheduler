import { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
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

    image: String,

    googleId: String,

    role: {
      type: String,
      enum: ["admin", "teacher", "candidate"],
      default: "candidate",
    },
    isApproved: {
      type: Boolean,
      default: false,
    },

    lastLogin: Date,
  },
  {
    timestamps: true,
  }
);

export const User =
  models.User || model("User", UserSchema);
