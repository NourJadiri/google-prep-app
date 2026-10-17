import type { Verdict } from "../lib/verdict";
import "./VerdictBanner.css";

export default function VerdictBanner({ verdict }: { verdict: Verdict }) {
  return (
    <div className={"ws-verdict " + verdict.tone}>
      <strong>{verdict.title}</strong>
      <span>{verdict.detail}</span>
    </div>
  );
}
