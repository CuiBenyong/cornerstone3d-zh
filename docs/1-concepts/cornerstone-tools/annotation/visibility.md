---
id: visibility
title: 可见性
---

# 可见性

注释的可见性可以被更改。您可以使用可见性 API 来显示/隐藏注释。

## API

有各种用于显示和隐藏注释的 API 以及 get/set 方法

```js
import { annotation } from '@cornerstonejs/tools';

// 将注释的可见性更改为可见（隐式可见参数）。
annotation.visibility.setAnnotationVisibility(annotationUID);

// 将注释的可见性更改为不可见。
annotation.visibility.setAnnotationVisibility(annotationUID, false);

// 显示所有注释（隐藏的）
annotation.visibility.showAllAnnotations();

// 获取注释是否可见。
// 可能的结果是：如果没有给定 UID 的注释，则为 undefined，如果可见为 true，如果不可见为 false。
annotation.visibility.isAnnotationVisible(annotationUID);
```

## 阅读更多

:::note 提示
在[此处](https://www.cornerstonejs.org/api/tools/namespace/annotation#visibility)阅读更多关于可见性 API 的信息
:::