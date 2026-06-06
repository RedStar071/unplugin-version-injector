/**
 * This entry file is for Farm plugin.
 *
 * @module
 */

import { VersionInjector } from './index';

/**
 * Farm plugin
 *
 * @example
 * ```ts
 * // farm.config.js
 * import VersionInjector from '@redstardev/unplugin-version-injector/farm'
 *
 * export default {
 *   plugins: [VersionInjector()],
 * }
 * ```
 */
const farm = VersionInjector.farm as typeof VersionInjector.farm;
export default farm;
export { farm as 'module.exports' };
