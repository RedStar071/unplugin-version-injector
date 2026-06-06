import { rm } from 'node:fs/promises';
import { resolve } from 'node:path';

const dirs = [resolve('tests/fixtures/build-out'), resolve('tests/fixtures/build-mid')];

for (const dir of dirs) {
  await rm(dir, { recursive: true, force: true });
}
