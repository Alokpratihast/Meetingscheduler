"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

type Candidate = {
  _id: string;
  name?: string;
  email: string;
  role?: string;
};

export default function PendingCandidates() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/users?pending=true");
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to load candidates");
      setCandidates(data.data);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load candidates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchCandidates();
  }, []);

  const approve = async (id: string) => {
    try {
      const res = await fetch(`/api/users/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ promote: true }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Approve failed");
      toast.success("Candidate approved successfully");
      setCandidates((c) => c.filter((x) => x._id !== id));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Approve failed");
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Pending Candidates</h1>
      {candidates.length === 0 ? (
        <div className="p-6 text-sm text-slate-500">No pending candidates</div>
      ) : (
        <div className="bg-white border rounded-xl p-4">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-slate-500">
                <th className="p-2">Name</th>
                <th className="p-2">Email</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((c) => (
                <tr key={c._id} className="border-t">
                  <td className="p-2">{c.name || "—"}</td>
                  <td className="p-2">{c.email}</td>
                  <td className="p-2">
                    <button
                      onClick={() => approve(c._id)}
                      className="px-3 py-1 rounded bg-emerald-600 text-white"
                    >
                      Approve as Candidate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
