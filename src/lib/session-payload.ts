export function hasValidSessionIdentity(
  value: unknown,
  identityKey: "userId" | "patientId",
  nowSeconds = Math.floor(Date.now() / 1000)
): boolean {
  if (!value || typeof value !== "object") return false;
  const payload = value as Record<string, unknown>;
  return typeof payload[identityKey] === "string" && Boolean(payload[identityKey]) &&
    typeof payload.organizationId === "string" && Boolean(payload.organizationId) &&
    typeof payload.exp === "number" && Number.isFinite(payload.exp) && payload.exp > nowSeconds;
}
