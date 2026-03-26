"use client";

import React, { useEffect, useState } from "react";
import Protected from "@/components/Protected";
import AppShell from "@/components/AppShell";
import { apiGet, apiPost } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { Banner, Card, EmptyState, Field } from "@/components/UI";

type Announcement = {
  id: number;
  title: string;
  content: string;
  created_at?: string;
};

export default function AnnouncementsPage() {
  const { role } = useAuth();
  const canManage = role === "teacher" || role === "admin";

  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  async function refresh() {
    const data = await apiGet<Announcement[]>("/announcements");
    setItems(data);
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await apiGet<Announcement[]>("/announcements");
        if (!cancelled) setItems(data);
      } catch {
        if (!cancelled) setError("Unable to load announcements.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveMsg(null);

    if (!title.trim()) {
      setSaveMsg("Title is required.");
      return;
    }
    if (!content.trim()) {
      setSaveMsg("Content is required.");
      return;
    }

    setSaving(true);
    try {
      await apiPost<Announcement>("/announcements", {
        title: title.trim(),
        content: content.trim(),
      });
      setTitle("");
      setContent("");
      await refresh();
      setSaveMsg("Announcement posted.");
    } catch {
      setSaveMsg("Post failed. Ensure your role is teacher/admin.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Protected>
      <AppShell title="Announcements">
        {error ? <Banner kind="error">{error}</Banner> : <Banner kind="info">Stay up to date with class news.</Banner>}

        {canManage ? (
          <Card title="Post announcement">
            {saveMsg ? <Banner kind={saveMsg.includes("failed") ? "error" : "success"}>{saveMsg}</Banner> : null}
            <form onSubmit={onCreate} style={{ marginTop: 12 }}>
              <Field label="Title">
                <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
              </Field>
              <Field label="Content">
                <textarea className="textarea" value={content} onChange={(e) => setContent(e.target.value)} />
              </Field>
              <button className="button" type="submit" disabled={saving}>
                {saving ? "Posting…" : "Post"}
              </button>
            </form>
          </Card>
        ) : null}

        <Card title="All announcements">
          {loading ? (
            <p className="muted">Loading…</p>
          ) : items.length === 0 ? (
            <EmptyState>No announcements found.</EmptyState>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {items.map((x) => (
                <div key={x.id} className="card" style={{ boxShadow: "2px 2px 0 0 #111827" }}>
                  <div className="cardBody">
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                      <div style={{ fontFamily: "var(--mono)", fontWeight: 900 }}>{x.title}</div>
                      <div className="muted small">
                        {x.created_at ? new Date(x.created_at).toLocaleString() : ""}
                      </div>
                    </div>
                    <p className="muted small" style={{ marginTop: 6 }}>
                      {x.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </AppShell>
    </Protected>
  );
}
