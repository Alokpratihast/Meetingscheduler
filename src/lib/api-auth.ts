import { NextResponse } from "next/server";
import type { Session } from "next-auth";

import { auth } from "@/auth";
import type { UserRole } from "@/types/domain";

type ApiSession = Session & {
  user: Session["user"] & {
    email: string;
    role: UserRole;
  };
};

export async function getApiSession(): Promise<ApiSession | null> {
  const session = await auth();

  if (!session?.user?.email) {
    return null;
  }

  return session as ApiSession;
}

export function apiError(message: string, status: number) {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status }
  );
}

export function hasRole(
  role: string | undefined,
  allowedRoles: UserRole[]
) {
  return allowedRoles.includes(role as UserRole);
}
