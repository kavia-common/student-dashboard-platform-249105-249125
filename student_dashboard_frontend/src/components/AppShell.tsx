"use client";

import Link from "next/link";
import React, { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

type NavItem = {
  href: string;
  label: string;
  roles?: Array<"student" | "teacher" | "admin">;
};

type Role = "student" | "teacher" | "admin";

function classNames(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export default function AppShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const { role, user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = useMemo<NavItem[]>(
    () => [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/profile", label: "Profile" },
      { href: "/timetable", label: "Timetable" },
      { href: "/assignments", label: "Assignments" },
      { href: "/grades", label: "Grades" },
      { href: "/announcements", label: "Announcements" },
      { href: "/todos", label: "To-Dos" },

      // Teacher/Admin extras (still reuse same pages, but we'll show "Manage" hint)
      { href: "/announcements", label: "Manage Announcements", roles: ["teacher", "admin"] },
      { href: "/grades", label: "Manage Grades", roles: ["teacher", "admin"] },
      { href: "/assignments", label: "Manage Assignments", roles: ["teacher", "admin"] },
    ],
    []
  );

  const visibleItems = useMemo(() => {
    return items.filter((it) => {
      if (!it.roles || it.roles.length === 0) return true;
      if (!role) return false;
      return it.roles.includes(role as Role);
    });
  }, [items, role]);

  const onLogout = () => {
    logout();
    router.replace("/login");
  };

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="nav" aria-label="Primary navigation">
      {visibleItems.map((it) => {
        const active = pathname === it.href;
        return (
          <Link
            key={`${it.href}-${it.label}`}
            href={it.href}
            className={classNames("navLink", active && "navLinkActive")}
            onClick={onNavigate}
          >
            <span className="navDot" aria-hidden="true" />
            <span>{it.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbarLeft">
          <button
            type="button"
            className="iconButton mobileOnly"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            ☰
          </button>
          <Link href="/dashboard" className="brand">
            <span className="brandMark" aria-hidden="true">
              ▣
            </span>
            <span className="brandText">Student Dashboard</span>
          </Link>
        </div>

        <div className="topbarRight">
          <div className="userChip" title={user?.email ?? ""}>
            <span className="userChipRole">{role ?? "user"}</span>
            <span className="userChipEmail">{user?.email ?? "Signed in"}</span>
          </div>
          <button type="button" className="button" onClick={onLogout}>
            Log out
          </button>
        </div>
      </header>

      <div className="body">
        <aside className="sidebar desktopOnly">
          <div className="sidebarHeader">
            <h2 className="sidebarTitle">Menu</h2>
            <p className="muted small">Role-aware links</p>
          </div>
          <NavLinks />
        </aside>

        {/* Mobile drawer */}
        {mobileOpen ? (
          <div className="drawerOverlay" role="presentation" onClick={() => setMobileOpen(false)}>
            <aside
              className="drawer"
              role="dialog"
              aria-label="Mobile navigation"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="drawerHeader">
                <div className="drawerTitle">Menu</div>
                <button
                  type="button"
                  className="iconButton"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                >
                  ✕
                </button>
              </div>
              <NavLinks onNavigate={() => setMobileOpen(false)} />
            </aside>
          </div>
        ) : null}

        <main className="content" role="main">
          <div className="contentHeader">
            <h1 className="pageTitle">{title}</h1>
          </div>
          {children}
        </main>
      </div>

      <footer className="footer">
        <span className="muted small">
          Tip: Demo accounts are seeded in the backend database. Use teacher/admin role for manage
          links.
        </span>
      </footer>
    </div>
  );
}
