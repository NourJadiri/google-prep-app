import { probXP } from "../../data/plan";
import type { Problem } from "../../types";
import DifficultyTag from "../ui/DifficultyTag";
import Tag from "../ui/Tag";
import XpValue from "../ui/XpValue";
import "./ProblemTags.css";

export default function ProblemTags({ prob, passed }: { prob: Problem; passed: boolean }) {
  return (
    <div className="pmeta">
      <DifficultyTag diff={prob.diff} />
      {prob.warm && <Tag>warm-up</Tag>}
      {prob.drill && <Tag>{prob.orig ? "original" : "premium"}</Tag>}
      {passed && <Tag tone="passed">passed</Tag>}
      <XpValue>{"+" + probXP(prob) + " XP"}</XpValue>
    </div>
  );
}
