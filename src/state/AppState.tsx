import { createContext, useContext, useMemo, useReducer } from "react";
import type { ReactNode } from "react";
import { useCloudSync } from "./hooks/useCloudSync";
import { useHashLink } from "./hooks/useHashLink";
import { usePageLifecycle } from "./hooks/usePageLifecycle";
import { useSaveData } from "./hooks/useSaveData";
import { reducer } from "./reducer";
import { boot } from "./shape";
import type { AppStateShape } from "./shape";
import { useActions } from "./useActions";
import type { Actions } from "./useActions";

interface AppValue {
  state: AppStateShape;
  actions: Actions;
}

const AppCtx = createContext<AppValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, boot);

  useSaveData(state.data);
  useCloudSync(dispatch);
  useHashLink(dispatch);
  usePageLifecycle(state.session !== null);

  const actions = useActions(dispatch);
  const value = useMemo<AppValue>(() => ({ state, actions }), [state, actions]);
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp(): AppValue {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}
