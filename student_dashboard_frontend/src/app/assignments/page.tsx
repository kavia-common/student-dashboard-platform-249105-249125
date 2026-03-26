"use client";

import React, { useEffect, useMemo, useState } from "react";
import Protected from "@/components/Protected";
import AppShell from "@/components/AppShell";
import { apiGet, apiPost } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { Banner, Card, EmptyState, Field } from "@/components/UI";

type Assignment = {
  id: number;
  title: string;
  description?: string | null;
  due_date?: string | null;
  status?: string | null;
};

export default function AssignmentsPage() {
  const { role } = useAuth();
  const canManage = role === "teacher" || role === "admin";

  const [items, setItems] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const headerHint = useMemo(() => {
    if (canManage) return "Create and review assignments.";
    return "Track upcoming assignments.";
  }, [canManage]);

  async function refresh() {
    const data = await apiGet<Assignment[]>("/assignments");
    setItems(data);
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await apiGet<Assignment[]>("/assignments");
        if (!cancelled) setItems(data);
      } catch {
        if (!cancelled) setError("Unable to load assignments.");
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

    setSaving(true);
    try {
      await apiPost<Assignment>("/assignments", {
        title: title.trim(),
        description: description.trim() ? description.trim() : null,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
        status: "assigned",
      });
      setTitle("");
      setDescription("");
      setDueDate("");
      await refresh();
      setSaveMsg("Assignment created.");
    } catch {
      setSaveMsg("Create failed. Ensure your role is teacher/admin.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Protected>
      <AppShell title="Assignments">
        {error ? <Banner kind="error">{error}</Banner> : <Banner kind="info">{headerHint}</Banner>}

        {canManage ? (
          <Card title="Create assignment">
            {saveMsg ? <Banner kind={saveMsg.includes("failed") ? "error" : "success"}>{saveMsg}</Banner> : null}
            <form onSubmit={onCreate} style={{ marginTop: 12 }}>
              <Field label="Title">
                <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
              </Field>
              <Field label="Description">
                <textarea
                  className="textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Field>
              <Field label="Due date">
                <input
                  className="input"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </Field>
              <button className="button" type="submit" disabled={saving}>
                {saving ? "Saving…" : "Create"}
              </button>
            </form>
          </Card>
        ) : null}

        <Card title="All assignments">
          {loading ? (
            <p className="muted">Loading…</p>
          ) : items.length === 0 ? (
            <EmptyState>No assignments found.</EmptyState>
          ) : (
            <table className="table" aria-label="Assignments table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Due</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((x) => (
                  <tr key={x.id}>
                    <td>
                      <div style={{ fontFamily: "var(--mono)", fontWeight: 900 }}>{x.title}</div>
                      {x.description ? <div className="muted small">{x.description}</div> : null}
                    </td>
                    <td>{x.due_date ? new Date(x.due_date).toLocaleDateString() : "—"}</td>
                    <td>{x.status ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </AppShell>
    </Protected>
  );
}
