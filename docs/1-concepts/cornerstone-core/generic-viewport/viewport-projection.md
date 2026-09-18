---
id: viewport-projection
title: 视口投影
description: 视口投影（Viewport Projection）是通用视口用来跨视口族提供显示状态、坐标变换与渲染器相机输出的构件，从而不必把 ICamera 当作通用相机模型。本文说明它的公开契约与稳定性分层、核心类型、带语义标签的缩放与位置、投影服务的用法，以及如何新增适配器。
keywords:
  - 视口投影
  - Viewport Projection
  - viewportProjection
  - ProjectionSnapshot
  - ProjectionScale
  - withPresentation
  - 视口同步器
upstream: https://www.cornerstonejs.org/docs/concepts/cornerstone-core/generic-viewport/viewport-projection
---

# 视口投影 {#viewport-projection}

视口投影是通用视口中的一个构件，用来回答这样一个问题：某个视口的语义状态
如何映射为显示状态、坐标变换和渲染器输出。

它之所以存在，是因为 `zoom`、`scale`、`pan` 和相机字段在不同视口族里的含义并不相同。
平面视口有语义锚点、切片几何、显示区域和派生出来的渲染器相机；3D 视口以运行时相机为准；
视频、ECG 和 WSI 各有自己的映射规则。因此共享抽象**不是** `ICamera`——
`ICamera` 只在渲染器需要时作为渲染器输出存在。

## 这里说的「投影」是什么意思 {#what-projection-means-here}

在这份代码里，「投影」取数学含义——把视口的语义状态*投射*到一套显示状态、
一组坐标变换，以及（在适用时）一个渲染器相机上。一个 `Projection` 就是视口内部模型
与同步器、工具所消费的跨族接口之间的适配缝。

它**不是** VTK 的平行/透视投影（`parallelProjection`、`setParallelProjection`）。
后者是渲染器矩阵设置，存在于解析后的 `ICamera` 载荷里
（`rendererCamera.parallelProjection`）。两个术语可以出现在同一段代码路径中：

```ts
// 跨视口的投影适配器——本页讨论的主题。
const snapshot = viewportProjection.get(viewport);

// VTK 的投影矩阵——与上面无关，设置在渲染器相机上。
snapshot?.rendererCamera?.parallelProjection; // boolean
```

如果你在读的代码里出现了 "projection"，看它的名词是什么：`ProjectionSnapshot`、
`ViewportProjectionAdapter` 或 `viewportProjection` 指的是下文这个跨视口的缝；
而 `parallelProjection` 标志或 `setParallelProjection` 调用指的是 VTK 的渲染矩阵模式。

## 公开契约与稳定性 {#public-contract-and-stability}

稳定的入口是投影服务和这些通用投影类型：

- `viewportProjection`
- `ViewportProjectionService`
- `ViewportProjectionTypes.ts`
- `ProjectionSnapshot`
- `ProjectionPresentation`
- `ProjectionScale`
- `ProjectionPosition`
- `ViewportProjectionAdapter`

各视口族的命名空间是有意作为「进阶辅助」导出的：

- `planarProjection`
- `volume3DProjection`
- `videoProjection`
- `ecgProjection`
- `wsiProjection`

当你要构建自定义同步器、工具、测试，或者需要更底层的快照 / 渲染器相机行为的
新视口族时，才使用这些命名空间。它们比核心视口方法低一个层级，
在通用视口 API 尚未稳定期间可能会变动。应用代码在读写显示状态时应优先使用
`viewportProjection.getPresentation()` 和 `viewportProjection.withPresentation()`。
直接使用的 Next 视口实例有意不暴露 `getViewPresentation()` 和 `setViewPresentation()`。

## 核心类型 {#core-types}

投影接口定义在 `ViewportProjectionTypes.ts` 中。

```ts
interface ViewportProjectionAdapter<TViewState, TPresentation> {
  id: string;
  viewportTypes: string[];

  getSnapshot(request: ProjectionRequest): ProjectionSnapshot | undefined;
  getPresentation(
    snapshot: ProjectionSnapshot,
    selector?: ViewPresentationSelector
  ): TPresentation;
  withPresentation(
    snapshot: ProjectionSnapshot,
    presentation: Partial<TPresentation>,
    options?: ProjectionWriteOptions
  ): TViewState;
  applyToRenderer?(snapshot: ProjectionSnapshot, target: unknown): void;
}
```

