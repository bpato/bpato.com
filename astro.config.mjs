// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

import sitemap from "@astrojs/sitemap";
import { loadEnv } from "vite";

const env = loadEnv(process.env.NODE_ENV, process.cwd(), "");

// https://astro.build/config
export default defineConfig({
  site: env.DOMAIN,
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
