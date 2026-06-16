import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { google } from "googleapis";

import { connectDB } from "@/lib/db";
import { Teacher } from "@/models/Teacher";
import { User } from "@/models/User";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: process.env.AUTH_TRUST_HOST === "true",
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          access_type: "offline",
          prompt: "consent",
          scope:
            "openid email profile https://www.googleapis.com/auth/calendar",
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, profile }) {
      if (!user.email) {
        return false;
      }

      await connectDB();
      const email = user.email.toLowerCase();
      const existingUser = await User.findOne({ email }).select("role isApproved");
      const teacher = await Teacher.findOne({
        email,
        isActive: true,
      }).select("_id");

      const adminEmails =
        process.env.ADMIN_EMAILS?.split(",")
          .map((item) => item.trim().toLowerCase())
          .filter(Boolean) || [];
      const isAdmin =
        adminEmails.includes(email) ||
        existingUser?.role === "admin";

      const role = isAdmin
        ? "admin"
        : teacher
        ? "teacher"
        : "candidate";

      const approved =
        existingUser?.isApproved ?? (isAdmin || Boolean(teacher));

      await User.findOneAndUpdate(
        { email },
        {
          $set: {
            name: user.name || email,
            image: user.image,
            googleId: profile?.sub,
            role,
            isApproved: approved,
            lastLogin: new Date(),
          },
          $setOnInsert: { email },
        },
        {
          upsert: true,
          new: true,
          runValidators: true,
        }
      );

      return true;
    },
    async jwt({ token, account }: { token: any; account?: any }) {
      const refreshAccessToken = async (token: any) => {
        if (!token.refreshToken) {
          return token;
        }

        try {
          const response = await fetch(
            "https://oauth2.googleapis.com/token",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body: new URLSearchParams({
                client_id: process.env.GOOGLE_CLIENT_ID || "",
                client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
                grant_type: "refresh_token",
                refresh_token: token.refreshToken,
              }),
            }
          );

          const refreshedTokens = await response.json();

          if (!response.ok || !refreshedTokens.access_token) {
            throw refreshedTokens;
          }

          return {
            ...token,
            accessToken: refreshedTokens.access_token,
            accessTokenExpires:
              Date.now() +
              (refreshedTokens.expires_in
                ? refreshedTokens.expires_in * 1000
                : 3600 * 1000),
            refreshToken:
              refreshedTokens.refresh_token || token.refreshToken,
          };
        } catch (error) {
          console.error("Error refreshing access token", error);
          return {
            ...token,
            error: "RefreshAccessTokenError",
          };
        }
      };

      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token || token.refreshToken;
        token.accessTokenExpires = account.expires_in
          ? Date.now() + account.expires_in * 1000
          : Date.now() + 3600 * 1000;
        return token;
      }

      const expires = token.accessTokenExpires;
      if (typeof expires === "number" && Date.now() < expires) {
        return token;
      }

      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (!session.user?.email) {
        return session;
      }

      await connectDB();
      const dbUser = await User.findOne({
        email: session.user.email.toLowerCase(),
      }).select("_id role isApproved");

      if (dbUser) {
        session.user.id = dbUser._id.toString();
        session.user.role = dbUser.role;
        // expose approval state to the session
        // @ts-ignore
        session.user.isApproved = Boolean(dbUser.isApproved);
      }

      session.accessToken =
        typeof token.accessToken === "string"
          ? token.accessToken
          : undefined;
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
});
