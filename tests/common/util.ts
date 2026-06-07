import type { BuildOptions } from 'esbuild';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { rollup } from 'rollup';
import esbuildRollupPlugin from 'rollup-plugin-esbuild';
import { defineConfig, type Options as TsupOptions } from 'tsup';
import { build as viteBuild, type PluginOption } from 'vite';
import webpack from 'webpack';
import { rspack } from '@rspack/core';
import { rolldown } from 'rolldown';
import VersionInjectorEsbuild from '../../dist/esbuild.mjs';
import VersionInjectorRollup from '../../dist/rollup.mjs';
import VersionInjectorRolldown from '../../dist/rolldown.mjs';
import VersionInjectorVite from '../../dist/vite.mjs';
import VersionInjectorWebpack from '../../dist/webpack.mjs';
import VersionInjectorRspack from '../../dist/rspack.mjs';
import type { Options } from '../../src/core/options';
import { VersionInjector as VersionInjectorSource } from '../../src/index';

const __dirname = dirname(fileURLToPath(import.meta.url));

export type BundlerName = 'rollup' | 'rolldown' | 'vite' | 'webpack' | 'rspack';
export type OutputFormat = 'es' | 'cjs';

export interface BundlerBuildInput {
  bundler: BundlerName;
  entry: string;
  outputName: string;
  format: OutputFormat;
  pluginOptions?: Options;
}

function outputExtension(format: OutputFormat): 'mjs' | 'cjs' {
  return format === 'es' ? 'mjs' : 'cjs';
}

function outputFile(bundler: BundlerName, outputName: string, format: OutputFormat): string {
  return buildAbsolutePath(`../fixtures/build-out/${bundler}/${outputName}.${outputExtension(format)}`);
}

function needsTranspiler(entry: string): boolean {
  return /\.[cm]?tsx?$/.test(entry);
}

function rollupEsbuildPlugin(entry: string) {
  if (!needsTranspiler(entry)) {
    return null;
  }

  return esbuildRollupPlugin({
    target: 'es2021',
    loaders: {
      '.cts': 'ts',
      '.mts': 'ts',
      '.ts': 'ts',
      '.tsx': 'tsx'
    }
  });
}

export async function buildWithBundler(input: BundlerBuildInput): Promise<void> {
  switch (input.bundler) {
    case 'rollup':
      return buildRollup(input);
    case 'rolldown':
      return buildRolldown(input);
    case 'vite':
      return buildVite(input);
    case 'webpack':
      return buildWebpack(input);
    case 'rspack':
      return buildRspack(input);
  }
}

async function buildRollup(input: BundlerBuildInput): Promise<void> {
  const transpiler = rollupEsbuildPlugin(input.entry);
  const bundle = await rollup({
    input: input.entry,
    plugins: [...(transpiler ? [transpiler] : []), VersionInjectorRollup(input.pluginOptions)]
  });

  await bundle.write({
    file: outputFile(input.bundler, input.outputName, input.format),
    format: input.format === 'es' ? 'es' : 'cjs',
    exports: 'auto'
  });
  await bundle.close();
}

async function buildRolldown(input: BundlerBuildInput): Promise<void> {
  const build = await rolldown({
    input: input.entry,
    plugins: [VersionInjectorRolldown(input.pluginOptions)]
  });

  await build.write({
    file: outputFile(input.bundler, input.outputName, input.format),
    format: input.format === 'es' ? 'esm' : 'cjs'
  });
}

async function buildVite(input: BundlerBuildInput): Promise<void> {
  const ext = outputExtension(input.format);

  await viteBuild({
    configFile: false,
    plugins: [VersionInjectorVite(input.pluginOptions) as PluginOption],
    build: {
      outDir: buildAbsolutePath('../fixtures/build-out/vite'),
      emptyOutDir: false,
      minify: false,
      lib: {
        entry: input.entry,
        formats: [input.format === 'es' ? 'es' : 'cjs'],
        fileName: () => `${input.outputName}.${ext}`
      },
      rollupOptions: {
        output: {
          entryFileNames: `${input.outputName}.${ext}`
        }
      }
    }
  });
}

