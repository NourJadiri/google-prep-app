export interface Timer {
  armed(): boolean;
  /** Replaces any pending run. */
  restart(fn: () => void, ms: number): void;
  stop(): void;
}

export function createTimer(): Timer {
  let id: ReturnType<typeof setTimeout> | null = null;
  const stop = () => {
    if (id !== null) clearTimeout(id);
    id = null;
  };
  return {
    armed: () => id !== null,
    restart(fn, ms) {
      stop();
      id = setTimeout(() => {
        id = null;
        fn();
      }, ms);
    },
    stop,
  };
}
