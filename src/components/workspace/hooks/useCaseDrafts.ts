import { useState } from "react";
import type { Spec } from "../../../data/problems";
import { defaultCases, type CaseDraft } from "../lib/runPlan";

/** The Testcase tab's cases and which one is open. */
export function useCaseDrafts(spec: Spec) {
  const [cases, setCases] = useState<CaseDraft[]>(() => defaultCases(spec));
  const [activeCase, setActiveCase] = useState(0);
  return { cases, setCases, activeCase, setActiveCase };
}
