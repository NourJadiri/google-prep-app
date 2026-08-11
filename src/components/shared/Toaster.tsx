import { useEffect } from "react";
import type { StampedToast } from "../../types";

/* Pill toasts, stacked under the notch. The CSS fades each one out at 2.5s;
   this clears it from the DOM at 3s, same as the reference. */

interface ToastProps {
  toast: StampedToast;
  onExpire: (id: number) => void;
}

function Toast({ toast, onExpire }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(() => onExpire(toast.id), 3000);
    return () => clearTimeout(t);
  }, [toast.id, onExpire]);

  return <div className={"toast" + (toast.gold ? " gold" : "")}>{toast.msg}</div>;
}

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
