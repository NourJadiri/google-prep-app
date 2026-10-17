import { cx } from "../../lib/cx";
import CodeBlock from "../shared/CodeBlock";
import Icon from "../shared/Icon";
import "./TemplateCode.css";

interface TemplateCodeProps {
  code: string;
  /** Whether the code has been un-blurred this session. */
  shown: boolean;
  onReveal: () => void;
}

/* The reveal is session-only on purpose: tomorrow you should have to write it again. */
export default function TemplateCode({ code, shown, onReveal }: TemplateCodeProps) {
  return (
    <div className={cx("tcode", !shown && "hidden")}>
      <CodeBlock code={code} />
      <div className="veil">
        <Icon name="lock" size={15} className="vlock" />
        <span>Write yours from a blank page first.</span>
        <button onClick={onReveal}>Reveal &amp; diff</button>
      </div>
    </div>
  );
}
