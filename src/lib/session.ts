import crypto from "node:crypto";
import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "nutrisys_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

type SessionPayload = {
  userId: string;
  organizationId: string;
  role: string;
  exp: number;
};

export type AuthenticatedUser = {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  role: string;
};

export type RequiredAuthUser = AuthenticatedUser & {
  userId: string;
};

export function createSessionCookie(payload: Omit<SessionPayload, "exp">): string {
  const session: SessionPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS
  };

  const encoded = Buffer.from(JSON.stringify(session)).toString("base64url");
  const signature = sign(encoded);

  return `${encoded}.${signature}`;
}

export function setSessionCookie(response: NextResponse, value: string) {
  response.cookies.set(COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/"
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/"
  });
}

export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const cookie = cookies().get(COOKIE_NAME)?.value;
  let token = cookie;

  if (!token) {
    const authHeader = headers().get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
  }

  const payload = token ? verifySessionCookie(token) : null;

  if (!payload) {
    return null;
  }

  const user = await prisma.user.findFirst({
    where: {
      id: payload.userId,
      organizationId: payload.organizationId,
      active: true
    },
    select: {
      id: true,
      organizationId: true,
      name: true,
      email: true,
      role: true
    }
  });

  return user ? { ...user, role: user.role } : null;
}

export async function requireAuth(_request?: Request): Promise<RequiredAuthUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Nao autenticado.");
  }

  return { ...user, userId: user.id };
}

function verifySessionCookie(cookie: string): SessionPayload | null {
  const [encoded, signature] = cookie.split(".");

  if (!encoded || !signature || !safeEqual(signature, sign(encoded))) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as SessionPayload;
    if (!payload.userId || !payload.organizationId || payload.exp < Math.floor(Date.now() / 1000)) {
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
