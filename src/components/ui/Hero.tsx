import type { ReactNode } from "react";
import "./Hero.css";

interface HeroProps {
  /** The title's words, the last of them in a `<b>`. */
  heading: ReactNode;
  blurb: string;
  /** Sits over the heading. */
  above?: ReactNode;
  /** Whatever the tab adds under the blurb. */
  children?: ReactNode;
}

export default function Hero({ heading, blurb, above, children }: HeroProps) {
  return (
    <div className="hero">
      {above}
      <h1>{heading}</h1>
      <p>{blurb}</p>
      {children}
    </div>
  );
}
