"use client";

import React, { useEffect, useMemo, useState } from "react";
import Protected from "@/components/Protected";
import AppShell from "@/components/AppShell";
import { apiGet } from "@/lib/api";
import { Card, EmptyState } from "@/components/UI";
import { useAuth } from "@/components/AuthProvider";

type Announcement = {
  id: string;
  title: string;
  body: string;
  posted_at?: string;
};

type Todo = {
  id: string;
  title: string;
  status: string;
  due_at?: string | null;
};

type Assignment = {
  id: string;
  title: string;
  due_at?: string | null;
  status?: string;
};

export default function DashboardPage() {
  const { role } = useAuth();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const roleHint = useMemo(() => {
    if (role === "teacher" || role === "admin") return "You can manage announcements/grades.";
    return "You can track assignments, grades, and your to-dos.";
  }, [role]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [a, t, asg] = await Promise.all([
          apiGet<Announcement[]>("/announcements"),
          apiGet<Todo[]>("/todos"),
          apiGet<Assignment[]>("/assignments"),
        ]);
        if (cancelled) return;
        setAnnouncements(a.slice(0, 3));
        setTodos(t.filter((x) => !x.completed).slice(0, 4));
        setAssignments(asg.slice(0, 4));
      } catch {
        if (cancelled) return;
        setError("Unable to load dashboard data. Check API base URL / CORS / login.");
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
      <AppShell title="Dashboard">
        {error ? (
          <div className="banner banner-error">{error}</div>
        ) : (
          <div className="banner banner-info">{roleHint}</div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 14 }}>
          <div style={{ gridColumn: "span 12" }}>
            <Card title="Upcoming Assignments">
              {loading ? (
                <p className="muted">Loading…</p>
              ) : assignments.length === 0 ? (
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
                    {assignments.map((x) => (
                      <tr key={x.id}>
                        <td>{x.title}</td>
                        <td>{x.due_at ? new Date(x.due_at).toLocaleDateString() : "—"}</td>
                        <td>{x.status ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Card>
          </div>

          <div style={{ gridColumn: "span 12" }}>
            <Card title="Latest Announcements">
              {loading ? (
                <p className="muted">Loading…</p>
              ) : announcements.length === 0 ? (
                <EmptyState>No announcements yet.</EmptyState>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  {announcements.map((x) => (
                    <div key={x.id} className="card" style={{ boxShadow: "2px 2px 0 0 #111827" }}>
                      <div className="cardBody">
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                          <div style={{ fontFamily: "var(--mono)", fontWeight: 900 }}>
                            {x.title}
                          </div>
                          <div className="muted small">
                            {x.posted_at ? new Date(x.posted_at).toLocaleDateString() : ""}
                          </div>
                        </div>
                        <p className="muted small" style={{ marginTop: 6 }}>
                          {x.body}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div style={{ gridColumn: "span 12" }}>
            <Card title="Open To-Dos">
              {loading ? (
                <p className="muted">Loading…</p>
              ) : todos.length === 0 ? (
                <EmptyState>All clear. No open to-dos.</EmptyState>
              ) : (
                <ul style={{ listStyle: "none", display: "grid", gap: 8 }}>
                  {todos.map((t) => (
                    <li key={t.id} className="kvRow">
                      <div style={{ fontFamily: "var(--mono)", fontWeight: 900 }}>{t.title}</div>
                      <div className="muted small">
                        {t.status ? `Status: ${t.status}` : null}{" "}
                        • Due: {t.due_at ? new Date(t.due_at).toLocaleDateString() : "—"}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>
      </AppShell>
    </Protected>
  );
}
