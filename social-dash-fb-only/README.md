# Social Dash — Facebook-only local test

This is the minimal slice: connect a Facebook Page via OAuth, then publish
a text or photo post to it. No database, no Instagram yet — in-memory
session only, so restarting the server logs you out.

## 1. Install dependencies

```
npm install
```

## 2. Start a public tunnel (Meta requires HTTPS redirect URIs)

In a separate terminal:

```
npx ngrok http 3000
```

Copy the `https://xxxx.ngrok-free.app` URL it gives you.

## 3. Configure environment

```
cp .env.local.example .env.local
```

Fill in:
- `META_APP_ID` / `META_APP_SECRET` — from your Meta App > Settings > Basic
- `BASE_URL` — the ngrok URL from step 2, no trailing slash
- `SESSION_SECRET` — any long random string

## 4. Configure the Meta App dashboard

In your Meta App > Facebook Login > Settings, add to
"Valid OAuth Redirect URIs":

```
https://xxxx.ngrok-free.app/api/auth/meta/callback
```

(Use your actual ngrok URL. This changes every time you restart ngrok
unless you're on a paid ngrok plan — update it here each session.)

Make sure your Facebook user is added as a **Tester** under
App Roles > Roles, and that you've accepted the tester invite on
facebook.com, since the app is in Development mode.

## 5. Run it

```
npm run dev
```

Visit your ngrok URL (not localhost:3000 — Meta needs to redirect back to
the public URL) and click "Connect Facebook".

## Expected flow

1. Land on `/` → click Connect Facebook
2. Facebook login dialog → approve `pages_show_list`,
   `pages_read_engagement`, `pages_manage_posts`
3. Redirected to `/dashboard` → your Page(s) should be listed
4. Type a message (and optionally a public image URL) → Publish now
5. Check the Page on facebook.com — the post should appear

## If something breaks

- **No pages found**: your Facebook user isn't an admin of any Page, or
  the app doesn't have tester access to that Page/user yet.
- **redirect_uri mismatch**: the ngrok URL in `.env.local` doesn't exactly
  match what's in the Meta dashboard's Valid OAuth Redirect URIs. They
  must match character-for-character, including https://.
- **Image publish fails**: the `imageUrl` you passed isn't publicly
  fetchable — Meta's servers need to be able to GET it directly.
