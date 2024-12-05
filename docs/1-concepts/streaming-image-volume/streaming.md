---
id: streaming
title: 体数据的流媒体传输
---

# 体数据的流媒体传输

随着[`体积`](../cornerstone-core/volumes.md)加入`Cornerstone3D`，我们正在添加和维护`Streaming-volume-image-loader`，
这是一个逐步加载体积的加载器。此加载器旨在接受图像 ID 并将其加载到`Volume`中。

## 从图像创建体积

由于 3D`Volume`是由 2D 图像（在`StreamingImageVolume`中）组成的，因此其体积元数据是从 2D 图像的元数据派生的。
因此，此加载器需要最初调用以获取图像元数据。这样，不仅可以在内存中预分配和缓存`Volume`，
还可以在 2D 图像加载时渲染体积（逐步加载）。

![](../../assets/volume-building.png)

通过预先获取所有图像（`imageIds`）的元数据，我们不需要为每个 imageId 创建[`图像`](../cornerstone-core/images.md)对象。
相反，我们可以将图像的 pixelData 直接插入到正确位置的体积中。这保证了速度和内存效率（但也带来了预取元数据的最小成本）。

## 从图像转换体积

`StreamingImageVolume`基于一系列获取的图像（2D）加载体积，`Volume`可以实现将其 3D 像素数据转换为 2D 图像的功能，
而无需通过网络重新请求它们。例如，使用`convertToCornerstoneImage`，`StreamingImageVolume`实例获取一个 imageId 及其 imageId 索引并返回一个 Cornerstone 图像对象（需要 imageId 索引，因为我们需要在 3D 数组中定位 imageId 的 pixelData 并将其复制到 Cornerstone 图像上）。

这是一个可以反转的过程；如果一组`imageIds`具有体积的属性（相同的 FromOfReference、origin、dimension、direction 和 pixelSpacing），
`Cornerstone3D`可以从这些图像 ID 中创建一个体积。

## 使用

如前所述，应提前从图像元数据创建一个预缓存的体积。这可以通过调用`createAndCacheVolume`来完成。

```js
const ctVolumeId = 'cornerstoneStreamingImageVolume:CT_VOLUME';
const ctVolume = await volumeLoader.createAndCacheVolume(ctVolumeId, {
  imageIds: ctImageIds,
});
```

然后，可以调用体积的`load`方法来实际加载图像的像素数据。

```js
await ctVolume.load();
```

## imageLoader

由于体积加载器不需要为`StreamingImageVolume`中的每个 imageId 创建[`图像`](../cornerstone-core/images.md)对象，
它将在内部使用`skipCreateImage`选项来跳过图像对象的创建。
否则，体积的图像加载器与`cornerstone-wado-image-loader`中的 wadors 图像加载器相同。

```js
const imageIds = ['wadors:imageId1', 'wadors:imageId2'];

const ctVolumeId = 'cornerstoneStreamingImageVolume:CT_VOLUME';

const ctVolume = await volumeLoader.createAndCacheVolume(ctVolumeId, {
  imageIds: ctImageIds,
});

await ctVolume.load();
```

## 要考虑的替代实现

尽管我们相信我们的预取方法在确保尽可能快速地加载体积方面效果最佳，
但可以有其他不依赖于此预取方法的体积加载器实现。

#### 无需预取元数据来创建体积

在这种情况下，每个图像都需要单独创建，这意味着每个图像都需要加载并创建一个 Cornerstone [`图像`](../cornerstone-core/images.md)。
这是一个昂贵的操作，因为所有图像对象都加载在内存中，并且需要从这些图像中单独创建一个[`Volume`](../cornerstone-core/volumes.md)。

优点：

- 无需单独调用元数据来获取图像元数据。

缺点：

- 性能成本
- 不能逐步加载图像数据，因为这需要为每个图像变化创建一个新的体积