import { NextResponse } from "next/server";
import { checkDatabaseHealth } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const dbHealth = await checkDatabaseHealth();
  const isHealthy = dbHealth.status === "connected";

  const payload = {
    status: isHealthy ? "healthy" : "unhealthy",
    timestamp: new Date().toISOString(),
    database: dbHealth,
    environment: process.env.NODE_ENV ?? "development",
  };

  return NextResponse.json(payload, {
    status: isHealthy ? 200 : 503,
  });
}
