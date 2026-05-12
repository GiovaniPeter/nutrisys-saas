import crypto from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "nutrisys_patient_portal";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 14;

type PortalSessionPayload = {
  patientId: string;
  organizationId: string;
  exp: number;
};

export type PortalPatient = {
  id: string;
  organizationId: string;
  name: string;
  email: string | null;
  phone: string | null;
  goal: string | null;
  organization: {
    name: string;
    primaryColor: string;
    secondaryColor: string;
    logoUrl: string | null;
  };
};

export function createPortalSessionCookie(payload: Omit<PortalSessionPayload, "exp">): string {
  const session: PortalSessionPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS
  };

  const encoded = Buffer.from(JSON.stringify(session)).toString("base64url");
  const signature = sign(encoded);

  return `${encoded}.${signature}`;
}

export function setPortalSessionCookie(response: NextResponse, value: string) {
  response.cookies.set(COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/"
  });
}

export function clearPortalSessionCookie(response: NextResponse) {
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/"
  });
}

export async function getCurrentPortalPatient(): Promise<PortalPatient | null> {
  const cookie = cookies().get(COOKIE_NAME)?.value;
  const payload = cookie ? verifyPortalSessionCookie(cookie) : null;

  if (!payload) {
    return null;
  }

  const patient = await prisma.patient.findFirst({
    where: {
      id: payload.patientId,
      organizationId: payload.organizationId,
      portalEnabled: true
    },
    select: {
      id: true,
      organizationId: true,
      name: true,
      email: true,
      phone: true,
      goal: true,
      organization: {
        select: {
          name: true,
          primaryColor: true,
          secondaryColor: true,
          logoUrl: true
        }
      }
    }
  });

  return patient;
}

function verifyPortalSessionCookie(cookie: string): PortalSessionPayload | null {
  const [encoded, signature] = cookie.split(".");

  if (!encoded || !signature || !safeEqual(signature, sign(encoded))) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as PortalSessionPayload;
    if (!payload.patientId || !payload.organizationId || payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

function sign(value: string): string {
  const secret = process.env.SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must have at least 32 characters.");
  }

  return crypto.createHmac("sha256", secret).update(value).digest("base64url");
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}
