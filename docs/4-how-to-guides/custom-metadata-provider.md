---
id: custom-metadata-provider
title: 自定义元数据提供者
description: 创建并注册自定义元数据提供者的分步指南。示例实现一个存放 PET 影像缩放因子的提供者，说明为何应以 imageURI 而不是 imageId 作为缓存键、如何编写 get 提供者函数、如何按优先级注册，以及如何取用。
keywords:
  - 自定义元数据提供者
  - addProvider
  - imageIdToImageURI
  - scalingModule
  - SUV
  - 元数据缓存
upstream: https://www.cornerstonejs.org/docs/how-to-guides/custom-metadata-provider
---

# 自定义元数据提供者 {#custom-metadata-provider}

本指南将演示如何创建一个自定义元数据提供者。你应当先熟悉以下核心概念：

- [影像加载器](../1-concepts/cornerstone-core/imageLoader.md)
- [影像对象](../1-concepts/cornerstone-core/images.md)
- [元数据提供者](../1-concepts/cornerstone-core/metadataProvider.md)

## 介绍 {#introduction}

Cornerstone **不**负责取回元数据。它使用已注册的元数据提供者
（按优先级顺序），把 `imageId` 和要取回的元数据 `type` 传给每个提供者去调用。
通常，元数据提供者会有一个方法用来把解析好的元数据加入它自己的缓存。

你可能会问：

:::note 怎么做

我该如何构建一个自定义元数据提供者？

:::

## 实现 {#implementation}

通过下面几步，我们实现一个自定义元数据提供者，
用来存放 PET 影像缩放因子的元数据。

### 第 1 步：创建 add 方法 {#step-1-create-an-add-method}

我们需要把元数据存进一个缓存，因此需要一个用来添加元数据的方法。

```js
const scalingPerImageId = {};

function add(imageId, scalingMetaData) {
  const imageURI = csUtils.imageIdToImageURI(imageId);
  scalingPerImageId[imageURI] = scalingMetaData;
}
```

<details>

<summary>imageId 与 imageURI 的区别</summary>

随着 `Cornerstone3D` 引入了**体数据**，以及**体数据**与**影像**之间
在内部所做的缓存优化
（见[影像加载器](../1-concepts/streaming-image-volume/streaming.md#imageloader)），
我们应当在提供者的缓存中存 imageURI（而不是 `imageId`）——
因为 imageURI 对每张影像是唯一的，但可以通过不同的加载 scheme 取到它。

</details>

### 第 2 步：创建提供者函数 {#step-2-create-a-provider}

接下来需要一个提供者函数，在给定元数据类型的情况下，
取出某个特定 imageId 的元数据。这个例子里，
该提供者只关心 `scalingModule` 类型；如果缓存中存在该 `imageId`
的元数据，它就返回。

```js
function get(type, imageId) {
  if (type === 'scalingModule') {
    const imageURI = csUtils.imageIdToImageURI(imageId);
    return scalingPerImageId[imageURI];
  }
}
```

### 第 3 步：注册该提供者 {#step-3-register-the-provider}

最后，需要把这个提供者注册到 cornerstone。

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

## 用法示例 {#usage-example}

提供者注册好之后，我们就可以用它来取回某张影像的元数据了。
不过先假设：在影像加载过程中我们已经取回了该 imageId 的元数据，
并把它存进了提供者的缓存。之后我们就能用这个提供者取回该 imageId
的元数据并加以使用（例如让工具正确显示 SUV 值）。

```js
// 取回这份元数据
const imagePlaneModule = cornerstone.metaData.get(
  'scalingModule',
  'scheme://imageId'
);
```
