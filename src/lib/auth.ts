import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// ─── Role-Based Access Control ──────────────────────────────────────────────
export const ROLES = {
  STUDENT: "STUDENT",
  INDUSTRY: "INDUSTRY",
  ACADEMICIAN: "ACADEMICIAN",
  ADMIN: "ADMIN",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// Extend NextAuth types to include role and id
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string | null;
      email: string | null;
      role: Role;
    };
  }

  interface User {
    role: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}

// ─── NextAuth Configuration ─────────────────────────────────────────────────
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("Invalid email or password");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid email or password");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role as Role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// ─── Role Authorization Helpers ─────────────────────────────────────────────

/** Check if a role is allowed to perform an action */
export function hasRole(userRole: Role, allowedRoles: Role[]): boolean {
  return allowedRoles.includes(userRole);
}

/** Middleware-style guard: throws if user doesn't have required role */
export function requireRole(userRole: Role, requiredRoles: Role[]): void {
  if (!hasRole(userRole, requiredRoles)) {
    throw new Error("Unauthorized: insufficient permissions");
  }
}

/** Common role groups */
export const ROLE_GROUPS = {
  ALL: [ROLES.STUDENT, ROLES.INDUSTRY, ROLES.ACADEMICIAN, ROLES.ADMIN] as Role[],
  ORGANIZERS: [ROLES.INDUSTRY, ROLES.ACADEMICIAN, ROLES.ADMIN] as Role[],
  ADMIN_ONLY: [ROLES.ADMIN] as Role[],
  MENTEES: [ROLES.STUDENT] as Role[],
  MENTORS: [ROLES.INDUSTRY, ROLES.ACADEMICIAN] as Role[],
} as const;
