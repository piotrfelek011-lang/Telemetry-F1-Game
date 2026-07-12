// Client-side helpers for the F1 shell routes.
// Reads sessions directly from Supabase REST API (anon key, matches /app/script.js).

export const SUPABASE_URL = "https://kbjjtiajugxvhoboqxwb.supabase.co";
export const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtiamp0aWFqdWd4dmhvYm9xeHdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwODE5NzUsImV4cCI6MjA5MTY1Nzk3NX0.VI2B5EcQXx_aaXyOB-eGXentTbMRG6obxu6IjUv7juI";

export type Session = {
  id: string;
  season: number;
  track_name: string;
  category: string;
  finishing_position: number | null;
  starting_position: number | null;
  created_at: string;
  lap_history?: any[];
  session_info?: any;
  race_story?: any;
};

const SEASON_KEY = "f1.season";

export function getSavedSeason(): number {
  if (typeof window === "undefined") return 1;
  const raw = window.localStorage.getItem(SEASON_KEY);
  const n = raw ? Number(raw) : 1;
  return Number.isFinite(n) && n >= 1 ? n : 1;
}
export function setSavedSeason(n: number) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SEASON_KEY, String(n));
}

export async function fetchSessions(season?: number): Promise<Session[]> {
  const url = new URL(`${SUPABASE_URL}/rest/v1/sessions`);
  url.searchParams.set("select", "*");
  url.searchParams.set("order", "created_at.desc");
  if (season != null) url.searchParams.set("season", `eq.${season}`);
  const res = await fetch(url.toString(), {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });
  if (!res.ok) throw new Error(`Failed to load sessions (${res.status})`);
  return res.json();
}

export function trackSlug(name: string) {
  return (name || "").toLowerCase().trim();
}

const BASE = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "") + "/";

export function trackMapUrl(name: string) {
  return `${BASE}track-maps/${trackSlug(name)}.png`;
}
export function appEmbedUrl(params: { season: number; track: string; view: string; cat?: string }) {
  const qp = new URLSearchParams();
  qp.set("season", String(params.season));
  qp.set("track", params.track);
  qp.set("view", params.view);
  if (params.cat) qp.set("cat", params.cat);
  return `${BASE}app/index.html?${qp.toString()}`;
}
export function appManageUrl() {
  return `${BASE}app/index.html`;
}

const TRACK_FLAGS: Record<string, string> = {
  melbourne: "🇦🇺", shanghai: "🇨🇳", suzuka: "🇯🇵", sakhir: "🇧🇭",
  jeddah: "🇸🇦", miami: "🇺🇸", imola: "🇮🇹", monaco: "🇲🇨",
  catalunya: "🇪🇸", montreal: "🇨🇦", austria: "🇦🇹", silverstone: "🇬🇧",
  spa: "🇧🇪", hungaroring: "🇭🇺", zandvoort: "🇳🇱", monza: "🇮🇹",
  madrid: "🇪🇸", baku: "🇦🇿", singapore: "🇸🇬", texas: "🇺🇸",
  austin: "🇺🇸", mexico: "🇲🇽", mexico_city: "🇲🇽", interlagos: "🇧🇷",
  brazil: "🇧🇷", las_vegas: "🇺🇸", lasvegas: "🇺🇸", "las vegas": "🇺🇸",
  vegas: "🇺🇸", losail: "🇶🇦", qatar: "🇶🇦", abu_dhabi: "🇦🇪",
  yas_marina: "🇦🇪", abu: "🇦🇪", "abu dhabi": "🇦🇪",
};
export function trackFlag(name: string) {
  return TRACK_FLAGS[trackSlug(name)] || "🏁";
}

export type SessionBadges = { win?: boolean; pole?: boolean; fl?: boolean; podium?: boolean; gs?: boolean };
export function badgesFor(s: Session): SessionBadges {
  const finish = Number(s.finishing_position);
  const start = Number(s.starting_position);
  return {
    win: finish === 1,
    pole: start === 1,
    podium: finish >= 1 && finish <= 3,
    fl: !!(s.race_story?.player_fastest_lap ?? false),
    gs: !!(s.race_story?.grand_slam ?? false),
  };
}

export function seasonStats(sessions: Session[]) {
  const races = sessions.filter((s) => s.category === "Race");
  const sprints = sessions.filter((s) => s.category === "Sprint");
  return {
    raceWins: races.filter((s) => Number(s.finishing_position) === 1).length,
    sprintWins: sprints.filter((s) => Number(s.finishing_position) === 1).length,
    gpPoles: races.filter((s) => Number(s.starting_position) === 1).length,
    sprintPoles: sprints.filter((s) => Number(s.starting_position) === 1).length,
    podiums: races.filter((s) => {
      const p = Number(s.finishing_position);
      return p >= 1 && p <= 3;
    }).length,
    fastestLaps: sessions.filter((s) => badgesFor(s).fl).length,
  };
}

// Group by track: latest session per (track_name).
export function groupByTrack(sessions: Session[]) {
  const map = new Map<string, { track: string; sessions: Session[] }>();
  for (const s of sessions) {
    const key = trackSlug(s.track_name);
    if (!key) continue;
    const bucket = map.get(key) ?? { track: s.track_name, sessions: [] };
    bucket.sessions.push(s);
    map.set(key, bucket);
  }
  return Array.from(map.values());
}
