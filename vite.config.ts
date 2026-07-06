// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Vercel needs the Nitro `vercel` preset + default server entry.
// The custom src/server.ts wrapper is Cloudflare Workers `{ fetch }` only (Lovable hosting).
const isVercel = !!(process.env.VERCEL || process.env.NITRO_PRESET === "vercel");

export default defineConfig({
  nitro: { preset: isVercel ? "vercel" : "cloudflare-module" },
  ...(isVercel
    ? {}
    : {
        tanstackStart: {
          server: { entry: "server" },
        },
      }),
});
