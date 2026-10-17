import Section from "../ui/Section";
import TemplateCard from "./TemplateCard";
import type { Group } from "./lib/groupTemplates";

interface TemplateGroupProps {
  group: Group;
  openIds: readonly string[];
  shownIds: readonly string[];
  onToggle: (id: string) => void;
  onReveal: (id: string) => void;
}

export default function TemplateGroup({ group, openIds, shownIds, onToggle, onReveal }: TemplateGroupProps) {
  return (
    <Section title={group.label}>
      {group.templates.map((tpl) => (
        <TemplateCard
          key={tpl.id}
          tpl={tpl}
          open={openIds.includes(tpl.id)}
          shown={shownIds.includes(tpl.id)}
          onToggle={onToggle}
          onReveal={onReveal}
        />
      ))}
    </Section>
  );
}
