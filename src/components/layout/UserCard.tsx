type Props = {
  name: string;
  email: string;
  role: string;
};

export default function UserCard({
  name,
  email,
  role,
}: Props) {
  return (
    <div className="bg-white border rounded-xl p-6">
      <h3 className="text-lg font-bold">
        User Information
      </h3>

      <div className="mt-4 space-y-2">
        <p>
          <strong>Name:</strong> {name}
        </p>

        <p>
          <strong>Email:</strong> {email}
        </p>

        <p>
          <strong>Role:</strong> {role}
        </p>
      </div>
    </div>
  );
}