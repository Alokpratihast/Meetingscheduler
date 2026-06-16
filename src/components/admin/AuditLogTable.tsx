type AuditLog = {
  _id: string;
  action: string;
  performedBy: string;
  role: string;
  entityType: string;
  entityId: string;
  createdAt: string;
};

type Props = {
  logs: AuditLog[];
};

const actionColor = (action: string) => {
  if (action.includes("CREATED"))
    return "bg-green-100 text-green-700";

  if (action.includes("UPDATED"))
    return "bg-blue-100 text-blue-700";

  if (
    action.includes("DELETED") ||
    action.includes("CANCELLED") ||
    action.includes("DEACTIVATED")
  ) {
    return "bg-red-100 text-red-700";
  }

  return "bg-gray-100 text-gray-700";
};

const roleColor = (role: string) => {
  switch (role) {
    case "admin":
      return "bg-purple-100 text-purple-700";

    case "teacher":
      return "bg-indigo-100 text-indigo-700";

    default:
      return "bg-slate-100 text-slate-700";
  }
};

export default function AuditLogTable({
  logs,
}: Props) {
  return (
    <div className="overflow-hidden rounded-3xl border bg-white shadow-sm">
      <div className="border-b px-6 py-5">
        <h2 className="text-xl font-bold">
          Audit Activity
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          System activity and user actions
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-slate-50 text-sm">
              <th className="p-4 text-left font-semibold">
                Action
              </th>

              <th className="p-4 text-left font-semibold">
                User
              </th>

              <th className="p-4 text-left font-semibold">
                Role
              </th>

              <th className="p-4 text-left font-semibold">
                Entity
              </th>

              <th className="p-4 text-left font-semibold">
                Timestamp
              </th>
            </tr>
          </thead>

          <tbody>
            {logs.map((log) => (
              <tr
                key={log._id}
                className="border-b transition hover:bg-slate-50"
              >
                <td className="p-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${actionColor(
                      log.action
                    )}`}
                  >
                    {log.action}
                  </span>
                </td>

                <td className="p-4">
                  <div>
                    <p className="font-medium">
                      {log.performedBy}
                    </p>
                  </div>
                </td>

                <td className="p-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${roleColor(
                      log.role
                    )}`}
                  >
                    {log.role}
                  </span>
                </td>

                <td className="p-4">
                  <div>
                    <p className="font-medium capitalize">
                      {log.entityType}
                    </p>

                    <p className="text-xs text-gray-500">
                      {log.entityId.slice(-8)}
                    </p>
                  </div>
                </td>

                <td className="p-4 text-sm text-gray-600">
                  {new Date(
                    log.createdAt
                  ).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {logs.length === 0 && (
          <div className="py-16 text-center">
            <h3 className="text-lg font-semibold">
              No audit records found
            </h3>

            <p className="mt-2 text-gray-500">
              Activities will appear here automatically.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}