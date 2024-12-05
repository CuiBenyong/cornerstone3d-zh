---
id: state
title: 状态
---

# 状态

`SegmentationState` 存储了关于库中 `Segmentation` 和 `SegmentationRepresentation` 当前状态的所有信息。在 2.x 版本中，我们将 `Segmentation` 从其表示中解耦，并使系统具备视口特定性，而不是工具组特定性。从一个 `Segmentation`，可以创建各种表示（目前支持 Labelmap、Contour 和 Surface）。

## ColorLUT

`SegmentationState` 存储用于渲染分割表示的 `colorLUT` 数组。`Cornerstone3DTools` 最初将 255 种颜色（`[[0,0,0,0], [221, 84, 84, 255], [77, 228, 121, 255], ...]`）添加为该数组的第一个索引。默认情况下，所有分割表示都使用第一个 colorLUT。但是，使用配置中的颜色 API，您可以将更多颜色添加到全局 colorLUT 和/或更改特定视口中特定分割表示的 colorLUT。

## Segmentations

`SegmentationState` 将所有分段存储在一个数组中。每个 Segmentation 对象存储了创建 `SegmentationRepresentation` 所需的信息。

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

- `segmentationId`：消费者提供的必填字段。这是分割的唯一标识符。
- `label`：分割的标签。
- `segments`：包含每个分段信息的对象，包括其标签、激活状态、锁定状态和缓存统计。
- `representationData`：**最重要的部分**，这是存储每种 `SegmentationRepresentation` 创建数据的地方。例如，在 `Labelmap` 表示中，所需的信息是一个缓存的 `volumeId`。

### 将分割添加到状态

由于 `Segmentation` 和 `SegmentationRepresentation` 是分开的，首先我们需要使用顶级 API 将 `segmentation` 添加到状态中：

```js
import { segmentation, Enums } from '@cornerstonejs/tools';

segmentation.addSegmentations([
  {
    segmentationId,
    representation: {
      type: Enums.SegmentationRepresentations.Labelmap,
      data: {
        imageIds: segmentationImageIds
      }
    }
  }
]);
```

:::note 重要
将 `Segmentation` 添加到状态不会渲染分割。您需要将 `SegmentationRepresentation` 添加到特定的视口中以进行渲染。
:::

## 视口

### 向视口添加 SegmentationRepresentation

要渲染分割，您需要将其表示添加到特定的视口中。这可以使用 `addSegmentationRepresentation` 方法完成：

```js
import { segmentation, Enums } from '@cornerstonejs/tools';

await segmentation.addSegmentationRepresentations(viewportId, [
  {
    segmentationId,
    type: Enums.SegmentationRepresentations.Labelmap
  }
]);
```

### 特定表示方法

Cornerstone3D v2 提供了专门的方法来添加不同类型的分割表示：

```js
// 添加 labelmap 表示
await segmentation.addLabelmapRepresentationToViewport(viewportId, [
  {
    segmentationId,
    config: {}
  }
]);

// 添加轮廓表示
await segmentation.addContourRepresentationToViewport(viewportId, [
  {
    segmentationId,
    config: {}
  }
]);

// 添加表面表示
await segmentation.addSurfaceRepresentationToViewport(viewportId, [
  {
    segmentationId,
    config: {}
  }
]);
```

### 多视口操作

您还可以使用视口映射方法同时向多个视口添加表示：

```js
const viewportInputMap = {
  viewport1: [
    {
      segmentationId: 'seg1',
      type: Enums.SegmentationRepresentations.Labelmap
    }
  ],
  viewport2: [
    {
      segmentationId: 'seg1',
      type: Enums.SegmentationRepresentations.Labelmap
    }
  ]
};

await segmentation.addLabelmapRepresentationToViewportMap(viewportInputMap);