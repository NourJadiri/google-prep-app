import { useState } from "react";
import { useApp } from "../../../../state/AppState";
import * as sync from "../../../../lib/sync";
import type { LinkDirective } from "../../../../types";
import { useOutcomeFx } from "../../hooks/useOutcomeFx";

/** Saying yes to a link: "recv" joins the code and adopts the cloud copy, "send" claims it from here. */
export function useAcceptLink({ code, dir }: LinkDirective) {
  const { actions } = useApp();
  const fx = useOutcomeFx();
  const [busy, setBusy] = useState(false);

  async function accept() {
    setBusy(true);
    const out = dir === "recv" ? await sync.join(code) : await sync.claim(code);
    setBusy(false);
    /* A parsed link can't be invalid (link.ts enforces the server's own rule), but the card stays up rather than quietly doing nothing. */
    const done = dir === "recv" ? fx.joined(out) : fx.sent(out);
    if (done) actions.clearLink();
  }

  return { busy, accept };
}