`ProjectionSnapshot` 是以能力为基础的：

```ts
interface ProjectionSnapshot {
  kind: string;
  frameOfReferenceUID?: string;

  spaces: {
    canvas?: boolean;
    world?: boolean;
    image?: boolean;
    renderer?: boolean;
  };

  transforms?: {
    canvasToWorld?(point: Point2): Point3;
    worldToCanvas?(point: Point3): Point2;
  };

  presentation: ProjectionPresentation;
  rendererCamera?: ICamera;
}
```

如果某个视口无法提供某项变换，就应当省略那项能力。
不要为了凑齐一个通用结构而添加占位用的变换。

## 带语义标签的缩放与位置 {#semantic-scale-and-position}

投影的缩放和位置都带有标签，好让调用方在使用数值之前先读懂它的意图：

```ts
type ProjectionScale =
  | { kind: 'fit'; value: number }
  | { kind: 'fitWidth'; value: number }
  | { kind: 'fitHeight'; value: number }
  | { kind: 'displayArea'; value: number; area: DisplayArea }
  | { kind: 'nativePixel'; pixelsPerCanvasPixel: number }
  | { kind: 'physical'; mmPerCanvasPixel: number }
  | {
      kind: 'signal';
      samplesPerCanvasPixel: number;
      valueUnitsPerCanvasPixel: number;
    };

type ProjectionPosition =
  | { kind: 'anchor'; worldPoint?: Point3; canvasPoint: Point2 }
  | { kind: 'imagePoint'; imagePoint: Point2; canvasPoint: Point2 }
  | { kind: 'mediaPoint'; mediaPoint: Point2; canvasPoint: Point2 }
  | {
      kind: 'signalPoint';
      sampleIndex: number;
      value: number;
      channelIndex: number;
      canvasPoint: Point2;
    }
  | { kind: 'focalPoint'; worldPoint: Point3 };
```

不要把 `presentation.zoom`、`presentation.scale` 或 `presentation.pan`
当作通用数值来用。先看标签，再按你的工具或同步器所支持的语义分支处理。

## 投影服务 {#projection-service}

包级别的投影服务以 `viewportProjection` 的名字导出。

```ts
import { viewportProjection } from '@cornerstonejs/core';

const projection = viewportProjection.get(viewport, {
  kind: 'planar',
  dataId,
});
```

这个服务是包级 / 全局的，而不是每个渲染引擎一份。这样自定义同步器和进阶工具
就不必依附于渲染引擎的归属关系。

内置视口类型以及显式的 `kind` 请求都为下游代码提供了带类型的辅助别名：

```ts
import type {
  ProjectionPresentationForKind,
  ProjectionSnapshotForKind,
  ProjectionViewStateForKind,
} from '@cornerstonejs/core';

type PlanarSnapshot = ProjectionSnapshotForKind<'planar'>;
type PlanarPresentation = ProjectionPresentationForKind<'planar'>;
type PlanarViewState = ProjectionViewStateForKind<'planar'>;
```

当视口实例带有字面量形式的 Next 视口类型时，服务可以直接从视口参数推断出这些类型。
显式的 `kind` 请求则留给那些只能把视口当作 `unknown` 的自定义同步器使用。

内置适配器已为以下几项注册：

- `planarProjection`
- `volume3DProjection`
- `videoProjection`
- `ecgProjection`
- `wsiProjection`

这些进阶命名空间为有意在核心视口 API 之下工作的代码提供了更底层的辅助函数。

`@cornerstonejs/tools` 中的 `createZoomPanSynchronizer` 已经在源视口和目标视口
都提供了投影适配器时使用这个服务，并在遇到旧视口族时回退到早前的
`getZoom`/`setZoom` 和 `getPan`/`setPan` 能力检查。

## 什么时候需要关心它 {#when-to-care}

大多数应用代码应该这样用：原生视口变更用 `setViewState`；
恢复该视口族的默认导航用 `resetViewState`；空间导航用
`getViewReference` / `setViewReference`；坐标换算用
`canvasToWorld` / `worldToCanvas`。只有当代码需要一个跨视口族可移植的显示层时，
才使用投影。

在写下面这些东西时使用视口投影：

- 需要跨视口族工作的自定义同步器
- 在变换坐标点之前必须先检查能力的工具
- 一个新的通用视口族
- 语义状态与特定渲染器相机输出之间的桥接

## 读取一个投影 {#reading-a-projection}

