"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { Banner, Card, Field } from "@/components/UI";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function LoginPage() {
  const router = useRouter();
  const { ready, authenticated, login } = useAuth();

  const [email, setEmail] = useState("student1@example.com");
  const [password, setPassword] = useState("password");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ready) return;
    if (authenticated) router.replace("/dashboard");
  }, [ready, authenticated, router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isValidEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (!password.trim()) {
      setError("Password is required.");
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page">
      <div style={{ width: "min(520px, 100%)" }}>
        <Card
          title="Log in"
          actions={<span className="muted small">v1 • retro export-safe</span>}
        >
          <p className="muted small" style={{ marginBottom: 12 }}>
            Uses a JWT stored in <span style={{ fontFamily: "var(--mono)" }}>localStorage</span>.
            Ensure the backend allows CORS for this frontend origin.
          </p>

          {error ? <Banner kind="error">{error}</Banner> : null}

          <form onSubmit={onSubmit} style={{ marginTop: 12 }}>
            <Field label="Email">
              <input
                className="input"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student1@example.com"
              />
            </Field>

            <Field label="Password" hint="Demo seed uses 'password' for all demo users.">
              <input
                className="input"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
              />
            </Field>

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button className="button" type="submit" disabled={loading}>
                {loading ? "Signing in…" : "Sign in"}
              </button>
              <span className="muted small">
                API: <code style={{ fontFamily: "var(--mono)" }}>NEXT_PUBLIC_API_BASE_URL</code>
              </span>
            </div>
          </form>
        </Card>

        <div style={{ marginTop: 14 }}>
          <Card title="Demo accounts">
            <table className="table" aria-label="Demo accounts table">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Email</th>
                  <th>Password</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>student</td>
                  <td>student1@example.com</td>
                  <td>password</td>
                </tr>
                <tr>
                  <td>teacher</td>
                  <td>teacher1@example.com</td>
                  <td>password</td>
                </tr>
                <tr>
                  <td>admin</td>
                  <td>admin1@example.com</td>
                  <td>password</td>
                </tr>
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    </main>
  );
}
