import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";

export function ShellHeader({ crumbs }: { crumbs: { label: string; to?: any; params?: any }[] }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0a0f]/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-lg font-black tracking-tight">
          <span>🏎️</span>
          <span>F1 Telemetry</span>
        </Link>
        <nav className="ml-4 flex items-center gap-2 text-sm text-white/60">
          {crumbs.map((c, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <span className="text-white/30">/</span>}
              {c.to ? (
                <Link to={c.to} params={c.params as any} className="hover:text-white">
                  {c.label}
                </Link>
              ) : (
                <span className="text-white">{c.label}</span>
              )}
            </span>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/"
            className="rounded-md border border-white/15 px-3 py-1.5 text-xs font-semibold hover:bg-white/5"
          >
            Home
          </Link>
        </div>
      </div>
    </header>
  );
}

export function ShellPage({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="mx-auto max-w-[1400px] px-4 py-6">{children}</div>
    </div>
  );
}
