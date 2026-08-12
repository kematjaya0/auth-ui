import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    routes: 'src/routes.ts',
    pages: 'src/pages.ts',
    proxy: 'src/proxy.ts',
    session: 'src/session.ts'
  },
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
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
