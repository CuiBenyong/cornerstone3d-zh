---
id: volumeLoader
title: 体积载器
---

# 体积载器

与 [`Image Loaders`](./imageLoader.md) 类似，体积载器采用 `volumeId` 和其他信息这是加载体积所需的，并返回一个解析为“Volume”的“Promise”。这个“Volume”可以由一组 2D 图像（例如“imageIds”）构造而成，或者可以来自一个 3D 数组对象（例如“NIFTI”格式）。

我们添加了 [`cornerstoneStreamingImageVolumeLoader`](/docs/concepts/streaming-image-volume/streaming) 库来支持流式传输将 2D 图像 (`imageIds`) 转换为 3D 体积，它是流式体积的默认体积载器。

## 注册体积载器

您可以使用 [`registerVolumeLoader`](/api/core/namespace/volumeLoader#registerVolumeLoader) 定义应在特定 `scheme` 上调用的体积载器。
下面您可以看到“cornerstoneStreamingImageVolumeLoader”的简化代码，其中：

1. 基于一组 imageId，我们计算体积元数据，例如：间距、原点、方向等。
2. 实例化一个新的 [`StreamingImageVolume`](/api/streaming-image-volume-loader/class/StreamingImageVolume)

- `StreamingImageVolume` 实现加载方法 (`.load`)
  - 它通过使用“imageLoadPoolManager”实现加载
  - 每个加载的帧（imageId）都放置在 3D 体积中的正确切片中

3. 返回一个 `Volume Load Object`，它有一个解析为 `Volume` 的承诺。

```js
function cornerstoneStreamingImageVolumeLoader(
  volumeId: string,
  options: {
    imageIds: Array<string>,
  }
) {
  // Compute Volume metadata based on imageIds
  const volumeMetadata = makeVolumeMetadata(imageIds);
  const streamingImageVolume = new StreamingImageVolume(
    // ImageVolume properties
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
    // Streaming properties
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

// Used for any volume that its scheme is not provided
registerUnknownVolumeLoader(cornerstoneStreamingImageVolumeLoader);
```

如上所示，由于 `cornerstoneStreamingImageVolumeLoader` 已注册到 `cornerstoneStreamingImageVolume` 方案中，我们可以通过传递“volumeId”使用“cornerstoneStreamingImageVolume”方案加载体积，如下所示：

```js
const volumeId = 'cornerstoneStreamingImageVolume:myVolumeId';

const volume = await volumeLoader.createAndCacheVolume(volumeId, {
  imageIds: imageIds,
});
```

## 默认未知体积载器

默认情况下，如果该方案没有找到“volumeLoader”，则使用“unknownVolumeLoader”。 `cornerstoneStreamingImageVolumeLoader`
是默认的未知体积加载程序。

：：：信息
即使您不提供方案，默认情况下也会使用“cornerstoneStreamingImageVolumeLoader”。

所以下面的代码也可以工作：

```js
const volumeId = 'myVolumeId';
const volume = await volumeLoader.createAndCacheVolume(volumeId, {
  imageIds: imageIds,
});
```
