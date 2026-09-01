"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  ExternalLink,
  User,
  GraduationCap,
  Building2,
  Filter,
} from "lucide-react";
import Link from "next/link";

interface Credential {
  id: string;
  title: string;
  issuer: string;
  type: string | null;
  issuedDate: string | null;
  expiryDate: string | null;
  credentialUrl: string | null;
  documentUrl: string | null;
  status: string;
  rejectReason: string | null;
  verifiedAt: string | null;
  createdAt: string;
  holder: {
    id: string;
    name: string | null;
    email: string | null;
    profile: { university: string | null; headline: string | null } | null;
  };
  verifiedBy: { name: string | null } | null;
}

export default function CredentialsPage() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("PENDING");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  async function fetchCredentials() {
    setLoading(true);
    try {
      const url = filter === "ALL"
        ? "/api/admin/credentials"
        : `/api/admin/credentials?status=${filter}`;
      const res = await fetch(url);
      if (res.ok) {
        setCredentials(await res.json());
      }
    } catch {
      // Demo data fallback
      setCredentials([
        {
          id: "cred-1",
          title: "AWS Solutions Architect – Associate",
          issuer: "Amazon Web Services",
          type: "CERTIFICATION",
          issuedDate: "2025-09-15T00:00:00Z",
          expiryDate: "2028-09-15T00:00:00Z",
          credentialUrl: "https://aws.amazon.com/verification/abc123",
          documentUrl: null,
          status: "PENDING",
          rejectReason: null,
          verifiedAt: null,
          createdAt: "2026-08-20T00:00:00Z",
          holder: { id: "u1", name: "Alex Chen", email: "alex@student.com", profile: { university: "Stanford University", headline: "CS Student" } },
          verifiedBy: null,
        },
        {
          id: "cred-2",
          title: "Google Professional Machine Learning Engineer",
          issuer: "Google Cloud",
          type: "CERTIFICATION",
          issuedDate: "2026-01-10T00:00:00Z",
          expiryDate: "2028-01-10T00:00:00Z",
          credentialUrl: "https://google.com/certs/ml456",
          documentUrl: null,
          status: "PENDING",
          rejectReason: null,
          verifiedAt: null,
          createdAt: "2026-08-22T00:00:00Z",
          holder: { id: "u2", name: "Priya Sharma", email: "priya@student.com", profile: { university: "MIT", headline: "ML Engineering Student" } },
          verifiedBy: null,
        },
        {
          id: "cred-3",
          title: "B.S. Computer Science – Dean's List",
          issuer: "Georgia Institute of Technology",
          type: "ACHIEVEMENT",
          issuedDate: "2025-12-01T00:00:00Z",
          expiryDate: null,
          credentialUrl: null,
          documentUrl: null,
          status: "VERIFIED",
          rejectReason: null,
          verifiedAt: "2026-08-18T00:00:00Z",
          createdAt: "2026-08-15T00:00:00Z",
          holder: { id: "u1", name: "Alex Chen", email: "alex@student.com", profile: { university: "Stanford University", headline: "CS Student" } },
          verifiedBy: { name: "SkillBridge Admin" },
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCredentials();
  }, [filter]);

  async function handleAction(id: string, status: "VERIFIED" | "REJECTED") {
    setProcessingId(id);
    try {
      const res = await fetch("/api/admin/credentials", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status, rejectReason: status === "REJECTED" ? rejectReason : undefined }),
      });

      if (res.ok) {
        setCredentials((prev) =>
          prev.map((c) =>
            c.id === id
              ? { ...c, status, verifiedAt: new Date().toISOString(), rejectReason: status === "REJECTED" ? rejectReason : null }
              : c
          )
        );
        setRejectModal(null);
        setRejectReason("");
      }
    } finally {
      setProcessingId(null);
    }
  }

  const statusConfig: Record<string, { icon: React.ElementType; color: string; variant: "default" | "success" | "warning" | "destructive" | "secondary" }> = {
    PENDING: { icon: Clock, color: "text-yellow-600", variant: "warning" },
    VERIFIED: { icon: CheckCircle2, color: "text-green-600", variant: "success" },
    REJECTED: { icon: XCircle, color: "text-red-600", variant: "destructive" },
  };

  const typeLabels: Record<string, string> = {
    CERTIFICATION: "Certification",
    DEGREE: "Degree",
    COURSE: "Course",
    ACHIEVEMENT: "Achievement",
  };

  const pendingCount = credentials.filter((c) => c.status === "PENDING").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/admin">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Award className="h-6 w-6 text-yellow-600" />
            Credential Verification
          </h1>
          <p className="text-muted-foreground">
            Review and verify student certifications, degrees, and achievements.
          </p>
        </div>
        {pendingCount > 0 && (
          <Badge variant="warning" className="text-sm">
            {pendingCount} pending
          </Badge>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { value: "PENDING", label: "Pending", icon: Clock },
          { value: "VERIFIED", label: "Verified", icon: CheckCircle2 },
          { value: "REJECTED", label: "Rejected", icon: XCircle },
          { value: "ALL", label: "All", icon: Filter },
        ].map((f) => (
          <Button
            key={f.value}
            variant={filter === f.value ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f.value)}
          >
            <f.icon className="mr-1 h-3 w-3" />
            {f.label}
          </Button>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : credentials.length === 0 ? (
            <div className="py-12 text-center">
              <Award className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">No credentials found for this filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Holder</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Credential</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Issued</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {credentials.map((cred) => {
                    const sc = statusConfig[cred.status] || statusConfig.PENDING;
                    return (
                      <tr key={cred.id} className="border-b last:border-0 hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                              {cred.holder.name?.charAt(0) || "?"}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate">{cred.holder.name}</p>
                              <p className="text-[11px] text-muted-foreground truncate">
                                {cred.holder.profile?.university || cred.holder.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-sm">{cred.title}</p>
                            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <Building2 className="h-3 w-3" /> {cred.issuer}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="text-[10px]">
                            {typeLabels[cred.type || ""] || cred.type || "—"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {cred.issuedDate
                            ? new Date(cred.issuedDate).toLocaleDateString("en-US", {
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={sc.variant} className="gap-1">
                            <sc.icon className="h-3 w-3" />
                            {cred.status}
                          </Badge>
                          {cred.rejectReason && (
                            <p className="text-[10px] text-red-500 mt-0.5 max-w-[150px] truncate">
                              {cred.rejectReason}
                            </p>
                          )}
                          {cred.verifiedBy && (
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              by {cred.verifiedBy.name}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            {cred.credentialUrl && (
                              <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                                <a href={cred.credentialUrl} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              </Button>
                            )}
                            {cred.status === "PENDING" && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-green-600 hover:text-green-700 hover:bg-green-50"
                                  onClick={() => handleAction(cred.id, "VERIFIED")}
                                  disabled={processingId === cred.id}
                                >
                                  {processingId === cred.id ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="h-3 w-3" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => setRejectModal(cred.id)}
                                  disabled={processingId === cred.id}
                                >
                                  <XCircle className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Reject Credential</CardTitle>
              <CardDescription>
                Provide a reason for rejecting this credential verification.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="e.g. Insufficient documentation, credential expired, unable to verify..."
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setRejectModal(null); setRejectReason(""); }}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleAction(rejectModal, "REJECTED")}
                  disabled={processingId === rejectModal}
                >
                  {processingId === rejectModal && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
