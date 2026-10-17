import { useCopyToast } from "../../hooks/useCopyToast";
import "./CodeChip.css";

/** A sync code that copies on tap. */
export default function CodeChip({ code }: { code: string }) {
  const copy = useCopyToast();
  return (
    <button
      className="synccode"
      onClick={() => {
        if (code) copy(code, "Code copied");
      }}
      title="Tap to copy"
    >
      {code}
    </button>
  );
}
