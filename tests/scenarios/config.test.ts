import tsup, { type Options as TsupOptions } from 'tsup';
import type { Options } from '../../src/core/options';
import { assertFileContent, buildAbsolutePath, createTsupConfig } from '../common/util';

function createConfig(pluginOptions?: Options): TsupOptions {
  return createTsupConfig(
    {
      format: ['esm'],
      entry: [buildAbsolutePath('../fixtures/build-in/typescript.mts')]
    },
    pluginOptions
  );
}

describe('Config', () => {
  test('GIVEN custom packageJsonPath THEN injects version from that file', async () => {
    const config = createConfig({
      packageJsonPath: buildAbsolutePath('../../package.json')
    });

    await tsup.build(config);

    await assertFileContent('../fixtures/build-out/tsup/typescript.mjs');
  });

  test('GIVEN custom include pattern THEN still injects matching files', async () => {
    const config = createConfig({
      include: [/\.mts$/]
    });

    await tsup.build(config);

    await assertFileContent('../fixtures/build-out/tsup/typescript.mjs');
  });
});
