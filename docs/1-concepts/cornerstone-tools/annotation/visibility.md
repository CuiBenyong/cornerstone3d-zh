---
id: visibility
title: 可见性
description: 标注的可见性可以被改变。本文介绍 annotation.visibility 命名空间下显示 / 隐藏单个标注、显示全部已隐藏标注，以及查询某个标注是否可见的 API。
keywords:
  - 标注可见性
  - setAnnotationVisibility
  - showAllAnnotations
  - isAnnotationVisible
upstream: https://www.cornerstonejs.org/docs/concepts/cornerstone-tools/annotation/visibility
---

# 可见性 {#visibility}

标注的可见性可以被改变。你可以用可见性 API 显示 / 隐藏标注。

## API {#api}

显示与隐藏标注有多个 API，另有相应的 get / set 方法：

```js
import { annotation } from '@cornerstonejs/tools';

// 把某个标注的可见性改为可见（visible 参数隐式为真）。
annotation.visibility.setAnnotationVisibility(annotationUID);

// 把某个标注的可见性改为不可见。
annotation.visibility.setAnnotationVisibility(annotationUID, false);

// 显示全部（已隐藏的）标注
annotation.visibility.showAllAnnotations();

// 查询某个标注是否可见。
// 可能的结果是：给定 UID 没有对应标注时返回 undefined，可见返回 true，不可见返回 false。
annotation.visibility.isAnnotationVisible(annotationUID);
```

## 延伸阅读 {#read-more}

:::note TIP
关于可见性 API 的更多内容见[这里](https://www.cornerstonejs.org/docs/api/tools/namespaces/annotation/namespaces/visibility)
:::
