---
id: vue-angular-react-etc
title: React、Vue、Angular 等框架
description: 在 React、Vue、Angular、Next.js 等前端框架中接入 Cornerstone3D 的完整配置指南，涵盖 Vite 与 Webpack 配置、编解码器 WASM 文件的定位方式、子路径部署，以及常见报错的排查方法。
keywords:
  - Cornerstone3D React
  - Cornerstone3D Vue
  - Cornerstone3D Angular
  - Cornerstone3D Vite
  - wasmBasePath
  - viteCommonjs
  - Cornerstone3D 接入
upstream: https://www.cornerstonejs.org/docs/getting-started/vue-angular-react-etc
---

下面是在 React、Vue、Angular 以及基于 Vite 的框架中使用 Cornerstone3D 的一些示例。

**示例仓库：**

- [Cornerstone3D + Vite + React](https://github.com/cornerstonejs/vite-react-cornerstone3d)
- [Cornerstone3D + Vite + Vue](https://github.com/cornerstonejs/vue-cornerstone3d)
- [Cornerstone3D + Angular](https://github.com/cornerstonejs/angular-cornerstone3d)
  - [社区维护的项目](https://github.com/yanqzsu/ng-cornerstone)
- [Cornerstone3D + Next.js](https://github.com/cornerstonejs/nextjs-cornerstone3d)

---

## 搭建与安装

### 前置条件

- **Node.js**（视模板而定，例如 18+ 或 20+）
- **npm** 或 **yarn**

### Vue（Vite）

1. 克隆或创建一个 Vite + Vue 项目并安装依赖：

   ```bash
   npm install
   # 或：yarn
   ```

2. **必需配置：**
   - **Vite 配置：** 为 `dicom-parser` 使用 `@originjs/vite-plugin-commonjs`，
     设置 `optimizeDeps.exclude: ['@cornerstonejs/dicom-image-loader']`、
     `optimizeDeps.include: ['dicom-parser']`，以及 `worker: { format: 'es' }`。
     参见下方的 [Vite 基础配置](#基础配置)。
   - **子路径：** 若要部署在子路径下（例如 `/subpath/`），从 `process.env.BASE_PATH`
     读取 `base`，并使用会设置 `BASE_PATH=/subpath/` 的脚本，例如
     `dev:subpath` / `build:subpath`。Vue 模板用 `cross-env` 来做这件事。
   - **编解码器 WASM：** Vite 会自行解析编解码器的二进制文件，这里无需任何配置。
     如果想把它们放到自己指定的位置（例如 CDN）来提供服务，可以设置
     `init({ wasmBasePath })`——参见[编解码器 WASM 的位置](#编解码器-wasm-的位置)。

3. **如何运行：**
   - **开发（根路径）：** `npm run dev` → 打开 http://localhost:5173/
   - **构建（根路径）：** `npm run build` → 产物在 `dist/`
   - **预览（根路径）：** `npm run preview` → 打开 http://localhost:4173/
   - **开发（子路径）：** `npm run dev:subpath` → 打开 http://localhost:5173/subpath/
   - **构建（子路径）：** 先 `npm run build:subpath`，再 `npm run preview:subpath`
     （或者直接用 `npm run dev:subpath` 来测试）。

### Angular

1. 安装依赖（这一步会执行 **postinstall** 脚本来完成构建准备）：

   ```bash
   npm install
   ```

2. **必需配置：**
   - **postinstall / prebuild：** 该项目用脚本为浏览器构建创建 Node 模块的替身
     （`fs` / `path`），并打包 DICOM 影像加载器的 worker、复制编解码器的 WASM 文件。
     这些脚本在 `npm install` 时以及 `npm run build` 之前（通过 `prebuild`）运行。
     **preview** 脚本会在构建前执行它们，以保证生产包里带有 worker 和编解码器。
   - **启动服务：** 开发环境下，`@cornerstonejs/dicom-image-loader` 会被排除在预打包之外，
     以保证 worker 能正确加载。
   - **编解码器 WASM：** 与 Vite 模板不同，这里**必须**配置。`application` 构建器使用
     esbuild，而 esbuild 不会解析编解码器那种裸模块标识符。需要用
     `init({ wasmBasePath })` 把加载器指向已复制出来的二进制文件，
     参见[编解码器 WASM 的位置](#编解码器-wasm-的位置)。
   - **静态资源：** 编解码器的 `.wasm` 文件通过 `angular.json` 的 assets 配置从
     `node_modules` 复制进构建产物；worker 会生成到 `public/cs-dicom-loader/`
     （该目录通常会被 gitignore）。

3. **如何运行：**
   - **开发（根路径）：** `npm start` 或 `npm run dev` → 打开 http://localhost:4200/
   - **构建（根路径）：** `npm run build` → 产物在 `dist/angular-vite-6/`
   - **预览（根路径）：** `npm run preview` → 先构建再在 http://localhost:4201/ 提供服务
     （如果开发服务器下影像加载不正常，请改用这个）。
   - **开发（子路径）：** `npm run dev:subpath` → 打开 http://localhost:4200/subpath/
   - **构建（子路径）：** `npm run build:subpath` → 然后运行预览脚本，
     或者把 `dist/angular-vite-6/browser` 部署在 `/subpath/` 下提供服务。
   - **预览（子路径）：** `npm run preview:subpath` → 按子路径构建后在
     http://localhost:4202/ 提供服务。

   生产环境请部署 `dist/angular-vite-6/browser` 的内容，并将其挂载在 `/`
   或你的子路径下。

### React（Vite）

1. 安装依赖：

   ```bash
   npm install
   # 或：yarn
   ```

2. **必需配置：**
   - **Vite 配置：** 与 Vue 相同：为 `dicom-parser` 启用 CommonJS 插件、
     把 `@cornerstonejs/dicom-image-loader` 从 `optimizeDeps` 中排除、
     把 `dicom-parser` 加入 `include`，并设置 `worker: { format: 'es' }`。
     也可以选择使用 Cornerstone 的 WASM 插件，或为子路径设置 `base`。
   - **子路径：** 在 `vite.config.ts` 中设置 `base: '/subpath/'`（或从环境变量读取），
     用于子路径下的构建与预览。
   - **编解码器 WASM：** Vite 会自行解析编解码器的二进制文件，这里无需任何配置。
     如果想把它们放到自己指定的位置（例如 CDN）来提供服务，可以设置
     `init({ wasmBasePath })`——参见[编解码器 WASM 的位置](#编解码器-wasm-的位置)。

3. **如何运行：**
   - **开发（根路径）：** `npm run dev` → 打开 http://localhost:5173/
   - **构建：** `npm run build` → 产物在 `dist/`
   - **预览（根路径）：** `npm run preview` → 打开 http://localhost:4173/
   - **子路径：** 在配置中设置 `base: '/subpath/'`，然后构建并预览
     （或以该 base 运行开发服务器），访问 `http://localhost:5173/subpath/`
     或带 `/subpath/` 的预览地址。

**速查表：**

| 框架         | 安装          | 开发（根路径） | 构建            | 预览 / 类生产环境                |
| ------------ | ------------- | -------------- | --------------- | -------------------------------- |
| Vue（Vite）  | `npm install` | `npm run dev`  | `npm run build` | `npm run preview`                |
| Angular      | `npm install` | `npm start`    | `npm run build` | `npm run preview`（先构建再服务） |
| React（Vite）| `npm install` | `npm run dev`  | `npm run build` | `npm run preview`                |

关于子路径：在提供了 `dev:subpath` / `build:subpath` / `preview:subpath` 脚本的模板
（Vue、Angular）中直接使用这些脚本；React / Vue 也可以在 Vite 配置里设置 `base`。

---

## 编解码器 WASM 的位置

每个解码器都通过 `new URL(..., import.meta.url)` 中的裸标识符
`@cornerstonejs/codec-...` 来定位自己的 WASM 二进制文件。这是否需要你额外配置，
取决于打包工具：

| 打包工具              | 行为                                                                             |
| --------------------- | -------------------------------------------------------------------------------- |
| webpack 5             | 通过包的 `exports` 映射解析该标识符，并把二进制文件作为静态资源输出。无需处理。   |
| Vite / Rollup（构建） | 同上：会解析并输出二进制文件（体积低于内联阈值时会被内联）。无需处理。            |
| esbuild               | **不会**解析。`new URL(...)` 被当作普通代码，裸标识符会原样留在构建产物里。       |

Angular 的 `application` 构建器基于 esbuild，因此 Angular 应用是最常见的需要配置的情况。
在 Vite 中，要把 `@cornerstonejs/dicom-image-loader` 排除在开发期依赖优化之外
（也就是上面的 `optimizeDeps.exclude`），因为预打包过程使用的正是 esbuild——
这与开发服务器下遇到的是同一个限制。

当标识符没有被解析时，请求会打到一个并不存在的路径上，通常由 SPA 的兜底路由响应，
表现为这样的报错：

```
CompileError: WebAssembly.instantiate(): expected magic word 00 61 73 6d, found 3c 21 64 6f
```

（`3c 21 64 6f` 就是 `<!do`——解码器收到的是 `index.html`，而不是二进制文件。）

自行托管这些二进制文件，并用 `wasmBasePath` 把加载器指向它们：

```js
import { init as dicomImageLoaderInit } from '@cornerstonejs/dicom-image-loader';

dicomImageLoaderInit({
  wasmBasePath: '/assets/cs-wasm/',
});
```

需要用到它的场合有两种：打包工具不解析这些标识符时（esbuild，也就是 Angular），
或者你希望这些二进制文件从自己掌控的位置提供服务时——比如 CDN，
或者某个适配子路径部署的路径——这种情况与打包工具无关。

这是一个面向所有编解码器的统一根目录，**没有**按单个编解码器分别配置的选项。
该目录必须包含以下四个二进制文件，且保持其发布时的文件名。它们需要在构建时从各个
编解码器包的 `dist` 目录中复制出来：

| 文件                           | 复制来源                                  |
| ------------------------------ | ----------------------------------------- |
| `charlswasm_decode.wasm`       | `@cornerstonejs/codec-charls`             |
| `libjpegturbowasm_decode.wasm` | `@cornerstonejs/codec-libjpeg-turbo-8bit` |
| `openjpegwasm_decode.wasm`     | `@cornerstonejs/codec-openjpeg`           |
| `openjphjs.wasm`               | `@cornerstonejs/codec-openjph`            |

对于**子路径**部署，需要把 base 路径包含进去。从文档中推导 base，
可以让同一份构建产物在任意挂载点都能工作：

```js
dicomImageLoaderInit({
  wasmBasePath: new URL('assets/cs-wasm/', document.baseURI).href,
});
```

相对的 `wasmBasePath` 会相对解码 worker 所在位置解析；绝对路径或完整 URL
（例如 CDN 地址）则按原样使用。不设置该选项时，沿用默认的 `import.meta.url` 解析方式——
未打包的用法和通过 script 标签引入的用法依赖的就是这套默认行为。

这个路径是全局的，而不是某个加载器专属的，所以 `@cornerstonejs/ai` 也会在同一位置
寻找 ONNX Runtime 的二进制文件——把 `onnxruntime-web/dist` 复制到同一个目录即可，
不需要再做别的配置。如果没有设置 `wasmBasePath`，这些二进制文件会被预期放在应用
base 路径下的 `ort/` 目录中；该 base 取自 `PUBLIC_URL`
（`window.PUBLIC_URL`、`window.config.path` 或构建期的 `process.env.PUBLIC_URL`），
默认为服务器根目录。

因此**子路径**部署必须声明这两者之一。`onnxruntime-web@1.17` 只导出了 JavaScript
入口，所以它的二进制文件无法像编解码器那样相对加载它的模块来定位——既没有可推导的 base，
也没有可回退的方案。要么设置 `wasmBasePath`，要么把 `PUBLIC_URL` 设为应用的挂载位置。
无论用哪种方式，都能让该位置不再取决于用户当前所处的路由。

---

## Vite

### 基础配置

下面是一份可以配合 cornerstone3D 工作的 Vite 配置示例，适用于基于 Vite 的项目。

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteCommonjs } from '@originjs/vite-plugin-commonjs';

export default defineConfig({
  plugins: [
    react(),
    // 用于 dicom-parser
    viteCommonjs(),
  ],
  // 似乎只在开发模式下需要
  optimizeDeps: {
    exclude: ['@cornerstonejs/dicom-image-loader'],
    include: ['dicom-parser'],
  },
  worker: {
    format: 'es',
  },
});
```

:::note
这份配置面向 cornerstone3D 工具的基础用法，不包含 polySeg，也不包含标签图插值。
:::

### 进阶配置

#### PolySeg

如果需要用 polyseg 在不同的分割表示形式之间转换，可以添加下面这个依赖，
并用相应配置初始化 cornerstoneTools：

```bash
yarn add @cornerstonejs/polymorphic-segmentation
```

```js
import * as polySeg from '@cornerstonejs/polymorphic-segmentation';
import { init } from '@cornerstonejs/tools';

initialize({
  addons: {
    polySeg,
  },
});
```

接下来需要修改 Vite 配置，加入下面的内容。注意我们把 WASM 文件包含进构建、
同时将其排除在依赖优化之外。Vite 在处理 `import.meta.url` 上存在一个尚未解决的问题
（[见其 GitHub issue](https://github.com/vitejs/vite/issues/8427)），
这使得我们必须把 wasm 文件从依赖优化中排除。

```js
export default defineConfig({
  assetsInclude: ['**/*.wasm'],
  plugins: [
    react(),
    // 用于 dicom-parser
    viteCommonjs(),
  ],
  // 似乎只在开发模式下需要
  optimizeDeps: {
    exclude: [
      '@cornerstonejs/dicom-image-loader',
      '@cornerstonejs/polymorphic-segmentation',
    ],
    include: ['dicom-parser'],
  },
  worker: {
    format: 'es',
  },
});
```

#### 标签图插值

需要先添加依赖：

```bash
yarn add @cornerstonejs/labelmap-interpolation
```

然后修改 Vite 配置，加入以下内容：

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteCommonjs } from '@originjs/vite-plugin-commonjs';

export default defineConfig({
  assetsInclude: ['**/*.wasm'],
  plugins: [
    react(),
    // 用于 dicom-parser
    viteCommonjs(),
  ],
  // 似乎只在开发模式下需要
  optimizeDeps: {
    exclude: [
      '@cornerstonejs/dicom-image-loader',
      '@cornerstonejs/polymorphic-segmentation',
      '@cornerstonejs/labelmap-interpolation',
    ],
    include: ['dicom-parser'],
  },
  worker: {
    format: 'es',
  },
});
```

## Webpack

### 基础配置

开箱即用、无需额外配置，所以下面这份 `next.config.js` 是你唯一需要添加的内容。

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // 为其中一个依赖解析 fs
    config.resolve.fallback = {
      fs: false,
    };

    return config;
  },
};

export default nextConfig;
```

### 进阶配置（PolySeg 与标签图插值）

:::note 上游文档内容缺失

官方英文文档中这一节目前只有标题，正文尚未撰写。等上游补全后，本页会同步更新。

在此之前，Webpack 下 PolySeg 与标签图插值的配置可以参考上面 Vite 部分的对应小节
（依赖安装和 `initialize({ addons: { polySeg } })` 的初始化方式是通用的），
以及本页下方[排查问题](#排查问题)中关于 wasm 的 `module.rules` 配置。

:::

## 排查问题

### 1. Rollup 配置

为了把包体积控制得比较小，我们默认不把 `@icr/polyseg-wasm`、`itk-wasm` 和
`@itk-wasm/morphological-contour-interpolation` 这几个库打进产物。
Rollup **可能**会因此报警，这时可以在 rollupOptions 中加入：

```js
worker: {
    format: "es",
    rollupOptions: {
      external: ["@icr/polyseg-wasm"],
    },
  },
```

### 2. @cornerstonejs/core 的路径解析问题

如果构建时遇到报错 `No known conditions for "./types" specifier in "@cornerstonejs/core" package`
（而开发模式下一切正常），在 Vite 配置里加入下面的 alias：

```javascript
resolve: {
  alias: {
    '@': fileURLToPath(new URL('./src', import.meta.url)),
    '@root': fileURLToPath(new URL('./', import.meta.url)),
    "@cornerstonejs/core": fileURLToPath(new URL('node_modules/@cornerstonejs/core/dist/esm', import.meta.url)),
  },
},
```

### 3. 工具名被压缩的问题

如果遇到工具名被压缩的情况（例如 `LengthTool` 被注册成了 `"FE"`），
可以通过下面的配置关闭压缩：

```javascript
build: {
  minify: false,
}
```

:::note
这些方案主要在 macOS 上验证过，但在其他操作系统上应该同样适用。
如果你使用 Vuetify 或其他 Vue 框架，这些配置可能需要根据具体情况调整。
:::

### 4. Webpack

对 webpack 而言，安装 cornerstone3D 库并在项目中引入即可。

如果你此前用过

`noParse: [/(codec)/],`

来避免 webpack 解析编解码器，请把这一行删掉。cornerstone3D 现在已经以 ES 模块的形式
包含了这些编解码器。

另外由于用到了 wasm，需要在 webpack 配置的 `module.rules` 部分加入：

```javascript
{
  test: /\.wasm/,
  type: 'asset/resource',
},
```

### 5. Svelte + Vite

与上面的配置类似，使用 CommonJS 插件把 commonjs 转换为 esm。
否则代码会一直卡在 `await viewport.setStack(stack);`，影像不会被渲染。

```javascript
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { viteCommonjs } from '@originjs/vite-plugin-commonjs';

export default defineConfig({
  plugins: [svelte(), viteCommonjs()],
  optimizeDeps: {
    exclude: ['@cornerstonejs/dicom-image-loader'],
    include: ['dicom-parser'],
  },
});
```

:::note 提示

如果你用的是 `sveltekit`，配置形如 `plugins: [ sveltekit(), viteCommonjs() ]` 时，
`viteCommonjs()` 可能不起作用。试着把 `sveltekit` 换成 `vite-plugin-svelte`，
这样就能正常工作。

:::
