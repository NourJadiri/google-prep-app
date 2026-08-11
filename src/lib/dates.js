/* Calendar-day helpers. Everything the app stores is a local "YYYY-MM-DD"
   string, never a timestamp — a study day is a day on the wall, not 24 hours. */

export function todayStr(d = new Date()) {
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
}

/* Both ends parse as UTC midnight, so month and year rollovers are just
   arithmetic: "2026-07-31" -> "2026-08-01" is 1. */
export function daysBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86400000);
}
