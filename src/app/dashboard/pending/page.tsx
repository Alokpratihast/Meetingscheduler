export default function PendingPage() {
  return (
    <div className="max-w-3xl mx-auto p-8">
      <div className="bg-white border rounded-2xl p-8 text-center">
        <h1 className="text-2xl font-bold">Account pending approval</h1>
        <p className="mt-4 text-gray-600">
          Your account is pending approval by an admin. You will be notified when an admin approves your access. If you think this is an error, contact your administrator.
        </p>
      </div>
    </div>
  );
}
