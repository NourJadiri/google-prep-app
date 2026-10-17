import type { ComponentProps } from "react";
import "./ProblemHeading.css";

export default function ProblemHeading(props: ComponentProps<"h3">) {
  return <h3 className="ws-problem-heading" {...props} />;
}
