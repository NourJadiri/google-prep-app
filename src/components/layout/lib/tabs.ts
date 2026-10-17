import type { Tab } from "../../../types";
import type { IconName } from "../../shared/Icon";

export const TABS: ReadonlyArray<{ id: Tab; icon: IconName; label: string }> = [
  { id: "line", icon: "route", label: "Line" },
  { id: "metro", icon: "train", label: "Metro" },
  { id: "dojo", icon: "code", label: "Dojo" },
  { id: "me", icon: "chart", label: "Me" },
];
