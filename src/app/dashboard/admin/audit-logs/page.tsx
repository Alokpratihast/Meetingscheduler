"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import AuditLogTable from "@/components/admin/AuditLogTable";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch(
        "/api/audit-logs"
      );

      const data = await res.json();

      if (data.success) {
        setLogs(data.logs);
      }
    } catch {
      toast.error(
        "Failed to load audit logs"
      );
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        Audit Logs
      </h1>

      <AuditLogTable logs={logs} />
    </div>
  );
}