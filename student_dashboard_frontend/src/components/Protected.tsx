"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function Protected({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: Array<"student" | "teacher" | "admin">;
}) {
  const router = useRouter();
  const { ready, authenticated, role } = useAuth();

  useEffect(() => {
    if (!ready) return;
    if (!authenticated) {
      router.replace("/login");
      return;
    }
    if (roles && roles.length > 0) {
      const ok = role && roles.includes(role as (typeof roles)[number]);
      if (!ok) router.replace("/dashboard");
    }
  }, [ready, authenticated, role, roles, router]);

  if (!ready) {
    return (
      <div className="page">
        <div className="card">
          <p className="muted">Loading session…</p>
        </div>
      </div>
    );
  }

  if (!authenticated) return null;

  if (roles && roles.length > 0) {
    const ok = role && roles.includes(role as (typeof roles)[number]);
    if (!ok) return null;
  }

  return <>{children}</>;
}
