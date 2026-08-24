import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';
import type { UnpluginOptions } from 'unplugin';
import type { Options } from '../src/core/options';
import { VersionInjector } from '../src/index';

const packageJsonPath = resolve(import.meta.dirname, '../package.json');
const { version: packageVersion } = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as { version: string };

function createPlugin(options?: Options): UnpluginOptions {
  const plugin = VersionInjector.raw(options, { framework: 'rollup', versions: {} });
  if (Array.isArray(plugin)) {
    throw new Error('Expected a single plugin');
  }
  return plugin;
}

type TransformHandler = (code: string, id: string) => Promise<string | null | undefined>;

function getTransformHandler(plugin: UnpluginOptions): TransformHandler {
  const transformHook = plugin.transform;

  if (!transformHook || Array.isArray(transformHook)) {
    throw new Error('Expected a single transform hook');
  }

  if (typeof transformHook === 'function') {
    return transformHook as TransformHandler;
  }

  return transformHook.handler as TransformHandler;
}

async function transform(code: string, options?: Options) {
  const handler = getTransformHandler(createPlugin(options));
  return handler(code, 'test.ts');
}

describe('VersionInjector', () => {
  test('replaces inject tag with version from package.json', async () => {
    const result = await transform("export const version = '[VI]{{inject}}[/VI]'", {
      packageJsonPath
    });

    expect(result).toBe(`export const version = '${packageVersion}'`);
  });

  test('replaces inject tag with current date', async () => {
    const result = await transform("export const version = '[VI]{{inject}}[/VI]'", {
      versionOrCurrentDate: 'current-date'
    });

    expect(result).toBe("export const version = '2022-02-01T14:30:30.000Z'");
  });

  test('returns null when inject tag is not present', async () => {
    const result = await transform("export const version = '1.0.0'", {
      packageJsonPath
    });

    expect(result).toBeNull();
  });

  test('supports custom inject tag', async () => {
    const result = await transform("export const version = '[VERSION][/VERSION]'", {
      injectTag: '[VERSION][/VERSION]',
      packageJsonPath
    });

    expect(result).toBe(`export const version = '${packageVersion}'`);
  });

  test('replaces multiple occurrences', async () => {
    const result = await transform("const a = '[VI]{{inject}}[/VI]'; const b = '[VI]{{inject}}[/VI]';", {
      packageJsonPath
    });

    expect(result).toBe(`const a = '${packageVersion}'; const b = '${packageVersion}';`);
  });

  test('works with CSS content', async () => {
    const handler = getTransformHandler(
      createPlugin({
        packageJsonPath
      })
    );

    const result = await handler(".myClass { content: '[VI]{{inject}}[/VI]'; }", 'styles.css');

    expect(result).toBe(`.myClass { content: '${packageVersion}'; }`);
  });

  test('returns null when package.json not found', async () => {
    const result = await transform("export const version = '[VI]{{inject}}[/VI]'", {
      packageJsonPath: './nonexistent/package.json'
    });

    expect(result).toBeNull();
  });
});

describe('VersionInjector bundler exports', () => {
  test('exposes vite plugin', () => {
    expect(VersionInjector.vite).toBeDefined();
    expect(typeof VersionInjector.vite).toBe('function');
  });

  test('exposes rollup plugin', () => {
    expect(VersionInjector.rollup).toBeDefined();
    expect(typeof VersionInjector.rollup).toBe('function');
  });

  test('exposes webpack plugin', () => {
    expect(VersionInjector.webpack).toBeDefined();
    expect(typeof VersionInjector.webpack).toBe('function');
  });

  test('exposes esbuild plugin', () => {
    expect(VersionInjector.esbuild).toBeDefined();
    expect(typeof VersionInjector.esbuild).toBe('function');
  });

  test('exposes rspack plugin', () => {
    expect(VersionInjector.rspack).toBeDefined();
    expect(typeof VersionInjector.rspack).toBe('function');
  });

  test('exposes rolldown plugin', () => {
    expect(VersionInjector.rolldown).toBeDefined();
    expect(typeof VersionInjector.rolldown).toBe('function');
  });
});
