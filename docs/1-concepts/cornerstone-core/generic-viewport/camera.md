---
id: camera
title: 相机模型
description: 通用视口用语义化的 viewState 而非 VTK 风格相机字段作为唯一可信来源。本文给出 ViewState、ViewPresentation、ViewReference、ResolvedView、DataPresentation 五者的职责矩阵，平面视口状态字段，视频与 ECG 的投影坐标，3D 与 WSI 的例外情况，以及旧相机 API 的迁移写法。
keywords:
  - 相机模型
  - viewState
  - ViewReference
  - ResolvedView
  - viewportProjection
  - setViewState
  - ICamera
  - 通用视口
upstream: https://www.cornerstonejs.org/docs/concepts/cornerstone-core/generic-viewport/camera
---

# 相机模型 {#camera-model}

通用视口把 `viewState` 而不是 VTK 风格的相机字段作为干净的唯一可信来源。

模型是这样的：

```text
Viewport viewState
  -> ResolvedView
  -> renderer projection
  -> runtime engine state
```

只有 `viewState` 是持久化的视口导航状态。`ResolvedView` 是针对当前画布、数据和状态
计算出来的快照。渲染器投影是发给 VTK、CPU 画布、DOM、OpenLayers 或其他运行时的指令。
运行时引擎状态则是该渲染器私有的。

干净的 Next 视口实例**不**暴露 `getViewPresentation()` 和 `setViewPresentation()`。
显示状态归投影服务负责：

```ts
import { viewportProjection } from '@cornerstonejs/core';

const presentation = viewportProjection.getPresentation(viewport, {
  selector: {
    pan: true,
    zoom: true,
    rotation: true,
  },
});

const nextViewState = viewportProjection.withPresentation(viewport, {
  zoom: 2,
  pan: [20, -10],
});

if (nextViewState) {
  viewport.setViewState(nextViewState);
}
```

`viewportProjection.withPresentation()` 是纯函数。它把显示状态补丁翻译成该视口族的
原生 `ViewState`，但既不修改视口，也不触发渲染。要做任意的视图状态改动，
干净的 Next 路径仍然是 `setViewState()` 和 `updateViewState()`；
`resetViewState()` 是对应的重置辅助方法。

做跨视口的工具和同步器时，请使用视口投影（Viewport Projection）这一构件，
而不要把 `ICamera` 当成通用的相机模型。视口投影提供经过能力检查的变换、
语义化的缩放与位置，以及可选的渲染器相机输出。见
[视口投影](./viewport-projection.md)。

> **命名说明。** 「视口投影」中的*投影*取其数学含义——把语义化的视口状态投射到
> 显示状态、变换和渲染器输出上。它与 VTK 的平行/透视投影
> （`parallelProjection`）是两回事，后者是承载在解析后 `ICamera` 上的
> 渲染器矩阵设置。这两个概念会出现在同一段代码路径里，但描述的是不同层次。

## 职责矩阵 {#contract-matrix}

| 概念               | 负责                                                                                       | 不负责                                                   |
| ------------------ | ------------------------------------------------------------------------------------------ | -------------------------------------------------------- |
| `ViewState`        | 视口本地的导航与布局状态，可变，是唯一可信来源。                                            | 它本身不负责跨视口的持久化。                             |
| `ViewPresentation` | 可持久化的外观状态：平移、缩放（或 scale）、旋转、翻转和显示区域。                          | 数据身份、切片身份、VOI、不透明度或颜色映射表。          |
| `ViewReference`    | 可持久化的空间指针：参考坐标系、数据 id、体数据 id、影像 id、切片定位符和平面限制。         | 平移、缩放、旋转、翻转、VOI、不透明度或颜色映射表。      |
| `ResolvedView`     | 临时性的世界/画布变换、解析后的显示状态，以及渲染器几何信息。                               | 持久化状态或持久化本身。                                 |
| `DataPresentation` | 每个绑定各自的外观，例如 VOI、不透明度、颜色映射表、插值方式和可见性。                      | 视口导航。                                               |

## 平面视口状态 {#planar-view-state}

`PlanarViewState` 是语义化的。它不继承 `ICamera`，也不会把 `focalPoint`、
`position`、`parallelScale`、`viewPlaneNormal`、`viewUp` 作为可信来源存下来。

它存的是这些字段：

- `orientation`
- `slice`
- `anchorWorld`
- `anchorCanvas`
- `scale`
- `scaleMode`
- `rotation`
- `flipHorizontal`
- `flipVertical`
- `displayArea`

平面切片的身份是显式的：

