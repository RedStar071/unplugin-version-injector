import { Result } from '@sapphire/result';
import type { BuildOptions, BuildResult, OnLoadArgs, OnLoadResult, PluginBuild } from 'esbuild';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createUnplugin, type UnpluginInstance } from 'unplugin';
import { matchesId, resolveOptions, toEsbuildOnLoadOptions, type Options, type OptionsResolved } from './core/options';

interface IMinimalPackageJson {
  version?: string;
  name?: string;
  description?: string;
}

async function getReplacementValue(options: Pick<OptionsResolved, 'versionOrCurrentDate' | 'packageJsonPath'>): Promise<string | null> {
  if (options.versionOrCurrentDate === 'current-date') {
    return new Date().toISOString();
  }

  const packageFile = await Result.fromAsync(readFile(resolve(options.packageJsonPath), { encoding: 'utf-8' }));

  if (packageFile.isErr()) {
    return null;
  }

  const packageJson = Result.from<IMinimalPackageJson>(JSON.parse(packageFile.unwrap()));

  if (packageJson.isErr()) {
    return null;
  }

  const packageJsonVersion = packageJson.unwrap().version;

  if (!packageJsonVersion) {
    return null;
  }

  return packageJsonVersion;
}

async function injectCode(code: string, options: OptionsResolved): Promise<string | null> {
  if (!code.includes(options.injectTag)) {
    return null;
  }

  const replacement = await getReplacementValue(options);
  if (!replacement) {
    return null;
  }

  return code.replaceAll(options.injectTag, replacement);
}

function getOutputPaths(result: BuildResult): string[] {
  if (result.outputFiles?.length) {
    return result.outputFiles.map((file) => file.path);
  }

  if (result.metafile) {
    return Object.keys(result.metafile.outputs);
  }

  return [];
}

async function patchEsbuildOutputs(result: BuildResult, options: OptionsResolved): Promise<void> {
  const replacement = await getReplacementValue(options);
  if (!replacement) {
    return;
  }

  if (result.outputFiles?.length) {
    for (const file of result.outputFiles) {
      if (!matchesId(file.path, options) || !file.text.includes(options.injectTag)) {
        continue;
      }

      file.contents = new TextEncoder().encode(file.text.replaceAll(options.injectTag, replacement));
    }

    return;
  }

  for (const outputPath of getOutputPaths(result)) {
    if (!matchesId(outputPath, options)) {
      continue;
    }

    let content: string;
    try {
      content = await readFile(outputPath, { encoding: 'utf-8' });
    } catch {
      continue;
    }

    if (!content.includes(options.injectTag)) {
      continue;
    }

    await writeFile(outputPath, content.replaceAll(options.injectTag, replacement));
  }
}

function buildEsbuildConfig(options: OptionsResolved) {
  const onLoadOptions = toEsbuildOnLoadOptions(options);

  return {
    config(buildOptions: BuildOptions) {
      if (buildOptions.write !== false && buildOptions.metafile == null) {
        buildOptions.metafile = true;
      }
    },
    setup(build: PluginBuild) {
      if (onLoadOptions) {
        build.onLoad(onLoadOptions, async (args: OnLoadArgs): Promise<OnLoadResult | undefined> => {
          const id = args.path + (args.suffix || '');
          if (!matchesId(id, options)) {
            return undefined;
          }

          const fileResult = await Result.fromAsync(readFile(args.path, { encoding: 'utf-8' }));
          if (fileResult.isErr()) {
            return undefined;
          }

          const contents = await injectCode(fileResult.unwrap(), options);
          if (!contents) {
            return undefined;
          }

          return {
            contents,
            pluginData: args.pluginData
          };
        });
      }

      build.onEnd(async (result) => {
        if (result.errors.length > 0) {
          return;
        }

        await patchEsbuildOutputs(result, options);
      });
    }
  };
}

export const VersionInjector: UnpluginInstance<Options | undefined> = createUnplugin((rawOptions = {}) => {
  const options = resolveOptions(rawOptions);

  const name = 'unplugin-version-injector';
  return {
    name,
    enforce: options.enforce,
    esbuild: buildEsbuildConfig(options),
    transform: {
      filter: {
        id: { include: options.include, exclude: options.exclude }
      },
      async handler(code) {
        return injectCode(code, options);
      }
    }
  };
});

/**
 * The [unplugin-version-injector](https://github.com/RedStar071/unplugin-version-injector/#readme) version
 * that you are currently using.
 */
//
const version: string = '[InternalVi]{{internal-inject}}[/InternalVi]';
export { version };

export type { EsbuildNamespace, Options, OptionsResolved } from './core/options';
export { matchesId, resolveOptions, toEsbuildOnLoadOptions } from './core/options';
