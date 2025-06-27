// SPDX-License-Identifier: (EUPL-1.2)
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';

export default defineConfig({
  output: 'static',
  adapter: cloudflare(),
  integrations: [react()],
});
