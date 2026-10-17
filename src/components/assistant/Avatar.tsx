import { cx } from "../../lib/cx";
import "./Avatar.css";

interface Props {
  src: string;
  small?: boolean;
  /** Which face this is, for whoever reads the page (and its checks). */
  mood?: string;
}

/* Decorative: the window's header already says who is talking. */
export default function Avatar({ src, small, mood = "neutral" }: Props) {
  const size = small ? 24 : 36;
  return (
    <img
      className={cx("asst-avatar", small && "sm")}
      src={src}
      alt=""
      width={size}
      height={size}
      decoding="async"
      data-mood={mood}
    />
  );
}
