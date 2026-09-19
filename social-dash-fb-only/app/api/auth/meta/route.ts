import { NextResponse } from "next/server";
import crypto from "crypto";
import { buildAuthUrl } from "@/lib/meta";

export async function GET() {
  // Simple CSRF-style state value. In production, store this and verify it
  // matches on callback. Kept minimal here since this is local testing.
  const state = crypto.randomBytes(16).toString("hex");
  const url = buildAuthUrl(state);
  return NextResponse.redirect(url);
}
