import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://www.repaircafe74.fr",
  integrations: [tailwind(), sitemap()],
});