- 堆栈与影像路径使用 `slice.kind === 'stackIndex'`。
- 体数据路径使用 `slice.kind === 'volumePoint'`。

`setImageIdIndex()` 仍然是一个便捷 API。对堆栈数据它存的是堆栈索引；
对体数据它会把请求的索引解析为一个世界坐标点，并存为 `volumePoint` 切片定位符。
十字定位线和导航类工具应当使用 `ViewReference` 或 `sliceWorldPoint`，
而不是原始的相机位置。

## 解析后的平面视图 {#resolved-planar-view}

平面渲染代码从解析后的视图中派生出 VTK 兼容的字段，包括焦点、位置、平行缩放、
视平面法向量、视图上方向、显示缩放，以及 CPU 与 VTK 路径所需的切片元数据。

这些字段属于渲染器投影数据，**不会**作为持久化真值回写到 `PlanarViewState` 中。

## 视频与 ECG {#video-and-ecg}

视频和 ECG 视口同样以语义状态作为唯一可信来源。它们的渲染代码从以下输入解析出
一套画布映射：

- 视口状态
- 画布或元素的尺寸
- 媒体或波形的固有度量
- object-fit 或信号布局规则

解析出的画布映射为工具和渲染器提供平移、缩放以及画布/世界坐标的换算，
它不会作为相机被持久化。

视频投影报告的是媒体像素的固有坐标：

- `ProjectionPosition.kind === 'mediaPoint'`
- `ProjectionScale.kind === 'nativePixel'`

ECG 投影报告的是信号坐标：

- 世界坐标元组为 `[sampleIndex, amplitudeValue, channelIndex]`
- `ProjectionPosition.kind === 'signalPoint'`
- `ProjectionScale.kind === 'signal'`

## 3D 与 WSI 的例外 {#3d-and-wsi-exceptions}

3D 视口以运行时相机为准。VTK 的活动相机仍然是唯一可信来源，
`getViewState()` 从 VTK 读取，`setViewState()` 则作用到 VTK 上。

全片影像（WSI）视口有语义化的 `WSIViewState`，但它会在读取之前以及地图交互之后
与 OpenLayers 同步。它的投影适配器通过 `viewportProjection` 暴露切片/世界变换、
缩放、旋转和渲染器相机输出。

## 相机补丁的迁移 {#camera-patch-migration}

旧代码常常直接写入持久化的相机字段：

```ts
viewport.setCamera({
  focalPoint,
  position,
  parallelScale,
});
```

对于直接使用的 Next 视口，优先写原生状态或走投影：

```ts
viewport.updateViewState((viewState) => ({
  ...viewState,
  anchorWorld: [x, y, z],
}));
```

```ts
const nextViewState = viewportProjection.withPresentation(viewport, {
  zoom: 2,
});

if (nextViewState) {
  viewport.setViewState(nextViewState);
}
```

跨切片或跨数据集的空间导航请使用 `ViewReference`：

```ts
const reference = sourceViewport.getViewReference();

targetViewport.setViewReference(reference);
targetViewport.render();
```

`setCamera()` 只应在旧版兼容适配器上使用。只带位置的相机补丁不是一个稳定的
Next 状态操作，因为 Next 的视图状态存的是语义化锚点、切片定位符和缩放，
而不是持久化的渲染器位置。

## 旧版兼容 {#legacy-compatibility}

旧版适配器是 `ICamera` 的临时迁移边界。它们的存在是为了让较老的应用在代码
迁移到直接使用 Next 视口的过程中还能继续运行，**不应**被当作 Next 的长期 API。
请预期这些兼容性相机方法会在后续某个破坏性版本中移除。

干净的通用视口暴露 `getViewState()`、`setViewState()`、`updateViewState()`、
`resetViewState()` 和 `getResolvedView()`。旧版适配器则为老 API 和旧相机事件
暴露 `getCamera()`、`setCamera()`、`resetCamera()`、`getViewPresentation()`
和 `setViewPresentation()`。

对平面适配器而言：

- `getCamera()` 从 `getResolvedView()` 派生出一个 `ICamera`。
- `parallelScale` 借助当前解析出的适配缩放值映射为语义化的 scale。
- 平面内的焦点位移映射为平移和锚点状态。
- 法向方向的焦点位移映射为体数据的 `sliceWorldPoint` 导航。
- `position` 可以用来消解旧版移动操作的歧义，但不会被存下来。
- 只带位置的平面补丁不被支持，也不应修改干净状态。

仍然需要 `ICamera` 兼容结构的工具，应当使用那个桥接工具函数——
它会先从 `getResolvedView()` 派生出该结构，只在必要时才回退到旧版的 `getCamera()`。
