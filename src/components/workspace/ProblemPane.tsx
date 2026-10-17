import { useMemo, useState } from "react";
import type { ProblemContent } from "../../data/problems";
import { useCopied } from "../../hooks/useCopied";
import { Md, sections } from "./Markdown";
import Editor from "./Editor";
import Icon from "../shared/Icon";
import Button from "../ui/Button";
import LinkButton from "../ui/LinkButton";
import Tab from "../ui/Tab";
import Tabs from "../ui/Tabs";

/* The left pane: the statement, and behind a second tab the walkthrough and
   reference solution. The solution is veiled until you ask, or until you've
   passed every test — the dojo's blur-until-you've-tried, one level up. */

const HINT = /^aim for$/i;
const FOLLOW = /^follow-ups?/i;

interface ProblemPaneProps {
  content: ProblemContent;
  tab: "desc" | "solution";
  onTab: (t: "desc" | "solution") => void;
  /** Passed every test at some point: the solution is open. */
  accepted: boolean;
  fontSize: number;
}

export default function ProblemPane({ content, tab, onTab, accepted, fontSize }: ProblemPaneProps) {
  const [revealed, setRevealed] = useState(false);
  const [copied, copy] = useCopied(1800);
  const parts = useMemo(() => sections(content.statement), [content.statement]);
  const open = accepted || revealed;

  const main = parts.filter((s) => !HINT.test(s.title) && !FOLLOW.test(s.title));
  const hint = parts.find((s) => HINT.test(s.title));
  const follow = parts.find((s) => FOLLOW.test(s.title));
  const topics = content.spec.topics ?? [];

  return (
    <section className="ws-problem" aria-label="Problem">
      <Tabs>
        <Tab icon="file-text" selected={tab === "desc"} onSelect={() => onTab("desc")}>
          Description
        </Tab>
        <Tab icon={open ? "book-open" : "lock"} selected={tab === "solution"} onSelect={() => onTab("solution")}>
          Solution
        </Tab>
      </Tabs>

      <div className="ws-problem-body">
        {tab === "desc" ? (
          <>
            {topics.length > 0 && (
              <div className="ws-topics">
                {topics.map((t) => (
                  <span key={t} className="ws-topic">
                    {t}
                  </span>
                ))}
              </div>
            )}
            {main.map((s) => (
              <div key={s.title} className="ws-sec">
                <h3 className="ws-h">{s.title}</h3>
                <Md text={s.body} />
              </div>
            ))}
            {hint && (
              <details className="ws-hintbox">
                <summary>
                  <Icon name="lightbulb" size={14} />
                  Hint — what to aim for
                </summary>
                <Md text={hint.body} />
              </details>
            )}
            {follow && (
              <details className="ws-hintbox">
                <summary>
                  <Icon name="arrow-right" size={14} />
                  Follow-ups an interviewer might ask
                </summary>
                <Md text={follow.body} />
              </details>
            )}
          </>
        ) : !open ? (
          <div className="ws-veil">
            <Icon name="lock" size={22} />
            <p>
              <b>Try it first.</b> The walkthrough and a reference solution are here when you want them — and they
              open by themselves once every test passes.
            </p>
            <Button onClick={() => setRevealed(true)}>
              <Icon name="eye" size={15} />
              Reveal the solution
            </Button>
          </div>
        ) : (
          <>
            <Md text={content.notes} />
            <div className="ws-sol-head">
              <h3 className="ws-h">Reference solution</h3>
              <LinkButton onClick={() => copy(content.solution)}>
                <Icon name={copied ? "check" : "copy"} size={13} />
                {copied ? "Copied" : "Copy"}
              </LinkButton>
            </div>
            <div className="ws-sol-code">
              <Editor
                value={content.solution}
                docKey={"solution:" + content.id}
                fontSize={Math.max(11, fontSize - 1)}
                readOnly
                label="Reference solution"
              />
            </div>
          </>
        )}
      </div>
    </section>
  );
}
