import Station from "./Station";
import { terminusCopy } from "../../lib/engine";

/* End of the line. The dot is the only four-colour object in the app. */

export default function Terminus({ cleared }: { cleared: number }) {
  return (
    <Station color="var(--line)" terminus>
      <div className="terminus-card">
        <h2>GOOGLE</h2>
        <p>{terminusCopy(cleared)}</p>
      </div>
    </Station>
  );
}
