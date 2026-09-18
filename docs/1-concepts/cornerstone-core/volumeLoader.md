---
id: volumeLoader
title: 体数据加载器
description: 体数据加载器接收 volumeId 及加载所需信息，返回一个解析为体数据的 Promise。体数据可以由一组二维影像构成，也可以来自单个三维数组对象（如 NIfTI）。本文说明如何用 registerVolumeLoader 注册加载器，并解析默认的流式体数据加载器实现。
keywords:
  - 体数据加载器
  - registerVolumeLoader
  - cornerstoneStreamingImageVolumeLoader
  - StreamingImageVolume
  - createAndCacheVolume
  - registerUnknownVolumeLoader
  - NIfTI
upstream: https://www.cornerstonejs.org/docs/concepts/cornerstone-core/volumeLoader
---

# 体数据加载器 {#volume-loaders}

与[影像加载器](./imageLoader.md)类似，体数据加载器接收一个 `volumeId`
以及加载体数据所需的其他信息，返回一个会解析为**体数据**的 `Promise`。
这份体数据既可以由一组二维影像（即 `imageIds`）构成，
也可以来自单个三维数组对象（例如 `NIFTI` 格式）。

我们加入了
[`cornerstoneStreamingImageVolumeLoader`](../streaming-image-volume/streaming.md)
来支持把二维影像（`imageIds`）流式加载成一份三维体数据，
它也是流式体数据的默认体数据加载器。

## 注册体数据加载器 {#register-volume-loaders}

你可以用
[`registerVolumeLoader`](https://www.cornerstonejs.org/docs/api/core/namespaces/volumeloader/functions/registervolumeloader)
定义一个体数据加载器，声明它应当在哪个 `scheme` 上被调用。
下面是我们 `cornerstoneStreamingImageVolumeLoader` 的简化代码，其中：

1. 依据一组 imageId 计算体数据的元数据，例如间距、原点、方向等。
2. 实例化一个新的
   [`StreamingImageVolume`](https://www.cornerstonejs.org/docs/api/core/classes/streamingimagevolume/)
   - `StreamingImageVolume` 实现了加载相关的方法（`.load`）
   - 它借助 `imageLoadPoolManager` 来实现加载
   - 每张加载完成的帧（imageId）会被放到三维体数据中正确的切片位置上

3. 返回一个**体数据加载对象**，其中的 promise 会解析为该**体数据**。

```js
function cornerstoneStreamingImageVolumeLoader(
  volumeId: string,
  options: {
    imageIds: Array<string>,
  }
) {
  // 依据 imageIds 计算体数据元数据
  const volumeMetadata = makeVolumeMetadata(imageIds);
  const streamingImageVolume = new StreamingImageVolume(
    // ImageVolume 属性
    {
      volumeId,
      metadata: volumeMetadata,
      dimensions,
      spacing,
      origin,
      direction,
      scalarData,
      sizeInBytes,
    },
    // 流式加载相关属性
    {
      imageIds: sortedImageIds,
      loadStatus: {
        loaded: false,
        loading: false,
        cachedFrames: [],
        callbacks: [],
      },
    }
  );

  return {
    promise: Promise.resolve(streamingImageVolume),
    cancel: () => {
      streamingImageVolume.cancelLoading();
    },
  };
}

registerVolumeLoader(
  'cornerstoneStreamingImageVolume',
  cornerstoneStreamingImageVolumeLoader
);

// 用于任何未提供 scheme 的体数据
registerUnknownVolumeLoader(cornerstoneStreamingImageVolumeLoader);
```

如上所示，由于 `cornerstoneStreamingImageVolumeLoader` 是以
`cornerstoneStreamingImageVolume` 这个 scheme 注册的，
我们就可以像下面这样、通过传入带该 scheme 的 `volumeId` 来加载体数据：

```js
const volumeId = 'cornerstoneStreamingImageVolume:myVolumeId';

const volume = await volumeLoader.createAndCacheVolume(volumeId, {
  imageIds: imageIds,
});
```

## 默认的未知体数据加载器 {#default-unknown-volume-loader}

默认情况下，如果没有找到与该 scheme 匹配的 `volumeLoader`，
就会使用 `unknownVolumeLoader`。而 `cornerstoneStreamingImageVolumeLoader`
正是默认的未知体数据加载器。

:::info
即使你不提供 scheme，默认也会使用 `cornerstoneStreamingImageVolumeLoader`。

所以下面这段代码同样可以工作：

```js
const volumeId = 'myVolumeId';
const volume = await volumeLoader.createAndCacheVolume(volumeId, {
  imageIds: imageIds,
});
```

:::
