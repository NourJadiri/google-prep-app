import { linkUrl } from "../../../lib/link";
import CodeChip from "../CodeChip";
import QrCode from "./QrCode";
import SheetHint from "./SheetHint";
import "./QrSquare.css";

const GET_LABEL = "QR code — scan it with the device that has your progress";
const SEND_LABEL = "QR code — scan it with the device you want to link";

interface QrSquareProps {
  code: string;
  get: boolean;
}

export default function QrSquare({ code, get }: QrSquareProps) {
  return (
    <>
      <div className="qrbig">
        {/* The verb is the other device's: the code that gets progress tells the scanner to send. */}
        <QrCode value={linkUrl(code, get ? "send" : "recv")} label={get ? GET_LABEL : SEND_LABEL} />
      </div>
      <CodeChip code={code} />
      <SheetHint>
        {get
          ? "Scan with the device that has your progress — it sends, this one receives."
          : "Scan with the device you want to link — it adopts the progress on this one."}
      </SheetHint>
    </>
  );
}
