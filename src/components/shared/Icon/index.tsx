import { GLYPHS, type IconName } from "./glyphs";

export type { IconName };

interface IconProps {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export default function Icon({ name, size = 18, strokeWidth = 2, className }: IconProps) {
  return (
    <svg
      className={className} width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
    >
      {GLYPHS[name]}
    </svg>
  );
}
