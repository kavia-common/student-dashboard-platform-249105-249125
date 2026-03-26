"use client";

import React, { useEffect, useState } from "react";
import Protected from "@/components/Protected";
import AppShell from "@/components/AppShell";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";
import { Banner, Card, EmptyState, Field } from "@/components/UI";

type Todo = {
  id: number;
  text: string;
  completed: boolean;
  due_date?: string | null;
};

export default function TodosPage() {
  const [items, setItems] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [text, setText] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);

  async function refresh() {
    const data = await apiGet<Todo[]>("/todos");
    setItems(data);
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await apiGet<Todo[]>("/todos");
        if (!cancelled) setItems(data);
      } catch {
        if (!cancelled) setError("Unable to load to-dos.");
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
    if (!text.trim()) return;

    setSaving(true);
    try {
      await apiPost<Todo>("/todos", {
        text: text.trim(),
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
        completed: false,
      });
      setText("");
      setDueDate("");
      await refresh();
    } catch {
      setError("Unable to create to-do.");
    } finally {
      setSaving(false);
    }
  };

  const onToggle = async (todo: Todo) => {
    try {
      await apiPut<Todo>(`/todos/${todo.id}`, { ...todo, completed: !todo.completed });
      await refresh();
    } catch {
      setError("Unable to update to-do.");
    }
  };

  const onDelete = async (todo: Todo) => {
    try {
      await apiDelete<{ ok?: boolean }>(`/todos/${todo.id}`);
      await refresh();
    } catch {
      // If delete isn't implemented on backend, keep UI graceful
      setError("Unable to delete to-do (endpoint may not be enabled).");
    }
  };

  return (
    <Protected>
      <AppShell title="To-Dos">
        {error ? <Banner kind="error">{error}</Banner> : <Banner kind="info">Keep a lightweight checklist.</Banner>}

        <Card title="Add a to-do">
          <form onSubmit={onCreate} style={{ marginTop: 8 }}>
            <Field label="Task">
              <input className="input" value={text} onChange={(e) => setText(e.target.value)} placeholder="Study for quiz…" />
            </Field>
            <Field label="Due date (optional)">
              <input className="input" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </Field>
            <button className="button" type="submit" disabled={saving}>
              {saving ? "Adding…" : "Add"}
            </button>
          </form>
        </Card>

        <Card title="Your list">
          {loading ? (
            <p className="muted">Loading…</p>
          ) : items.length === 0 ? (
            <EmptyState>No to-dos yet.</EmptyState>
          ) : (
            <table className="table" aria-label="Todos table">
              <thead>
                <tr>
                  <th>Done</th>
                  <th>Task</th>
                  <th>Due</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={t.completed}
                        onChange={() => onToggle(t)}
                        aria-label={`Mark ${t.text} as ${t.completed ? "not completed" : "completed"}`}
                      />
                    </td>
                    <td style={{ fontFamily: "var(--mono)", fontWeight: 900 }}>{t.text}</td>
                    <td>{t.due_date ? new Date(t.due_date).toLocaleDateString() : "—"}</td>
                    <td>
                      <button type="button" className="iconButton" onClick={() => onDelete(t)}>
                        Delete
                      </button>
                    </td>
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
