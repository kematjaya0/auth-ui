import { readFileSync, writeFileSync } from 'node:fs';
import { defineConfig } from 'tsup';

// esbuild/tsup drop 'use client' directives when bundling — it re-emits the
// merged module graph without preserving per-source-file directive
// prologues. `index`/`pages` are entirely client components, so Next.js's
// RSC compiler must see the banner as the literal first line of the output
// or it treats them as server-importable and resolves react-hook-form
// against its restricted "react-server" export condition (no useForm).
const CLIENT_ONLY_ENTRIES = ['index', 'pages'];

function prependUseClient(): void {
  for (const name of CLIENT_ONLY_ENTRIES) {
    for (const ext of ['js', 'cjs']) {
      const path = `dist/${name}.${ext}`;
      const contents = readFileSync(path, 'utf8');
      if (!contents.startsWith("'use client'")) {
        writeFileSync(path, `'use client';\n${contents}`);
      }
    }
  }
}

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    config: 'src/config.ts',
    routes: 'src/routes.ts',
    pages: 'src/pages.ts',
    proxy: 'src/proxy.ts',
    session: 'src/session.ts'
  },
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  // Each entry point mixes server/edge-only code (config, routes, proxy,
  // session) with client-only code (components, via `pages`/`index`).
  // tsup's default ESM chunk-splitting factors shared dependencies into
  // separate chunk files, which silently merges 'use client' modules into
  // chunks also pulled in by server/edge entries — breaking Next.js's
  // client/server boundary. Keeping every entry self-contained avoids that.
  splitting: false,
  external: [
    'react',
    'react-dom',
    'next',
    'react-hook-form',
    '@hookform/resolvers',
    'zod',
    '@kematjaya/bootstrap-ui-kit'
  ],
  onSuccess: async () => {
    prependUseClient();
  }
});
