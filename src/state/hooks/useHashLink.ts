import { useEffect } from "react";
import type { Dispatch } from "react";
import { consumeHashLink } from "../../lib/link";
import type { Action } from "../actions";

export function useHashLink(dispatch: Dispatch<Action>) {
  // Only stages the link for the consent card. hashchange covers a link pasted into an open tab;
  // consumeHashLink strips the hash it read, so StrictMode's second mount offers nothing twice.
  useEffect(() => {
    const open = () => {
      const d = consumeHashLink();
      if (d) dispatch({ type: "LINK_OPEN", link: d });
    };
    open();
    window.addEventListener("hashchange", open);
    return () => window.removeEventListener("hashchange", open);
  }, [dispatch]);
}
