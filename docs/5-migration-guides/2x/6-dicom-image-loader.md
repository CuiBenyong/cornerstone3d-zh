---

id: dicom-image-loader
title: '@cornerstonejs/dicom-image-loader'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# @cornerstonejs/dicom-image-loader

## 初始化和配置

**之前:**

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

// 额外配置...
cornerstoneDICOMImageLoader.webWorkerManager.initialize(config);
```

**之后:**

```js
cornerstoneDICOMImageLoader.init();

// 可以选择通过 config 对象进行初始化
cornerstoneDICOMImageLoader.init({
  maxWebWorkers: 2, //
});
```

**迁移指南:**

1. 你应该用 `init` 替换 `configure`
2. 不再需要传递 cornerstone 和 dicomParser 了，我们内部直接作为依赖导入它们
3. 移除 `useWebWorkers` 选项，因为现在始终使用 web workers。
4. 移除 `decodeConfig` 选项，因为它们不再适用。
5. 移除单独的 `webWorkerManager.initialize` 调用，因为它现在在内部处理。
6. 在配置选项中设置 `maxWebWorkers`，而不是通过单独的配置对象。
   1. 默认情况下，我们设置为可用核心数量的一半

### 移除外部模块

`externalModules` 文件已被移除。任何依赖 `cornerstone.external` 的代码都应该更新为直接导入或新配置方法。
我们只是将 cornerstonejs/core 和 dicomparser 视为任何其他依赖并直接在内部导入它们。

### Webpack 配置

如果你的配置中存在以下 Webpack 规则，请将其移除：

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

web workers 现在由库内部处理。

## 总是 `Prescale`

默认情况下，Cornerstone3D 总是用模态 LUT（重缩比斜率和截距）预缩放图像。你可能不需要对你的代码进行任何更改。

<details>
<summary>为什么?</summary>
以前是由视口决定是否预缩放，所有视口都遵循这种方法。然而，我们发现一些用户实现的自定义图像加载器中存在预缩放错误。我们现在通过一致地应用预缩放来修复这些问题。

</details>

## 解码器更新

`@cornerstonejs/dicomImageLoader` 以前使用旧的 web workers API，现在已弃用。它已通过我们新的内部封装 `comlink` 包过渡到新的 web worker API。此更改使与 web workers 的交互更加顺畅，并有助于编译和捆绑 web workers 以匹配库的 ESM 版本。

<details>
<summary>为什么?</summary>

为了使用新的 ES 模块格式统一 web worker API，这将使新的捆绑器如 `vite` 能够无缝地与库一起工作。

</details>

所以如果你在 webpack 或其他捆绑器中有自定义逻辑，可以移除以下规则

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

## 移除对非 web worker 解码器的支持

在 cornerstone3D 的 2.0 版本中，我们已移除对非 web worker 解码器的支持。此更改旨在确保库的性能更高并减少捆绑体积。

<details>
<summary>为什么?</summary>

我们认为没有理由再使用非 worker 解码器。web worker 解码器提供了更优的性能和更好的现代捆绑器兼容性。

</details>

## 移除 `imageFrame` 上的 `minAfterScale` 和 `maxAfterScale`

为 `smallestPixelValue` 和 `largestPixelValue` 让路，之前它们是一起使用的，导致使用正确的变得困难。

## DICOM 图像加载器 ESM 默认

在 cornerstone3D 的 2.0 版本中，我们已将 DICOM 图像加载器的默认导出更改为 ESM，并正确发布类型。
这意味着你不再需要为 DICOM 图像加载器设置别名。

<Tabs>
  <TabItem value="Before" label="之前 📦 " default>

可能在你的 webpack 或其他捆绑器中有这个

```js
 alias: {
  '@cornerstonejs/dicom-image-loader':
    '@cornerstonejs/dicom-image-loader/dist/dynamic-import/cornerstoneDICOMImageLoader.min.js',
},
```

  </TabItem>
  <TabItem value="After" label="之后 🚀🚀">

现在你可以移除此别名并使用默认导入

  </TabItem>
</Tabs>

<details>
<summary>为什么?</summary>

ESM 是 JavaScript 的未来，我们希望确保库与现代捆绑器和工具兼容。

</details>

---