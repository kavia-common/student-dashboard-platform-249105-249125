"use client";

import React, { useEffect, useMemo, useState } from "react";
import Protected from "@/components/Protected";
import AppShell from "@/components/AppShell";
import { apiGet, apiPost } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { Banner, Card, EmptyState, Field } from "@/components/UI";

type Grade = {
  id: number;
  class_name: string;
  assignment_title?: string | null;
  score: number;
  max_score: number;
  feedback?: string | null;
  created_at?: string;
};

export default function GradesPage() {
  const { role } = useAuth();
  const canManage = role === "teacher" || role === "admin";

  const [items, setItems] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [className, setClassName] = useState("Math");
  const [assignmentTitle, setAssignmentTitle] = useState("Quiz 1");
  const [score, setScore] = useState("8");
  const [maxScore, setMaxScore] = useState("10");
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const avg = useMemo(() => {
    if (items.length === 0) return null;
    const ratios = items.map((g) => (g.max_score > 0 ? g.score / g.max_score : 0));
    const m = ratios.reduce((a, b) => a + b, 0) / ratios.length;
    return Math.round(m * 100);
  }, [items]);

  async function refresh() {
    const data = await apiGet<Grade[]>("/grades");
    setItems(data);
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await apiGet<Grade[]>("/grades");
        if (!cancelled) setItems(data);
      } catch {
        if (!cancelled) setError("Unable to load grades.");
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

    const sc = Number(score);
    const mx = Number(maxScore);
    if (!className.trim()) {
      setSaveMsg("Class name is required.");
      return;
    }
    if (!Number.isFinite(sc) || !Number.isFinite(mx) || mx <= 0) {
      setSaveMsg("Score/max must be valid numbers (max > 0).");
      return;
    }

    setSaving(true);
    try {
      await apiPost<Grade>("/grades", {
        class_name: className.trim(),
        assignment_title: assignmentTitle.trim() ? assignmentTitle.trim() : null,
        score: sc,
        max_score: mx,
        feedback: feedback.trim() ? feedback.trim() : null,
      });
      await refresh();
      setSaveMsg("Grade created.");
    } catch {
      setSaveMsg("Create failed. Ensure your role is teacher/admin.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Protected>
      <AppShell title="Grades">
        {error ? (
          <Banner kind="error">{error}</Banner>
        ) : (
          <Banner kind="info">
            {avg === null ? "No grades yet." : `Average: ${avg}%`}{" "}
            {canManage ? "• You can add grades." : ""}
          </Banner>
        )}

        {canManage ? (
          <Card title="Add grade">
            {saveMsg ? <Banner kind={saveMsg.includes("failed") ? "error" : "success"}>{saveMsg}</Banner> : null}
            <form onSubmit={onCreate} style={{ marginTop: 12 }}>
              <Field label="Class">
                <input className="input" value={className} onChange={(e) => setClassName(e.target.value)} />
              </Field>
              <Field label="Assignment title">
                <input className="input" value={assignmentTitle} onChange={(e) => setAssignmentTitle(e.target.value)} />
              </Field>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Field label="Score">
                  <input className="input" value={score} onChange={(e) => setScore(e.target.value)} inputMode="numeric" />
                </Field>
                <Field label="Max score">
                  <input className="input" value={maxScore} onChange={(e) => setMaxScore(e.target.value)} inputMode="numeric" />
                </Field>
              </div>
              <Field label="Feedback">
                <textarea className="textarea" value={feedback} onChange={(e) => setFeedback(e.target.value)} />
              </Field>
              <button className="button" type="submit" disabled={saving}>
                {saving ? "Saving…" : "Create"}
              </button>
            </form>
          </Card>
        ) : null}

        <Card title="Gradebook">
          {loading ? (
            <p className="muted">Loading…</p>
          ) : items.length === 0 ? (
            <EmptyState>No grades found.</EmptyState>
          ) : (
            <table className="table" aria-label="Grades table">
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Assignment</th>
                  <th>Score</th>
                  <th>Feedback</th>
                </tr>
              </thead>
              <tbody>
                {items.map((g) => (
                  <tr key={g.id}>
                    <td>{g.class_name}</td>
                    <td>{g.assignment_title ?? "—"}</td>
                    <td>
                      {g.score}/{g.max_score}
                    </td>
                    <td className="muted small">{g.feedback ?? "—"}</td>
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
