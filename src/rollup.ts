/**
 * This entry file is for Rollup plugin.
 *
 * @module
 */

import { VersionInjector } from './index';

/**
 * Rollup plugin
 *
 * @example
 * ```ts
 * // rollup.config.js
 * import VersionInjector from '@redstardev/unplugin-version-injector/rollup'
 *
 * export default {
 *   plugins: [VersionInjector()],
 * }
 * ```
 */
const rollup = VersionInjector.rollup as typeof VersionInjector.rollup;
export default rollup;
export { rollup as 'module.exports' };