使用变换之前先检查能力：

```ts
const projection = viewportProjection.get(viewport);

if (projection?.spaces.canvas && projection.spaces.world) {
  const worldPoint = projection.transforms?.canvasToWorld?.([100, 120]);
}
```

应用缩放和位置之前先检查它们的语义：

```ts
const scale = projection?.presentation.scale;

if (scale?.kind === 'displayArea') {
  syncDisplayArea(scale.area);
}

if (scale?.kind === 'physical') {
  syncPhysicalSpacing(scale.mmPerCanvasPixel);
}
```

## 写入显示状态 {#writing-presentation}

当你需要适配器把一个显示状态补丁翻译回语义状态时，使用 `withPresentation`：

```ts
const nextState = viewportProjection.withPresentation(viewport, {
  zoom: 2,
  pan: [10, -5],
});

if (nextState) {
  viewport.setViewState(nextState);
}
```

Next 视口有意不暴露 `setViewPresentation`。投影服务才是那个可移植的写入层，
而 `setViewState` 仍是 Next 视口唯一的变更原语。它们同样不暴露
`getViewPresentation`；请改用
`viewportProjection.getPresentation(viewport, { selector })`。
旧版兼容适配器可能仍为老代码暴露 `getViewPresentation` 和 `setViewPresentation`，
但那些适配器只是一个临时迁移层，其中的旧相机 / 显示状态方法应当预期会在
后续某个破坏性版本中消失。

以前，旧代码或兼容代码可能这么写：

```ts
const presentation = viewport.getViewPresentation({
  pan: true,
  zoom: true,
});

viewport.setViewPresentation({
  zoom: presentation.zoom * 2,
});
```

直接使用 Next 的代码应该这么写：

```ts
const presentation = viewportProjection.getPresentation(viewport, {
  selector: {
    pan: true,
    zoom: true,
  },
});

const nextViewState = viewportProjection.withPresentation(viewport, {
  zoom: (presentation?.zoom ?? 1) * 2,
});

if (nextViewState) {
  viewport.setViewState(nextViewState);
}
```

不要让自定义投影适配器修改它所属的视口。它应当返回原生视图状态，
由调用方决定是否调用 `setViewState`。

## 新增一个适配器 {#adding-a-new-adapter}

为一个新的通用视口族新增适配器时：

1. 定义该视口族专属的快照与显示状态类型。
2. 基于当前语义状态和解析后的几何信息实现 `getSnapshot`。
3. 针对既有的公开视图显示状态结构实现 `getPresentation`。
4. 把 `withPresentation` 实现为「翻译回语义状态」的纯函数。
5. 只有当该视口能够产出渲染器输出时才实现 `applyToRenderer`。
6. 在通用视口的投影装配处注册该适配器。

适配器在 `withPresentation` 中不应修改视口。返回下一个语义状态，
由视口来决定如何应用它。

## 现有适配器 {#current-adapters}

平面投影使用：

- `PlanarViewState` 作为语义状态
- `PlanarSliceBasis` 和解析后的视图几何，用于数据/世界/画布的映射
- `PlanarResolvedICamera`，仅作为渲染器输出
- 针对旧版 `getZoom`、`getPan`、`getScale` 的兼容辅助函数

Volume3D 投影使用：

- 当前运行时的 VTK 相机作为状态来源
- 焦点（在可用时）作为语义位置
- 由 `parallelScale` 推导出的画布物理间距
- `ICamera` 作为渲染器输出

视频投影使用：

- `VideoViewState` 作为语义状态
- 媒体像素的固有坐标，用于世界/画布换算
- `mediaPoint` 位置标签
- `nativePixel` 缩放标签
- 可选的渲染器相机输出，用于旧版互操作

ECG 投影使用：

- `ECGViewState` 作为语义状态
- 形如 `[sampleIndex, amplitudeValue, channelIndex]` 的信号元组
- `signalPoint` 位置标签
- `signal` 缩放标签，携带每画布像素对应的采样数与数值单位
- 可选的渲染器相机输出，用于旧版互操作

WSI 投影使用：

- 从 OpenLayers 同步而来的 `WSIViewState`
- 来自 WSI 解析后视图的切片/世界变换
- `anchor` 位置标签
- 在渲染器相机输出能够提供时使用物理缩放

这样一来，跨视口的调用方面对的是同一个投影接口，
同时各视口族之间真实存在的差异也被保留了下来。
