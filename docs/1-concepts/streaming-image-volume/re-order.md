---
id: re-order
title: 重排序图像请求
---

# 重排序图像请求

如[`体数据的流式传输`](./streaming.md)部分所述，体的创建和缓存与图像数据的加载是分开的。

这使我们能够以任何顺序加载图像，并能够重排序图像请求以按正确顺序加载图像。

## getImageLoadRequests

创建 `StreamingImageVolume` 实例后，可以调用 `getImageLoadRequests` 获取图像加载请求。
然后可以重排序（或与另一个系列交错）图像请求以按所需顺序加载图像。