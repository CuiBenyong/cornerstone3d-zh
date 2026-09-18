---
id: polyseg
title: PolySeg
description: PolySeg 已从 cornerstoneTools 包中移出，成为独立包 @cornerstonejs/polymorphic-segmentation。本文说明为何这样拆分、如何安装并通过 addons 初始化，以及 computeAndAddXxxRepresentation 被移除后该如何用 computeAndAddRepresentation 自行组装。
keywords:
  - PolySeg
  - polymorphic-segmentation
  - 多态分割
  - computeAndAddRepresentation
  - polyseg-wasm
  - Cornerstone3D 3.x 迁移
upstream: https://www.cornerstonejs.org/docs/migration-guides/3x/polyseg
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# PolySeg 被外置为独立包 {#externalized-polyseg}

PolySeg 已经从 `cornerstoneTools` 包中移出，
现在是一个独立包，名为 @cornerstonejs/polymorphic-segmentation。

## 用法 {#usage}

它不再包含在 `cornerstoneTools` 包里了。如果你需要启用多态转换，
就得自行安装它，并用它来初始化 `cornerstoneTools`。

```js
import * as polyseg from '@cornerstonejs/polymorphic-segmentation';
import { init } from '@cornerstonejs/tools';

init({
  addons: {
    polyseg,
  },
});
```

:::note
做这个改动是因为我们并没有把 `polyseg-wasm` 依赖随 cornerstone tools 一起发布。
打包工具对其中包含的静态资源有过一些抱怨。现在，不想用它的人不受影响，
而想用它的人需要自己安装并初始化 `cornerstoneTools`。
:::

## 导出内容 {#exports}

我们此前并没有从 `tools` 目录暴露任何相关函数。如果你需要某个东西，
请从 `@cornerstonejs/polymorphic-segmentation` 引入。
它导出以下内容：

```js
import {
  canComputeRequestedRepresentation,
  // 计算
  computeContourData,
  computeLabelmapData,
  computeSurfaceData,
  // 更新
  updateSurfaceData,
  // 初始化
  init,
} from '@cornerstonejs/polymorphic-segmentation';
```

### computeAndAddContourRepresentation、computeAndAddLabelmapRepresentation、computeAndAddSurfaceRepresentation {#computeandaddcontourrepresentation-computeandaddlabelmaprepresentation-computeandaddsurfacerepresentation}

这几个函数已从 `tools` 目录中移除。如果你恰好需要它们（可能性不大），
就得自己组装：

```js
import { utilities } from '@cornerstonejs/tools';
import { computeLabelmapData } from '@cornerstonejs/polymorphic-segmentation';

const { computeAndAddRepresentation } = utilities.segmentation;

// 标签图
const labelmapData = await computeAndAddRepresentation(
  segmentationId,
  Representations.Labelmap,
  () => computeLabelmapData(segmentationId, { viewport }),
  () => null
);

// 曲面
import {
  computeSurfaceData,
  updateSurfaceData,
} from '@cornerstonejs/polymorphic-segmentation';

const SurfaceData = await computeAndAddRepresentation(
  segmentationId,
  Representations.Surface,
  () => computeSurfaceData(segmentationId, { viewport }),
  () => updateSurfaceData(segmentationId, { viewport })
);

// 轮廓同理
import { computeContourData } from '@cornerstonejs/polymorphic-segmentation';

const contourData = await computeAndAddRepresentation(
  segmentationId,
  Representations.Contour,
  () => computeContourData(segmentationId, { viewport }),
  () => undefined
);
```
