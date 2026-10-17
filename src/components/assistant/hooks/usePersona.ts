import { useCallback, useState } from "react";
import type { Persona } from "../../../../shared/assistantContract";
import { loadPersona, savePersona } from "../lib/storage";

/** The voice Patrick answers in, remembered by this browser. */
export function usePersona() {
  const [persona, setPersona] = useState<Persona>(loadPersona);
  const choose = useCallback((next: Persona) => {
    setPersona(next);
    savePersona(next);
  }, []);
  return { persona, choose };
}
