import type { Template } from "../../../types";

export interface Group {
  label: string;
  templates: Template[];
}

/** Splits the list into runs of consecutive templates that share a heading. */
export function groupTemplates(templates: readonly Template[]): Group[] {
  const groups: Group[] = [];
  for (const tpl of templates) {
    const last = groups[groups.length - 1];
    if (last && last.label === tpl.g) last.templates.push(tpl);
    else groups.push({ label: tpl.g, templates: [tpl] });
  }
  return groups;
}
