import type { SyncStatus } from "../../../../lib/sync";
import type { IconName } from "../../../shared/Icon";

interface Look {
  glyph: IconName;
  /** A token name, so both themes come along for free. */
  tone: string;
  title: string;
  /** The one sentence the card can't say in three words. */
  note: string;
}

export function look(s: SyncStatus): Look {
  if (s.held && s.phase === "error") {
    return {
      glyph: "alert-triangle",
      tone: "var(--med)",
      title: "Update needed",
      note: "The cloud copy is from a newer version of the app. Reload to update; until then this device leaves it alone.",
    };
  }
  switch (s.phase) {
    case "working":
      return { glyph: "cloud-upload", tone: "var(--blue)", title: "Syncing…", note: "" };
    case "pending":
      return {
        glyph: "cloud-upload",
        tone: "var(--blue)",
        title: "Changes queued",
        note: "They go up in a moment, or the next time there's a network.",
      };
    case "error":
      return {
        glyph: "cloud-off",
        tone: "var(--red)",
        title: "Cloud unreachable",
        note: "Progress is safe on this device and will sync when it can.",
      };
    default:
      return {
        glyph: "cloud-check",
        tone: "var(--green)",
        title: s.syncedAt ? "All changes synced" : "Sync is on",
        note: "Enter the code above on another device to link it.",
      };
  }
}

/** "just now", "3m ago", "2h ago"; nothing at all if it has never happened. */
export function ago(at: number, now: number): string {
  if (!at) return "";
  const secs = Math.max(0, Math.round((now - at) / 1000));
  if (secs < 45) return "just now";
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}
