import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://repair-cafe-74.github.io",
  integrations: [tailwind(), sitemap()],
});
