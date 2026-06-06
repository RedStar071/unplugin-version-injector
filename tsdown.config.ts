import { lib } from 'tsdown-preset-sxzz';

export default lib(
  {
    entry: 'shallow'
  },
  {
    deps: {
      neverBundle: [
        'unplugin',
        '@sapphire/result',
        // peer dependencies
        'vite',
        'webpack',
        'rollup',
        'esbuild',
        '@farmfe/core',
        '@rspack/core',
        'rolldown',
        '@nuxt/kit',
        '@nuxt/schema'
      ]
    }
  }
);
