# Elenchos Frontend

Presentation layer for [elenchos.live](https://elenchos.live). Reads all scores, topics, and trackers from Supabase; the backend (`phaddad150-max/elenchos-backend`) is the single source of truth.

## Stack

- TanStack Start + Vite
- Deployed on **Vercel**
- Auth + data: Supabase project `jacbalsongvqvaqlfsbx`

## Retired

- `/compare` on-demand page and `elenchos-compare-backend` dispatch — removed


## Local dev

```bash
npm install
npm run dev
```

Set Supabase env vars in `.env` (see Vercel project settings for names).