"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password. Please try again.");
      return;
    }

    // Fetch session to get role for redirect
    const res = await fetch("/api/auth/session");
    const session = await res.json();

    if (session?.user?.role) {
      router.push(`/dashboard/${session.user.role.toLowerCase()}`);
    } else {
      router.push("/dashboard");
    }
  }

  async function handleDemoLogin(role: string) {
    const credentials: Record<string, string> = {
      student: "alex@student.com",
      industry: "jordan@industry.com",
      academician: "sarah@academician.com",
      admin: "admin@skillbridge.com",
    };

    setEmail(credentials[role]);
    setPassword("password123");
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email: credentials[role],
      password: "password123",
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Demo login failed. Is the database seeded?");
      return;
    }

    router.push(`/dashboard/${role}`);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">SkillBridge</CardTitle>
          <CardDescription>
            Sign in to the hackathon platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Demo Accounts
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {(["student", "industry", "academician", "admin"] as const).map(
              (role) => (
                <Button
                  key={role}
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin(role)}
                  disabled={loading}
                  className="capitalize"
                >
                  {role}
                </Button>
              )
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-1.5">
            <Badge variant="secondary">Student</Badge>
            <Badge variant="secondary">Industry</Badge>
            <Badge variant="secondary">Academician</Badge>
            <Badge variant="secondary">Admin</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
