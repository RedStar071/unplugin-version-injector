import { lib } from 'tsdown-preset-sxzz';
import rolldown from './src/rolldown';

export default lib(
  {
    entry: 'shallow'
  },
  {
    plugins: [
      rolldown({
        injectTag: '[InternalVi]{{internal-inject}}[/InternalVi]'
      })
    ],
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
