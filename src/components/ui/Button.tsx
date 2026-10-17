import type { ComponentProps } from "react";
import { cx } from "../../lib/cx";
import "./Button.css";

interface ButtonProps extends ComponentProps<"button"> {
  variant?: "primary" | "ghost";
  tone?: "ok";
}

export default function Button({ variant, tone, className, ...rest }: ButtonProps) {
  return <button className={cx("btn", variant, tone, className)} {...rest} />;
}
