import { nodeLib } from 'tsdown-preset-sxzz';

export default nodeLib(
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
