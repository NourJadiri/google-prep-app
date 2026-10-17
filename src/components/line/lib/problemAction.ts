import { probURL } from "../../../data/plan";
import { hasProblem } from "../../../data/problems";
import { specOf } from "../../../data/tracks";
import type { Problem } from "../../../types";

export type RowAction = { kind: "editor" } | { kind: "link"; url: string } | { kind: "none" };

/** The workspace for every problem the bank has; LeetCode only for the timed mocks, which are a random pick by design. */
export function problemAction(prob: Problem): RowAction {
  if (hasProblem(specOf(prob))) return { kind: "editor" };
  const url = probURL(prob);
  return url ? { kind: "link", url } : { kind: "none" };
}
