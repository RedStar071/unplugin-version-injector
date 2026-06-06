/**
 * This entry file is for Rspack plugin.
 *
 * @module
 */

import { VersionInjector } from './index';

/**
 * Rspack plugin
 *
 * @example
 * ```js
 * // rspack.config.js
 * import VersionInjector from '@redstardev/unplugin-version-injector/rspack'
 *
 * export default {
 *   plugins: [VersionInjector()],
 * }
 * ```
 */
const rspack = VersionInjector.rspack as typeof VersionInjector.rspack;
export default rspack;
export { rspack as 'module.exports' };
