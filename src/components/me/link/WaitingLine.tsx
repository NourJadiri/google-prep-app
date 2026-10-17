import Ellipsis from "./Ellipsis";
import "./WaitingLine.css";

const WAITING = "Waiting for the other device";
const UNREACHABLE = "Cloud unreachable — progress here is safe; still watching for the other device.";

export default function WaitingLine({ reachable }: { reachable: boolean }) {
  return (
    <p className="qrwait waiting" role="status">
      {reachable ? (
        <>
          {WAITING}
          <Ellipsis />
        </>
      ) : (
        UNREACHABLE
      )}
    </p>
  );
}
