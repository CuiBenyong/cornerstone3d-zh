---
id: dicom-image-loader
title: "@cornerstonejs/dicom-image-loader"
description: 从 1.x 升级到 2.x 时 DICOM 影像加载器的变化。configure 改为 init、不再需要传入 cornerstone 与 dicomParser、externalModules 被移除、Web Worker 改用 comlink 并成为唯一解码方式、影像一律预先做模态 LUT 缩放，以及默认导出改为 ESM 后可去掉打包 alias。
keywords:
  - dicom-image-loader
  - init
  - maxWebWorkers
  - externalModules
  - prescale
  - comlink
  - worker-loader
  - ESM
  - Cornerstone3D 2.x 迁移
upstream: https://www.cornerstonejs.org/docs/migration-guides/2x/dicom-image-loader
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# @cornerstonejs/dicom-image-loader {#cornerstonejsdicom-image-loader}

## 初始化与配置 {#initialization-and-configuration}

**迁移前：**

```js
cornerstoneDICOMImageLoader.external.cornerstone = cornerstone;
cornerstoneDICOMImageLoader.external.dicomParser = dicomParser;
cornerstoneDICOMImageLoader.configure({
  useWebWorkers: true,
  decodeConfig: {
    convertFloatPixelDataToInt: false,
    use16BitDataType: preferSizeOverAccuracy || useNorm16Texture,
  },
});

// 其他配置……
cornerstoneDICOMImageLoader.webWorkerManager.initialize(config);
```

**迁移后：**

```js
cornerstoneDICOMImageLoader.init();

// 也可以给 init 传一个配置对象
cornerstoneDICOMImageLoader.init({
  maxWebWorkers: 2, //
});
```

**迁移指引：**

1. 把 configure 换成 `init`。
2. 不再需要传入 cornerstone 和 dicomParser——我们在内部直接使用它们，
   并把它们当作依赖引入。
3. 去掉 `useWebWorkers` 选项，因为现在始终使用 Web Worker。
4. 去掉 `decodeConfig` 选项，它们已不再适用。
5. 去掉单独的 `webWorkerManager.initialize` 调用，这一步现在由内部处理。
6. 把 `maxWebWorkers` 设在 configure 的选项里，而不是另给一个 config 对象。
   1. 默认情况下我们会用可用核心数的一半。

### externalModules 被移除 {#removal-of-external-module}

`externalModules` 文件已被移除。任何依赖 `cornerstone.external` 的代码
都应改为使用直接 import 或新的配置方式。我们现在把 cornerstonejs/core
和 dicomparser 当作普通依赖，在内部直接引入。

### Webpack 配置 {#webpack-configuration}

如果你的配置中有下面这条 Webpack 规则，请删掉它：

```json
{
  test: /\.worker\.(mjs|js|ts)$/,
  use: [
    {
      loader: 'worker-loader',
    },
  ],
},
```

Web Worker 现在由库内部处理。

## 一律预先缩放（`Prescale`） {#always-prescale}

默认情况下，Cornerstone3D 始终会用模态 LUT（rescale slope 与 intercept）
对影像做预先缩放。你的代码大概不需要做任何改动。

<details>
<summary>为什么？</summary>
以前是由视口来决定是否做预先缩放，所有视口都沿用这个做法。
但我们在一些用户自行实现的影像加载器中发现了预缩放相关的缺陷。
现在我们通过统一地应用预缩放修好了这些问题。

</details>

## 解码器的更新 {#decoders-update}

`@cornerstonejs/dicomImageLoader` 此前使用的是旧的 Web Worker API，
那套 API 现已废弃。它已经改用新的 Web Worker API——
通过我们在 `comlink` 包之上新写的内部封装实现。这项改动让与 Web Worker
的交互更顺畅，也便于把 Web Worker 编译打包成与该库 ESM 版本相匹配的形式。

<details>
<summary>为什么？</summary>

为了用一种新的 ES 模块格式统一 Web Worker API，
这样像 `vite` 这类新的打包工具就能与该库顺畅配合。

</details>

因此，如果你在 webpack 或其他打包工具里有自定义逻辑，可以把下面这条规则删掉：

```json
{
  test: /\.worker\.(mjs|js|ts)$/,
  use: [
    {
      loader: 'worker-loader',
    },
  ],
},
```

## 不再支持非 Web Worker 解码器 {#removing-support-for-non-web-worker-decoders}

我们在 cornerstone3D 2.0 版本中移除了对非 Web Worker 解码器的支持。
这样做是为了让库的性能更好，同时减小包体积。

<details>
<summary>为什么？</summary>

我们看不到再使用非 worker 解码器的充分理由。Web Worker 解码器性能更优，
与现代打包工具的兼容性也更好。

</details>

## `imageFrame` 上的 `minAfterScale` 与 `maxAfterScale` 被移除 {#removal-of-minafterscale-and-maxafterscale-on-imageframe}

它们被 `smallestPixelValue` 和 `largestPixelValue` 取代。
以前这四个字段是一起用的，很难判断该用哪一个。

## DICOM 影像加载器默认改为 ESM {#dicom-image-loader-esm-default}

我们在 cornerstone3D 2.0 版本中把 DICOM 影像加载器的默认导出改为了 ESM，
并且正确地发布了类型定义。

这意味着你不再需要为 dicom image loader 配置 alias。

<Tabs>
  <TabItem value="Before" label="迁移前 📦 " default>

你在 webpack 或其他打包工具里大概有过这样的配置：

```js
 alias: {
  '@cornerstonejs/dicom-image-loader':
    '@cornerstonejs/dicom-image-loader/dist/dynamic-import/cornerstoneDICOMImageLoader.min.js',
},
```

  </TabItem>
  <TabItem value="After" label="迁移后 🚀🚀">

现在可以把这个 alias 删掉，直接用默认 import。

  </TabItem>
</Tabs>

<details>
<summary>为什么？</summary>

ESM 是 JavaScript 的未来，我们希望确保该库与现代打包工具和工具链兼容。

</details>

---
