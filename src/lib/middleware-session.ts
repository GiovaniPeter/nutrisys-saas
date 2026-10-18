import { hasValidSessionIdentity } from "./session-payload";

/** Verifica o mesmo HMAC das sessões do servidor usando Web Crypto no Edge. */
export async function readVerifiedSession(token?: string): Promise<{ role: string | null; specialty: string | null }> {
  const empty = { role: null, specialty: null };
  const secret = process.env.SESSION_SECRET;
  if (!token || !secret || secret.length < 32) return empty;
  const parts = token.split(".");
  if (parts.length !== 2 || !parts.every((part) => /^[A-Za-z0-9_-]+$/.test(part))) return empty;

  try {
    const [encoded, signature] = parts;
    const decode = (value: string) => Uint8Array.from(
      atob(value.replace(/-/g, "+").replace(/_/g, "/")), (character) => character.charCodeAt(0)
    );
    const key = await crypto.subtle.importKey(
      "raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]
    );
    const valid = await crypto.subtle.verify("HMAC", key, decode(signature), new TextEncoder().encode(encoded));
    if (!valid) return empty;
    const payload = JSON.parse(new TextDecoder().decode(decode(encoded)));
    if (!hasValidSessionIdentity(payload, "userId")) return empty;
    return {
      role: typeof payload.role === "string" ? payload.role : null,
      specialty: typeof payload.specialty === "string" ? payload.specialty : null
    };
  } catch {
    return empty;
  }
}
