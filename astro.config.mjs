import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://japan-trip-companion.com',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/admin/'),
      customPages: [],
      changefreq: 'weekly',
      priority: 0.8,
      lastmod: new Date(),
    })
  ],
  output: 'static',
  build: {
    format: 'directory',
  },
});
