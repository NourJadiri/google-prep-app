import { useApp } from "../../state/AppState";
import CodeBlock from "../shared/CodeBlock";
import type { Template } from "../../types";

/* Code stays behind a blur until you say you've written yours. The reveal is
   session-scoped on purpose — tomorrow you should have to write it again. */

interface TemplateCardProps {
  tpl: Template;
  open: boolean;
  /** Whether the code has been un-blurred this session. */
  shown: boolean;
}

export default function TemplateCard({ tpl, open, shown }: TemplateCardProps) {
  const { actions } = useApp();

  return (
    <div className={"tcard" + (open ? " open" : "")}>
      <button className="thead" onClick={() => actions.toggleTpl(tpl.id)} aria-expanded={open}>
        <h3>{tpl.n}</h3>
        <span className="ttag">{tpl.tag}</span>
        <span className="chev">▾</span>
      </button>
      <div className="tbody">
        <p className="tnote">{tpl.note}</p>
        <div className={"tcode" + (shown ? "" : " hidden")}>
          <CodeBlock code={tpl.code} />
          <div className="veil">
            <span>Write yours from a blank page first.</span>
            <button onClick={() => actions.revealTpl(tpl.id)}>Reveal &amp; diff</button>
          </div>
        </div>
      </div>
    </div>
  );
}
