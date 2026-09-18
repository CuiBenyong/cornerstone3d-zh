---
id: imageLoader
title: 影像加载器
description: 影像加载器（ImageLoader）是一个接收 imageId、返回影像对象的 JavaScript 函数。本文说明加载器的完整工作流、如何用 registerImageLoader 注册自定义加载器，以及 DICOM、Web 图片、NIfTI 三类官方加载器的用途与初始化方式。
keywords:
  - 影像加载器
  - ImageLoader
  - registerImageLoader
  - CornerstoneDICOMImageLoader
  - wado-rs
  - wado-uri
  - dicomParser
upstream: https://www.cornerstonejs.org/docs/concepts/cornerstone-core/imageLoader
---

# 影像加载器 {#image-loaders}

`ImageLoader` 是一个 JavaScript 函数，职责是接收一个
[`ImageId`](./imageId.md) 并返回一个[影像对象](./images.md)。
由于加载影像通常需要请求服务器，影像加载的 API 必须是异步的。
Cornerstone 要求影像加载器返回一个包含 Promise 的对象，
Cornerstone 通过这个 Promise 异步接收影像对象，或者在出错时接收到 Error。

## 影像加载器的工作流 {#image-loader-workflow}

1. `ImageLoader` 通过
   [`registerImageLoader`](https://www.cornerstonejs.org/docs/api/core/namespaces/imageloader/functions/registerimageloader)
   API 向 cornerstone 注册自己，声明它负责加载哪些 ImageId URL scheme。
2. 应用请求加载影像：堆栈用 `loadImage` API，体数据用 `createAndCacheVolume` API。
3. Cornerstone 把加载请求转交给与该 imageId URL scheme 相匹配的已注册 `ImageLoader`。
4. `ImageLoader` 返回一个包含 Promise 的**影像加载对象**，
   并在拿到像素数据后用对应的影像对象 resolve 该 Promise。
   获取像素数据的过程可能包括：用 `XMLHttpRequest` 请求远端服务器、
   解压像素数据（例如从 JPEG 2000 解压），以及把像素数据转换成
   Cornerstone 能理解的格式（例如 RGB 与 YBR 之间的转换）。
5. Promise resolve 后回传的[影像对象](./images.md)随即通过
   `renderingEngine` API 显示出来。

## 注册影像加载器 {#register-image-loader}

你可以用
[`registerImageLoader`](https://www.cornerstonejs.org/docs/api/core/namespaces/imageloader/functions/registerimageloader)
把一个外部影像加载器接入 cornerstone 库。该函数接受一个 `scheme`，
表示第二个参数那个影像加载器函数负责处理的 scheme。

## 可用的影像加载器 {#available-image-loaders}

| 影像加载器 | 用途 |
| --- | --- |
| [Cornerstone DICOM Image Loader](https://github.com/cornerstonejs/cornerstone3D/tree/main/packages/dicomImageLoader) | DICOM Part 10 影像；支持 WADO-URI 与 WADO-RS；支持多帧 DICOM 实例；支持从 File 对象读取 DICOM 文件 |
| [Cornerstone Web Image Loader](https://github.com/cornerstonejs/cornerstoneWebImageLoader) | PNG 与 JPEG |
| [Cornerstone-nifti-image-loader](https://github.com/cornerstonejs/cornerstone3D/tree/main/packages/nifti-volume-loader) | NIfTI |

### CornerstoneDICOMImageLoader {#cornerstonedicomimageloader}

[`CornerstoneDICOMImageLoader`](https://github.com/cornerstonejs/cornerstone3D/tree/main/packages/dicomImageLoader)
是一个 cornerstone 影像加载器，用于从兼容 WADO 的服务器加载 DICOM 影像。
可以用下面的代码安装并初始化它。在内部，`CornerstoneDICOMImageLoader` 会把自己的
`wado-rs` 和 `wado-uri` 影像加载器注册到 `Cornerstone3D`，
并使用 [`dicomParser`](https://github.com/cornerstonejs/dicomParser)
解析元数据和像素数据。

```js
import { init } from '@cornerstonejs/dicom-image-loader';

init({
  maxWebWorkers: navigator.hardwareConcurrency || 1,
});
```

`CornerstoneDICOMImageLoader` 初始化之后，任何使用 `wado-uri` scheme 的 imageId
都会由 `CornerstoneDICOMImageLoader` 的 `wado-uri` 影像加载器和元数据提供者来处理
（例如 `imageId = 'wado-uri: https://exampleServer.com/wadoURIEndPoint?requestType=WADO&studyUID=1.2.3&seriesUID=4.5.6&objectUID=7.8.9&contentType=application%2Fdicom'`）；
`wado-rs` 的 imageId 同理，会走 `CornerstoneDICOMImageLoader` 的 `wado-rs`
影像加载器和元数据提供者
（例如 `imageId = 'wado-rs: https://exampleServer.com/wadoRSEndPoint/studies/1.2.3/series/4.5.6/instances/7.8.9/frames/1'`）。

### CornerstoneWebImageLoader {#cornerstonewebimageloader}

`CornerstoneWebImageLoader` 的示例代码可以在
[这里](https://github.com/cornerstonejs/cornerstone3D/tree/main/packages/core/examples/webLoader)
查看。
