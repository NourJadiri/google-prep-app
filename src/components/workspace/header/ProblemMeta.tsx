import type { Spec } from "../../../data/problems";
import { LC } from "../../../data/plan";
import { TRACKS, type ProblemRef } from "../../../data/tracks";
import Icon from "../../shared/Icon";
import DifficultyTag from "../../ui/DifficultyTag";
import Tag from "../../ui/Tag";
import "./ProblemMeta.css";

interface ProblemMetaProps {
  spec: Spec;
  problemRef: ProblemRef;
  /** Ticked on the line, by hand or by passing. */
  done: boolean;
  accepted: boolean;
}

export default function ProblemMeta({ spec, problemRef: { day, track }, done, accepted }: ProblemMetaProps) {
  const T = TRACKS[track];
  const lcLink = spec.lc?.slug ? LC(spec.lc.slug) : null;

  return (
    <div className="ws-meta">
      <DifficultyTag diff={spec.difficulty} />
      <span className="ws-bullet" data-track={track} aria-label={T.name}>
        {T.bullet}
      </span>
      <Tag>{`${T.unit} ${day.d} · ${day.stn}`}</Tag>
      {done && (
        <span className="ws-done">
          <Icon name="check" size={11} strokeWidth={3} />
          {accepted ? "passed" : "ticked"}
        </span>
      )}
      {lcLink ? (
        <a className="ws-lc" href={lcLink} target="_blank" rel="noopener">
          {"LC " + (spec.lc?.num ?? "")}
          <Icon name="arrow-up-right" size={11} />
        </a>
      ) : spec.lc?.premium ? (
        <Tag>{"LC " + spec.lc.num + " · premium"}</Tag>
      ) : null}
    </div>
  );
}
