"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

import type { UserRole } from "@/types/domain";

const links = [
  { name: "Overview", href: "/dashboard", marker: "O" },
  { name: "Meetings", href: "/dashboard/meetings", marker: "M" },
  { name: "Admin", href: "/dashboard/admin/candidates", marker: "A", adminOnly: true },
  {
    name: "Teachers",
    href: "/dashboard/teachers",
    marker: "T",
    teacherOnly: true,
  },
  {
  name: "Analytics",
  href: "/dashboard/admin/analytics",
  marker: "📊",
  adminOnly: true,
},

  {
    name: "Audit Logs",
    href: "/dashboard/admin/audit-logs",
    marker: "L",
    adminOnly: true,
  },
];

export default function Sidebar({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const visibleLinks = links.filter((link) => {
    if (link.adminOnly) return role === "admin";
    if (link.teacherOnly) return role === "teacher" || role === "admin";
    return true;
  });

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r border-slate-200 bg-slate-950 text-white lg:flex">
        <div className="px-7 pb-6 pt-8">
          <Link href="/dashboard" className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-indigo-500 font-bold shadow-lg shadow-indigo-950">
              TM
            </span>
            <span>
              <span className="block font-bold">MeetFlow</span>
              <span className="text-xs text-slate-400">
                Teacher scheduler
              </span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 space-y-2 px-4 py-4">
          <p className="px-3 pb-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            Workspace
          </p>
          {visibleLinks.map((link) => {
            const active =
              pathname === link.href ||
              (link.href !== "/dashboard" &&
                pathname.startsWith(link.href));

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold ${
                  active
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-950/40"
                    : "text-slate-300 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <span
                  className={`grid h-8 w-8 place-items-center rounded-lg text-xs ${
                    active ? "bg-white/15" : "bg-slate-900"
                  }`}
                >
                  {link.marker}
                </span>
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="m-4 rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
            Signed in as
          </p>
          <p className="mt-1 capitalize text-sm font-bold">{role}</p>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="mt-4 w-full rounded-xl border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800"
          >
            Sign out
          </button>
        </div>
      </aside>

      <nav className="fixed inset-x-3 bottom-3 z-30 flex items-center justify-around rounded-2xl border border-slate-200 bg-slate-950/95 p-2 shadow-2xl backdrop-blur lg:hidden">
        {visibleLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-xl px-4 py-2 text-xs font-semibold ${
              pathname === link.href
                ? "bg-indigo-500 text-white"
                : "text-slate-300"
            }`}
          >
            {link.name}
          </Link>
        ))}

         <button
    type="button"
    onClick={() => signOut({ callbackUrl: "/login" })}
    className="rounded-xl px-4 py-2 text-xs font-semibold text-red-400"
  >
    Logout
  </button>

      </nav>
    </>
  );
}
