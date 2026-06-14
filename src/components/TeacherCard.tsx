type Props = {
  teacher: {
    _id: string;
    name: string;
    email: string;
    department: string;
    designation: string;
  };
};

export default function TeacherCard({
  teacher,
}: Props) {
  return (
    <div className="border rounded-xl p-4 bg-white shadow-sm">
      <h2 className="font-bold text-lg">
        {teacher.name}
      </h2>

      <p>{teacher.email}</p>

      <p className="text-gray-600">
        {teacher.department}
      </p>

      <p className="text-sm">
        {teacher.designation}
      </p>
    </div>
  );
}