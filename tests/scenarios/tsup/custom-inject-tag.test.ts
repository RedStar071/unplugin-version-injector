import tsup, { type Options as TsupOptions } from 'tsup';
import type { Options } from '../../../src/core/options';
import { assertFileContent, buildAbsolutePath, createTsupConfig } from '../../common/util';

function createConfig(pluginOptions?: Options): TsupOptions {
  return createTsupConfig(
    {
      format: ['esm'],
      entry: [buildAbsolutePath('../fixtures/build-in/custom-inject-tag.mts')]
    },
    pluginOptions
  );
}

describe('Custom Version Inject Tag', () => {
  test('GIVEN custom tag THEN injects version', async () => {
    const config = createConfig({
      injectTag: '[VersionInject][/VersionInject]'
    });

    await tsup.build(config);

    await assertFileContent('../fixtures/build-out/tsup/custom-inject-tag.mjs');
  });
});
