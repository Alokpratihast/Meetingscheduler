import type { User as AuthUser } from "@auth/core/types";
import type { UserRole } from "@/types/domain";

declare module "@auth/core/types" {
  interface User extends AuthUser {
    role: UserRole;
    isApproved?: boolean;
  }
}

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: AuthUser & {
      role: UserRole;
      isApproved?: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpires?: number;
  }
}
