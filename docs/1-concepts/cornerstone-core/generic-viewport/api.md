---
id: api
title: API
description: 通用视口 API 的实用示例。涵盖创建 PLANAR_NEXT 平面视口、注册并挂载堆栈数据与体数据切面、添加叠加层实现 PET/CT 融合、用 setViewState 与 updateViewState 更新视图状态、按显示集更新 VOI 与颜色映射、标签图分割的切面渲染，以及用视图引用在视口间传递空间位置。
keywords:
  - 通用视口 API
  - PLANAR_NEXT
  - setDisplaySets
  - addDisplaySet
  - setDisplaySetPresentation
  - genericViewportDisplaySetMetadataProvider
  - useSliceRendering
  - getViewReference
upstream: https://www.cornerstonejs.org/docs/concepts/cornerstone-core/generic-viewport/api
---

# API {#api}

通用视口的 API 以逻辑显示集（display set）id 为中心。显示集只需注册一次，
把它挂载到视口上，之后视图状态和数据显示状态就可以各自独立更新。

## 创建一个平面通用视口 {#create-a-planar-generic-viewport}

堆栈类和体数据切面的二维工作流使用 `ViewportType.PLANAR_NEXT`。
视口会根据已注册的数据集形态、请求的方位、渲染配置、WebGL 支持情况
以及分割切面渲染配置来推断渲染路径。

```ts
import {
  Enums,
  RenderingEngine,
  viewportProjection,
  utilities,
  type PlanarViewport,
} from '@cornerstonejs/core';

const renderingEngine = new RenderingEngine('renderingEngineId');

renderingEngine.enableElement({
  viewportId: 'CT_AXIAL',
  type: Enums.ViewportType.PLANAR_NEXT,
  element,
  defaultOptions: {
    background: [0, 0, 0],
  },
});

const viewport = renderingEngine.getViewport('CT_AXIAL') as PlanarViewport;
```

平面渲染路径的选择是内部行为。堆栈类的 imageId 数据走影像路径；
基于体数据的数据或重建方位走体数据切面路径。CPU / GPU 的选择由平面渲染路径
决策服务依据运行时渲染配置和阈值做出。

## 添加堆栈数据 {#add-stack-data}

先把堆栈类数据注册到元数据提供者，再用 `setDisplaySets()` 挂载它。

```ts
const stackDisplaySetId = 'ct-stack';

utilities.genericViewportDisplaySetMetadataProvider.add(stackDisplaySetId, {
  kind: 'planar',
  imageIds,
  initialImageIdIndex: 0,
});

await viewport.setDisplaySets({
  displaySetId: stackDisplaySetId,
});

viewport.setDisplaySetPresentation(stackDisplaySetId, {
  voiRange: { lower: -1500, upper: 2500 },
});

viewport.render();
```

`setDisplaySets()` 接受可变数量的参数；除非显式指定角色，第一项会成为源绑定。
每次调用都会替换当前已挂载的全部显示集。

`setDisplaySets()` 和 `addDisplaySet()` 都**不**返回运行时渲染 id。
后续做显示状态更新、移除以及视图引用相关操作时，请使用你自己提供的 `displaySetId`。

## 添加体数据切面数据 {#add-volume-slice-data}

体数据切面数据用的是同一套视口 API。由于注册的数据里带有 `volumeId`，
视口会选择体数据切面渲染路径。

```ts
const ctDataId = 'ct-volume-source';

utilities.genericViewportDisplaySetMetadataProvider.add(ctDataId, {
  kind: 'planar',
  imageIds: ctImageIds,
  initialImageIdIndex: Math.floor(ctImageIds.length / 2),
  volumeId: ctVolumeId,
});

await viewport.setDisplaySets({
  displaySetId: ctDataId,
  options: {
    orientation: Enums.OrientationAxis.SAGITTAL,
  },
});
```

同样的调用对 CPU 和 GPU 的体数据切面都适用。请通过渲染配置和阈值来设置
CPU / GPU 的偏好，而不是随数据一起传入某个渲染模式。

## 添加叠加层 {#add-an-overlay}

叠加层就是以 `role: 'overlay'` 挂载的额外数据绑定。它们使用与源数据相同的
视口视图状态，但保留各自独立的数据显示状态。

```ts
const ptDataId = 'pt-volume-overlay';

utilities.genericViewportDisplaySetMetadataProvider.add(ptDataId, {
  kind: 'planar',
  imageIds: ptImageIds,
  initialImageIdIndex: Math.floor(ptImageIds.length / 2),
  volumeId: ptVolumeId,
});

await viewport.addDisplaySet(ptDataId, {
  orientation: Enums.OrientationAxis.SAGITTAL,
  role: 'overlay',
});

viewport.setDisplaySetPresentation(ptDataId, {
  colormap: {
    name: 'hsv',
    opacity: 0.4,
  },
});

viewport.render();
```

`setDisplaySets()` 也可以把源数据和叠加层一起挂载：

```ts
await viewport.setDisplaySets(
  {
    displaySetId: ctDataId,
    options: {
      orientation: Enums.OrientationAxis.SAGITTAL,
      role: 'source',
    },
  },
  {
    displaySetId: ptDataId,
    options: {
      orientation: Enums.OrientationAxis.SAGITTAL,
      role: 'overlay',
    },
  }
);
```

只有当注册的数据在语义上派生自另一个对象时才使用 `reference`。
源堆栈数据和源体数据通常不需要它，因为它们的 `displaySetId`、`imageIds`
以及可选的 `volumeId` 本身就已经是公开身份了。

```ts
utilities.genericViewportDisplaySetMetadataProvider.add(labelmapDataId, {
  kind: 'planar',
  imageIds: labelmapImageIds,
  reference: {
    kind: 'segmentation',
    segmentationId,
    representationUID,
    labelmapId,
  },
});
```

