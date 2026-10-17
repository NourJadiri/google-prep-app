import { Suspense, lazy } from "react";
import type { AskContext } from "../assistant/lib/askContext";

/* The assistant and the AI SDK behind it load on the first ask, not before. */
const Assistant = lazy(() => import("../assistant/Assistant"));

interface LazyAssistantProps {
  /** Stays true once the assistant has been opened, so closing keeps the chat. */
  loaded: boolean;
  open: boolean;
  summon: number;
  onClose: () => void;
  context: () => AskContext;
  /** The problem was just one-shot: Bana's catgirl mode has a face for that. */
  oneShot: boolean;
  wide: boolean;
}

export default function LazyAssistant({ loaded, ...props }: LazyAssistantProps) {
  if (!loaded) return null;
  return (
    <Suspense fallback={null}>
      <Assistant {...props} />
    </Suspense>
  );
}
