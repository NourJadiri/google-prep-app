import { cx } from "../../../lib/cx";
import type { StampedToast } from "../../../types";
import { useExpiry } from "./hooks/useExpiry";
import { TOAST_MS } from "./lib/lifetimes";
import "./Toast.css";

interface ToastProps {
  toast: StampedToast;
  onExpire: (id: number) => void;
}

export default function Toast({ toast, onExpire }: ToastProps) {
  useExpiry(toast.id, TOAST_MS, onExpire);

  return <div className={cx("toast", toast.gold && "gold")}>{toast.msg}</div>;
}
