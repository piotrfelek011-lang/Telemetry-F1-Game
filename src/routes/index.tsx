import { createFileRoute } from "@tanstack/react-router";
import { Activity, Gauge, LineChart, Radio } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Telemetry — Realtime Signals Dashboard" },
      {
        name: "description",
        content:
          "Monitor live telemetry from your devices and services with realtime metrics, alerts, and insights.",
      },
      { property: "og:title", content: "Telemetry — Realtime Signals Dashboard" },
      {
        property: "og:description",
        content:
          "Monitor live telemetry from your devices and services with realtime metrics, alerts, and insights.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Activity className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold tracking-tight">Telemetry</span>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            All systems nominal
          </div>
        </header>

        <section className="flex flex-1 flex-col items-start justify-center py-20">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            <Radio className="h-3 w-3" /> v0.1 — early preview
          </span>
          <h1 className="max-w-3xl text-5xl font-semibold tracking-tight sm:text-6xl">
            Realtime telemetry,
            <br />
            <span className="text-muted-foreground">without the noise.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base text-muted-foreground">
            Stream metrics from devices and services, visualize what matters, and get
            alerted the moment something drifts out of range.
          </p>
          <div className="mt-8 flex gap-3">
            <button className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
              Start streaming
            </button>
            <button className="rounded-md border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent">
              View docs
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 pb-10 sm:grid-cols-3">
          {[
            {
              icon: Gauge,
              title: "Live metrics",
              desc: "Sub-second ingestion with rolling aggregates.",
            },
            {
              icon: LineChart,
              title: "Time-series view",
              desc: "Inspect any signal across any time window.",
            },
            {
              icon: Radio,
              title: "Smart alerts",
              desc: "Thresholds, anomalies, and quiet hours built in.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-lg border border-border bg-card p-5 transition-colors hover:bg-accent"
            >
              <Icon className="h-5 w-5 text-foreground" />
              <h3 className="mt-3 text-sm font-medium">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
