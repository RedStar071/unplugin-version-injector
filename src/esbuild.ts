/**
 * This entry file is for esbuild plugin.
 *
 * @module
 */

import { VersionInjector } from './index';

/**
 * Esbuild plugin
 *
 * @example
 * ```ts
 * import { build } from 'esbuild'
 * import VersionInjector from '@redstardev/unplugin-version-injector/esbuild'
 *
 * build({ plugins: [VersionInjector()] })
 * ```
 */
const esbuild = VersionInjector.esbuild as typeof VersionInjector.esbuild;
export default esbuild;
export { esbuild as 'module.exports' };
