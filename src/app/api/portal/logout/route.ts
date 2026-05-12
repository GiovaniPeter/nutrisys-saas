import { NextResponse } from "next/server";
import { clearPortalSessionCookie } from "@/lib/patient-session";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  clearPortalSessionCookie(response);
  return response;
}
