export const isMac = () => /Mac|iPhone|iPad/.test(navigator.platform);
export const modKey = () => (isMac() ? "⌘" : "Ctrl");
