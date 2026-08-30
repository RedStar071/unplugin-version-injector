/**
 * This entry file is for the Nuxt module.
 *
 * @module
 */

import { addVitePlugin, addWebpackPlugin, defineNuxtModule } from '@nuxt/kit';
import type { Options } from './core/options';
import { VersionInjector } from './index';

export interface ModuleOptions extends Options {}

/**
 * Nuxt module
 *
 * @example
 * ```ts
 * // nuxt.config.ts
 * export default defineNuxtConfig({
 *   modules: ['@redstardev/unplugin-version-injector/nuxt'],
 *   versionInjector: {
 *     // options
 *   },
 * })
 * ```
 */
export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@redstardev/unplugin-version-injector',
    configKey: 'versionInjector'
  },
  defaults: {},
  setup(options) {
    addVitePlugin(() => VersionInjector.vite(options));
    addWebpackPlugin(() => VersionInjector.webpack(options));
  }
});
