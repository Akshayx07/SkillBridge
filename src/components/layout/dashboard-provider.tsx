"use client";

import { SessionProvider } from "next-auth/react";

import type { Session } from "next-auth";

interface DashboardProviderProps {
  children: React.ReactNode;
  session: Session;
}

export function DashboardProvider({
  children,
  session,
}: DashboardProviderProps) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
