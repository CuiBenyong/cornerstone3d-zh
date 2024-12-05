---
id: custom-image-loader
title: 自定义图像加载器
---

# 自定义图像加载器

在这个操作指南中，我们将向您展示如何创建一个自定义图像加载器。您应该熟悉以下核心概念：

- [图像加载器](../concepts/cornerstone-core/imageLoader.md)
- [图像对象](../concepts/cornerstone-core/images.md)
- [元数据提供者](../concepts/cornerstone-core/metadataProvider.md)

## 介绍

Cornerstone **不**处理图像加载。它将图像加载委托给[图像加载器](../concepts/cornerstone-core/imageLoader.md)。Cornerstone团队已经开发了常用的图像加载器（如用于从符合wado标准的dicom服务器加载图像的`CornerstoneDICOMImageLoader`，通过`wado-rs`或`wado-uri`加载，加载PNG和JPEG网页图像的`CornerstoneWebImageLoader`以及用于加载NIFTI图像的`cornerstone-nifti-image-loader`）。然而，您可能会问自己：

:::note 如何实现

如何构建一个自定义图像加载器？

:::

## 实现

让我们实现一个`imageLoader`，使用`XMLHttpRequest`获取像素数据，并返回一个包含Promise的图像加载对象，该Promise解析为Cornerstone的[`image`](../concepts/cornerstone-core/images.md)。

### 步骤1：创建图像加载器

下面，我们创建一个接受`imageId`并返回一个`imageLoadObject`作为Promise的`imageLoader`。

```js
function loadImage(imageId) {
  // 解析imageId并返回一个可用的URL（省略逻辑）
  const url = parseImageId(imageId);

  // 创建一个新的Promise
  const promise = new Promise((resolve, reject) => {
    // 在Promise构造函数内，发出图像数据请求
    const oReq = new XMLHttpRequest();
    oReq.open('get', url, true);
    oReq.responseType = 'arraybuffer';
    oReq.onreadystatechange = function (oEvent) {
      if (oReq.readyState === 4) {
        if (oReq.status == 200) {
          // 请求成功，创建一个图像对象（省略逻辑）
          // 这可能需要将图像解码为原始像素数据，确定行/列，像素间距等。
          const image = createImageObject(oReq.response);

          // 通过解析Promise返回图像对象
          resolve(image);
        } else {
          // 出现错误，通过拒绝Promise返回包含错误的对象
          reject(new Error(oReq.statusText));
        }
      }
    };

    oReq.send();
  });

  // 返回一个包含Promise的对象给cornerstone，这样它可以设置回调函数，
  // 在成功/解析和失败/拒绝的情况下异步调用。
  return {
    promise,
  };
}
```

### 步骤2：确保图像元数据也可用

我们的图像加载器返回一个包含像素数据及相关信息的`imageLoadObject`，但Cornerstone可能还需要[额外的元数据](../concepts/cornerstone-core/metadataProvider.md)来显示图像。请参阅[自定义元数据提供者](custom-metadata-provider.md)文档以了解如何执行此操作。

### 步骤3：图像加载器的注册

在实现图像加载器之后，您需要将其注册到Cornerstone。首先，您需要决定图像加载器支持的网址方案。假设您的图像加载器支持`custom1`方案，那么任何以`custom1://`开头的imageId都会由您的图像加载器处理。

```js
// 注册
cornerstone.imageLoader.registerImageLoader('custom1', loadImage);
```

## 用法

```js
// 按如下方式加载的图像将传递给我们的loadImage函数：
stackViewport.setStack(['custom1://example.com/image.dcm']);
```

<details>
<summary>
使用 Viewport API 加载图像
</summary>

在早期版本的Cornerstone中，您可以使用`loadImage`或`loadAndCacheImage`加载图像。然而，在`Cornerstone3D`中，此任务可以使用`Viewports` APIs来完成。

</details>