import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type HealthStatus = "ok" | "degraded";

type HealthResponse = {
  status: HealthStatus;
  db:     "ok" | "error";
  rag:    "configured" | "not_configured";
  uptime: number;
};

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse<HealthResponse>> {
  const health: HealthResponse = {
    status: "ok",
    db:     "ok",
    rag:    "configured",
    uptime: process.uptime(),
  };

  // Vérification DB — compatible PgBouncer (pas de prepared statement)
  try {
    await prisma.$queryRawUnsafe("SELECT 1");
  } catch (err) {
    console.error("[/api/health] DB:", err instanceof Error ? err.message : err);
    health.db     = "error";
    health.status = "degraded";
  }

  if (!process.env.RAG_SERVICE_URL) {
    health.rag    = "not_configured";
    health.status = "degraded";
  }

  return NextResponse.json(health, { status: health.status === "ok" ? 200 : 503 });
}
