/* Hashing first gives timingSafeEqual the equal lengths it requires, and keeps the password's length out of the timing too. */
async function sameSecret(given: string, expected: string): Promise<boolean> {
  const enc = new TextEncoder();
  const [a, b] = await Promise.all([
    crypto.subtle.digest("SHA-256", enc.encode(given)),
    crypto.subtle.digest("SHA-256", enc.encode(expected)),
  ]);
  return crypto.subtle.timingSafeEqual(a, b);
}

export async function isAuthorized(request: Request, password: string): Promise<boolean> {
  const auth = request.headers.get("authorization") ?? "";
  const given = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  return !!given && (await sameSecret(given, password));
}
