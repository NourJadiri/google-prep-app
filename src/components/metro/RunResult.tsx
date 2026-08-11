import { useApp } from "../../state/AppState";
import { runResultCopy } from "../../lib/engine";
import type { Session } from "../../types";

export default function RunResult({ session: s }: { session: Session }) {
  const { actions } = useApp();
  const n = s.ids.length;
  const missed = s.results.filter((r) => !r).length;

  return (
    <div className="qwrap result">
      <div className="big">{s.right + "/" + n}</div>
      <div className="sub">{runResultCopy(s.right, n)}</div>
      <div className="row">
        <span>
          <b>{"+" + s.xp}</b>XP
        </span>
        <span>
          <b>{s.best}</b>best streak
        </span>
        <span>
          <b>{missed}</b>to redemption
        </span>
      </div>
      <div className="mrow" style={{ justifyContent: "center", marginTop: "18px" }}>
        <button className="mbtn" onClick={actions.startRun}>
          Run it again
        </button>
        <button className="mbtn" onClick={actions.quitRun}>
          Decks
        </button>
      </div>
    </div>
  );
}
