import type { StampedToast } from "../../../types";
import Toast from "./Toast";
import "./Toaster.css";

interface ToasterProps {
  toasts: StampedToast[];
  onExpire: (id: number) => void;
}

export default function Toaster({ toasts, onExpire }: ToasterProps) {
  return (
    <div className="toasts" aria-live="polite">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onExpire={onExpire} />
      ))}
    </div>
  );
}
