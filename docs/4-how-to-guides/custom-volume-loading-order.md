---
id: custom-volume-loading
title: 自定义体数据加载顺序
description: 自定义体数据切片加载顺序的教程。示例把两份体数据的加载请求交错起来，让它们同步逐层加载而不是一份接一份，涵盖 getImageLoadRequests 取请求、用 lodash 交错排序，以及把请求重新加回 imageLoadPoolManager。
keywords:
  - 自定义加载顺序
  - getImageLoadRequests
  - imageLoadPoolManager
  - 交错加载
  - callLoadImage
upstream: https://www.cornerstonejs.org/docs/how-to-guides/custom-volume-loading
---

# 自定义体数据加载顺序 {#custom-volume-loading-order}

本指南将演示如何按自定义顺序加载体数据。

## 介绍 {#introduction}

**体数据**可以由一组二维影像构成，于是你可能会问：

:::note 怎么做

我该如何重排体数据加载过程中的影像请求顺序（自上而下、自下而上等）？

:::

## 实现 {#implementation}

我们来把两份体数据的加载重新排序，让它们同步逐层加载
（而不是一份加载完再加载另一份）。要自定义体数据的加载顺序，
需要从体数据对象上取到 `imageLoadRequests`，再按自定义顺序排序。

### 第 1 步：创建体数据 {#step-1-create-a-volume}

和前面的教程一样，我们从一组 `imageIds` 创建体数据。

```js
const ptVolume = await volumeLoader.createAndCacheVolume(ptVolumeId, {
  imageIds: ptImageIds,
});
const ctVolume = await volumeLoader.createAndCacheVolume(ctVolumeId, {
  imageIds: ctVolumeImageIds,
});
```

### 第 2 步：取得 imageLoad 请求 {#step-2-getting-imageload-requests}

接下来需要取得那些 imageLoad 请求。

```js
const ctRequests = ctVolume.getImageLoadRequests();
const ptRequests = ptVolume.getImageLoadRequests();
```

### 第 3 步：自定义请求顺序 {#step-3-custom-ordering-of-requests}

我们用 lodash 的辅助函数把两组请求一前一后地交错合并起来。

```js
import _ from 'lodash';

const ctPtRequests = _.flatten(_.zip(ctRequests, ptRequests)).filter(
  (el) => el
);
```

### 第 4 步：把请求加回 imageLoadPoolManager {#step-4-add-requests-back-to-imageloadpoolmanager}

我们需要把这些请求重新加回 `imageLoadPoolManager`
（同时还要注意处理好要绑定到 `callLoadImage` 上的那些取值）。

```js
ctPtRequests.forEach((request) => {
  const {
    callLoadImage,
    requestType,
    additionalDetails,
    priority,
    imageId,
    imageIdIndex,
    options,
  } = request;

  imageLoadPoolManager.addRequest(
    callLoadImage.bind(null, imageId, imageIdIndex, options),
    requestType,
    additionalDetails,
    priority
  );
});
```

:::note 提示

不需要再调用 `volume.load`，因为该方法做的基本上就是上面第 3、4 步的事情。

:::

## 效果 {#results}

![customLoading](../assets/custom-loading.gif)
