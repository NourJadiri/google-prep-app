import { useSyncExternalStore } from "react";
import * as runner from "../../../runner/runner";
import type { RunnerStatus } from "../../../runner/runner";

export const useRunnerStatus = (): RunnerStatus => useSyncExternalStore(runner.subscribe, runner.getStatus);
