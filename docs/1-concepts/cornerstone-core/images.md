---
id: images
title: 影像对象
description: 影像对象（Image Object）是 Cornerstone 中表示单张医学影像的核心数据结构，包含像素数据、窗宽窗位、像素间距、PET 的 SUV 缩放等信息。本文给出 IImage 接口的完整字段，并说明加载器为何返回影像加载对象而不是单纯的 Promise。
keywords:
  - 影像对象
  - IImage
  - Image Load Object
  - getPixelData
  - windowCenter
  - SUV
  - 像素间距
upstream: https://www.cornerstonejs.org/docs/concepts/cornerstone-core/images
---

# 影像对象 {#image-object}

Cornerstone 的[影像加载器](./imageLoader.md)返回的是**影像加载对象**
（Image Load Object），其中包含一个 Promise。之所以选择返回一个对象、
而不是单纯返回 Promise，是因为这样影像加载器还能在影像加载对象里带上其他属性。
举个例子：我们打算通过加载器在影像加载对象中回传一个 `cancelFn`，
来支持取消待处理或进行中的请求。

下面是这种影像加载对象的接口。每个字段的详细说明见 API 参考的
[IImage 一节](https://www.cornerstonejs.org/docs/api/core/namespaces/Types/interfaces/IImage)。

```js
interface IImage {
  imageId: string
  sharedCacheKey?: string
  minPixelValue: number
  maxPixelValue: number
  slope: number
  intercept: number
  windowCenter: number[]
  windowWidth: number[]
  getPixelData: () => Array<number>
  getCanvas: () => HTMLCanvasElement
  rows: number
  columns: number
  height: number
  width: number
  color: boolean
  rgba: boolean
  numberOfComponents: number
  columnPixelSpacing: number
  rowPixelSpacing: number
  sliceThickness?: number
  invert: boolean
  sizeInBytes: number
  scaling?: {
    PET?: {
      SUVlbmFactor?: number
      SUVbsaFactor?: number
      suvbwToSuvlbm?: number
      suvbwToSuvbsa?: number
    }
  }
}
```