## 更新视图状态 {#update-view-state}

导航和视图外观与「每份数据集各自的外观」是分开的。
对直接使用的 Next 视口来说，`ViewState` 是视口唯一可变的可信来源。
打补丁用 `setViewState()`，需要「读—改—写」时用 `updateViewState()`。
想恢复该视口族的默认导航则用 `resetViewState()`。

```ts
viewport.setViewState({
  flipHorizontal: true,
  rotation: 90,
});

viewport.updateViewState(({ rotation = 0 }) => ({
  rotation: rotation + 30,
}));

viewport.resetViewState();
```

当输入是一个可移植的显示状态补丁、而不是原生视图状态时，使用视口投影。
投影服务是纯函数：它返回下一个原生 `ViewState`，由调用方负责应用。

```ts
const nextViewState = viewportProjection.withPresentation(viewport, {
  zoom: 1.5,
  pan: [40, -20],
});

if (nextViewState) {
  viewport.setViewState(nextViewState);
}
viewport.render();
```

读取显示状态也用同一个服务：

```ts
const presentation = viewportProjection.getPresentation(viewport, {
  selector: {
    pan: true,
    zoom: true,
    rotation: true,
  },
});
```

不要在直接使用的 Next 视口上调用 `viewport.getViewPresentation()` 或
`viewport.setViewPresentation()`。这些方法只保留在临时的旧版兼容适配器上，
并且应当预期它们会在后续某个破坏性版本中从该兼容层移除。

索引式的导航使用 `setImageIdIndex()`。对基于体数据的数据，
视口会在内部把请求的索引解析为一个体数据切面点。

```ts
await viewport.setImageIdIndex(viewport.getCurrentImageIdIndex() + 1);
```

## 更新显示集的显示状态 {#update-display-set-presentation}

显示集的显示状态作用范围是单个已挂载的显示集 id。
调用 `setDisplaySetPresentation` 时只传 `props`，更新会作用到当前的源绑定上；
传入显式的 `displaySetId` 则作用到指定的绑定上。

```ts
viewport.setDisplaySetPresentation(ctDataId, {
  voiRange: { lower: -1500, upper: 2500 },
});

viewport.setDisplaySetPresentation(ptDataId, {
  visible: false,
});

// 省略 id 时，作用到当前的源绑定上。
viewport.setDisplaySetPresentation({
  voiRange: { lower: -1000, upper: 1000 },
});

viewport.render();
```

VOI、不透明度、颜色映射表、反色、混合模式、插值方式和可见性，都应该设置在这里。

## 标签图分割 {#labelmap-segmentations}

分割仍然通过 `@cornerstonejs/tools` 添加。对 Next 的平面体数据切面视口来说，
标签图可以通过设置 `config.useSliceRendering` 来使用切面渲染。

```ts
import * as cornerstoneTools from '@cornerstonejs/tools';

const { segmentation, Enums: csToolsEnums } = cornerstoneTools;
const { SegmentationRepresentations } = csToolsEnums;

const segmentationId = 'segmentation-volume-id';

segmentation.addSegmentations([
  {
    segmentationId,
    representation: {
      type: SegmentationRepresentations.Labelmap,
      data: {
        volumeId: segmentationId,
      },
    },
  },
]);

await segmentation.addLabelmapRepresentationToViewportMap({
  CT_AXIAL: [
    {
      segmentationId,
      type: SegmentationRepresentations.Labelmap,
      config: {
        useSliceRendering: true,
      },
    },
  ],
});
```

启用 `useSliceRendering` 后，兼容的体数据标签图会走影像/切面路径渲染，
而不是把它作为一整份三维标签图体数据来分配内存并绘制。这在平面切面的工作流里
很有用，尤其是当源视口本身就在使用体数据切面路径时。

分割显示工具会把每一层标签图作为叠加数据注册到视口上：

```ts
await viewport.addDisplaySet(labelmapDataId, {
  orientation: viewport.getViewState().orientation,
  role: 'overlay',
});

viewport.setDisplaySetPresentation(labelmapDataId, {
  blendMode: Enums.BlendModes.COMPOSITE,
  visible: true,
});
```

处理分割时，应用代码通常不需要直接调用这条更底层的叠加路径；
这里写出来只是为了说明分割是如何映射到通用视口的绑定模型上的。

## 视图引用 {#view-references}

在视口之间传递空间位置，或者恢复一个记下来的视图时，使用视图引用。

```ts
const reference = viewport.getViewReference();

otherViewport.setViewReference(reference);
otherViewport.render();
```

当只需要在兼容的视口族之间复制平移、缩放、旋转、翻转和显示区域时，
使用投影显示状态。显示状态的结构是各适配器专属的，
所以这种做法适用于 Planar Next 到 Planar Next 之间。
**不要**把它当成跨视口族的通用相机复制；那种场景请使用视图引用，
或者用一个显式映射了缩放与位置语义的同步器。

```ts
const presentation = viewportProjection.getPresentation(viewport, {
  selector: {
    displayArea: true,
    flipHorizontal: true,
    flipVertical: true,
    pan: true,
    rotation: true,
    zoom: true,
  },
});

if (!presentation) {
  return;
}

// `withPresentation` 是纯函数：它为目标视口翻译显示状态，
// 但不会修改目标视口，也不会安排渲染。
const nextViewState = viewportProjection.withPresentation(
  otherViewport,
  presentation
);

if (nextViewState) {
  // 对 Next 视口来说，`setViewState` 始终是唯一的变更路径。
  otherViewport.setViewState(nextViewState);
  otherViewport.render();
}
```
