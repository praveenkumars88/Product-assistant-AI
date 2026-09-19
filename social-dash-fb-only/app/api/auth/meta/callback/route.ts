import { NextRequest, NextResponse } from "next/server";
import {
  exchangeCodeForUserToken,
  getLongLivedUserToken,
  getUserPages,
} from "@/lib/meta";
import { setSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  const baseUrl = process.env.BASE_URL!;
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      `${baseUrl}/?error=${encodeURIComponent(error)}`
    );
  }
  if (!code) {
    return NextResponse.redirect(`${baseUrl}/?error=missing_code`);
  }

  try {
    const shortLivedToken = await exchangeCodeForUserToken(code);
    const longLivedToken = await getLongLivedUserToken(shortLivedToken);
    const pages = await getUserPages(longLivedToken);

    setSession({
      userToken: longLivedToken,
      pages: pages.map((p) => ({
        id: p.id,
        name: p.name,
        accessToken: p.accessToken,
      })),
    });

    return NextResponse.redirect(`${baseUrl}/dashboard`);
  } catch (err: any) {
    console.error("OAuth callback error:", err);
    return NextResponse.redirect(
      `${baseUrl}/?error=${encodeURIComponent(err.message ?? "unknown_error")}`
    );
  }
}
