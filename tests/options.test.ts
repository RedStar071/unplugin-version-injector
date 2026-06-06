import { describe, expect, test } from 'vitest';
import { matchesId, resolveOptions, toEsbuildOnLoadOptions, type Options } from '../src/core/options';

describe('resolveOptions', () => {
  test('returns defaults when no options provided', () => {
    const resolved = resolveOptions({});

    expect(resolved.injectTag).toBe('[VI]{{inject}}[/VI]');
    expect(resolved.versionOrCurrentDate).toBe('version');
    expect(resolved.packageJsonPath).toBe('./package.json');
    expect(resolved.enforce).toBe('pre');
    expect(resolved.exclude).toEqual([/node_modules/]);
  });

  test('respects custom options', () => {
    const opts: Options = {
      injectTag: '[VERSION][/VERSION]',
      versionOrCurrentDate: 'current-date',
      packageJsonPath: './custom/package.json',
      enforce: 'post'
    };
    const resolved = resolveOptions(opts);

    expect(resolved.injectTag).toBe('[VERSION][/VERSION]');
    expect(resolved.versionOrCurrentDate).toBe('current-date');
    expect(resolved.packageJsonPath).toBe('./custom/package.json');
    expect(resolved.enforce).toBe('post');
  });

  test('allows enforce to be undefined', () => {
    const resolved = resolveOptions({ enforce: undefined });
    expect(resolved.enforce).toBeUndefined();
  });

  test('leaves namespace undefined by default', () => {
    const resolved = resolveOptions({});

    expect(resolved.namespace).toBeUndefined();
    expect(toEsbuildOnLoadOptions(resolved)).toBeUndefined();
  });

  test('preserves esbuild namespace when provided', () => {
    const resolved = resolveOptions({ namespace: 'esbuild-sass-plugin' });

    expect(resolved.namespace).toBe('esbuild-sass-plugin');
    expect(toEsbuildOnLoadOptions(resolved)).toEqual({
      filter: /.*/,
      namespace: 'esbuild-sass-plugin'
    });
  });
});

describe('matchesId', () => {
  test('matches include patterns and excludes node_modules by default', () => {
    const options = resolveOptions({});

    expect(matchesId('/project/src/index.ts', options)).toBe(true);
    expect(matchesId('/project/node_modules/pkg/index.js', options)).toBe(false);
  });
});
