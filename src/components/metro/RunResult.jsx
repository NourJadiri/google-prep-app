import { useApp } from "../../state/AppState.jsx";
import { runResultCopy } from "../../lib/engine.js";

export default function RunResult() {
  const { state, actions } = useApp();
  const s = state.session;
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
