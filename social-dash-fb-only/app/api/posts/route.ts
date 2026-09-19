import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { publishTextPost, publishPhotoPost } from "@/lib/meta";

export async function POST(req: NextRequest) {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: "Not connected" }, { status: 401 });
  }

  const body = await req.json();
  const { pageId, message, imageUrl } = body as {
    pageId: string;
    message: string;
    imageUrl?: string;
  };

  const page = session.pages.find((p) => p.id === pageId);
  if (!page) {
    return NextResponse.json({ error: "Unknown page" }, { status: 400 });
  }

  try {
    const result = imageUrl
      ? await publishPhotoPost(page.id, page.accessToken, imageUrl, message)
      : await publishTextPost(page.id, page.accessToken, message);

    return NextResponse.json({ success: true, postId: result.id });
  } catch (err: any) {
    console.error("Publish error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
