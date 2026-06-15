import { Schema, model, models } from "mongoose";

const AuditLogSchema = new Schema(
  {
    action: {
      type: String,
      required: true,
    },

    performedBy: {
      type: String,
      required: true,
      lowercase: true,
    },

    role: {
      type: String,
      enum: ["admin", "teacher", "candidate"],
    },

    entityType: {
      type: String,
      required: true,
    },

    entityId: {
      type: String,
      required: true,
    },

    details: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

export const AuditLog =
  models.AuditLog ||
  model("AuditLog", AuditLogSchema);