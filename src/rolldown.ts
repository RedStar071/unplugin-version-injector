/**
 * This entry file is for Rolldown plugin.
 *
 * @module
 */

import { VersionInjector } from './index';

/**
 * Rolldown plugin
 *
 * @example
 * ```ts
 * // rolldown.config.js
 * import VersionInjector from 'unplugin-version-injector/rolldown'
 *
 * export default {
 *   plugins: [VersionInjector()],
 * }
 * ```
 */
const rolldown = VersionInjector.rolldown as typeof VersionInjector.rolldown;
export default rolldown;
export { rolldown as 'module.exports' };
