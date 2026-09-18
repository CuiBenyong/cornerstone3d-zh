---
id: general
title: 总体变化
description: 从 1.x 升级到 2.x 的总体变化。包括各框架的接入配置、移除 SharedArrayBuffer 后可删掉跨源隔离响应头、TypeScript 升到 5.5、编译目标改为 ES2022、不再发布 CJS 与 UMD 只保留 ESM，以及各包启用 exports 字段后的子路径引入方式。
keywords:
  - Cornerstone3D 2.x 迁移
  - SharedArrayBuffer
  - Cross-Origin-Embedder-Policy
  - ES2022
  - ESM
  - package exports
  - structuredClone
upstream: https://www.cornerstonejs.org/docs/migration-guides/2x/general
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 总体变化 {#general}

## 视频指南 {#video-guide}

这段视频指南带你[直观走一遍](https://www.youtube.com/embed/tkQiVLftpuI?si=HbFitXWowvlndI0i)迁移过程：

<iframe
  width="560"
  height="315"
  src="https://www.youtube.com/embed/tkQiVLftpuI?si=HbFitXWowvlndI0i"
  title="YouTube video player"
  frameborder="0"
  loading="lazy"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
  referrerpolicy="strict-origin-when-cross-origin"
  allowfullscreen
></iframe>

## 各类框架 {#frameworks}

我们花了很大力气改善在 React、Vue、Angular、Vite、Webpack
等各类框架中使用 Cornerstone3D 的开发体验。

更多内容见[框架接入](../../2-getting-started/vue-angular-react-vite.md)页面。

你需要修改 Vite 和 Webpack 的配置，才能正确引入 Cornerstone3D 库。
各框架的具体细节请查看对应仓库。

## 移除 SharedArrayBuffer {#removal-of-sharedarraybuffer}

我们在不牺牲速度的前提下简化了体数据的加载流程，
不再需要 shared array buffer。这项改动解决了在各类框架中遇到的问题——
此前它们都需要设置特定的安全响应头。现在你可以把之前设的那些头都去掉，
这也降低了那些不支持这些头的框架采用 Cornerstone3D 的门槛。
shared array buffer 已不再必要，所有相关的响应头都可以删掉。

如果 `Cross-Origin-Opener-Policy` 和 `Cross-Origin-Embedder-Policy`
在你应用的其他方面没有用处，就可以把它们从自定义响应头中移除。

## TypeScript 版本 {#typescript-version}

在 cornerstone3D 2.0 版本中，我们把 TypeScript 版本从 4.6 升级到了 5.5。
这次升级很可能不需要你改动任何代码，但还是建议把你项目里的 TypeScript
也升到 5.5，以免将来出问题。

<details>
<summary>为什么？</summary>

升级 TypeScript 让我们能用上 TypeScript 标准所提供的最新特性与改进。
相关内容可以在这里了解：https://devblogs.microsoft.com/typescript/announcing-typescript-5-5/

</details>

## ECMAScript 编译目标 {#ecmascript-target}

在 Cornerstone3D 1.x 中，我们的编译目标是 ES5。
随着 2.0 版本发布，我们把目标更新为 `ES2022`。

<details>
<summary>为什么？</summary>

这会带来更小的包体积和更好的性能。你的环境很可能已经支持 ES2022 了：

https://compat-table.github.io/compat-table/es2016plus/

</details>

## 移除 CJS，只保留 ESM 构建 {#remove-of-cjs-only-esm-builds}

从 Cornerstone3D 2.x 开始，我们不再发布该库的 CommonJS（CJS）和 UMD 构建。
你的代码很可能不需要做任何改动。如果你在打包工具里为 cjs 版本配了 alias，
可以整个删掉。

<details>
<summary>为什么？</summary>
Node.js 和现代浏览器现在都默认支持 ECMAScript 模块（ESM）了。
</details>

:::note 提示
如果你必须使用 CJS——例如你在用 `dicom-image-loader` 和 `dicom-parser`——
就需要用 `vite-plugin-commonjs` 把 CommonJS 转成 ESM。更多内容见
[框架接入](../../2-getting-started/vue-angular-react-vite.md)页面。
:::

## 包的 exports 字段 {#package-exports}

Cornerstone 系列库现在在各自的 `package.json` 中使用了 `exports` 字段。
这让我们能更精确地控制模块被引入的方式，也保证了与不同构建系统的兼容性。

下面是从每个包引入模块的示例，以及 `exports` 字段配置的说明。

<details>
<summary><b>@cornerstonejs/adapters</b></summary>

```json
{
  "exports": {
    ".": {
      "import": "./dist/esm/index.js",
      "types": "./dist/esm/index.d.ts"
    },
    "./cornerstone": {
      "import": "./dist/esm/adapters/Cornerstone/index.js",
      "types": "./dist/esm/adapters/Cornerstone/index.d.ts"
    },
    "./cornerstone/*": {
      "import": "./dist/esm/adapters/Cornerstone/*.js",
      "types": "./dist/esm/adapters/Cornerstone/*.d.ts"
    },
    "./cornerstone3D": {
      "import": "./dist/esm/adapters/Cornerstone3D/index.js",
      "types": "./dist/esm/adapters/Cornerstone3D/index.d.ts"
    },
    "./cornerstone3D/*": {
      "import": "./dist/esm/adapters/Cornerstone3D/*.js",
      "types": "./dist/esm/adapters/Cornerstone3D/*.d.ts"
    },
    "./enums": {
      "import": "./dist/esm/adapters/enums/index.js",
      "types": "./dist/esm/adapters/enums/index.d.ts"
    }
    // ……其他导出
  }
}
```

**引入示例：**

```js
import * as cornerstoneAdapters from '@cornerstonejs/adapters'; // 引入主入口
import * as cornerstoneAdapter from '@cornerstonejs/adapters/cornerstone'; // 引入 Cornerstone 适配器
import { someModule } from '@cornerstonejs/adapters/cornerstone/someModule'; // 从 Cornerstone 适配器引入某个具体模块
import * as cornerstone3DAdapter from '@cornerstonejs/adapters/cornerstone3D'; // 引入 Cornerstone3D 适配器
// ……其他引入
```

</details>

<details>
<summary><b>@cornerstonejs/core</b></summary>

```json
{
  "exports": {
    ".": {
      "import": "./dist/esm/index.js",
      "types": "./dist/esm/index.d.ts"
    },
    "./utilities": {
      // 子路径导出
      "import": "./dist/esm/utilities/index.js",
      "types": "./dist/esm/utilities/index.d.ts"
    },
    "./utilities/*": {
      // 通配符子路径导出
      "import": "./dist/esm/utilities/*.js",
      "types": "./dist/esm/utilities/*.d.ts"
    }
    // ……其他导出
  }
}
```

**引入示例：**

```js
import * as cornerstoneCore from '@cornerstonejs/core'; // 引入主入口
import * as utilities from '@cornerstonejs/core/utilities'; // 引入 utilities 模块
import { someUtility } from '@cornerstonejs/core/utilities/someUtility'; // 引入某个具体工具函数
// ……其他引入
```

</details>

<details>
<summary><b>@cornerstonejs/tools</b></summary>

```json
{
  "exports": {
    ".": {
      "import": "./dist/esm/index.js",
      "types": "./dist/esm/index.d.ts"
    },
    "./tools": {
      // tools 的子路径导出
      "import": "./dist/esm/tools/index.js",
      "types": "./dist/esm/tools/index.d.ts"
    },
    "./tools/*": {
      // tools 的通配符子路径导出
      "import": "./dist/esm/tools/*.js",
      "types": "./dist/esm/tools/*.d.ts"
    }
    // ……其他导出
  }
}
```

**引入示例：**

```js
import * as cornerstoneTools from '@cornerstonejs/tools'; // 引入主入口
import * as tools from '@cornerstonejs/tools/tools'; // 引入 tools 模块
import { someTool } from '@cornerstonejs/tools/tools/someTool'; // 引入某个具体工具
// ……其他引入
```

</details>

<details>
<summary><b>@cornerstonejs/dicom-image-loader</b></summary>

```json
{
  "exports": {
    ".": {
      "import": "./dist/esm/index.js",
      "types": "./dist/esm/index.d.ts"
    },
    "./imageLoader": {
      // 影像加载器的子路径导出
      "import": "./dist/esm/imageLoader/index.js",
      "types": "./dist/esm/imageLoader/index.d.ts"
    }
    // ……其他导出
  }
}
```

**引入示例：**

```js
import * as dicomImageLoader from '@cornerstonejs/dicom-image-loader'; // 引入主入口
import * as imageLoader from '@cornerstonejs/dicom-image-loader/imageLoader'; // 单独引入 imageLoader 模块
// ……其他引入
```

</details>

### cloneDeep {#clonedeep}

原先的实现已被 `structuredClone` 函数取代。
你使用 Cornerstone3D 的代码不需要做任何改动。

<details>
<summary>为什么？</summary>
既然可以用浏览器原生 API，为什么还要依赖一个第三方库呢？

</details>
