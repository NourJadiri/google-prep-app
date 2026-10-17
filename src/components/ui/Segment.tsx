import type { ComponentProps } from "react";
import { cx } from "../../lib/cx";

interface SegmentProps extends Omit<ComponentProps<"button">, "onClick" | "onSelect"> {
  selected: boolean;
  onSelect: () => void;
}

export default function Segment({ selected, onSelect, className, ...rest }: SegmentProps) {
  return <button role="tab" aria-selected={selected} className={cx(selected && "on", className)} onClick={onSelect} {...rest} />;
}
