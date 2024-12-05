---
id: active-segmentation
title: 活跃分割
---


# 活跃分割

![](../../../assets/active-segmentation.png)


每个视窗可以同时显示多个分割表示，但每个视窗只能有一个分割处于活跃状态。活跃分割是可以被分割工具修改的分割。

您可以为活跃和非活跃的分割设置不同的样式。例如，您可以为每个视窗中的活跃和非活跃分割配置不同的填充和轮廓属性。

如上图所示，您可以在同一个视窗中显示多个标签图分割。默认情况下，活跃分割具有更高的轮廓宽度，使其在视觉上比非活跃分割更为显著。

## 特定视窗的活跃分割

在 2.x 版中的一个重要概念是，活跃分割是视窗特定的。这意味着：

- 每个视窗可以有自己的活跃分割
- 同一个分割可以在一个视窗中活跃而在另一个视窗中非活跃
- 分割工具只会修改当前使用视窗中的活跃分割

## API

活跃分割 API 提供了获取和设置每个视窗活跃分割的方法：

```js
import { segmentation } from '@cornerstonejs/tools';

// 获取视窗的活跃分割
const activeSegmentation = segmentation.getActiveSegmentation(viewportId);

// 设置视窗的活跃分割
segmentation.setActiveSegmentation(viewportId, segmentationId);
```

### 获取活跃分割数据

一旦您拥有活跃分割，您可以访问各种属性：

```js
const activeSegmentation = segmentation.getActiveSegmentation(viewportId);

```

### 处理多个视窗

不同的视窗可以有不同的活跃分割：

```js
// 为不同的视窗设置不同的活跃分割
segmentation.setActiveSegmentation('viewport1', 'segmentation1');
segmentation.setActiveSegmentation('viewport2', 'segmentation2');

// 检查活跃分割
const activeInViewport1 = segmentation.getActiveSegmentation('viewport1');
const activeInViewport2 = segmentation.getActiveSegmentation('viewport2');
```

请记住，工具在执行操作时会遵循这些特定视窗的活跃分割。