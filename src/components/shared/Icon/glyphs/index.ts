import { ASSISTANT_GLYPHS } from "./assistant";
import { CONTENT_GLYPHS } from "./content";
import { CONTROL_GLYPHS } from "./controls";
import { MARK_GLYPHS } from "./marks";
import { PROGRESS_GLYPHS } from "./progress";
import { SYNC_GLYPHS } from "./sync";
import { TAB_GLYPHS } from "./tabs";

export const GLYPHS = {
  ...TAB_GLYPHS,
  ...MARK_GLYPHS,
  ...PROGRESS_GLYPHS,
  ...CONTROL_GLYPHS,
  ...SYNC_GLYPHS,
  ...CONTENT_GLYPHS,
  ...ASSISTANT_GLYPHS,
};

export type IconName = keyof typeof GLYPHS;
