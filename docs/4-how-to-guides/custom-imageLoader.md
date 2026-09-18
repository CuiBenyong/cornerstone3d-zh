---
id: custom-image-loader
title: 自定义影像加载器
description: 实现自定义影像加载器的分步指南。示例用 XMLHttpRequest 取回像素数据并返回包含 Promise 的影像加载对象，随后说明如何保证元数据同样可用、如何按 URL scheme 注册加载器，以及如何在视口中使用。
keywords:
  - 自定义影像加载器
  - registerImageLoader
  - imageLoadObject
  - XMLHttpRequest
  - URL scheme
upstream: https://www.cornerstonejs.org/docs/how-to-guides/custom-image-loader
---

# 自定义影像加载器 {#custom-image-loader}

本指南将演示如何创建一个自定义影像加载器。你应当先熟悉以下核心概念：

- [影像加载器](../1-concepts/cornerstone-core/imageLoader.md)
- [影像对象](../1-concepts/cornerstone-core/images.md)
- [元数据提供者](../1-concepts/cornerstone-core/metadataProvider.md)

## 介绍 {#introduction}

Cornerstone **不**负责影像加载。它把影像加载委托给
[影像加载器](../1-concepts/cornerstone-core/imageLoader.md)。
Cornerstone 团队已经开发了一些常用的影像加载器：
`CornerstoneDICOMImageLoader`（用 `wado-rs` 或 `wado-uri`
从兼容 wado 的 DICOM 服务器加载影像）、
`CornerstoneWebImageLoader`（加载 PNG、JPEG 等 Web 图片）、
以及 `cornerstone-nifti-image-loader`（加载 NIfTI 影像）。
不过你可能会问：

:::note 怎么做

我该如何构建一个自定义影像加载器？

:::

## 实现 {#implementation}

我们来实现一个 `imageLoader`：它用 `XMLHttpRequest` 取回像素数据，
并返回一个影像加载对象，其中的 Promise 会解析为一个 Cornerstone
[影像](../1-concepts/cornerstone-core/images.md)。

### 第 1 步：创建影像加载器 {#step-1-create-an-image-loader}

下面创建一个 `imageLoader`，它接收一个 `imageId`，
并以 Promise 的形式返回一个 `imageLoadObject`。

```js
function loadImage(imageId) {
  // 解析 imageId 并返回一个可用的 URL（这部分逻辑省略）
  const url = parseImageId(imageId);

  // 创建一个新的 Promise
  const promise = new Promise((resolve, reject) => {
    // 在 Promise 构造函数内部，
    // 发起对影像数据的请求
    const oReq = new XMLHttpRequest();
    oReq.open('get', url, true);
    oReq.responseType = 'arraybuffer';
    oReq.onreadystatechange = function (oEvent) {
      if (oReq.readyState === 4) {
        if (oReq.status == 200) {
          // 请求成功，创建一个影像对象（这部分逻辑省略）
          // 这一步可能需要把影像解码为原始像素数据、
          // 确定行列数、像素间距等等。
          const image = createImageObject(oReq.response);

          // 通过 resolve Promise 把影像对象返回出去
          resolve(image);
        } else {
          // 出错了，通过 reject Promise
          // 返回一个包含该错误的对象
          reject(new Error(oReq.statusText));
        }
      }
    };

    oReq.send();
  });

  // 把包含该 Promise 的对象返回给 cornerstone，
  // 好让它为成功 / resolve 与失败 / reject 两种情形设置异步回调。
  return {
    promise,
  };
}
```

### 第 2 步：保证影像元数据同样可用 {#step-2-ensure-image-metadata-is-also-available}

我们的影像加载器返回的 `imageLoadObject` 包含像素数据及相关信息，
但 Cornerstone 可能还需要
[额外的元数据](../1-concepts/cornerstone-core/metadataProvider.md)
才能显示这张影像。具体怎么做，见
[自定义元数据提供者](./custom-metadata-provider.md)文档。

### 第 3 步：注册影像加载器 {#step-3-registration-of-image-loader}

实现好影像加载器之后，需要把它注册到 Cornerstone。首先要决定
你的影像加载器支持哪个 URL scheme。假设它想支持 `custom1` scheme，
那么任何以 `custom1://` 开头的 imageId 都会交给你的加载器处理。

```js
// 注册
cornerstone.imageLoader.registerImageLoader('custom1', loadImage);
```

## 用法 {#usage}

```js
// 像下面这样加载的影像会被交给我们的 loadImage 函数：
stackViewport.setStack(['custom1://example.com/image.dcm']);
```

<details>
<summary>
用视口 API 加载影像
</summary>

在 Cornerstone 早前的版本中，你可以用 `loadImage` 或 `loadAndCacheImage`
来加载影像。但在 `Cornerstone3D` 中，这件事是通过**视口**的 API 完成的。

</details>
