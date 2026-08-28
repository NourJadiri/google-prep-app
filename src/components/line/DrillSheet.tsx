import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useApp } from "../../state/AppState";
import { DRILLS } from "../../data/drills";
import { DAY_OF, DIFFN, PROBS } from "../../data/plan";
import Icon from "../shared/Icon";

/* The drill reader: a bottom sheet on a phone, a centred dialog on anything
   wider. It renders the drill's markdown itself — the files only ever use the
   handful of shapes below, so a ~40-line renderer beats a dependency, and the
   Copy button still hands Claude the raw file, verbatim. */

/* Inline spans: `code`, **strong**, *em*. Longest marker first, so a bold
   never half-matches as an italic. */
const INLINE = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;

function inline(text: string): ReactNode[] {
  return text.split(INLINE).map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`"))
      return <code key={i}>{part.slice(1, -1)}</code>;
    if (part.startsWith("**") && part.endsWith("**"))
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2)
      return <em key={i}>{part.slice(1, -1)}</em>;
    return part;
  });
}

/* Blocks: everything above the first ## is skipped — the sheet header already
   says the title, the classic it stands in for, and the day — then fences,
   ## sections, --- rules, - lists, and paragraphs of consecutive plain lines.
   The clipboard still gets the whole file; only the reader elides the lead. */
function render(md: string): ReactNode[] {
  const lines = md.split("\n");
  const out: ReactNode[] = [];
  let i = 0;
  if (lines.some((l) => l.startsWith("## "))) {
    while (i < lines.length && !(lines[i] ?? "").startsWith("## ")) i++;
  } else if (lines[0]?.startsWith("# ")) {
    i = 1;
  }

  while (i < lines.length) {
    const line = lines[i] ?? "";

    if (line.startsWith("```")) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !(lines[i] ?? "").startsWith("```")) {
        code.push(lines[i] ?? "");
        i++;
      }
      i++; // the closing fence
      out.push(<pre className="dcode" key={out.length}>{code.join("\n")}</pre>);
    } else if (line.startsWith("## ")) {
      out.push(<h3 className="dsec" key={out.length}>{line.slice(3)}</h3>);
      i++;
    } else if (line.startsWith("---")) {
      out.push(<hr className="dhr" key={out.length} />);
      i++;
    } else if (line.startsWith("- ")) {
      const items: ReactNode[] = [];
      while ((lines[i] ?? "").startsWith("- ")) {
        items.push(<li key={items.length}>{inline((lines[i] ?? "").slice(2))}</li>);
        i++;
      }
      out.push(<ul key={out.length}>{items}</ul>);
    } else if (line.trim() === "") {
      i++;
    } else {
      const para: string[] = [];
      while (i < lines.length) {
        const l = lines[i] ?? "";
        if (l.trim() === "" || l.startsWith("## ") || l.startsWith("```") || l.startsWith("- ") || l.startsWith("---")) break;
        para.push(l);
        i++;
      }
      out.push(<p key={out.length}>{inline(para.join(" "))}</p>);
    }
  }
  return out;
}

export default function DrillSheet({ id }: { id: string }) {
  const { actions } = useApp();
  const drill = DRILLS[id];
  const [copied, setCopied] = useState(false);
  const timer = useRef<number>(0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") actions.closeDrill();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(timer.current);
    };
  }, [actions]);

  /* A stale id off an old export closes rather than rendering an empty shell. */
  if (!drill) {
    actions.closeDrill();
    return null;
  }

  const prob = Object.values(PROBS).find((p) => p.drill === id);
  const day = prob ? DAY_OF[prob.id] : undefined;

  const copy = () => {
    if (navigator.clipboard) {
      // Optimistic, same as Export and the sync chip; a denied clipboard is not an error.
      navigator.clipboard.writeText(drill.md).catch(() => {});
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="dscrim" onClick={actions.closeDrill}>
      <div
        className="dsheet"
        role="dialog"
        aria-modal="true"
        aria-label={drill.n}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="dshead">
          <div className="dshead-info">
            <div className="deyebrow">{drill.lc}</div>
            <h2>{drill.n}</h2>
            <div className="dmeta">
              {prob && <span className={"diff " + prob.diff}>{DIFFN[prob.diff]}</span>}
              {day && <span className="tag">{"Day " + day.d + " · " + day.stn}</span>}
            </div>
          </div>
          <button className="dclose" onClick={actions.closeDrill} aria-label="Close drill">
            <Icon name="x" size={16} />
          </button>
        </header>

        <div className="dbody">{render(drill.md)}</div>

        <footer className="dsfoot">
          <button className={"dcopy" + (copied ? " ok" : "")} onClick={copy}>
            <Icon name={copied ? "check" : "copy"} size={16} />
            {copied ? "Copied — paste it to Claude" : "Copy for Claude"}
          </button>
        </footer>
      </div>
    </div>
  );
}
