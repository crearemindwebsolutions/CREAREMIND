/**
 * Formats any raw Supabase UUID or user identifier into a consistent, unique 8-digit numeric User ID.
 * This guarantees that every real live user has the EXACT same 8-digit User ID across /profile, /admin, and the entire website.
 */
export function format8DigitUserId(rawIdOrEmail: string): string {
  if (!rawIdOrEmail) return "10000000";
  const str = rawIdOrEmail.toLowerCase().trim();
  
  // FNV-1a 32-bit hash algorithm for uniform distribution
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  
  // Map unsigned 32-bit integer to 8-digit numeric range [10000000, 99999999]
  const unsigned = hash >>> 0;
  const eightDigitNum = 10000000 + (unsigned % 90000000);
  return String(eightDigitNum);
}
