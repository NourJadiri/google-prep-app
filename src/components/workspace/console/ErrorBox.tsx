import type { CaseError } from "../../../runner/types";
import Icon from "../../shared/Icon";
import ConsoleHint from "./ConsoleHint";
import ValueBox from "./ValueBox";
import "./ErrorBox.css";

export default function ErrorBox({ err }: { err: CaseError }) {
  return (
    <div className="ws-error">
      <div className="ws-error-msg">
        <Icon name="alert-triangle" size={14} />
        {err.message}
        {err.line && <span className="ws-line">line {err.line}</span>}
      </div>
      {err.traceback && err.traceback !== err.message && <ValueBox>{err.traceback}</ValueBox>}
      {err.hint && <ConsoleHint>{err.hint}</ConsoleHint>}
    </div>
  );
}
