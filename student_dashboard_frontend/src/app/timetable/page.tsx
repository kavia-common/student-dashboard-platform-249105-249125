"use client";

import React, { useEffect, useState } from "react";
import Protected from "@/components/Protected";
import AppShell from "@/components/AppShell";
import { apiGet } from "@/lib/api";
import { Banner, Card, EmptyState } from "@/components/UI";

type TimetableItem = {
  id: number;
  class_name: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  location?: string | null;
};

export default function TimetablePage() {
  const [items, setItems] = useState<TimetableItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await apiGet<TimetableItem[]>("/timetable");
        if (!cancelled) setItems(data);
      } catch {
        if (!cancelled) setError("Unable to load timetable.");
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
      <AppShell title="Timetable">
        {error ? <Banner kind="error">{error}</Banner> : null}

        <Card title="Weekly schedule">
          {loading ? (
            <p className="muted">Loading…</p>
          ) : items.length === 0 ? (
            <EmptyState>No timetable entries found.</EmptyState>
          ) : (
            <table className="table" aria-label="Timetable table">
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Day</th>
                  <th>Time</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>
                {items.map((x) => (
                  <tr key={x.id}>
                    <td>{x.class_name}</td>
                    <td>{x.day_of_week}</td>
                    <td>
                      {x.start_time}–{x.end_time}
                    </td>
                    <td>{x.location ?? "—"}</td>
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
