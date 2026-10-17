export const MOCK_SECONDS = 25 * 60;

export const fmtT = (s: number): string =>
  String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
