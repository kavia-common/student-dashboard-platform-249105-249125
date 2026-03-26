"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { login as apiLogin } from "@/lib/api";
import { AuthUser, getRole, getUser, isAuthenticated, logout as doLogout } from "@/lib/auth";

type AuthContextValue = {
  ready: boolean;
  authenticated: boolean;
  user: AuthUser | null;
  role: string | undefined;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

// PUBLIC_INTERFACE
export function useAuth(): AuthContextValue {
  /** Hook to access authentication state and actions. */
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Client-only hydration: load from localStorage.
    setAuthenticated(isAuthenticated());
    setUser(getUser());
    setRole(getRole());
    setReady(true);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ready,
      authenticated,
      user,
      role,
      login: async (email: string, password: string) => {
        await apiLogin(email, password);
        setAuthenticated(true);
        setUser(getUser());
        setRole(getRole());
      },
      logout: () => {
        doLogout();
        setAuthenticated(false);
        setUser(null);
        setRole(undefined);
      },
    }),
    [ready, authenticated, user, role]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
