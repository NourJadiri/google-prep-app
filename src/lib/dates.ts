// Days are stored as local "YYYY-MM-DD" strings, never timestamps: a study day is a day on the wall.
export function todayStr(d: Date = new Date()): string {
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
}

// Both ends parse as UTC midnight, so month and year rollovers are plain arithmetic.
export function daysBetween(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}
