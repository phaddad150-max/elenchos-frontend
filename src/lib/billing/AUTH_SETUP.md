# Fix Google sign-in: `Error 400: redirect_uri_mismatch`

Google rejects the OAuth request when the **redirect URI** sent by Supabase is not listed on your Google OAuth client.

Supabase always redirects Google to **its own callback**, not directly to elenchos.live.

## 1. Google Cloud Console

Open [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → your **OAuth 2.0 Client ID** (Web application).

### Authorized JavaScript origins

```
https://elenchos.live
https://www.elenchos.live
https://jacbalsongvqvaqlfsbx.supabase.co
```

### Authorized redirect URIs (critical)

Paste **exactly**:

```
https://jacbalsongvqvaqlfsbx.supabase.co/auth/v1/callback
```

Save. Wait 1–5 minutes for Google to propagate.

## 2. Supabase Dashboard

Project `jacbalsongvqvaqlfsbx` → **Authentication** → **URL Configuration**

| Field | Value |
|-------|--------|
| Site URL | `https://elenchos.live` |
| Redirect URLs | `https://elenchos.live/**` |
| | `https://www.elenchos.live/**` |
| | `http://localhost:5173/**` (local Vite if needed) |

### Google provider

Authentication → Providers → **Google**

- Enabled: on  
- Client ID / Client Secret: same Web client as above  

## 3. App behaviour

`/pro` uses `oauthReturnTo("/pro")` → `https://elenchos.live/pro` after Supabase finishes the exchange.

Flow:

```text
User → Google → supabase.co/auth/v1/callback → elenchos.live/pro
```

## 4. Quick test

1. Incognito → https://elenchos.live/pro  
2. Continue with Google  
3. Should land signed-in on `/pro` with wallet section  

If still blocked, open Google’s error URL and confirm `redirect_uri=` equals the Supabase callback above (character-for-character).
