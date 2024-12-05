---  
id: imageLoader  
title: 图像加载器
---  

# 图像加载器

`ImageLoader` 是一个 JavaScript 函数，负责接收一个 [`ImageId`](./imageId.md) 并返回一个 [`Image Object`](./images.md)。由于加载图像通常需要调用服务器，因此图像加载的 API 需要是异步的。Cornerstone 要求 `Image Loaders` 返回一个包含 Promise 的对象，Cornerstone 将使用该 Promise 异步接收图像对象，或者如果发生错误则返回错误。  

## 图像加载器工作流程  

1. `ImageLoaders` 使用 [`registerImageLoader`](https://www.cornerstonejs.org/api/core/namespace/imageLoader#registerImageLoader) API 向 Cornerstone 注册自己，以加载特定的 ImageId URL 方案  
2. 应用程序通过 `loadImage` API 请求加载图像（用于堆栈）或通过 `createAndCacheVolume` API 请求加载体积图像  
3. Cornerstone 将加载图像的请求委托给已注册的 `ImageLoader`，该加载器根据图像 Id 的 URL 方案处理请求  
4. `ImageLoader` 将返回一个 `Image Load Object`，其中包含一个 Promise，当它获取到像素数据时会解析该 Promise 并返回相应的图像对象。获取像素数据可能需要通过 `XMLHttpRequest` 调用远程服务器，解压像素数据（例如，从 JPEG 2000 格式解压），并将像素数据转换为 Cornerstone 能够理解的格式（例如，RGB 与 YBR 颜色格式）  
5. 通过解析后的 Promise 返回的 [Image Object](./images.md) 然后使用 `renderingEngine` API 进行显示  

## 注册图像加载器  

您可以使用 [`registerImageLoader`](https://www.cornerstonejs.org/api/core/namespace/imageLoader#registerImageLoader) 将外部图像加载器提供给 Cornerstone 库。此函数接受一个 `scheme`，图像加载器函数（第二个参数）应根据该方案进行处理。  

## 可用的图像加载器  

| 图像加载器                                                                                       | 用途                                                                                                                     |  
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ |  
| [Cornerstone DICOM 图像加载器](https://github.com/cornerstonejs/cornerstone3D/tree/main/packages/dicomImageLoader) | DICOM Part 10 图像；支持 WADO-URI 和 WADO-RS；支持多帧 DICOM 实例；支持从 File 对象读取 DICOM 文件                          |  
| [Cornerstone Web 图像加载器](https://github.com/cornerstonejs/cornerstoneWebImageLoader)           | PNG 和 JPEG 图像                                                                                                         |  
| [Cornerstone NIFTI 图像加载器](https://github.com/cornerstonejs/cornerstone3D/tree/main/packages/nifti-volume-loader) | NIFTI 图像                                                                                                              |  

### CornerstoneDICOMImageLoader  

[`CornerstoneDICOMImageLoader`](https://github.com/cornerstonejs/cornerstone3D/tree/main/packages/dicomImageLoader) 是一个 Cornerstone 图像加载器，负责从 WADO 兼容的服务器加载 DICOM 图像。您可以通过以下代码安装并初始化它。在内部，`CornerstoneDICOMImageLoader` 将其 `wado-rs` 和 `wado-uri` 图像加载器注册到 `Cornerstone3D`，并使用 [`dicomParser`](https://github.com/cornerstonejs/dicomParser) 解析元数据和像素数据。  

```js  
import { init } from '@cornerstonejs/dicom-image-loader';  

init({  
  maxWebWorkers: navigator.hardwareConcurrency || 1,  
});  
```  

初始化 `CornerstoneDICOMImageLoader` 后，任何使用 `wado-uri` 方案的 ImageId 都将通过 `CornerstoneDICOMImageLoader` 的 `wado-uri` 图像加载器和元数据提供程序进行加载（例如，imageId = 'wado-uri: https://exampleServer.com/wadoURIEndPoint?requestType=WADO&studyUID=1.2.3&seriesUID=4.5.6&objectUID=7.8.9&contentType=application%2Fdicom'）。同样，`wado-rs` 图像 Id 也将使用 `CornerstoneDICOMImageLoader` 的 `wado-rs` 图像加载器和元数据提供程序进行加载（例如，imageId = 'wado-rs: https://exampleServer.com/wadoRSEndPoint/studies/1.2.3/series/4.5.6/instances/7.8.9/frames/1'）。  

### CornerstoneWebImageLoader  

您可以查看我们为 `CornerstoneWebImageLoader` 提供的示例代码 [这里](https://github.com/cornerstonejs/cornerstone3D/tree/main/packages/core/examples/webLoader)。  