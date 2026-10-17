import { useCallback, useState } from "react";
import { useApp } from "../../../../state/AppState";
import * as sync from "../../../../lib/sync";
import { useOutcomeFx } from "../../hooks/useOutcomeFx";

export type JoinForm = ReturnType<typeof useJoinForm>;

/** The "I have a code" row. Joining adopts the cloud copy, the one sync action that can cost this device progress, hence the confirm. */
export function useJoinForm(hasProgress: boolean) {
  const { actions } = useApp();
  const fx = useOutcomeFx();
  const [entering, setEntering] = useState(false);
  const [code, setCode] = useState("");

  const toggle = useCallback(() => setEntering((v) => !v), []);
  const close = useCallback(() => setEntering(false), []);

  async function connect() {
    const trimmed = code.trim();
    if (!trimmed) {
      actions.toast("Paste the code from your other device first");
      return;
    }
    if (
      hasProgress &&
      !window.confirm(
        "This device has progress. Connecting replaces it with the cloud copy — export first if you want to keep it. Continue?"
      )
    ) {
      return;
    }
    // join() turns sync on before it calls out, so the panel's status card shows the wait.
    const out = await sync.join(trimmed);
    if (!fx.joined(out)) return;
    setEntering(false);
    setCode("");
  }

  return { entering, code, setCode, toggle, close, connect };
}
