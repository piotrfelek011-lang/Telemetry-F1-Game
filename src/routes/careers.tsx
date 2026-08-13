import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CAREER_SLOTS, getActiveCareer, setActiveCareer, type CareerSlot } from "@/lib/career";
import { fetchCareerCounts, clearSessionsCache } from "@/lib/f1-shell";
import { ShellPage } from "@/components/f1/ShellHeader";
import { supabase, displayNameFromSession } from "@/lib/supabase";

export const Route = createFileRoute("/careers")({
  head: () => ({
    meta: [
      { title: "Choose a career · F1 Telemetry Analyzer" },
      { name: "description", content: "Pick a driver career or my-team career slot to load its telemetry sessions." },
      { property: "og:title", content: "Choose a career · F1 Telemetry Analyzer" },
      { property: "og:description", content: "Pick a driver career or my-team career slot to load its telemetry sessions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CareersPage,
});

function CareersPage() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [active, setActive] = useState<string | null>(null);
  const [name, setName] = useState("");

  useEffect(() => {
    setActive(getActiveCareer());
    fetchCareerCounts().then(setCounts).catch(() => {});
    supabase.auth.getSession().then(({ data }) => setName(displayNameFromSession(data.session)));
  }, []);

  function choose(slot: CareerSlot) {
    setActiveCareer(slot.id);
    clearSessionsCache();
    navigate({ to: "/" });
  }

  const groups: { type: "driver" | "team"; title: string; blurb: string; icon: string }[] = [
    { type: "driver", title: "Driver career", blurb: "You race for an existing team", icon: "🏎️" },
    { type: "team", title: "My Team career", blurb: "You run your own constructor", icon: "🏗️" },
  ];

  return (
    <ShellPage>
      <div className="mx-auto max-w-4xl py-6">
        <h1 className="text-3xl font-black">Choose a career</h1>
        <p className="mt-2 text-sm text-white/60">
          {name ? `Signed in as ${name}. ` : ""}Every upload is saved into the slot you pick here.
          Switch slots any time from the header.
        </p>

        {groups.map((g) => (
          <section key={g.type} className="mt-8">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-white/60">
              {g.icon} {g.title} <span className="ml-2 font-normal normal-case tracking-normal text-white/35">{g.blurb}</span>
            </h2>
            <div className="grid gap-3 sm:grid-cols-3">
              {CAREER_SLOTS.filter((s) => s.type === g.type).map((s) => {
                const n = counts[s.id] ?? 0;
                const isActive = active === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => choose(s)}
                    className={
                      "flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition hover:-translate-y-0.5 " +
                      (isActive
                        ? "border-red-500 bg-red-500/10"
                        : "border-white/10 bg-white/[0.03] hover:border-red-500/60")
                    }
                  >
                    <span className="text-xs font-black uppercase tracking-widest text-white/50">
                      Slot {s.index}
                    </span>
                    <span className="text-lg font-bold">
                      {g.type === "driver" ? "Driver" : "My Team"} {s.index}
                    </span>
                    <span className="text-xs text-white/55">
                      {n > 0 ? `${n} session${n === 1 ? "" : "s"}` : "Empty — upload to start"}
                    </span>
                    {isActive && (
                      <span className="rounded-sm bg-red-500 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                        Active
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        ))}

        {(counts["unassigned"] ?? 0) > 0 && (
          <p className="mt-8 rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
            {counts["unassigned"]} session(s) are not assigned to a career slot yet. Run the
            migration in SETUP_CAREERS.sql to move them into My Team · Slot 1.
          </p>
        )}
      </div>
    </ShellPage>
  );
}