async function buildWebpack(input: BundlerBuildInput): Promise<void> {
  const ext = outputExtension(input.format);
  const isEsm = input.format === 'es';

  // Webpack relies on real timers; vitest-setup enables fake timers globally.
  vi.useRealTimers();
  try {
    await runWebpackLikeBundler(webpack, VersionInjectorWebpack(input.pluginOptions), input, ext, isEsm);
  } finally {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2022-02-01T14:30:30.000Z'));
  }
}

async function buildRspack(input: BundlerBuildInput): Promise<void> {
  const ext = outputExtension(input.format);
  const isEsm = input.format === 'es';

  await runWebpackLikeBundler(rspack, VersionInjectorRspack(input.pluginOptions), input, ext, isEsm);
}

async function runWebpackLikeBundler(
  bundler: typeof webpack | typeof rspack,
  plugin: webpack.WebpackPluginInstance | ReturnType<typeof VersionInjectorRspack>,
  input: BundlerBuildInput,
  ext: 'mjs' | 'cjs',
  isEsm: boolean
): Promise<void> {
  const rules: webpack.RuleSetRule[] = [];

  if (needsTranspiler(input.entry)) {
    rules.push({
      test: /\.[cm]?[jt]sx?$/,
      loader: 'esbuild-loader',
      options: { target: 'es2021' }
    });
  }

  await new Promise<void>((resolvePromise, reject) => {
    const compiler = (bundler as typeof webpack)({
      mode: 'production',
      entry: input.entry,
      output: {
        path: buildAbsolutePath(`../fixtures/build-out/${input.bundler}`),
        filename: `${input.outputName}.${ext}`,
        module: isEsm,
        library: isEsm ? { type: 'module' } : undefined,
        chunkFormat: isEsm ? 'module' : undefined
      },
      experiments: isEsm ? { outputModule: true } : undefined,
      module: { rules },
      optimization: { minimize: false },
      plugins: [plugin as webpack.WebpackPluginInstance]
    });

    compiler.run((error: Error | null | undefined, stats?: webpack.Stats) => {
      compiler.close(() => undefined);

      if (error) {
        reject(error);
        return;
      }

      if (stats?.hasErrors()) {
        reject(new Error(stats.toString()));
        return;
      }

      resolvePromise();
    });
  });
}

export function createEsbuildConfig(buildOptions: BuildOptions, pluginOptions?: Options): BuildOptions {
  return {
    ...buildOptions,
    outdir: buildAbsolutePath('../fixtures/build-out/esbuild'),
    bundle: true,
    platform: 'node',
    plugins: [VersionInjectorEsbuild(pluginOptions)]
  };
}

export function createTsupConfig(tsupOptions: TsupOptions, pluginOptions?: Options): TsupOptions {
  return defineConfig({
    ...tsupOptions,
    clean: false,
    dts: false,
    minify: false,
    skipNodeModulesBundle: true,
    sourcemap: false,
    target: 'es2021',
    tsconfig: buildAbsolutePath('../fixtures/build-in/tsconfig.json'),
    keepNames: true,
    treeshake: true,
    outDir: buildAbsolutePath('../fixtures/build-out/tsup'),
    bundle: true,
    platform: 'node',
    splitting: false,
    config: false,
    silent: true,
    esbuildPlugins: [VersionInjectorSource.esbuild(pluginOptions)],
    outExtension(context) {
      switch (context.format) {
        case 'cjs':
          return { js: '.cjs' };
        case 'esm':
          return { js: '.mjs' };
        default:
          return { js: 'js' };
      }
    }
  }) as TsupOptions;
}

const ISO_DATE_PATTERN = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/g;
const NORMALIZED_DATE = '2022-02-01T14:30:30.000Z';

function normalizeSnapshotContent(content: string): string {
  return content
    .replace(ISO_DATE_PATTERN, NORMALIZED_DATE)
    .replace(/\/\*\*\*\/ \d+/g, '/***/ MODULE_ID')
    .replace(/^\d+\(module\)/gm, 'MODULE_ID(module)')
    .replace(/__webpack_require__\(\d+\)/g, '__webpack_require__(MODULE_ID)');
}

export async function assertFileContent(filePath: string) {
  const fileContent = normalizeSnapshotContent(await readFile(buildAbsolutePath(filePath), { encoding: 'utf-8' }));
  expect(fileContent).toMatchSnapshot();
}

export function buildAbsolutePath(filePath: string) {
  return resolve(__dirname, filePath);
}
