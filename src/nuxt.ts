/**
 * This entry file is for the Nuxt module.
 *
 * @module
 */

import { addRspackPlugin, addVitePlugin, addWebpackPlugin, defineNuxtModule } from '@nuxt/kit';
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
  setup(options, nuxt) {
    switch (nuxt.options.builder) {
      case '@nuxt/webpack-builder':
        addWebpackPlugin(() => VersionInjector.webpack(options));
        break;
      case '@nuxt/rspack-builder':
        addRspackPlugin(() => VersionInjector.rspack(options));
        break;
      case '@nuxt/vite-builder':
        addVitePlugin(() => VersionInjector.vite(options));
        break;
      default:
        throw new Error(`[@redstardev/unplugin-version-injector] Unsupported Nuxt builder: "${String(nuxt.options.builder)}"`);
    }
  }
});
