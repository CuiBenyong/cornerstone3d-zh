---

id: general  
title: '概述'  
---  

import Tabs from '@theme/Tabs';  
import TabItem from '@theme/TabItem';  

# 概述

## 视频指南

观看此视频指南，获取迁移过程的[可视化操作流程](https://www.youtube.com/embed/tkQiVLftpuI?si=HbFitXWowvlndI0i)：

<iframe  
  width="560"  
  height="315"  
  src="https://www.youtube.com/embed/tkQiVLftpuI?si=HbFitXWowvlndI0i"  
  title="YouTube 视频播放器"  
  frameborder="0"  
  loading="lazy"  
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"  
  referrerpolicy="strict-origin-when-cross-origin"  
  allowfullscreen  
></iframe>  

## 框架

我们努力增强了使用 Cornerstone3D 时，在 React、Vue、Angular、Vite 和 Webpack 等各种框架中的开发体验。

有关更多信息，请参阅[框架](../../getting-started/vue-angular-react-etc.md)页面。

您需要修改您的 Vite 和 Webpack 配置，以便正确导入 Cornerstone3D 库。请查看各框架的仓库以获取更多细节。

## 移除 SharedArrayBuffer

我们通过消除对共享数组缓冲区的需求，简化了体积加载过程，而不会牺牲速度。这一变化解决了各种框架中的问题，之前需要特定的安全头。现在，您可以移除任何之前设置的头部，这降低了在不支持这些头的框架中使用 Cornerstone3D 的门槛。共享数组缓冲区不再必要，所有相关头部可以被移除。

如果您在应用的其他部分不需要它们，您可以从自定义头部中移除 `Cross-Origin-Opener-Policy` 和 `Cross-Origin-Embedder-Policy`。

## TypeScript 版本

我们在 Cornerstone3D 2.0 版本中将 TypeScript 版本从 4.6 升级到 5.5。
此升级很可能不需要您对代码库做出任何更改，但建议您将项目中的 TypeScript 版本更新到 5.5，以避免未来可能出现的问题。

<details>  
<summary>为什么？</summary>  

TypeScript 5.4 的升级让我们能够利用 TypeScript 标准提供的最新功能和改进。您可以在这里阅读更多信息：[TypeScript 5.5 发布公告](https://devblogs.microsoft.com/typescript/announcing-typescript-5-5/)  

</details>

## ECMAScript 目标

在 Cornerstone3D 1.x 版本中，我们的目标是 ES5。随着 2.0 版本的发布，我们已将目标更新为 `ES2022`。

<details>  
<summary>为什么？</summary>  

这将导致更小的捆绑包大小和更好的性能。您的设置很可能已经支持 ES2022：

[ES2022 兼容性表](https://compat-table.github.io/compat-table/es2016plus/)  

</details>

## 移除 CJS，仅支持 ESM 构建

从 Cornerstone3D 2.x 版本开始，我们将不再提供 CommonJS (CJS) 和 UMD 构建版本的库。您可能不需要对代码库做出任何更改。如果您在捆绑器中使用了 CJS 库的别名，您可以完全移除它。

<details>  
<summary>为什么？</summary>  
Node.js 和现代浏览器现在默认支持 ECMAScript 模块 (ESM)。  
</details>

## 包导出

现在，Cornerstone 库在其 `package.json` 文件中使用 `exports` 字段。这允许更精确地控制模块的导入方式，并确保与不同构建系统的兼容性。

以下是如何从每个包导入模块的示例，以及 `exports` 字段配置的解释。

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
    // ... 其他导出  
  }  
}  
```  

**导入示例：**  

```js  
import * as cornerstoneAdapters from '@cornerstonejs/adapters'; // 导入主入口  
import * as cornerstoneAdapter from '@cornerstonejs/adapters/cornerstone'; // 导入 Cornerstone 适配器  
import { someModule } from '@cornerstonejs/adapters/cornerstone/someModule'; // 从 Cornerstone 适配器导入特定模块  
import * as cornerstone3DAdapter from '@cornerstonejs/adapters/cornerstone3D'; // 导入 Cornerstone3D 适配器  
// ... 其他导入  
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
    // ... 其他导出  
  }  
}  
```  

**导入示例：**  

```js  
import * as cornerstoneCore from '@cornerstonejs/core'; // 导入主入口  
import * as utilities from '@cornerstonejs/core/utilities'; // 导入 utilities 模块  
import { someUtility } from '@cornerstonejs/core/utilities/someUtility'; // 导入特定工具  
// ... 其他导入  
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
      // 工具模块的子路径导出  
      "import": "./dist/esm/tools/index.js",  
      "types": "./dist/esm/tools/index.d.ts"  
    },  
    "./tools/*": {  
      // 工具的通配符子路径导出  
      "import": "./dist/esm/tools/*.js",  
      "types": "./dist/esm/tools/*.d.ts"  
    }  
    // ... 其他导出  
  }  
}  
```  

**导入示例：**  

```js  
import * as cornerstoneTools from '@cornerstonejs/tools'; // 导入主入口  
import * as tools from '@cornerstonejs/tools/tools'; // 导入 tools 模块  
import { someTool } from '@cornerstonejs/tools/tools/someTool'; // 导入特定工具  
// ... 其他导入  
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
      // 图像加载器的子路径导出  
      "import": "./dist/esm/imageLoader/index.js",  
      "types": "./dist/esm/imageLoader/index.d.ts"  
    }  
    // ... 其他导出  
  }  
}  
```  

**导入示例：**  

```js  
import * as dicomImageLoader from '@cornerstonejs/dicom-image-loader'; // 导入主入口  
import * as imageLoader from '@cornerstonejs/dicom-image-loader/imageLoader';

 // 导入图像加载器模块  
```  

</details>  

---

