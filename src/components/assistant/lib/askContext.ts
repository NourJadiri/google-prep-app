import type { Problem } from "../../../../shared/assistantContract";

export interface AskContext {
  problem: Problem;
  code: string;
  /** The latest run's report, or null before any run. */
  run: string | null;
}
