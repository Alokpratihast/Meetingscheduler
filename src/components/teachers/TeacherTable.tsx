"use client";

import { toast } from "sonner";

type Teacher = {
  _id: string;
  name: string;
  email: string;
  department: string;
  designation: string;
};

type Props = {
  teachers: Teacher[];
  fetchTeachers?: () => void;
};

export default function TeacherTable({
  teachers,
}: Props) {

  const deleteTeacher = async (
    id: string
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this teacher?"
    );

    if (!confirmed) return;

    try {
      const res = await fetch(
        `/api/teachers/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        throw new Error(
          data?.message || "Failed to delete teacher"
        );
      }

      toast.success("Teacher deleted successfully");

      window.location.reload();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete teacher"
      );
    }
  };

  return (
    <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b">
            <th className="p-4 text-left">
              Name
            </th>

            <th className="p-4 text-left">
              Email
            </th>

            <th className="p-4 text-left">
              Department
            </th>

            <th className="p-4 text-left">
              Designation
            </th>

            <th className="p-4 text-left">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {teachers.map((teacher) => (
            <tr
              key={teacher._id}
              className="border-b"
            >
              <td className="p-4">
                {teacher.name}
              </td>

              <td className="p-4">
                {teacher.email}
              </td>

              <td className="p-4">
                {teacher.department}
              </td>

              <td className="p-4">
                {teacher.designation}
              </td>

              <td className="p-4">
                <button
                  onClick={() =>
                    deleteTeacher(
                      teacher._id
                    )
                  }
                  className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
