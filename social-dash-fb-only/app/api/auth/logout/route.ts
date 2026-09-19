import { NextResponse } from "next/server";
import { clearSession } from "@/lib/session";

export async function GET() {
  clearSession();
  return NextResponse.redirect(`${process.env.BASE_URL}/`);
}
