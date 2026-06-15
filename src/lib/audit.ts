import { AuditLog } from "@/models/AuditLog";

type AuditPayload = {
  action: string;
  performedBy: string;
  role?: string;
  entityType: string;
  entityId: string;
  details?: Record<string, unknown>;
};

export async function createAuditLog(
  payload: AuditPayload
) {
  try {
    await AuditLog.create(payload);
  } catch (error) {
    console.error(
      "Audit log failed:",
      error
    );
  }
}