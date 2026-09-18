---
id: synchronizers
title: 同步器
description: 同步器（Synchronizer）用于在多个视口之间联动特定行为，例如同步平移缩放或窗宽窗位，也可以把任意回调绑定到某个事件上。本文说明同步器的四项必要构成、SynchronizerManager 的用法，以及内置的位置同步器与 VOI 同步器。
keywords:
  - 同步器
  - Synchronizer
  - SynchronizerManager
  - createCameraPositionSynchronizer
  - createVOISynchronizer
  - CAMERA_MODIFIED
  - VOI_MODIFIED
upstream: https://www.cornerstonejs.org/docs/concepts/cornerstone-tools/synchronizers
---

# 同步器 {#synchronizers}

同步器可以用来在多个视口之间联动特定行为（例如同步平移 / 缩放交互），
也可以把任意回调绑定到某个特定事件上。同步器需要四样东西：

- 一个要监听的[事件](https://www.cornerstonejs.org/docs/api/core/namespaces/enums/enumerations/events)
- 一个当该事件在源视口上被触发时调用的函数
- 一个**源**视口数组
- 一个**目标**视口数组

传入的那个函数会收到事件、源视口和目标视口，通常用来检查源视口上的「某个值」，
然后更新目标视口——一般是借助核心库暴露的公开 API——使它们与该状态 / 取值一致。

## 用法 {#usage}

`SynchronizerManager` 暴露的 API 与 `ToolGroupManager` 类似。
创建出来的同步器带有 `addTarget`、`addSource`、`add`
（把该视口同时作为「源」和「目标」加入）等方法，以及对应的 `remove*` 方法。

当某个视口被禁用时，同步器会自行把它从源 / 目标中移除。
同步器还暴露了一个 `disabled` 标志，可用于临时阻止同步。

```js
import { Enums } from '@cornerstonejs/core';
import { SynchronizerManager } from '@cornerstonejs/tools';

const cameraPositionSynchronizer = SynchronizerManager.createSynchronizer(
  'synchronizerName',
  Enums.Events.CAMERA_MODIFIED,
  (
    synchronizerInstance,
    sourceViewport,
    targetViewport,
    cameraModifiedEvent
  ) => {
    // 同步逻辑写在这里
  }
);

// 添加要同步的视口
const firstViewport = { renderingEngineId, viewportId };
const secondViewport = {
  /* */
};

sync.addSource(firstViewport);
sync.addTarget(secondViewport);
```

### 内置同步器 {#built-in-synchronizers}

目前我们实现了两个可以直接使用的同步器。

#### 位置同步器 {#position-synchronizer}

它同步视口之间的相机属性，包括缩放、平移和滚动。

```js
const ctAxial = {
  viewportId: VIEWPORT_IDS.CT.AXIAL,
  type: ViewportType.ORTHOGRAPHIC,
  element,
  defaultOptions: {
    orientation: Enums.OrientationAxis.AXIAL,
  },
};

const ptAxial = {
  viewportId: VIEWPORT_IDS.PT.AXIAL,
  type: ViewportType.ORTHOGRAPHIC,
  element,
  defaultOptions: {
    orientation: Enums.OrientationAxis.AXIAL,
    background: [1, 1, 1],
  },
};

const axialSync = createCameraPositionSynchronizer('axialSync')[
  (ctAxial, ptAxial)
].forEach((vp) => {
  const { renderingEngineId, viewportId } = vp;
  axialSync.add({ renderingEngineId, viewportId });
});
```

在内部，当源视口上触发相机修改事件时，`cameraSyncCallback` 就会运行，
把所有目标视口同步过去。

对于直接使用的通用 / Next 视口，同步器不应把 `ICamera` 当作通用状态对象。
请用 `viewportProjection.getPresentation(sourceViewport, { selector })`
读取可移植的显示状态，用
`viewportProjection.withPresentation(targetViewport, presentation)`
为目标视口做翻译，然后用 `targetViewport.setViewState(nextViewState)`
应用返回的原生状态。投影服务是纯函数，不会修改任何一侧的视口。

#### VOI 同步器 {#voi-synchronizer}

它同步视口之间的 VOI。举例来说，在 PET/CT 的 3×3 布局中，
如果 CT 影像的对比度被调整了，我们希望融合视口也随之反映这个变化。

```js
const ctWLSync = createVOISynchronizer('ctWLSync');

ctViewports.forEach((viewport) => {
  const { renderingEngineId, viewportId } = viewport;
  ctWLSync.addSource({ renderingEngineId, viewportId });
});

fusionViewports.forEach((viewport) => {
  const { renderingEngineId, viewportId } = viewport;
  ctWLSync.addTarget({ renderingEngineId, viewportId });
});
```

在内部，`voiSyncCallback` 会在 `VOI_MODIFIED` 事件之后运行。
