---
id: migration
title: 迁移
description: 把应用代码从 StackViewport / VolumeViewport 迁移到通用视口的前后对照示例。覆盖视口类型选择、堆栈与体数据切面数据的挂载、融合叠加层、VOI 与颜色映射、平移缩放旋转翻转、切片导航、分割切面渲染，并给出推荐的迁移顺序。
keywords:
  - 通用视口迁移
  - PLANAR_NEXT
  - setStack 迁移
  - setVolumes 迁移
  - setDisplaySets
  - setDisplaySetPresentation
  - registerViewportType
upstream: https://www.cornerstonejs.org/docs/concepts/cornerstone-core/generic-viewport/migration
---

# 迁移 {#migration}

这份迁移指南只针对通用视口架构，不是一份通用的 Cornerstone 迁移指南。

目标是把应用代码从「依赖具体视口类的行为」迁移到「逻辑数据 id、推断出的渲染路径、
绑定、视图状态和数据显示状态」这一套上。

如果你需要从扩展中添加自定义视口类型，请使用 `Enums.ViewportTypes`
（先用 `registerViewportType` 注册，然后访问 `Enums.ViewportTypes.<NAME>`），
具体见
[5.x 通用视口迁移指南](../../../5-migration-guides/5x/2-generic-viewport.md#extending-viewport-types-new-pattern)。

## 堆栈视口还是体数据视口 {#stack-or-volume-viewport-selection}

以前，视口类型通常直接编码了数据形态：

```ts
renderingEngine.enableElement({
  viewportId,
  type: Enums.ViewportType.STACK,
  element,
});

await viewport.setStack(imageIds);
```

```ts
renderingEngine.enableElement({
  viewportId,
  type: Enums.ViewportType.ORTHOGRAPHIC,
  element,
});

await viewport.setVolumes([{ volumeId }]);
```

现在，平面二维浏览统一用 `PLANAR_NEXT`，由数据和渲染路径来决定源数据
究竟是堆栈类还是体数据切面类：

```ts
renderingEngine.enableElement({
  viewportId,
  type: Enums.ViewportType.PLANAR_NEXT,
  element,
});

const viewport = renderingEngine.getViewport(viewportId) as PlanarViewport;
```

## 堆栈数据 {#stack-data}

以前：

```ts
await stackViewport.setStack(imageIds, 0);
stackViewport.setProperties({
  voiRange: { lower: -1500, upper: 2500 },
});
stackViewport.render();
```

现在：

```ts
const displaySetId = 'ct-stack';

utilities.genericViewportDisplaySetMetadataProvider.add(displaySetId, {
  kind: 'planar',
  imageIds,
  initialImageIdIndex: 0,
});

await viewport.setDisplaySets({
  displaySetId,
});

viewport.setDisplaySetPresentation(displaySetId, {
  voiRange: { lower: -1500, upper: 2500 },
});
viewport.render();
```

## 体数据切面数据 {#volume-slice-data}

以前：

```ts
await volumeViewport.setVolumes([
  {
    volumeId,
    callback: ({ volumeActor }) => {
      volumeActor.getProperty().setRGBTransferFunction(0, cfun);
    },
  },
]);
```

现在：

```ts
const displaySetId = 'ct-volume';

utilities.genericViewportDisplaySetMetadataProvider.add(displaySetId, {
  kind: 'planar',
  imageIds,
  initialImageIdIndex: Math.floor(imageIds.length / 2),
  volumeId,
});

await viewport.setDisplaySets({
  displaySetId,
  options: {
    orientation: Enums.OrientationAxis.AXIAL,
  },
});

viewport.setDisplaySetPresentation(displaySetId, {
  voiRange,
  colormap,
});
viewport.render();
```

## 融合叠加层 {#fusion-overlays}

以前，融合往往依赖体数据 actor、混合模式的设置，以及由视口持有的渲染器状态：

```ts
await volumeViewport.setVolumes([
  { volumeId: ctVolumeId },
  { volumeId: ptVolumeId },
]);

volumeViewport.setProperties(
  {
    colormap: { name: 'hsv' },
    voiRange: ptVoiRange,
  },
  ptVolumeId
);
```

现在，源数据和叠加数据是显式的数据绑定：

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

viewport.setDisplaySetPresentation(ptDataId, {
  colormap: {
    name: 'hsv',
    opacity: 0.4,
  },
});
```

## 添加叠加影像 {#adding-overlay-images}

以前：

```ts
viewport.addImages([{ imageId }]);
```

现在，优先注册叠加数据并使用数据显示状态：

```ts
utilities.genericViewportDisplaySetMetadataProvider.add(overlayDataId, {
  kind: 'planar',
  imageIds: [imageId],
  initialImageIdIndex: 0,
});

await viewport.addDisplaySet(overlayDataId, {
  role: 'overlay',
});

viewport.setDisplaySetPresentation(overlayDataId, {
  opacity: 0.5,
  visible: true,
});
```

兼容性的 `addImages()` 路径对影像叠加仍然可用，但新代码应当直接使用
显示集 id 和绑定。

## VOI、颜色映射表、不透明度与可见性 {#voi-colormap-opacity-and-visibility}

以前：

```ts
viewport.setProperties({
  voiRange,
  colormap,
  invert: true,
});
```

现在：

```ts
viewport.setDisplaySetPresentation(displaySetId, {
  voiRange,
  colormap,
  invert: true,
  visible: true,
});
```

这样显示状态就明确归属到每个显示集绑定上了。当视口同时挂载了源显示集和
叠加显示集时，这一点尤其重要。

## 平移、缩放、旋转与翻转 {#pan-zoom-rotation-and-flips}

以前，代码常常直接给相机对象打补丁：

```ts
const camera = viewport.getCamera();

viewport.setCamera({
  ...camera,
  parallelScale: camera.parallelScale * 0.8,
});
```

现在，使用语义化的视口 API：

```ts
viewport.setScale(viewport.getScale() * 1.25);
viewport.setPan([40, -20]);

viewport.updateViewState(({ rotation = 0 }) => ({
  rotation: rotation + 30,
}));

const nextViewState = viewportProjection.withPresentation(viewport, {
  rotation: 90,
});

if (nextViewState) {
  viewport.setViewState(nextViewState);
}

viewport.setViewState({ flipHorizontal: true });
viewport.render();
```

旧版适配器仍为老代码支持相机式调用。它们只是一个临时迁移层，
应当预期会在后续某个破坏性版本中移除，不要把它们当作 Next 的长期控制接口。
干净的 Next 代码应当使用视图状态和视口投影 API。
直接使用的 Next 视口不会把 `getViewPresentation()`、`setViewPresentation()`、
`getCamera()`、`setCamera()` 作为长期控制 API 暴露出来。

以前：

```ts
const presentation = viewport.getViewPresentation();

viewport.setViewPresentation({
  ...presentation,
  zoom: presentation.zoom * 2,
});
```

现在：

```ts
const presentation = viewportProjection.getPresentation(viewport);
const nextViewState = viewportProjection.withPresentation(viewport, {
  zoom: (presentation?.zoom ?? 1) * 2,
});

if (nextViewState) {
  viewport.setViewState(nextViewState);
}
```

以前：

```ts
viewport.setCamera({
  focalPoint,
  position,
});
```

现在，空间导航用视图引用，显示导航用显示状态补丁：

```ts
targetViewport.setViewReference(sourceViewport.getViewReference());
targetViewport.render();
```

```ts
const nextViewState = viewportProjection.withPresentation(viewport, {
  zoom: 1.5,
});

if (nextViewState) {
  viewport.setViewState(nextViewState);
}
```

如果你要改的是某个原生字段——例如平面方位、视频媒体锚点或 ECG 信号范围——
请直接用 `setViewState()` 或 `updateViewState()` 更新原生视图状态。
干净的 Next 重置操作用 `resetViewState()`；`resetCamera()` 属于临时的旧版适配器，
应当预期会在后续某个破坏性版本中移除。

## 切片导航 {#slice-navigation}

以前：

```ts
await stackViewport.setImageIdIndex(index);
```

```ts
volumeViewport.setCamera({
  focalPoint,
  position,
});
```

现在：

```ts
await viewport.setImageIdIndex(index);
```

对基于堆栈的数据，这里存的是堆栈索引。对基于体数据的数据，
视口会把索引解析为一个体数据切面点，使状态中只有一个切片定位符。

跨视口的空间导航：

```ts
const viewReference = sourceViewport.getViewReference();

targetViewport.setViewReference(viewReference);
targetViewport.render();
```

## 分割 {#segmentations}

以前，体数据标签图通常作为体数据 actor 渲染。这对某些工作流是有用的，
但即使只是单切面的平面工作流，它也可能分配整份三维标签图纹理。

```ts
await segmentation.addSegmentationRepresentations(viewportId, [
  {
    segmentationId,
    type: SegmentationRepresentations.Labelmap,
  },
]);
```

现在，对兼容的平面体数据切面工作流，启用切面渲染：

```ts
await segmentation.addLabelmapRepresentationToViewportMap({
  [viewportId]: [
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

启用 `useSliceRendering` 后，标签图表示形式会通过影像/切面叠加路径投射出来。
它作为一个叠加绑定跟随源数据的视图状态，而不再需要一条独立的体数据渲染叠加路径。

## 推荐的迁移顺序 {#recommended-migration-order}

1. 平面二维的堆栈与体数据切面工作流，把视口创建改为 `ViewportType.PLANAR_NEXT`。
2. 把每一份源数据或叠加数据注册为一个逻辑显示集 id。
3. 用 `setDisplaySets()` 或 `addDisplaySet()` 替换 `setStack()` 和 `setVolumes()`。
4. 把 VOI、颜色映射表、不透明度、混合模式和可见性迁移到
   `setDisplaySetPresentation(displaySetId, ...)`。
5. 把干净代码里的相机补丁替换为视图状态、视口投影、平移、缩放和视图引用这几套 API。
6. 为那些应当走切面路径渲染的标签图分割叠加层启用 `useSliceRendering`。
