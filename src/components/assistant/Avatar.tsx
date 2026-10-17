import { cx } from "../../lib/cx";
import "./Avatar.css";

/* Decorative: the window's header already says who is talking. */
export default function Avatar({ src, small }: { src: string; small?: boolean }) {
  const size = small ? 22 : 30;
  return <img className={cx("asst-avatar", small && "sm")} src={src} alt="" width={size} height={size} decoding="async" />;
}
