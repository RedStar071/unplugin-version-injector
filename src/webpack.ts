/**
 * This entry file is for webpack plugin.
 *
 * @module
 */

import { VersionInjector } from './index';

/**
 * Webpack plugin
 *
 * @example
 * ```js
 * // webpack.config.js
 * import VersionInjector from '@redstardev/unplugin-version-injector/webpack'
 *
 * export default {
 *   plugins: [VersionInjector()],
 * }
 * ```
 */
const webpack = VersionInjector.webpack as typeof VersionInjector.webpack;
export default webpack;
export { webpack as 'module.exports' };
