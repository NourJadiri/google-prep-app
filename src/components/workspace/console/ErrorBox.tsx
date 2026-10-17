import type { CaseError } from "../../../runner/types";
import Icon from "../../shared/Icon";
import Hint from "./Hint";
import Pre from "./Pre";
import "./ErrorBox.css";

export default function ErrorBox({ err }: { err: CaseError }) {
  return (
    <div className="ws-error">
      <div className="ws-error-msg">
        <Icon name="alert-triangle" size={14} />
        {err.message}
        {err.line && <span className="ws-line">line {err.line}</span>}
      </div>
      {err.traceback && err.traceback !== err.message && <Pre>{err.traceback}</Pre>}
      {err.hint && <Hint>{err.hint}</Hint>}
    </div>
  );
}
