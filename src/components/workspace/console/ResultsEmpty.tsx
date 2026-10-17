import { modKey } from "../../../lib/platform";
import "./ResultsEmpty.css";

export default function ResultsEmpty() {
  const mod = modKey();
  return (
    <div className="ws-empty">
      <p>
        <b>Run</b> tries the cases in the Testcase tab. <b>Submit</b> runs every test, hidden ones included, and a
        clean sweep ticks the problem.
      </p>
      <p className="ws-keys">
        <kbd>{mod}</kbd> <kbd>↵</kbd> run · <kbd>{mod}</kbd> <kbd>⇧</kbd> <kbd>↵</kbd> submit
      </p>
    </div>
  );
}
