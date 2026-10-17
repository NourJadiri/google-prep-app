export const isInOpenAssistant = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement && !!target.closest(".asst:not([hidden])");
