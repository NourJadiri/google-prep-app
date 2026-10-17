import { useEffect } from "react";

/** Fetches a mode's faces as soon as it is chosen, so a new mood never flashes an empty frame. */
export function usePreload(images: Record<string, string> | undefined) {
  useEffect(() => {
    if (!images) return;
    for (const src of Object.values(images)) new Image().src = src;
  }, [images]);
}
