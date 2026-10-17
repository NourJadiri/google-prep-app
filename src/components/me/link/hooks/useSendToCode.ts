import { useState } from "react";
import { useApp } from "../../../../state/AppState";
import { parseLink } from "../../../../lib/link";
import { useOutcomeFx } from "../../hooks/useOutcomeFx";

/** The paste row: send this device's progress to a code or link typed in. */
export function useSendToCode() {
  const { actions } = useApp();
  const fx = useOutcomeFx();
  const [target, setTarget] = useState("");

  function send() {
    const parsed = parseLink(target);
    if (!parsed) {
      fx.notACode();
      return;
    }
    /* This is the send side whatever the pasted link says. The consent card answers it, and mounting it closes the sheet. */
    actions.openLink({ code: parsed.code, dir: "send" });
    setTarget("");
  }

  return { target, setTarget, send };
}
