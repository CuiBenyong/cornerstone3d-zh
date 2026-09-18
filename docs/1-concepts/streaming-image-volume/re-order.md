---
id: re-order
title: 重排影像请求
description: 由于体数据的创建与缓存和影像数据的加载是分离的，因此可以按任意顺序加载影像。本文说明如何用 getImageLoadRequests 取得影像加载请求并重新排序，或与另一个序列的请求交错。
keywords:
  - 重排影像请求
  - getImageLoadRequests
  - StreamingImageVolume
  - 交错加载
upstream: https://www.cornerstonejs.org/docs/concepts/streaming-image-volume/re-order
---

# 重排影像请求 {#re-ordering-image-requests}

正如[体数据的流式加载](./streaming.md)一节所述，
体数据的创建与缓存和影像数据的加载是分开的。

这给了我们按任意顺序加载影像的灵活性，
也让我们能够重排这些影像请求，从而按期望的顺序加载影像。

## getImageLoadRequests {#getimageloadrequests}

创建出 `StreamingImageVolume` 实例之后，可以调用 `getImageLoadRequests`
取得影像加载请求。之后你就可以对这些请求重新排序
（或者把某个序列的请求与另一个序列的请求交错起来），
以便按期望的顺序加载影像。
