import { useSyncExternalStore } from "react";
import * as runner from "../../runner/runner";
import type { RunnerStatus } from "../../runner/runner";

/** The interpreter's state, live: cold, loading, ready, busy, failed. */
export const useRunnerStatus = (): RunnerStatus =>
  useSyncExternalStore(runner.subscribe, runner.getStatus);
