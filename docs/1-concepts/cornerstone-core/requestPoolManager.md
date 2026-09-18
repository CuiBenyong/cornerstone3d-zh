---
id: requestPoolManager
title: 请求池管理器
description: 请求池管理器把影像的获取与解码拆分为 imageRetrievalPoolManager 和 imageLoadPoolManager 两个独立队列，各自可配置最大并发数并异步执行，避免解码耗时阻塞新的获取请求。本文说明两个队列的配置、在自定义加载器中的用法，以及请求重排序。
keywords:
  - 请求池管理器
  - imageLoadPoolManager
  - imageRetrievalPoolManager
  - maxNumRequests
  - RequestType
  - 请求重排序
  - 并发请求
upstream: https://www.cornerstonejs.org/docs/concepts/cornerstone-core/requestPoolManager
---

# 请求池管理器 {#requestpool-manager}

请求池管理器经过了大幅重构，带来两项新能力：
1）`影像的异步获取与解码`；2）`请求重排序`。

## ImageLoad 与 ImageRetrieval 两个队列 {#imageload-and-imageretrieval-queues}

以前，获取和解码影像共用一个加载队列。只有当影像解码完成之后，
才会发起新的请求。这在解码比较耗时的场景下形成了一个约束：
即使按配置的最大请求数还允许发出更多请求，也不会有新的获取（fetch）请求被发出。

为了突破这个限制，我们为此创建了两个彼此独立的队列：
`imageRetrievalPoolManager` 和 `imageLoadPoolManager`，
各自拥有可配置的最大并发任务数。它们相互分离、异步执行，
这样只要有请求发射位空出来，每个获取请求就能立刻被发起。

把影像获取请求与解码拆开这一行为，在 `Cornerstone-wado-image-loader`
`v4.0.0-rc` 及以上版本中默认启用。

```js
// 加载 = 获取 + 解码
imageLoadPoolManager.maxNumRequests = {
  interaction: 1000,
  thumbnail: 1000,
  prefetch: 1000,
};

// 获取（通常）=== XHR 请求
imageRetrievalPoolManager.maxNumRequests = {
  interaction: 20,
  thumbnail: 20,
  prefetch: 20,
};
```

### 用法 {#usage}

在你自定义的 `imageLoader` 或 `volumeLoader` 中，
要正确使用 cornerstone 内部的这些池管理器，需要定义一个 `sendRequest` 函数
来发起加载影像的请求。

```js
import {
  imageLoadPoolManager,
  loadAndCacheImage,
  RequestType,
} from '@cornerstonejs/core';

function sendRequest(imageId, imageIdIndex, options) {
  return loadAndCacheImage(imageId, options).then(
    (image) => {
      // 渲染
      successCallback.call(this, image, imageIdIndex, imageId);
    },
    (error) => {
      errorCallback.call(this, error, imageIdIndex, imageId);
    }
  );
}

const imageId = 'schema://image';
const imageIdIndex = 10;

const requestType = RequestType.INTERACTION;
const priority = -5;
const additionalDetails = { imageId };
const options = {
  targetBuffer: {
    type: 'Float32Array',
  },
};

imageLoadPoolManager.addRequest(
  sendRequest.bind(this, imageId, imageIdIndex, options),
  requestType,
  additionalDetails,
  priority
);
```

## 请求重排序 {#requests-re-ordering}

你可能对影像的获取顺序有特定要求。例如希望从中间那张切片开始、
向上下两端加载一份体数据。这个选项我们已经在
`cornerstoneStreamingImageVolumeLoader` 中实现了，
详见[请求重排序](../streaming-image-volume/re-order.md)一节。
