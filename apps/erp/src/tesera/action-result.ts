/**
 * What a write action reports back. Business rules (say, insufficient funds)
 * return a readable error instead of throwing, so forms can show it in place.
 */
export type ActionResult = { ok: true } | { ok: false; error: string };
