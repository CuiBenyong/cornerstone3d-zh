---
id: config
title: 样式配置
description: 2.x 起分割配置通过统一的样式体系管理，用一个 specifier 对象把样式应用到不同粒度上——全局、按表示形式类型、按视口、按分割、按分段。本文说明各类表示形式的样式字段、getStyle 与 setStyle 的用法、非活动分割的渲染开关、颜色管理 API，以及样式的优先级顺序。
keywords:
  - 分割样式
  - segmentation.setStyle
  - getStyle
  - renderOutline
  - fillAlpha
  - addColorLUT
  - setSegmentIndexColor
  - setRenderInactiveSegmentations
upstream: https://www.cornerstonejs.org/docs/concepts/cornerstone-tools/segmentation/config
---

# 配置 {#configuration}

在 2.x 版本中，分割配置通过一套统一的样式体系来管理，
借助一个 specifier 对象把样式应用到不同的粒度层级上。

## 样式体系 {#style-system}

样式可以应用在多个层级上：

- 作用于所有分割的全局样式
- 按表示形式类型的样式（例如所有标签图）
- 按视口的样式
- 按分割的样式
- 按分段的样式

样式配置对象的结构取决于表示形式的类型：

```js
// 标签图样式示例
{
  renderFill: true,
  renderOutline: true,
  outlineWidth: 3,
  fillAlpha: 0.7,
  outlineAlpha: 0.9
}

// 轮廓样式示例
{
  renderFill: true,
  renderOutline: true,
  outlineWidth: 2
}

// 曲面样式示例
{
  renderFill: true,
  fillAlpha: 0.7
}
```

## 样式 API {#style-api}

新的样式 API 用一个 specifier 对象来定位具体的配置：

```js
import { segmentation } from '@cornerstonejs/tools';

// 取得某个上下文下的样式
const style = segmentation.getStyle({
  viewportId: 'viewport1', // 可选
  segmentationId: 'segmentation1', // 可选
  type: Enums.SegmentationRepresentations.Labelmap, // 必需
  segmentIndex: 1, // 可选
});

// 为某个上下文设置样式
segmentation.setStyle(
  {
    viewportId: 'viewport1',
    segmentationId: 'segmentation1',
    type: Enums.SegmentationRepresentations.Labelmap,
  },
  {
    renderFill: true,
    renderOutline: true,
    outlineWidth: 3,
  }
);

// 重置为全局样式
segmentation.resetToGlobalStyle();

// 检查某个上下文是否有自定义样式
const hasCustomStyle = segmentation.hasCustomStyle({
  viewportId: 'viewport1',
  segmentationId: 'segmentation1',
  type: Enums.SegmentationRepresentations.Labelmap,
});
```

### 非活动分割 {#inactive-segmentations}

非活动分割是否渲染，现在是按视口控制的：

```js
// 设置某个视口中是否渲染非活动分割
segmentation.setRenderInactiveSegmentations('viewport1', true);

// 取得某个视口中非活动分割是否被渲染
const renderInactive = segmentation.getRenderInactiveSegmentations('viewport1');
```

## 颜色管理 {#color-management}

颜色 API 已更新为按视口划分，命名也更加一致：

```js
import { segmentation } from '@cornerstonejs/tools';

// 添加一个新的颜色查找表
const colorLUTIndex = segmentation.addColorLUT(colorLUT);

// 为某个视口中的某份分割设置颜色查找表
segmentation.setColorLUT('viewport1', 'segmentation1', colorLUTIndex);

// 取得某个分段的颜色
const color = segmentation.getSegmentIndexColor(
  'viewport1',
  'segmentation1',
  segmentIndex
);

// 设置某个分段的颜色
segmentation.setSegmentIndexColor(
  'viewport1',
  'segmentation1',
  segmentIndex,
  [255, 0, 0, 255] // RGBA 颜色
);
```

### 样式层级 {#style-hierarchy}

样式按以下优先级顺序应用（从高到低）：

1. 按分段的样式（提供了 segmentIndex 时）
2. 按视口的样式（提供了 viewportId 时）
3. 按分割的样式（提供了 segmentationId 时）
4. 按类型的样式（只提供了 type 时）
5. 全局样式

示例：

```js
// 为所有标签图设置全局样式
segmentation.setStyle(
  { type: Enums.SegmentationRepresentations.Labelmap },
  { renderOutline: true }
);

// 覆盖某个特定视口的样式
segmentation.setStyle(
  {
    viewportId: 'viewport1',
    type: Enums.SegmentationRepresentations.Labelmap,
  },
  { renderOutline: false }
);

// 为某个特定分段设置样式
segmentation.setStyle(
  {
    viewportId: 'viewport1',
    segmentationId: 'segmentation1',
    type: Enums.SegmentationRepresentations.Labelmap,
    segmentIndex: 1,
  },
  { outlineWidth: 5 }
);
```

:::note Tip
关于每种表示形式各自可用样式选项的详细信息，请参阅 API 文档。
:::
