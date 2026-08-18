import { NextResponse } from "next/server";
import { fetchPublicSessions } from "@/lib/workshops/api";

export const dynamic = "force-dynamic";

export async function GET() {
  const sessions = await fetchPublicSessions();
  if (sessions === null) {
    return NextResponse.json({ sessions: [], configured: false }, { status: 200 });
  }
  return NextResponse.json({ sessions, configured: true });
}
