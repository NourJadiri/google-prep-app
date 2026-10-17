import type { FunctionComponent } from "react";
import LineView from "../components/line/LineView";
import MetroView from "../components/metro/MetroView";
import DojoView from "../components/dojo/DojoView";
import MeView from "../components/me/MeView";
import type { Tab } from "../types";

/* Keyed by Tab, so an unhandled tab is a compile error. */
export const VIEWS: Record<Tab, FunctionComponent> = {
  line: LineView,
  metro: MetroView,
  dojo: DojoView,
  me: MeView,
};
