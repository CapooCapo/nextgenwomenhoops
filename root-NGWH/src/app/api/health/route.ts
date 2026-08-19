import { getDbPool } from "@/server/db/client";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const pool = getDbPool();
    await pool.query("SELECT 1");
    return NextResponse.json({ status: "ok" }, { status: 200 });
  } catch {
    return NextResponse.json({ status: "unhealthy" }, { status: 503 });
  }
}
