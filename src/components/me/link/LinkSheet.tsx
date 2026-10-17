import { useRef, useState, type RefObject } from "react";
import * as sync from "../../../lib/sync";
import type { SyncStatus } from "../../../lib/sync";
import Dialog from "../../ui/Dialog";
import PillButton from "../../ui/PillButton";
import { scanSupported } from "../scan/lib/scanSupported";
import EnableSyncPrompt from "./EnableSyncPrompt";
import LinkedCard from "./LinkedCard";
import ModeToggle from "./ModeToggle";
import QrSquare from "./QrSquare";
import ReplaceWarning from "./ReplaceWarning";
import WaitingLine from "./WaitingLine";
import WaysRound from "./WaysRound";
import { useArrivalWatch } from "./hooks/useArrivalWatch";
import { useSendToCode } from "./hooks/useSendToCode";
import type { SheetMode } from "./lib/mode";
import "./LinkSheet.css";

interface LinkSheetProps {
  status: SyncStatus;
  hasProgress: boolean;
  /** Hand the screen to the camera instead. The caller closes this sheet. */
  onScan: () => void;
  /** Close: Escape, the scrim, Close, or an arrival finishing. */
  onDone: () => void;
  /** Where focus goes on close if the button that opened the sheet was replaced meanwhile. */
  returnFocus: RefObject<HTMLElement | null>;
}

export default function LinkSheet({ status, hasProgress, onScan, onDone, returnFocus }: LinkSheetProps) {
  /* A device with progress is nearly always the one with something to give; a fresh one the one that wants it. */
  const [mode, setMode] = useState<SheetMode>(hasProgress ? "send" : "get");
  /* One code per opening, so a re-render or a flip between modes keeps showing the same square. */
  const [minted] = useState(sync.mintCode);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const paste = useSendToCode();

  const { enabled } = status;
  const code = status.code ?? minted;
  const get = mode === "get";
  const { linked, reachable } = useArrivalWatch({ watching: get, code, enabled, serverAt: status.serverAt, onDone });
  const canScan = scanSupported();
  const square = get || enabled;

  return (
    <Dialog className="qrscrim" label="Link a device" onDismiss={onDone} initialFocus={closeBtn} returnFocus={returnFocus}>
      <div className="qrsheet">
        {linked ? (
          <LinkedCard />
        ) : (
          <>
            <ModeToggle mode={mode} onChange={setMode} />
            {square ? <QrSquare code={code} get={get} /> : <EnableSyncPrompt />}
            {get && (enabled || hasProgress) && <ReplaceWarning enabled={enabled} />}
            {get && <WaitingLine reachable={reachable} />}
            {(!get || canScan) && (
              <WaysRound
                send={!get}
                canScan={canScan}
                target={paste.target}
                onTarget={paste.setTarget}
                onSend={paste.send}
                onScan={onScan}
              />
            )}
          </>
        )}
        <PillButton ref={closeBtn} onClick={onDone}>
          Close
        </PillButton>
      </div>
    </Dialog>
  );
}
