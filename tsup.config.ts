import { defineConfig } from 'tsup';

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
  ]
});
