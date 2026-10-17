export interface AskContext {
  problem: { title: string; source: string; statement: string };
  code: string;
  /** The latest run's report, or null before any run. */
  run: string | null;
}
