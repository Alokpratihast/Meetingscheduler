"use client";

import { toast } from "sonner";
import TeacherTable from "@/components/teachers/TeacherTable";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Teacher = {
  _id: string;
  name: string;
  email: string;
  department: string;
  designation: string;
};

export default function TeachersPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "",
    designation: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.department.trim() ||
      !form.designation.trim()
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to create teacher");
      }

      toast.success("Teacher added successfully");
      setForm({ name: "", email: "", department: "", designation: "" });
      await fetchTeachers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await fetch("/api/teachers");
      const data = await res.json();
      if (data.success) setTeachers(data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load teachers");
    }
  };

  useEffect(() => {
    if (session?.user.role === "candidate" && session.user.isApproved === false) {
      router.replace("/dashboard/pending");
      return;
    }

    void fetchTeachers();
  }, [router, session]);

  const filteredTeachers = teachers.filter((teacher) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      teacher.name.toLowerCase().includes(q) ||
      teacher.email.toLowerCase().includes(q) ||
      teacher.department.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between mb-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Teachers</h1>
          <p className="text-gray-500 mt-1 max-w-xl">
            Add and manage teachers available for meetings. Use the form to quickly create profiles and manage availability.
          </p>
        </div>

        <div className="mt-3 md:mt-0 grid grid-cols-3 gap-3">
          <div className="bg-white border rounded-2xl p-4 shadow-sm text-center">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-2xl font-bold mt-2">{teachers.length}</p>
          </div>
          <div className="bg-white border rounded-2xl p-4 shadow-sm text-center">
            <p className="text-xs text-gray-500">Active</p>
            <p className="text-2xl font-bold mt-2">{teachers.length}</p>
          </div>
          <div className="bg-white border rounded-2xl p-4 shadow-sm text-center">
            <p className="text-xs text-gray-500">Pending</p>
            <p className="text-2xl font-bold mt-2">0</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1 bg-white border rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Add New Teacher</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border rounded-lg p-3"
                placeholder="Dr. Sharma"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full border rounded-lg p-3"
                placeholder="teacher@college.edu"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Department</label>
                <input
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  className="w-full border rounded-lg p-3"
                  placeholder="Computer Science"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Designation</label>
                <input
                  value={form.designation}
                  onChange={(e) => setForm({ ...form, designation: e.target.value })}
                  className="w-full border rounded-lg p-3"
                  placeholder="Professor"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 text-white px-5 py-2 rounded-lg disabled:opacity-50"
              >
                {loading ? "Adding..." : "Add Teacher"}
              </button>
            </div>
          </form>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Teachers Directory</h2>
              <input
                type="text"
                placeholder="Search teacher..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border rounded-lg p-2 w-64"
              />
            </div>

            {filteredTeachers.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold">No Teachers Found</h3>
                <p className="text-gray-500 mt-2">Add a teacher to get started.</p>
              </div>
            ) : (
              <TeacherTable teachers={filteredTeachers} fetchTeachers={fetchTeachers} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
