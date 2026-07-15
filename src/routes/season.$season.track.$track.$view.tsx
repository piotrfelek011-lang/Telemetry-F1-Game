import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { appEmbedUrl, titleCaseTrack } from "@/lib/f1-shell";
import { ShellHeader, ShellPage } from "@/components/f1/ShellHeader";

export const Route = createFileRoute("/season/$season/track/$track/$view")({
  component: ViewPage,
});

const LABELS: Record<string, string> = {
  standings: "Standings",
  records: "All-Time Records",
  "quali-results": "Qualifying",
  assignments: "Teams",
  "race-story": "Race Story",
  graphs: "Graphs",
  data: "Laps",
  practice: "Practice",
};

function ViewPage() {
  const { season, track, view } = Route.useParams();
  const { cat } = Route.useSearch();
  const label = LABELS[view] ?? view;
  const trackDisplay = titleCaseTrack(track);
  const src = appEmbedUrl({ season: Number(season), track, view, cat });

  return (
    <>
      <ShellHeader
        crumbs={[
          { label: `Season ${season}`, to: "/" },
          {
            label: cat ? `${trackDisplay} · ${cat}` : trackDisplay,
            to: "/season/$season/track/$track",
            params: { season, track },
            search: { cat },
          },
          { label },
        ]}
      />
      <ShellPage>
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-2xl font-black">{label}</h1>
          <Link
            to="/season/$season/track/$track"
            params={{ season, track }}
            search={{ cat }}
            className="rounded-md border border-white/15 px-3 py-1.5 text-xs font-semibold hover:bg-white/5"
          >
            ← Back to {trackDisplay}
          </Link>
        </div>
        <div className="overflow-hidden rounded-lg border border-white/10 bg-black/30">
          <iframe
            key={src}
            title={label}
            src={src}
            className="min-h-[85vh] w-full"
          />
        </div>
      </ShellPage>
    </>
  );
}
