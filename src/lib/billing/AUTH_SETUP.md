# Fix Google sign-in on `/pro`

**Vercel (ops):** Team **elenchos** · slug `elenchos-live` · domain dashboard  
https://vercel.com/elenchos-live/~/domains/elenchos.live  
(GitHub repo remains `phaddad150-max/elenchos-frontend`.)

---

The frontend does **not** store Google Client IDs. Supabase Auth holds them.  
Most failures are dashboard config — not app code.

---

## Error A — `401: deleted_client` (current)

**Meaning:** The OAuth **Client ID** saved in Supabase was **deleted** (or disabled) in Google Cloud. Google refuses any login with that dead client.

### Fix — create a new Web client and paste it into Supabase

#### 1. Google Cloud Console

1. Open [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Select the correct GCP project (the one you use for Elenchos)
3. **+ Create credentials** → **OAuth client ID**
4. Application type: **Web application**
5. Name: e.g. `Elenchos Supabase Auth`

**Authorized JavaScript origins**

```
https://elenchos.live
https://www.elenchos.live
https://jacbalsongvqvaqlfsbx.supabase.co
```

**Authorized redirect URIs** (exact)

```
https://jacbalsongvqvaqlfsbx.supabase.co/auth/v1/callback
```

6. Create → copy **Client ID** and **Client Secret**

If OAuth consent screen is not set: APIs & Services → **OAuth consent screen** → External (or Internal) → add app name, support email, save. For testing, add your Google account under **Test users**.

#### 2. Supabase — replace the dead client

1. [Supabase Dashboard](https://supabase.com/dashboard) → project **`jacbalsongvqvaqlfsbx`**
2. **Authentication** → **Providers** → **Google**
3. Enable Google
4. Paste the **new** Client ID and Client Secret (overwrite the old ones)
5. Save

#### 3. Supabase URL allowlist

**Authentication** → **URL Configuration**

| Field | Value |
|-------|--------|
| Site URL | `https://elenchos.live` |
| Redirect URLs | `https://elenchos.live/**` |
| | `https://www.elenchos.live/**` |
| | `http://localhost:5173/**` (local) |

#### 4. Test

1. Incognito window → https://elenchos.live/pro  
2. **Continue with Google**  
3. Should return signed-in to `/pro`

Do **not** reuse a deleted client ID — always create a new Web client and update Supabase.

---

## Error B — `400: redirect_uri_mismatch`

Google’s authorized redirect URI is missing or mistyped.  
It must be exactly:

```
https://jacbalsongvqvaqlfsbx.supabase.co/auth/v1/callback
```

(Not `elenchos.live/...` — Google talks to Supabase first.)

---

## App behaviour (already in code)

`/pro` uses `oauthReturnTo("/pro")` → `https://elenchos.live/pro` after Supabase finishes the exchange.

```text
User → Google → jacbalsongvqvaqlfsbx.supabase.co/auth/v1/callback → elenchos.live/pro
```
