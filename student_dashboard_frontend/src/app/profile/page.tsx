"use client";

import React, { useEffect, useState } from "react";
import Protected from "@/components/Protected";
import AppShell from "@/components/AppShell";
import { apiGet } from "@/lib/api";
import { Banner, Card, EmptyState, KeyValueList } from "@/components/UI";

type Profile = {
  id: number;
  email: string;
  full_name?: string | null;
  role?: string;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const p = await apiGet<Profile>("/profile");
        if (!cancelled) setProfile(p);
      } catch {
        if (!cancelled) setError("Unable to load profile.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Protected>
      <AppShell title="Profile">
        {error ? <Banner kind="error">{error}</Banner> : null}

        <Card title="Your details">
          {loading ? (
            <p className="muted">Loading…</p>
          ) : !profile ? (
            <EmptyState>No profile returned.</EmptyState>
          ) : (
            <KeyValueList
              items={[
                { k: "Email", v: profile.email },
                { k: "Full name", v: profile.full_name ?? "—" },
                { k: "Role", v: profile.role ?? "—" },
                { k: "User ID", v: profile.id },
              ]}
            />
          )}
        </Card>
      </AppShell>
    </Protected>
  );
}
