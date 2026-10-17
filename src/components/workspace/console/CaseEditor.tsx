import type { Spec } from "../../../data/problems";
import { fieldNames } from "../../../data/problems";
import { defaultCases, type CaseDraft } from "../lib/runPlan";
import CaseChips from "./CaseChips";
import CaseFields from "./CaseFields";

interface CaseEditorProps {
  spec: Spec;
  cases: CaseDraft[];
  onCases: (cs: CaseDraft[]) => void;
  activeCase: number;
  onActiveCase: (i: number) => void;
}

export default function CaseEditor({ spec, cases, onCases, activeCase, onActiveCase }: CaseEditorProps) {
  const names = fieldNames(spec);
  const cur = cases[activeCase] ?? cases[0];

  const edit = (name: string, value: string) => {
    if (!cur) return;
    onCases(cases.map((c) => (c.key === cur.key ? { ...c, fields: { ...c.fields, [name]: value } } : c)));
  };
  const add = () => {
    const key = Math.max(0, ...cases.map((c) => c.key)) + 1;
    const fields = cur ? { ...cur.fields } : Object.fromEntries(names.map((n) => [n, ""]));
    onCases([...cases, { key, origin: null, fields }]);
    onActiveCase(cases.length);
  };
  const remove = (i: number) => {
    const next = cases.filter((_, k) => k !== i);
    onCases(next);
    onActiveCase(Math.max(0, Math.min(activeCase, next.length - 1)));
  };
  const restore = () => {
    onCases(defaultCases(spec));
    onActiveCase(0);
  };

  return (
    <div className="ws-cases">
      <CaseChips spec={spec} cases={cases} active={activeCase} onSelect={onActiveCase} onRemove={remove} onAdd={add} onReset={restore} />
      {cur && <CaseFields names={names} fields={cur.fields} onEdit={edit} />}
    </div>
  );
}
