import type { OnLoadOptions } from 'esbuild';
import type { FilterPattern } from 'unplugin';

const DEFAULT_INCLUDE: FilterPattern = [/\.[cm]?[jt]sx?$/, /\.css$/, /\.scss$/, /\.sass$/, /\.less$/];

/** esbuild {@link OnLoadOptions} `namespace`, for the esbuild adapter. */
export type EsbuildNamespace = OnLoadOptions['namespace'];

export interface Options {
  /**
   * Optional [esbuild namespace](https://esbuild.github.io/plugins/#namespaces) to
   * hook during module loading.
   *
   * Matches esbuild's {@link OnLoadOptions.namespace}. When omitted, the esbuild
   * adapter still injects globally on all build outputs (any namespace).
   *
   * @default undefined
   */
  namespace?: EsbuildNamespace;
  /**
   * Filter patterns to include files for processing.
   *
   * @default [/\.[cm]?[jt]sx?$/, /\.css$/, /\.scss$/, /\.sass$/, /\.less$/]
   */
  include?: FilterPattern;
  /**
   * Filter patterns to exclude files from processing.
   *
   * @default [/node_modules/]
   */
  exclude?: FilterPattern;
  /**
   * Plugin enforcement order.
   *
   * @default 'pre'
   */
  enforce?: 'pre' | 'post' | undefined;
  /**
   * Whether the plugin should inject the package.json version or the
   * current date (in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format)
   *
   * @default 'version'
   */
  versionOrCurrentDate?: 'version' | 'current-date';
  /**
   * The tag that should be searched within the code and replaced with either
   * the version or the current date.
   *
   * @default '[VI]{{inject}}[/VI]'
   */
  injectTag?: string;
  /**
   * Relative path to the project's package.json.
   *
   * Ignored when {@link Options.versionOrCurrentDate} is set to `'current-date'`.
   *
   * @default './package.json'
   */
  packageJsonPath?: string;
}

type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U;

export type OptionsResolved = Overwrite<Required<Options>, Pick<Options, 'enforce' | 'namespace'>>;

function toPatternList(pattern: FilterPattern): Array<string | RegExp> {
  return Array.isArray(pattern) ? pattern : [pattern];
}

export function matchesId(id: string, options: Pick<OptionsResolved, 'include' | 'exclude'>): boolean {
  const normalizedId = id.replace(/\\/g, '/');

  for (const pattern of toPatternList(options.exclude)) {
    if (pattern instanceof RegExp) {
      pattern.lastIndex = 0;
      if (pattern.test(normalizedId)) {
        return false;
      }
    } else if (normalizedId.includes(pattern)) {
      return false;
    }
  }

  for (const pattern of toPatternList(options.include)) {
    if (pattern instanceof RegExp) {
      pattern.lastIndex = 0;
      if (pattern.test(normalizedId)) {
        return true;
      }
    } else if (normalizedId.includes(pattern)) {
      return true;
    }
  }

  return false;
}

/** Builds esbuild {@link OnLoadOptions} when a specific namespace should be hooked during load. */
export function toEsbuildOnLoadOptions(
  options: Pick<OptionsResolved, 'namespace'>,
  filter: OnLoadOptions['filter'] = /.*/
): OnLoadOptions | undefined {
  if (options.namespace === undefined) {
    return undefined;
  }

  return { filter, namespace: options.namespace };
}

export function resolveOptions(options: Options): OptionsResolved {
  return {
    namespace: options.namespace,
    include: options.include ?? DEFAULT_INCLUDE,
    exclude: options.exclude || [/node_modules/],
    enforce: 'enforce' in options ? options.enforce : 'pre',
    versionOrCurrentDate: options.versionOrCurrentDate || 'version',
    injectTag: options.injectTag || '[VI]{{inject}}[/VI]',
    packageJsonPath: options.packageJsonPath || './package.json'
  };
}
