"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const [signingIn, setSigningIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.replace("/dashboard");
    }
  }, [session, router]);

  if (status === "loading") {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-slate-500">
        Loading your workspace...
      </div>
    );
  }

  return (
    <main className="min-h-screen px-5 py-10 lg:grid lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-12 lg:px-16">
      <section className="mx-auto max-w-2xl py-10 lg:mx-0">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/80 px-4 py-2 text-sm font-semibold text-indigo-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Smarter academic collaboration
        </div>
        <h1 className="text-5xl font-bold tracking-tight text-slate-950 md:text-7xl">
          Meetings that stay
          <span className="block text-indigo-600">organized.</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
          Schedule teacher meetings, create Google Meet invitations,
          avoid calendar conflicts, and keep every participant aligned
          from one focused workspace.
        </p>
        <div className="mt-10 grid max-w-xl gap-4 sm:grid-cols-3">
          {[
            ["01", "Google Calendar sync"],
            ["02", "Role-based access"],
            ["03", "Meeting insights"],
          ].map(([number, label]) => (
            <div
              key={number}
              className="rounded-2xl border border-white/70 bg-white/65 p-4 shadow-sm"
            >
              <p className="text-xs font-bold text-indigo-600">{number}</p>
              <p className="mt-2 text-sm font-semibold text-slate-800">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="app-card mx-auto w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 text-white">
          <div className="mb-10 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-xl font-bold">
            TM
          </div>
          <h2 className="text-3xl font-bold">Welcome back</h2>
          <p className="mt-3 text-indigo-100">
            Sign in with your organization Google account to continue.
          </p>
        </div>
        <div className="p-8">
          <button
            type="button"
            disabled={signingIn}
            onClick={async () => {
              setSigningIn(true);
              await signIn("google", {
                callbackUrl: "/dashboard",
              });
            }}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-5 py-3.5 font-semibold text-slate-800 shadow-sm hover:-translate-y-0.5 hover:bg-slate-50 disabled:cursor-wait disabled:opacity-60"
          >
            <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-blue-500 via-red-500 to-amber-400 text-xs font-bold text-white">
              G
            </span>
            {signingIn ? "Connecting..." : "Continue with Google"}
          </button>
          <p className="mt-5 text-center text-xs leading-5 text-slate-500">
            Calendar permission is used only to create, update, and
            cancel meetings you organize.
          </p>

        </div>
      </section>
    </main>
  );
}
