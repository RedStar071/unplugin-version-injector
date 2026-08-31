<p align="center">
  <h1 align="center">@redstardev/unplugin-version-injector</h1>
  <p align="center">
    <strong>A universal plugin to inject your application's version number or today's date into your files</strong>
  </p>
  <p align="center">
    <a href="https://github.com/RedStar071/unplugin-version-injector/blob/main/LICENSE.md">
      <img src="https://img.shields.io/github/license/RedStar071/unplugin-version-injector" alt="License" />
    </a>
    <a href="https://www.npmjs.com/package/@redstardev/unplugin-version-injector">
      <img src="https://img.shields.io/npm/v/@redstardev/unplugin-version-injector?color=crimson&logo=npm&style=flat-square" alt="npm version" />
    </a>
  </p>
</p>

_This plugin was inspired by
[rollup-plugin-version-injector](https://github.com/djhouseknecht/rollup-plugin-version-injector)_

**Table of Contents**

- [@redstardev/unplugin-version-injector](#redstardevunplugin-version-injector)
  - [Description](#description)
  - [Installation](#installation)
  - [Usage](#usage)
    - [With Vite](#with-vite)
    - [With Rollup](#with-rollup)
    - [With Rolldown / tsdown](#with-rolldown--tsdown)
    - [With esbuild](#with-esbuild)
    - [With Webpack](#with-webpack)
    - [With Rspack](#with-rspack)
    - [With Farm](#with-farm)
    - [With Nuxt](#with-nuxt)
  - [File Injection examples](#file-injection-examples)
    - [JavaScript / TypeScript](#javascript--typescript)
    - [JSON](#json)
    - [CSS](#css)
    - [Text](#text)
  - [Options](#options)
  - [Migrating from esbuild-plugin-version-injector](#migrating-from-esbuild-plugin-version-injector)
  - [Support](#support)
  - [Contributors](#contributors)
  - [Credits](#credits)
  - [License](#license)

## Description

There are many ways to export a constant that holds your package version, from
loading your own package.json through a `fs.readFile`, importing the
package.json directly, or manually updating a constant on every bump. However
all of these have their downsides, and this plugin aims to solve that.

- `fs.readFile` is an additional file operation that the end-user's system has
  to deal with and causes slow downs.
- importing the package.json directly can cause issues with interoperability
  between CJS and ESM as the latter requires JSON assertions.
  - Alternatively when using a bundler that inlines the package.json code that
    means the bundle ends up increasing in size unnecessarily for only having to
    include the version field
- Manually updating a constant on every bump is a chore and can be easily
  forgotten.

This plugin aims to solve all of these issues by injecting the version number
and/or today's date directly into your built files during the bundling step.
Built on [unplugin](https://github.com/unjs/unplugin), it works with all major
bundlers — **Vite**, **Rollup**, **Rolldown**, **esbuild**, **Webpack**,
**Rspack**, and **Farm** — through a single, consistent API.

## Installation

You can use the following command to install this package:

```sh
pnpm add -D @redstardev/unplugin-version-injector
```

> **Requirements:** Node.js >= 20, pnpm >= 10

## Usage

Add the inject tag anywhere in your source files:

```ts
export const version = '[VI]{{inject}}[/VI]';
```

The tag will be replaced at build time with the version from your `package.json`
(or the current date, depending on your configuration).

### With [Vite][vite]

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import VersionInjector from '@redstardev/unplugin-version-injector/vite';

export default defineConfig({
  plugins: [VersionInjector()]
});
```

### With [Rollup][rollup]

```ts
// rollup.config.ts
import VersionInjector from '@redstardev/unplugin-version-injector/rollup';

export default {
  plugins: [VersionInjector()]
};
```

### With [Rolldown][rolldown] / [tsdown][tsdown]

```ts
// rolldown.config.ts / tsdown.config.ts
import VersionInjector from '@redstardev/unplugin-version-injector/rolldown';

export default {
  plugins: [VersionInjector()]
};
```

### With [esbuild][esbuild]

```ts
import { build } from 'esbuild';
import VersionInjector from '@redstardev/unplugin-version-injector/esbuild';

await build({
  format: 'cjs',
  entryPoints: ['./src/index.ts'],
  outdir: './dist',
  plugins: [VersionInjector()]
});
```

### With [Webpack][webpack]

```js
// webpack.config.js
import VersionInjector from '@redstardev/unplugin-version-injector/webpack';

export default {
  plugins: [VersionInjector()]
};
```

### With [Rspack][rspack]

```js
// rspack.config.js
import VersionInjector from '@redstardev/unplugin-version-injector/rspack';

export default {
  plugins: [VersionInjector()]
};
```

### With [Farm][farm]

```ts
// farm.config.ts
import VersionInjector from '@redstardev/unplugin-version-injector/farm';

export default {
  plugins: [VersionInjector()]
};
```

### With [Nuxt][nuxt]

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@redstardev/unplugin-version-injector/nuxt'],
  versionInjector: {
    // options
  }
});
```

[vite]: https://vite.dev/
[rollup]: https://rollupjs.org/
[rolldown]: https://rolldown.rs/
[tsdown]: https://tsdown.dev/
[esbuild]: https://esbuild.github.io/
[webpack]: https://webpack.js.org/
[rspack]: https://rspack.dev/
[farm]: https://www.farmfe.org/
[nuxt]: https://nuxt.com/

## File Injection examples

Place the inject tag in any file that matches your `include` patterns. By
default, JavaScript/TypeScript, CSS, SCSS, SASS, and LESS files are included.
For JSON or plain-text files, add the appropriate pattern to the `include`
option (see [Options](#options)).

### JavaScript / TypeScript

```ts
/**
 * The current version that you are currently using.
 *
 * Note to developers: This needs to explicitly be `string` so it is not typed as a "const string" that gets injected by the bundler
 */
// eslint-disable-next-line @typescript-eslint/no-inferrable-types
export const version: string = '[VI]{{inject}}[/VI]';
```

### JSON

```json
{
  "version": "[VI]{{inject}}[/VI]"
}
```

### CSS

```css
.myClass {
  content: '[VI]{{inject}}[/VI]';
}
```

**_A note regarding using CSS preprocessors (SASS / LESS / Stylus / etc)_**:
When using a CSS preprocessor you might be using an esbuild plugin like
[`esbuild-sass-plugin`](https://www.npmjs.com/package/esbuild-sass-plugin). This
causes the CSS to be processed before this plugin can inject the version number
and at the moment esbuild will no longer pass the file to be processed by this
plugin. To solve this you will have to build your code twice with esbuild, once
with the CSS preprocessor plugin and once with this plugin. This can be done by
using the `build` function twice, or by using the `buildSync` function twice. An
example of this can be found at the test to cover this case
[here](./tests/scenarios/css/sass-parsing.test.ts).

### Text

```txt
This document is for version [VI]{{inject}}[/VI]
```

## Options

The plugin accepts the following options:

| Option                 | Type                          | Default                                                          | Description                                                                                                                 |
| ---------------------- | ----------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `include`              | `FilterPattern`               | `[/\.[cm]?[jt]sx?$/, /\.css$/, /\.scss$/, /\.sass$/, /\.less$/]` | Filter patterns to include files for processing                                                                             |
| `exclude`              | `FilterPattern`               | `[/node_modules/]`                                               | Filter patterns to exclude files from processing                                                                            |
| `namespace`            | `string`                      | `undefined`                                                      | Optional esbuild namespace to hook during `onLoad`. When omitted, the esbuild adapter injects globally on all build outputs |
| `enforce`              | `'pre' \| 'post'`             | `'pre'`                                                          | Plugin enforcement order                                                                                                    |
| `versionOrCurrentDate` | `'version' \| 'current-date'` | `'version'`                                                      | Whether to inject the package.json version or the current date in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format |
| `injectTag`            | `string`                      | `'[VI]{{inject}}[/VI]'`                                          | The tag that should be searched within the code and replaced with either the version or the current date                    |
| `packageJsonPath`      | `string`                      | `'./package.json'`                                               | Relative path to the project's package.json. Ignored when `versionOrCurrentDate` is set to `'current-date'`                 |

Example with custom options:

```ts
import VersionInjector from '@redstardev/unplugin-version-injector/vite';

export default defineConfig({
  plugins: [
    VersionInjector({
      versionOrCurrentDate: 'current-date',
      injectTag: '[VI]{{inject}}[/VI]',
      include: [/\.[cm]?[jt]sx?$/, /\.css$/, /\.json$/]
    })
  ]
});
```

## Migrating from esbuild-plugin-version-injector

This package is the successor to
[`esbuild-plugin-version-injector`](https://github.com/favware/esbuild-plugin-version-injector).
It now supports all major bundlers through
[unplugin](https://github.com/unjs/unplugin).

### Before

```ts
import esbuildPluginVersionInjector from 'esbuild-plugin-version-injector';

await esbuild.build({
  plugins: [
    esbuildPluginVersionInjector({
      filter: /\.[cm]?[jt]sx?$/,
      namespace: 'esbuild-sass-plugin'
    })
  ]
});
```

### After

```ts
import VersionInjector from '@redstardev/unplugin-version-injector/esbuild';

await esbuild.build({
  plugins: [
    VersionInjector({
      include: [/\.[cm]?[jt]sx?$/]
    })
  ]
});
```

### Option mapping

| `esbuild-plugin-version-injector` | `@redstardev/unplugin-version-injector`                                         |
| --------------------------------- | ------------------------------------------------------------------------------- |
| `filter` (`RegExp`)               | `include` / `exclude` (`FilterPattern`)                                         |
| `namespace`                       | `namespace` (optional, esbuild only) — omit for global injection on all outputs |
| `disableOnLoadTrigger`            | removed — no longer needed                                                      |
| `versionOrCurrentDate`            | unchanged                                                                       |
| `injectTag`                       | unchanged                                                                       |
| `packageJsonPath`                 | unchanged                                                                       |

### Key breaking changes

- The package name changed to `@redstardev/unplugin-version-injector`
- Import from bundler-specific entry points (e.g.,
  `@redstardev/unplugin-version-injector/vite`,
  `@redstardev/unplugin-version-injector/esbuild`)
- `filter` was replaced by `include` / `exclude` (unplugin filter patterns;
  strings, regexps, or arrays)
- `namespace` is optional: by default the esbuild adapter injects into **all
  build outputs**, regardless of namespace. Set it only when you need to hook a
  specific esbuild namespace during `onLoad` (e.g., `esbuild-sass-plugin`)
- `disableOnLoadTrigger` was removed
- Node.js >= 20 is required

## Support

Unplugin Version Injector is and always will be open source. If you find it
useful and would like to show your appreciation, thank you very much in advance!

|                 |                                                                      |
| :-------------: | :------------------------------------------------------------------- |
|     Website     | [redstar071.dev](https://redstar071.dev)                             |
|     Discord     | [join.redstar071.dev](https://join.redstar071.dev)                   |
|     PayPal      | [donate.redstar071.dev/paypal](https://donate.redstar071.dev/paypal) |
| GitHub Sponsors | [RedStar071](https://github.com/sponsors/RedStar071)                 |

## Contributors

Please make sure to read the [Contributing Guide][contributing] before making a
pull request.

Thank you to all the people who already contributed!

<a href="https://github.com/RedStar071/unplugin-version-injector/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=RedStar071/unplugin-version-injector" alt="Contributors" />
</a>

[contributing]: .github/CONTRIBUTING.md

## Credits

Originally created by [Favware](https://github.com/favware) as
[`esbuild-plugin-version-injector`](https://github.com/favware/esbuild-plugin-version-injector).
Maintained from 2.0.0 by [RedStar071](https://redstar071.dev).

## License

[MIT](./LICENSE.md) © [RedStar071](https://redstar071.dev)
