---
id: custom-metadata-provider
title: 自定义元数据提供者
---

# 自定义元数据提供者 {#custom-metadata-provider}

在本操作指南中，我们将展示如何创建一个自定义元数据提供者。您应该熟悉以下核心概念：

- [图像加载器](../concepts/cornerstone-core/imageLoader.md)
- [图像对象](../concepts/cornerstone-core/images.md)
- [元数据提供者](../concepts/cornerstone-core/metadataProvider.md)

## 简介 {#introduction}

Cornerstone **不** 处理元数据的抓取。它使用注册的元数据提供者（按照优先顺序）调用每个提供者，传递 `imageId` 和要抓取元数据的 `type`。通常，元数据提供者有一个方法将解析的元数据添加到其缓存中。

您可能会问一个问题：

:::note How

我如何构建一个自定义的元数据提供者？

:::

## 实现 {#implementation}

通过以下步骤，我们实现一个自定义元数据提供者，用于存储 PT 图像的缩放因子的元数据。

### 步骤 1：创建一个添加方法 {#step-1-create-an-add-method}

我们需要在缓存中存储元数据，并且需要一个方法来添加元数据。

```js
const scalingPerImageId = {};

function add(imageId, scalingMetaData) {
  const imageURI = csUtils.imageIdToImageURI(imageId);
  scalingPerImageId[imageURI] = scalingMetaData;
}
```

<details>

<summary>imageId vs imageURI</summary>

随着 `Cornerstone3D` 中 `Volumes` 的增加，以及在 `Volumes` 和 `Images` 之间内部发生的缓存优化（[`imageLoader`](../concepts/streaming-image-volume/streaming.md#imageloader)），我们应该在提供者的缓存中存储 imageURI（而不是 `imageId`），因为 imageURI 对每个图像都是唯一的，但可以通过不同的加载方案检索。

</details>

### 步骤 2：创建一个提供者 {#step-2-create-a-provider}

接下来，需要一个提供者函数，以便根据特定的 imageId 获取相应类型的元数据。在本例中，提供者只关心 `scalingModule` 类型，并且如果在缓存中存在 `imageId` 的元数据，它将返回该元数据。

```js
function get(type, imageId) {
  if (type === 'scalingModule') {
    const imageURI = csUtils.imageIdToImageURI(imageId);
    return scalingPerImageId[imageURI];
  }
}
```

### 步骤 3：注册提供者 {#step-3-register-the-provider}

最后，我们需要将提供者注册到 cornerstone 中。

```js title="/src/myCustomProvider.js"
const scalingPerImageId = {};

function add(imageId, scalingMetaData) {
  const imageURI = csUtils.imageIdToImageURI(imageId);
  scalingPerImageId[imageURI] = scalingMetaData;
}

function get(type, imageId) {
  if (type === 'scalingModule') {
    const imageURI = csUtils.imageIdToImageURI(imageId);
    return scalingPerImageId[imageURI];
  }
}

export { add, get };
```

```js title="src/registerProvider.js"
import myCustomProvider from './myCustomProvider';

const priority = 100;
cornerstone.metaData.addProvider(
  myCustomProvider.get.bind(myCustomProvider),
  priority
);
```

## 使用示例 {#usage-example}

现在，提供者已注册，我们可以使用它来获取图像的元数据。但首先，让我们假设在图像加载过程中，我们为 imageId 获取元数据并将其存储在提供者的缓存中。稍后，我们可以使用提供者来获取 imageId 的元数据并使用它（例如，正确显示工具的 SUV 值）。

```js
// 检索此元数据
const imagePlaneModule = cornerstone.metaData.get(
  'scalingModule',
  'scheme://imageId'
);