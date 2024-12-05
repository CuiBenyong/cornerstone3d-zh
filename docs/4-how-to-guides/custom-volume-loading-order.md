---
id: custom-volume-loading
title: 自定义体积加载顺序
---

# 自定义体积加载顺序

在本操作指南中，我们将向您展示如何以自定义顺序加载体积。

## 介绍

`Volumes`可以由一组二维图像构成，您可能会问一个问题：

:::note 如何

如何在体积加载过程中重新排序图像请求（自上而下、从下至上等）？

:::

## 实现

让我们重新排序两个体积加载，使它们一起加载其切片（而不是一个体积之后再加载另一个）。要创建自定义的体积加载顺序，我们需要从体积对象中获取`imageLoadRequests`并按自定义顺序排序。

### 第一步：创建一个体积

我们从一组`imageIds`创建一个类似于以前教程的体积

```js
const ptVolume = await volumeLoader.createAndCacheVolume(ptVolumeId, {
  imageIds: ptImageIds,
});
const ctVolume = await volumeLoader.createAndCacheVolume(ctVolumeId, {
  imageIds: ctVolumeImageIds,
});
```

### 第二步：获取imageLoad请求

接下来，我们需要获取imageLoad请求

```js
const ctRequests = ctVolume.getImageLoadRequests();
const ptRequests = ptVolume.getImageLoadRequests();
```

### 第三步：自定义排序请求

我们使用lodash助手将请求按一个接一个的方式合并在一起。

```js
import _ from 'lodash';

const ctPtRequests = _.flatten(_.zip(ctRequests, ptRequests)).filter(
  (el) => el
);
```

### 第四步：将请求添加回imageLoadPoolManager

我们需要将请求添加回`imageLoadPoolManager`（我们需要处理绑定到`callLoadImage`的值）。

```js
ctPtRequests.forEach((request) => {
  const {
    callLoadImage,
    requestType,
    additionalDetails,
    priority,
    imageId,
    imageIdIndex,
    options,
  } = request;

  imageLoadPoolManager.addRequest(
    callLoadImage.bind(null, imageId, imageIdIndex, options),
    requestType,
    additionalDetails,
    priority
  );
});
```

:::note 提示

没有必要调用`volume.load`，因为这个方法基本上和我们的第3步和第4步的过程一样。

:::

## 结果

![customLoading](../assets/custom-loading.gif)