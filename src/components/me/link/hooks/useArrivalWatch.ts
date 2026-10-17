import { useEffect, useRef, useState } from "react";
import * as sync from "../../../../lib/sync";
import { useLatest } from "../../../../hooks/useLatest";
import { useOutcomeFx } from "../../hooks/useOutcomeFx";

const POLL_MS = 2_500;
/* Long enough for the Linked card to register as an answer, short enough that nobody reaches for Close. */
const WIN_MS = 1_200;

interface ArrivalWatchArgs {
  watching: boolean;
  code: string;
  enabled: boolean;
  serverAt: number;
  onDone: () => void;
}

/** Get mode's wait for the other device. The store is one dumb row with nothing to subscribe to, so this peeks at it until it moves. */
export function useArrivalWatch({ watching, code, enabled, serverAt, onDone }: ArrivalWatchArgs) {
  const fx = useOutcomeFx();
  const [linked, setLinked] = useState(false);
  const [reachable, setReachable] = useState(true);
  /* `enabled` flips during a Get-mode link and restarts the effect; an adoption already happened and must not go round again. */
  const settled = useRef(false);
  const winTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /* Read through a ref so the watch doesn't restart on every acknowledgment. */
  const acked = useLatest(serverAt);

  useEffect(
    () => () => {
      if (winTimer.current !== null) clearTimeout(winTimer.current);
    },
    []
  );

  useEffect(() => {
    if (!watching || settled.current) return;
    let live = true;
    let timer: ReturnType<typeof setTimeout> | null = null;
    /* Sync on: the row under this code is ours, so only a stamp newer than the one there now is the other device.
       Sync off: any row at all is. The baseline is measured on the first peek that answers, because an
       unreachable cloud says nothing and guessing zero would read our own next write as them. */
    let baseline: number | null = enabled ? null : 0;

    const later = (): void => {
      timer = setTimeout(() => void tick(), POLL_MS);
    };

    const arrived = async (): Promise<void> => {
      live = false;
      settled.current = true;
      /* The reader chose to receive, so the cloud copy wins either way. */
      const out = enabled ? await sync.syncNow(true) : await sync.join(code);
      fx.arrived(out, enabled);
      /* Nothing was linked if this build can't read what arrived; the toast says why and the panel shows it. */
      if (out === "held") {
        onDone();
        return;
      }
      setLinked(true);
      winTimer.current = setTimeout(onDone, WIN_MS);
    };

    const tick = async (): Promise<void> => {
      const r = await sync.probe(code);
      if (!live) return;
      setReachable(r !== "unreachable");
      if (r === "unreachable") {
        later();
        return;
      }
      const at = r === "none" ? 0 : r.at;
      if (baseline === null) baseline = at;
      /* A stamp the server has credited to this device is our own push landing, not an arrival. */
      else if (at > baseline && at > acked.current) {
        void arrived();
        return;
      }
      later();
    };

    void tick();
    return () => {
      live = false;
      if (timer !== null) clearTimeout(timer);
    };
  }, [watching, code, enabled, fx, onDone, acked]);

  return { linked, reachable };
}
