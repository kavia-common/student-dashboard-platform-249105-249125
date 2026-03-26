"use client";

import React from "react";

export function Card({
  title,
  children,
  actions,
}: {
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <section className="card">
      {title ? (
        <header className="cardHeader">
          <h2 className="cardTitle">{title}</h2>
          {actions ? <div className="cardActions">{actions}</div> : null}
        </header>
      ) : null}
      <div className="cardBody">{children}</div>
    </section>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="field">
      <label className="label">
        <span>{label}</span>
      </label>
      {children}
      {hint ? <p className="hint">{hint}</p> : null}
    </div>
  );
}

export function Banner({
  kind,
  children,
}: {
  kind: "info" | "success" | "error";
  children: React.ReactNode;
}) {
  return <div className={`banner banner-${kind}`}>{children}</div>;
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return <div className="empty">{children}</div>;
}

export function KeyValueList({
  items,
}: {
  items: Array<{ k: string; v: React.ReactNode }>;
}) {
  return (
    <dl className="kv">
      {items.map((it) => (
        <div key={it.k} className="kvRow">
          <dt className="kvKey">{it.k}</dt>
          <dd className="kvVal">{it.v}</dd>
        </div>
      ))}
    </dl>
  );
}
