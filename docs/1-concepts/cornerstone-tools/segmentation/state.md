---
id: state
title: 状态
description: SegmentationState 保存库中全部分割与分割表示形式的当前状态。2.x 起分割与其表示形式解耦，并从「按工具组划分」改为「按视口划分」。本文说明 colorLUT、分割对象的完整字段、把分割加入状态的方式，以及为视口添加各类表示形式的方法。
keywords:
  - SegmentationState
  - colorLUT
  - addSegmentations
  - addSegmentationRepresentations
  - addLabelmapRepresentationToViewport
  - representationData
upstream: https://www.cornerstonejs.org/docs/concepts/cornerstone-tools/segmentation/state
---

# 状态 {#state}

`SegmentationState` 保存了库中全部**分割**与**分割表示形式**当前状态的相关信息。
在 2.x 版本中，我们把**分割**与它们的表示形式解耦了，
并把这套体系从「按工具组划分」改为「按视口划分」。
从一份**分割**可以创建出多种表示形式（目前支持标签图、轮廓和曲面）。

## ColorLUT {#colorlut}

`SegmentationState` 保存了一个 `colorLUT` 数组，用于渲染分割表示形式。
`Cornerstone3DTools` 初始会把 255 种颜色
（`[[0,0,0,0], [221, 84, 84, 255], [77, 228, 121, 255], ...]`）
作为这个数组的第一项加入。默认情况下，所有分割表示形式都使用第一个 colorLUT。
不过通过配置中的颜色 API，你可以向全局 colorLUT 添加更多颜色，
和 / 或为特定视口中的特定分割表示形式更换 colorLUT。

## 分割 {#segmentations}

`SegmentationState` 把所有分割保存在一个数组里。每个分割对象都保存了
创建**分割表示形式**所需的信息。

每个分割对象具有以下属性：

```js
{
  segmentationId: 'segmentation1',
  label: 'segmentation1',
  segments: {
    0: {
      segmentIndex: 0,
      label: 'Segment 1',
      active: true,
      locked: false,
      cachedStats: {}
    },
    1: {
      segmentIndex: 1,
      label: 'Segment 2',
      active: false,
      locked: false,
      cachedStats: {}
    }
  },
  representationData: {
    Labelmap: {
      volumeId: 'segmentation1'
    },
    Contour: {
      geometryIds: ['contourSet1', 'contourSet2']
    },
    Surface: {
      geometryId: 'surface1'
    }
  }
}
```

- `segmentationId`：必填字段，由使用方提供。这是该分割的唯一标识。
- `label`：该分割的标签。
- `segments`：一个对象，包含每个分段的信息，
  包括它的标签、活动状态、加锁状态和已缓存的统计量。
- `representationData`：**最重要的部分**。创建每一种**分割表示形式**
  所需的数据就存放在这里。例如在**标签图**表示形式中，
  所需的信息是一个已缓存的 `volumeId`。

### 把分割加入状态 {#adding-segmentations-to-the-state}

由于**分割**与**分割表示形式**是分开的，我们首先需要用顶层 API
把**分割**加入状态：

```js
import { segmentation, Enums } from '@cornerstonejs/tools';

segmentation.addSegmentations([
  {
    segmentationId,
    representation: {
      type: Enums.SegmentationRepresentations.Labelmap,
      data: {
        imageIds: segmentationImageIds,
      },
    },
  },
]);
```

:::note Important
把一份**分割**加入状态**不会**渲染它。你还需要把**分割表示形式**
添加到你希望渲染它的那些具体视口上。
:::

## 视口 {#viewports}

### 为视口添加分割表示形式 {#adding-a-segmentationrepresentation-to-a-viewport}

要渲染一份分割，需要把它的表示形式添加到具体的视口上。
这可以通过 `addSegmentationRepresentation` 方法完成：

```js
import { segmentation, Enums } from '@cornerstonejs/tools';

await segmentation.addSegmentationRepresentations(viewportId, [
  {
    segmentationId,
    type: Enums.SegmentationRepresentations.Labelmap,
  },
]);
```

### 各表示形式专用的方法 {#representation-specific-methods}

Cornerstone3D v2 为添加不同类型的分割表示形式提供了专用方法：

```js
// 添加标签图表示形式
await segmentation.addLabelmapRepresentationToViewport(viewportId, [
  {
    segmentationId,
    config: {}
  }
]);

// 添加轮廓表示形式
await segmentation.addContourRepresentationToViewport(viewportId, [
  {
    segmentationId,
    config: {}
  }
]);

// 添加曲面表示形式
await segmentation.addSurfaceRepresentationToViewport(viewportId, [
  {
    segmentationId,
    config: {}
  }
]);
```

:::note 与原文的一处差异

官方英文原文最后那段「添加曲面表示形式」的示例代码少了一个右花括号，
直接复制会导致语法错误。上面的代码已补齐，其余内容与原文一致。

:::

### 同时操作多个视口 {#multiple-viewport-operations}

也可以用带视口映射的方法，同时把表示形式添加到多个视口：

```js
const viewportInputMap = {
  viewport1: [
    {
      segmentationId: 'seg1',
      type: Enums.SegmentationRepresentations.Labelmap,
    },
  ],
  viewport2: [
    {
      segmentationId: 'seg1',
      type: Enums.SegmentationRepresentations.Labelmap,
    },
  ],
};

await segmentation.addLabelmapRepresentationToViewportMap(viewportInputMap);
```
