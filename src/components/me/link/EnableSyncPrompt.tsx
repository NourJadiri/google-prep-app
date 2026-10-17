import * as sync from "../../../lib/sync";
import PillButton from "../../ui/PillButton";
import SheetHint from "./SheetHint";
import "./EnableSyncPrompt.css";

/** Send mode with sync off has no code of its own to show yet. */
export default function EnableSyncPrompt() {
  return (
    <div className="qrenable">
      <SheetHint>
        Two ways round: turn sync on and hold up a code of your own, or send to
        the code the other device is already showing.
      </SheetHint>
      {/* No toast: the square appearing is the receipt. */}
      <PillButton
        onClick={() => {
          sync.enable();
        }}
      >
        Turn on sync &amp; show the code
      </PillButton>
    </div>
  );
}
