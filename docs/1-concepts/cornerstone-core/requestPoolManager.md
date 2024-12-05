---
id: requestPoolManager
name: 请求池管理器
---

# 请求池管理器

RequestPool 管理器经过广泛修改，提供了两个新功能：1)“异步图像检索和解码”2)“请求重新排序”。

## 图像加载和图像检索提示

以前，只有一个加载队列用于获取和解码图像。
一旦图像解码完成，就发起新的请求。这有一个限制
用于解码时所需的时间；因此，不会发送新的检索（获取）请求，
即使根据配置的最大请求数允许其他请求。

为了克服这个限制，为此创建了两个不同的队列
目的：`imageRetrievalPoolManager`和`imageLoadPoolManager`，每个都有自己可配置的最大并发数
工作机会。它们彼此分离并异步执行，从而允许
每个检索请求在请求触发槽可用时立即启动。

默认启用分割图像检索请求和解码“Cornerstone-wado-image-loader”版本“v4.0.0-rc”或更高版本。

```js
// Loading = Retrieval + Decoding
imageLoadPoolManager.maxNumRequests = {
  interaction: 1000,
  thumbnail: 1000,
  prefetch: 1000,
};

// Retrieval (usually) === XHR requests
imageRetrievalPoolManager.maxNumRequests = {
  interaction: 20,
  thumbnail: 20,
  prefetch: 20,
};
```

### 使用

在您的自定义“imageLoader”或“volumeLoader”中，正确使用
在基石内部的 poolManagers 中，您需要定义一个 `sendRequest` 函数来发出加载图像请求。

```js
import {
  imageLoadPoolManager,
  loadAndCacheImage,
  RequestType,
} from '@cornerstonejs/core';

function sendRequest(imageId, imageIdIndex, options) {
  return loadAndCacheImage(imageId, options).then(
    (image) => {
      // render
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

## 请求重新订购

您可以记住检索图像的特定顺序。例如，
假设您要从中间切片到顶部和底部加载一个体积。
我们在“cornerstoneStreamingImageVolumeLoader”中实现了这样的选项。
您可以在[重新排序请求](../streaming-image-volume/re-order) 部分阅读更多相关信息。