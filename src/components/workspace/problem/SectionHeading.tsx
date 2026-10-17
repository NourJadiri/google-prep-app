import type { ComponentProps } from "react";
import "./SectionHeading.css";

export default function SectionHeading(props: ComponentProps<"h3">) {
  return <h3 className="ws-h" {...props} />;
}
