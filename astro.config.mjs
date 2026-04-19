// @ts-check
import dotenv from "dotenv";
dotenv.config();

import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

const site = process.env.DOMAIN || undefined;

// https://astro.build/config
export default defineConfig({
  site,
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
