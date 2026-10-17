import type { CaseResult, RunOutcome } from "../../../runner/types";

export type Tone = "ok" | "bad" | "warn" | "info";

export interface Verdict {
  tone: Tone;
  title: string;
  detail: string;
  /** Index into outcome.results of the case worth looking at first. */
  focus: number;
}

const SYNTAX = /^(SyntaxError|IndentationError|TabError)$/;

const plural = (n: number, one: string, many: string) => n + " " + (n === 1 ? one : many);

export function verdictOf(o: RunOutcome, mode: "run" | "submit"): Verdict {
  const rs = o.results;
  const passed = rs.filter((r) => r.status === "pass").length;
  const noun = mode === "submit" ? "tests" : "cases";
  const firstWhere = (pred: (r: CaseResult) => boolean) => Math.max(0, rs.findIndex(pred));
  const tally = `${passed} / ${o.total} ${noun} passed`;

  if (o.compileError) {
    const syntax = SYNTAX.test(o.compileError.type);
    return {
      tone: "bad",
      title: syntax ? "Syntax Error" : "Runtime Error",
      detail: syntax
        ? "Python couldn't read the file" + (o.compileError.line ? ` — line ${o.compileError.line}.` : ".")
        : "The file crashed while loading, before any test ran.",
      focus: 0,
    };
  }
  if (o.entryError) return { tone: "bad", title: "Nothing to run", detail: o.entryError, focus: 0 };

  const ab = o.aborted;
  if (ab) {
    const at = ab.at === null ? 0 : firstWhere((r) => r.i === ab.at);
    if (ab.reason === "tle")
      return { tone: "warn", title: "Time Limit Exceeded", detail: `${tally} before the clock ran out.`, focus: at };
    if (ab.reason === "crash")
      return { tone: "bad", title: "Runtime Error", detail: "The interpreter crashed and has restarted — details below.", focus: at };
    if (ab.reason === "setup-timeout")
      return { tone: "warn", title: "Time Limit Exceeded", detail: ab.message, focus: 0 };
    return { tone: "info", title: "Stopped", detail: `${tally} before you stopped it.`, focus: at };
  }

  if (rs.some((r) => r.status === "error"))
    return { tone: "bad", title: "Runtime Error", detail: tally, focus: firstWhere((r) => r.status === "error") };
  if (rs.some((r) => r.status === "fail"))
    return { tone: "bad", title: "Wrong Answer", detail: tally, focus: firstWhere((r) => r.status === "fail") };
  if (rs.some((r) => r.status === "invalid"))
    return { tone: "warn", title: "Check your input", detail: "A case you typed didn't parse.", focus: firstWhere((r) => r.status === "invalid") };

  const ms = Math.round(rs.reduce((a, r) => a + r.ms, 0));
  if (passed === o.total && o.total > 0) {
    return mode === "submit"
      ? { tone: "ok", title: "Accepted", detail: `All ${plural(o.total, "test", "tests")} passed · ${ms} ms`, focus: 0 }
      : { tone: "ok", title: "Passed", detail: `${tally} · Submit runs the full suite`, focus: 0 };
  }
  /* Typed-in cases the reference couldn't answer: output only, no verdict. */
  return { tone: "info", title: "Finished", detail: plural(rs.length, "case ran", "cases ran"), focus: 0 };
}

/* What counts against a one-shot: the solution failing. Not a stop, a runner that never loaded, or a typo in a typed case. */
const MISSES = new Set(["Syntax Error", "Runtime Error", "Wrong Answer", "Time Limit Exceeded"]);
export const isMiss = (v: Verdict): boolean => MISSES.has(v.title);

export function caseMark(status: CaseResult["status"] | "pending"): { tone: Tone | "idle"; word: string } {
  switch (status) {
    case "pass":
      return { tone: "ok", word: "Passed" };
    case "fail":
      return { tone: "bad", word: "Wrong answer" };
    case "error":
      return { tone: "bad", word: "Error" };
    case "crash":
      return { tone: "bad", word: "Crashed" };
    case "tle":
      return { tone: "warn", word: "Time limit" };
    case "invalid":
      return { tone: "warn", word: "Bad input" };
    case "ran":
      return { tone: "info", word: "Ran" };
    case "stopped":
    case "interrupted":
      return { tone: "idle", word: "Stopped" };
    default:
      return { tone: "idle", word: "Waiting" };
  }
}
