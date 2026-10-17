import { useCallback, useEffect, useState } from "react";
import type { LinkDirective } from "../../../../types";

/** Which full-screen surface is up. The sheet and the camera are both about the same handshake, so they never share the screen. */
export function useLinkFlow(pending: LinkDirective | null) {
  const [sheet, setSheet] = useState(false);
  const [scanning, setScanning] = useState(false);

  /* A consent card and a live square must not share the screen: closing the sheet stops its poll, which would be deciding behind the card. */
  useEffect(() => {
    if (pending) setSheet(false);
  }, [pending]);

  /* Stable: the sheet's poll and the scanner's camera have these in their effect deps. */
  const closeSheet = useCallback(() => setSheet(false), []);
  const closeScan = useCallback(() => setScanning(false), []);
  const toScanner = useCallback(() => {
    setSheet(false);
    setScanning(true);
  }, []);
  const openSheet = useCallback(() => {
    setScanning(false);
    setSheet(true);
  }, []);

  return { sheet, scanning, openSheet, closeSheet, toScanner, closeScan };
}
