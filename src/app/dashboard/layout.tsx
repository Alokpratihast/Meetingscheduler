import { redirect } from "next/navigation";

import { auth } from "@/auth";
import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/navbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen lg:flex">
      <Sidebar role={session.user.role} />
      <div className="min-w-0 flex-1 lg:pl-72">
        <Navbar
          name={session.user.name || "User"}
          email={session.user.email || ""}
          role={session.user.role}
          image={session.user.image}
        />
        <main className="px-4 py-6 sm:px-6 lg:px-10 lg:py-9">
          {children}
        </main>
      </div>
    </div>
  );
}
