// Tyre strategies stored per track (shared across every season / session of
// that track) and scoped to the signed-in user + active career slot.

import { supabase } from "./supabase";
import { getActiveCareer } from "./career";

export type Compound = "Soft" | "Medium" | "Hard" | "Intermediate" | "Wet";

export const COMPOUNDS: Compound[] = ["Soft", "Medium", "Hard", "Intermediate", "Wet"];

export const COMPOUND_COLOR: Record<string, string> = {
  Soft: "#ef3340",
  Medium: "#f4d03f",
  Hard: "#e8e8e8",
  Intermediate: "#27ae60",
  Wet: "#2e86de",
};

export const COMPOUND_SHORT: Record<string, string> = {
  Soft: "S",
  Medium: "M",
  Hard: "H",
  Intermediate: "I",
  Wet: "W",
};

export function compoundText(c: string) {
  return c === "Hard" || c === "Medium" ? "#111" : "#fff";
}

export type StrategyStint = { compound: string; start_lap: number; end_lap: number };

export type Strategy = {
  id: string;
  user_id?: string;
  career_slot: string | null;
  track_key: string;
  season: number | null;
  name: string;
  notes: string;
  source: "race" | "custom";
  stints: StrategyStint[];
  created_at?: string;
  updated_at?: string;
};

export function stintLaps(s: StrategyStint) {
  return Math.max(0, Number(s.end_lap) - Number(s.start_lap) + 1);
}

export function totalLaps(stints: StrategyStint[]) {
  return stints.reduce((a, s) => a + stintLaps(s), 0);
}

// Recompute contiguous lap ranges from per-stint lap counts.
export function relayStints(stints: StrategyStint[]): StrategyStint[] {
  let lap = 1;
  return stints.map((s) => {
    const len = Math.max(1, stintLaps(s));
    const out = { compound: s.compound, start_lap: lap, end_lap: lap + len - 1 };
    lap += len;
    return out;
  });
}

export function formatStrategy(stints: StrategyStint[]) {
  return stints
    .map((s) => `${COMPOUND_SHORT[s.compound] ?? "?"} ${s.start_lap}–${s.end_lap}`)
    .join(" · ");
}

export async function listStrategies(trackKey: string): Promise<Strategy[]> {
  const career = getActiveCareer();
  let q = supabase
    .from("tyre_strategies")
    .select("*")
    .eq("track_key", trackKey)
    .order("created_at", { ascending: true });
  if (career) q = q.eq("career_slot", career);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map(normalize);
}

function normalize(row: any): Strategy {
  return {
    ...row,
    notes: row.notes ?? "",
    source: row.source === "race" ? "race" : "custom",
    stints: Array.isArray(row.stints) ? row.stints : [],
  };
}

export async function createStrategy(input: {
  track_key: string;
  season?: number | null;
  name: string;
  notes?: string;
  source?: "race" | "custom";
  stints: StrategyStint[];
}): Promise<Strategy> {
  const { data: userData } = await supabase.auth.getUser();
  const uid = userData?.user?.id;
  if (!uid) throw new Error("Sign in to save strategies");
  const payload = {
    user_id: uid,
    career_slot: getActiveCareer(),
    track_key: input.track_key,
    season: input.season ?? null,
    name: input.name,
    notes: input.notes ?? "",
    source: input.source ?? "custom",
    stints: input.stints,
  };
  const { data, error } = await supabase.from("tyre_strategies").insert(payload).select("*").single();
  if (error) throw error;
  return normalize(data);
}

export async function updateStrategy(id: string, patch: Partial<Strategy>): Promise<void> {
  const { error } = await supabase
    .from("tyre_strategies")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteStrategy(id: string): Promise<void> {
  const { error } = await supabase.from("tyre_strategies").delete().eq("id", id);
  if (error) throw error;
}
