export interface Problem {
  title: string;
  source: string;
  statement: string;
}

export interface Turn {
  role: "user" | "assistant";
  text: string;
  /** User turns only: the editor's code, when it changed since the last question. */
  code?: string;
  /** User turns only: the latest run's report, when there is a new one. */
  run?: string;
}
