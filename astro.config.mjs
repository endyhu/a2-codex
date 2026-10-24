import { defineConfig } from 'astro/config';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Same id is baked into the pages and written to version.json, so open pages can tell when a newer build is live.
const buildId = Date.now().toString(36);

export default defineConfig({
  site: 'https://a2codex.prezenith.com',
  vite: { define: { __BUILD_ID__: JSON.stringify(buildId) } },
  integrations: [
    {
      name: 'version-file',
      hooks: {
        'astro:build:done': ({ dir }) => {
          writeFileSync(fileURLToPath(new URL('version.json', dir)), JSON.stringify({ id: buildId }));
        },
      },
    },
  ],
});
