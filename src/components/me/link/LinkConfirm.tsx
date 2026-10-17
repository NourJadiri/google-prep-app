import { useApp } from "../../../state/AppState";
import { progressSummary } from "../../../lib/engine";
import type { SyncStatus } from "../../../lib/sync";
import type { LinkDirective } from "../../../types";
import ButtonRow from "../../ui/ButtonRow";
import PillButton from "../../ui/PillButton";
import { useAcceptLink } from "./hooks/useAcceptLink";
import "./LinkConfirm.css";

interface LinkConfirmProps {
  link: LinkDirective;
  status: SyncStatus;
  hasProgress: boolean;
}

/* The one surface that acts on a link, however it arrived: every route can overwrite something, so nothing happens until the reader says yes.
   A card, not a modal: ignoring it and scrolling on is a perfectly good answer. */
export default function LinkConfirm({ link, status, hasProgress }: LinkConfirmProps) {
  const { state, actions } = useApp();
  const { busy, accept } = useAcceptLink(link);
  const { code, dir } = link;
  const recv = dir === "recv";

  const summary = progressSummary(state.data);
  const switching = status.enabled && status.code !== code;

  return (
    <div className="linkcard">
      <h3>{recv ? "Adopt the progress under this code?" : "Send this device's progress?"}</h3>
      <p>
        <code>{code}</code>
      </p>
      <p>
        {recv
          ? `This device connects to that code and takes the cloud copy. What's here now — ${summary} — is replaced, so export first if it's worth keeping.`
          : `This device's copy — ${summary} — goes up under that code, and the two devices stay linked from there.`}
      </p>
      {switching && <p>This device syncs under another code today; accepting moves it to this one.</p>}
      {dir === "send" && !hasProgress && (
        <p>
          Nothing here to send? If your progress lives in the copy you added to your home
          screen, open that one and scan from there — it keeps its own storage.
        </p>
      )}
      <ButtonRow>
        <PillButton disabled={busy} onClick={() => void accept()}>
          {recv ? "Connect & adopt" : "Send & link"}
        </PillButton>
        <PillButton disabled={busy} onClick={actions.clearLink}>
          Cancel
        </PillButton>
      </ButtonRow>
    </div>
  );
}
