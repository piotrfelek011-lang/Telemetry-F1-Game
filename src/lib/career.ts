// Career slots: 3 "Driver career" slots + 3 "My Team career" slots.
// The active slot is stored per-browser and every uploaded session is tagged
// with it (telemetry_sessions.career_slot), so each slot has its own data.

export type CareerType = "driver" | "team";
export type CareerSlot = { type: CareerType; index: number; id: string; label: string };

export const CAREER_KEY = "f1.career";

export function slotId(type: CareerType, index: number) {
  return `${type}-${index}`;
}

export function slotLabel(type: CareerType, index: number) {
  return `${type === "driver" ? "Driver" : "My Team"} · Slot ${index}`;
}

export const CAREER_SLOTS: CareerSlot[] = (["driver", "team"] as CareerType[]).flatMap((type) =>
  [1, 2, 3].map((index) => ({
    type,
    index,
    id: slotId(type, index),
    label: slotLabel(type, index),
  })),
);

export function parseSlot(id: string | null | undefined): CareerSlot | null {
  if (!id) return null;
  return CAREER_SLOTS.find((s) => s.id === id) ?? null;
}

export function getActiveCareer(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return parseSlot(window.localStorage.getItem(CAREER_KEY))?.id ?? null;
  } catch {
    return null;
  }
}

export function setActiveCareer(id: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CAREER_KEY, id);
  } catch {}
}

export function clearActiveCareer() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(CAREER_KEY);
  } catch {}
}

export function activeCareerLabel(): string {
  const slot = parseSlot(getActiveCareer());
  return slot ? slot.label : "No career";
}
