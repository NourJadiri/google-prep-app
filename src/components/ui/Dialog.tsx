import type { ComponentProps, RefObject } from "react";
import { useDialogBehavior } from "../../hooks/useDialogBehavior";

interface DialogProps extends Omit<ComponentProps<"div">, "role" | "aria-label" | "aria-modal"> {
  label: string;
  /** Makes the dialog modal: Escape and a press on the backdrop call it, and focus moves in and back out. */
  onDismiss?: () => void;
  /** Takes focus on open; whatever opened the dialog gets it back on close. */
  initialFocus?: RefObject<HTMLElement | null>;
}

export default function Dialog({ label, onDismiss, initialFocus, children, ...rest }: DialogProps) {
  useDialogBehavior(onDismiss, initialFocus);
  return (
    <div
      role="dialog"
      aria-modal={onDismiss ? true : undefined}
      aria-label={label}
      /* mousedown, not click: a drag that starts on the card and ends on the backdrop is a text selection. */
      onMouseDown={
        onDismiss
          ? (e) => {
              if (e.target === e.currentTarget) onDismiss();
            }
          : undefined
      }
      {...rest}
    >
      {children}
    </div>
  );
}
