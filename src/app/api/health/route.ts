import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      status: "ok",
      database: "ok",
      appUrlConfigured: Boolean(process.env.APP_URL),
      checkedAt: new Date().toISOString()
    });
  } catch {
    return NextResponse.json(
      {
        status: "error",
        database: "error",
        checkedAt: new Date().toISOString()
      },
      { status: 503 }
    );
  }
}
