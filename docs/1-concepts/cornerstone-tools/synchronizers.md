---
id: synchronizers
title: 同步器
---

# 同步器

同步器可用于链接视口之间的特定动作（例如同步平移/缩放交互），但也可以用于将任意回调绑定到特定事件。同步器需要：

- 一个要监听的[`事件`](/api/core/namespace/Enums#Events)
- 当该事件在源视口上触发时要调用的函数
- 一个`源`视口数组
- 一个`目标`视口数组

提供的函数接收事件、源视口和目标视口，通常用于检查源视口上的“某个值”。然后，该函数使用核心库公开的公共 API 来更新目标视口，以匹配该状态/值。

## 用法

`SynchronizerManager`公开的 API 类似于`ToolGroupManager`。创建的同步器具有 `addTarget`、`addSource`、`add`（将视口添加为“源”和“目标”）等方法，以及等效的`remove*`方法。

如果视口被禁用，同步器将自动移除源/目标。同步器还公开一个`disabled`标志，可用于暂时防止同步。

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
    // 同步逻辑应放在这里
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

### 内置同步器

我们目前实现了两个可以立即使用的同步器，

#### 位置同步器

它同步包括缩放、平移和滚动在内的摄像机属性。

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

在内部，当源视口上发生摄像机修改事件时，会运行`cameraSyncCallback`来同步所有目标视口。

#### VOI 同步器

它同步视口之间的 VOI（窗宽窗位）。例如，如果在 PET/CT 的 3x3 布局中 CT 图像对比度被调整，我们希望融合视口也反映这个变化。

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

在内部，`voiSyncCallback`在`VOI_MODIFIED`事件后运行。