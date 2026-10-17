import { useEffect } from "react";

/** Calls `onExpire(id)` once `ms` have passed since the item mounted. */
export function useExpiry(id: number, ms: number, onExpire: (id: number) => void): void {
  useEffect(() => {
    const t = setTimeout(() => onExpire(id), ms);
    return () => clearTimeout(t);
  }, [id, ms, onExpire]);
}
