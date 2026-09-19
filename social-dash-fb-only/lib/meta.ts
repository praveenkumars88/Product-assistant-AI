const GRAPH_VERSION = "v19.0";
const GRAPH_BASE = `https://graph.facebook.com/${GRAPH_VERSION}`;

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set`);
  return v;
}

/**
 * Step 1 of OAuth: build the URL the user is sent to for the Facebook login dialog.
 * Facebook-only scopes for now — pages_show_list + pages_read_engagement +
 * pages_manage_posts is enough to list Pages and publish to a Page feed/photos.
 */
export function buildAuthUrl(state: string): string {
  const appId = requireEnv("META_APP_ID");
  const baseUrl = requireEnv("BASE_URL");
  const redirectUri = `${baseUrl}/api/auth/meta/callback`;

  const scopes = [
    "pages_show_list",
    "pages_read_engagement",
    "pages_manage_posts",
  ].join(",");

  const params = new URLSearchParams({
    client_id: appId,
    redirect_uri: redirectUri,
    state,
    scope: scopes,
    response_type: "code",
  });

  return `https://www.facebook.com/${GRAPH_VERSION}/dialog/oauth?${params.toString()}`;
}

/**
 * Step 2: exchange the ?code= from the callback for a short-lived user token.
 */
export async function exchangeCodeForUserToken(code: string): Promise<string> {
  const appId = requireEnv("META_APP_ID");
  const appSecret = requireEnv("META_APP_SECRET");
  const baseUrl = requireEnv("BASE_URL");
  const redirectUri = `${baseUrl}/api/auth/meta/callback`;

  const params = new URLSearchParams({
    client_id: appId,
    client_secret: appSecret,
    redirect_uri: redirectUri,
    code,
  });

  const res = await fetch(`${GRAPH_BASE}/oauth/access_token?${params.toString()}`);
  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(`Token exchange failed: ${JSON.stringify(data)}`);
  }
  return data.access_token as string;
}

/**
 * Step 3: exchange the short-lived user token for a long-lived one (~60 days).
 */
export async function getLongLivedUserToken(shortLivedToken: string): Promise<string> {
  const appId = requireEnv("META_APP_ID");
  const appSecret = requireEnv("META_APP_SECRET");

  const params = new URLSearchParams({
    grant_type: "fb_exchange_token",
    client_id: appId,
    client_secret: appSecret,
    fb_exchange_token: shortLivedToken,
  });

  const res = await fetch(`${GRAPH_BASE}/oauth/access_token?${params.toString()}`);
  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(`Long-lived token exchange failed: ${JSON.stringify(data)}`);
  }
  return data.access_token as string;
}

export type PageInfo = {
  id: string;
  name: string;
  accessToken: string;
};

/**
 * Step 4: list the Pages this user manages, with each Page's own access token
 * (Page tokens are what you actually publish with, not the user token).
 */
export async function getUserPages(userToken: string): Promise<PageInfo[]> {
  const params = new URLSearchParams({
    access_token: userToken,
    fields: "id,name,access_token",
  });

  const res = await fetch(`${GRAPH_BASE}/me/accounts?${params.toString()}`);
  const data = await res.json();
  if (!res.ok || !data.data) {
    throw new Error(`Fetching pages failed: ${JSON.stringify(data)}`);
  }

  return data.data.map((p: any) => ({
    id: p.id,
    name: p.name,
    accessToken: p.access_token,
  }));
}

/**
 * Publish a text-only post to a Page's feed.
 */
export async function publishTextPost(
  pageId: string,
  pageAccessToken: string,
  message: string
): Promise<{ id: string }> {
  const res = await fetch(`${GRAPH_BASE}/${pageId}/feed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      access_token: pageAccessToken,
    }),
  });
  const data = await res.json();
  if (!res.ok || !data.id) {
    throw new Error(`Publishing text post failed: ${JSON.stringify(data)}`);
  }
  return { id: data.id };
}

/**
 * Publish a photo post to a Page, given a publicly fetchable image URL.
 */
export async function publishPhotoPost(
  pageId: string,
  pageAccessToken: string,
  imageUrl: string,
  caption?: string
): Promise<{ id: string }> {
  const res = await fetch(`${GRAPH_BASE}/${pageId}/photos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: imageUrl,
      caption,
      access_token: pageAccessToken,
    }),
  });
  const data = await res.json();
  if (!res.ok || !data.id) {
    throw new Error(`Publishing photo post failed: ${JSON.stringify(data)}`);
  }
  return { id: data.id };
}
