import { describe, test } from 'vitest';
import type { Options } from '../../src/core/options';
import { assertFileContent, buildAbsolutePath, buildWithBundler, type BundlerName, type OutputFormat } from './util';

interface ScenarioCase {
  title: string;
  entry: string;
  outputName: string;
  format: OutputFormat;
  pluginOptions?: Options;
}

function runScenario(bundler: BundlerName, scenario: ScenarioCase) {
  const ext = scenario.format === 'es' ? 'mjs' : 'cjs';

  test(scenario.title, async () => {
    await buildWithBundler({
      bundler,
      entry: buildAbsolutePath(scenario.entry),
      outputName: scenario.outputName,
      format: scenario.format,
      pluginOptions: scenario.pluginOptions
    });

    await assertFileContent(`../fixtures/build-out/${bundler}/${scenario.outputName}.${ext}`);
  });
}

export function describeJsBasedEsm(bundler: BundlerName) {
  describe('JS based ESM', () => {
    runScenario(bundler, {
      title: 'GIVEN no plugin options THEN injects version',
      entry: '../fixtures/build-in/javascript.mjs',
      outputName: 'javascript',
      format: 'es'
    });

    runScenario(bundler, {
      title: 'GIVEN versionOrCurrentDate = "current-date" THEN injects current date',
      entry: '../fixtures/build-in/javascript.mjs',
      outputName: 'javascript',
      format: 'es',
      pluginOptions: { versionOrCurrentDate: 'current-date' }
    });
  });
}

export function describeJsBasedCjs(bundler: BundlerName) {
  describe('JS based CJS', () => {
    runScenario(bundler, {
      title: 'GIVEN no plugin options THEN injects version',
      entry: '../fixtures/build-in/javascript.cjs',
      outputName: 'javascript',
      format: 'cjs'
    });

    runScenario(bundler, {
      title: 'GIVEN versionOrCurrentDate = "current-date" THEN injects current date',
      entry: '../fixtures/build-in/javascript.cjs',
      outputName: 'javascript',
      format: 'cjs',
      pluginOptions: { versionOrCurrentDate: 'current-date' }
    });
  });
}

export function describeTsBasedEsm(bundler: BundlerName) {
  describe('TS based ESM', () => {
    runScenario(bundler, {
      title: 'GIVEN no plugin options THEN injects version',
      entry: '../fixtures/build-in/typescript.mts',
      outputName: 'typescript',
      format: 'es'
    });

    runScenario(bundler, {
      title: 'GIVEN versionOrCurrentDate = "current-date" THEN injects current date',
      entry: '../fixtures/build-in/typescript.mts',
      outputName: 'typescript',
      format: 'es',
      pluginOptions: { versionOrCurrentDate: 'current-date' }
    });
  });
}

export function describeTsBasedCjs(bundler: BundlerName) {
  describe('TS based CJS', () => {
    runScenario(bundler, {
      title: 'GIVEN no plugin options THEN injects version',
      entry: '../fixtures/build-in/typescript.cts',
      outputName: 'typescript',
      format: 'cjs'
    });

    runScenario(bundler, {
      title: 'GIVEN versionOrCurrentDate = "current-date" THEN injects current date',
      entry: '../fixtures/build-in/typescript.cts',
      outputName: 'typescript',
      format: 'cjs',
      pluginOptions: { versionOrCurrentDate: 'current-date' }
    });
  });
}

export function describeCustomInjectTag(bundler: BundlerName) {
  describe('Custom Version Inject Tag', () => {
    runScenario(bundler, {
      title: 'GIVEN custom tag THEN injects version',
      entry: '../fixtures/build-in/custom-inject-tag.mts',
      outputName: 'custom-inject-tag',
      format: 'es',
      pluginOptions: { injectTag: '[VersionInject][/VersionInject]' }
    });
  });
}
