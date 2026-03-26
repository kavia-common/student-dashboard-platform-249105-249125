"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

export default function Home() {
  const router = useRouter();
  const { ready, authenticated } = useAuth();

  useEffect(() => {
    if (!ready) return;
    router.replace(authenticated ? "/dashboard" : "/login");
  }, [ready, authenticated, router]);

  return (
    <main className="page">
      <div className="card">
        <div className="cardBody">
          <p className="muted">Loading…</p>
        </div>
      </div>
    </main>
  );
}
