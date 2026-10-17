import Confetti from "./Confetti";
import Toaster from "./Toaster";
import { useCelebrationQueue } from "./hooks/useCelebrationQueue";

export default function Celebrations() {
  const { toasts, bursts, dropToast, dropBurst } = useCelebrationQueue();

  return (
    <>
      <Confetti bursts={bursts} onDone={dropBurst} />
      <Toaster toasts={toasts} onExpire={dropToast} />
    </>
  );
}
