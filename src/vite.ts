/**
 * This entry file is for Vite plugin.
 *
 * @module
 */

import { VersionInjector } from './index';

/**
 * Vite plugin
 *
 * @example
 * ```ts
 * // vite.config.ts
 * import VersionInjector from 'unplugin-version-injector/vite'
 *
 * export default defineConfig({
 *   plugins: [VersionInjector()],
 * })
 * ```
 */
const vite = VersionInjector.vite as typeof VersionInjector.vite;
export default vite;
export { vite as 'module.exports' };
