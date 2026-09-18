---
id: generic-viewport
title: 通用视口
description: 采用通用视口（Generic Viewport）的迁移指南。说明如何通过 useGenericViewport 启用兼容模式、用 registerViewportType 扩展自定义视口类型、已移除的渲染引擎访问器与对应的能力守卫、把类型判断改为能力判断、setDataIds 到 setDisplaySets 的替换、显示状态按作用域拆分，以及相机兼容与平面相机状态差异。
keywords:
  - 通用视口迁移
  - useGenericViewport
  - registerViewportType
  - getStackViewport 已移除
  - viewportSupportsStackCompatibility
  - setDisplaySets
  - resetViewState
upstream: https://www.cornerstonejs.org/docs/migration-guides/5x/generic-viewport
---

# 通用视口迁移指南 {#generic-viewport-migration-guide}

通用视口带来了一批新的视口实现，以及一个可选的兼容模式——
用来把旧的视口类型转接到这些新实现上。

大多数「创建视口、然后调用标准数据 API」的应用代码，
通过兼容适配器仍然可以正常工作。最可能需要改动的，
是那些依赖具体视口类、旧渲染引擎访问器、通用 `setDataIds()`，
或直接判断 `viewport.type` 的代码。

## 如何启用通用视口 {#how-generic-viewport-is-enabled}

你可以直接请求一个通用视口类型来使用它：

```ts
renderingEngine.enableElement({
  viewportId,
  element,
  type: Enums.ViewportType.PLANAR_NEXT,
});
```

也可以让旧的视口创建方式接入由 Next 支撑的兼容适配器：

```ts
import { init } from '@cornerstonejs/core';

init({
  rendering: {
    useGenericViewport: true,
  },
});
```

当 `rendering.useGenericViewport` 为 true 时，旧的视口请求会在内部被重新映射：

| 请求的类型                  | 运行时类型                      |
| --------------------------- | ------------------------------- |
| `ViewportType.STACK`        | `ViewportType.PLANAR_NEXT`      |
| `ViewportType.ORTHOGRAPHIC` | `ViewportType.PLANAR_NEXT`      |
| `ViewportType.VIDEO`        | `ViewportType.VIDEO_NEXT`       |
| `ViewportType.ECG`          | `ViewportType.ECG_NEXT`         |
| `ViewportType.WHOLE_SLIDE`  | `ViewportType.WHOLE_SLIDE_NEXT` |
| `ViewportType.VOLUME_3D`    | `ViewportType.VOLUME_3D_NEXT`   |

直接使用通用视口类型的代码用新 API。被重新映射的旧视口类型则使用兼容适配器，
后者在适用的情况下保留了 `setStack()`、`setVolumes()`、`setVideo()`、
`setEcg()`、`setWSI()` 等旧方法。这些适配器只是一个临时迁移层，
不是 Next 的长期 API，其中的旧辅助方法应当预期会在后续某个破坏性版本中移除。

对同一个视口实例，请把这两套 API 分开使用：在兼容视口上用旧方法，
或者在直接使用的通用视口上用 `setDisplaySets()`、`addDisplaySet()` 这类通用方法。
在同一个视口上把旧式数据挂载和直接的通用数据挂载混着用，
可能导致旧的显示状态默认值与通用数据状态不同步。

## 扩展视口类型（新模式） {#extending-viewport-types-new-pattern}

### 什么时候你才真的需要一个新视口类型 {#when-you-actually-need-a-new-viewport-type}

内置视口类型覆盖的是一组固定的渲染路径：堆栈与体数据影像切面、三维体数据、
全片影像瓦片、视频帧，以及 ECG 波形。只有当你希望某个视口绘制的东西
不属于上述任何一条渲染路径所建模的对象时，才需要注册一个**新**类型。

一个典型例子是**用于数字孪生的三维轮廓视口**。Cornerstone 已经能渲染轮廓几何——
例如 DICOM RT Structure Set 的轮廓——但只能作为对齐到某个影像源视图的分割**叠加层**。
而数字孪生视图要把轮廓几何作为**主源数据**：底下没有影像，
因此轮廓本身定义了这个视图，包括导航和相机。既然没有内置的源渲染路径
把轮廓几何建模为主数据，那么一个自定义的 `Contour3D` 视口类就拥有它自己的
数据形态、渲染路径和视图状态，同时又能像其他视口一样接入渲染引擎、
投影服务和工具体系。

经验法则：只有面对真正全新的**数据形态**或**渲染路径**时才注册新类型。
如果你的需求能用既有视口的源/叠加绑定加显示状态表达出来，就那样做。

### 注册类型 {#registering-the-type}

内置和扩展的视口类型名都放在 **`Enums.ViewportTypes`** 上——
这是 enums 包里的一个运行时常量映射，不是旧的 `ViewportType` 枚举。

- **内置：** `Enums.ViewportTypes.STACK`、`Enums.ViewportTypes.PLANAR_NEXT` 等。
- **扩展：** 先 `registerViewportType({ name: 'Contour3D', ... })`，
  之后即可访问 `Enums.ViewportTypes.Contour3D`。
- **类型：** 用你导出的常量去增强 `ViewportTypeConstants`
  （以及为字符串取值联合类型增强 `ViewportTypeRegistry`）。
  `Enums.ViewportTypes` 的类型来自 `ViewportTypeConstants`，
  所以新键会自动获得正确的字面量类型。

已废弃的 `Enums.ViewportType` 枚举在运行时保持不变，
注册新类型时**不会**扩展它。

### 1）在一处声明名称与类型增强 {#1-declare-the-name-and-type-augmentation-in-one-place}

把名称和字符串取值导出为常量，再从它们派生出类型增强。这样字面量字符串
就只存在于一个文件里，其余每一步都引入这些常量而不是重新敲一遍。
由于这个文件现在带有运行时值，它是一个普通的 `.ts` 模块，而不是 `.d.ts`
（`.d.ts` 只含类型，无法产出 `export const`）。

```ts
// my-extension/src/viewportTypes.ts
import '@cornerstonejs/core';

// 本扩展视口类型的唯一可信来源。
export const CONTOUR_3D_NAME = 'Contour3D';
export const CONTOUR_3D_TYPE = 'myOrg:contour3d';

declare module '@cornerstonejs/core' {
  interface ViewportTypeRegistry {
    [CONTOUR_3D_TYPE]: typeof CONTOUR_3D_TYPE;
  }

  interface ViewportTypeConstants {
    readonly [CONTOUR_3D_NAME]: typeof CONTOUR_3D_TYPE;
  }
}
```

这里的计算键之所以合法，是因为两个常量都具有字符串字面量类型；
于是 `Enums.ViewportTypes.Contour3D` 和 `'myOrg:contour3d'` 这个字符串取值
都由这两条声明派生而来。

### 2）在运行时注册该类型 {#2-register-the-type-at-runtime}

引入常量并直接传给 `registerViewportType`。这次调用会按第 1 步的类型增强做检查：
`name` 被约束为已声明的键，`type` 被固定为该键对应的字符串取值，
因此配错的组合会在编译期报错。在这里引入 `viewportTypes.ts`
同时也会把它的 `declare module` 增强带进来，
所以凡是加载了这个模块的地方，`Enums.ViewportTypes` 上都会有这个新名称。

```ts
import { registerViewportType } from '@cornerstonejs/core';
import { CONTOUR_3D_NAME, CONTOUR_3D_TYPE } from './viewportTypes';

registerViewportType({
  name: CONTOUR_3D_NAME,
  type: CONTOUR_3D_TYPE,
  ViewportClass: Contour3DViewport,
});
```

这段代码执行之后，`Enums.ViewportTypes.Contour3D === 'myOrg:contour3d'`。

### 3）用注册好的类型启用元素 {#3-enable-elements-using-the-registered-type}

复用同一个常量，或者在注册完成、该访问器已被填充后使用 `Enums.ViewportTypes`：

```ts
import { Enums } from '@cornerstonejs/core';
import { CONTOUR_3D_TYPE } from './viewportTypes';

renderingEngine.enableElement({
  viewportId: 'digitalTwinViewport',
  element,
  type: CONTOUR_3D_TYPE, // 或 Enums.ViewportTypes.Contour3D
});
```

几点提示：

- 在你的扩展入口模块中调用 `registerViewportType(...)`，
  必须**早于**任何使用 `Enums.ViewportTypes.Contour3D` 的 `enableElement(...)`。
- `declare module` 只影响 TypeScript，它不会注册构造函数。
  运行时注册是必需的。
- 使用带命名空间的字符串取值（例如 `myOrg:contour3d`），避免扩展之间冲突。
- 引入 `CONTOUR_3D_TYPE` / `CONTOUR_3D_NAME`，而不要重新敲字面量。
  `Enums.ViewportTypes.Contour3D` 是那个类枚举的便捷访问器，
  注册之后它与 `CONTOUR_3D_TYPE` 等价。

依据 `viewport.type` 分支的代码也需要把运行时类型考虑进去。
直接使用的平面通用视口报告的是 `ViewportType.PLANAR_NEXT`；
而被重新映射的 stack 与 orthographic 兼容适配器对外仍然暴露它们被请求的旧类型，
内部则委托给平面通用实现。

## 已移除的渲染引擎访问器 {#removed-rendering-engine-accessors}

以下 `RenderingEngine` 方法已被移除：

- `getStackViewport(viewportId)`
- `getStackViewports()`
- `getVolumeViewports()`

这些方法是按具体的旧视口类来分类视口的。这在通用视口下无法可靠工作，
因为一个 `PLANAR_NEXT` 视口可以同时支持堆栈式和体数据式的行为，
却并不是 `StackViewport` 或 `VolumeViewport` 的实例。

请改用 `getViewport()` 配合能力守卫：

```ts
import { utilities } from '@cornerstonejs/core';

const viewport = renderingEngine.getViewport(viewportId);

if (!utilities.viewportSupportsStackCompatibility(viewport)) {
  throw new Error(`Viewport ${viewportId} does not support setStack`);
}

await viewport.setStack(imageIds);
```

获取视口列表时：

```ts
const stackViewports = renderingEngine
  .getViewports()
  .filter(utilities.viewportSupportsStackCompatibility);

const volumeViewports = renderingEngine
  .getViewports()
  .filter(utilities.viewportSupportsVolumeCompatibility);
```

可用的能力守卫包括：

- `viewportSupportsImageSlices`
- `viewportSupportsStackCompatibility`
- `viewportSupportsStackCalibration`
- `viewportSupportsVolumeCompatibility`
- `viewportSupportsVolumeActors`
- `viewportSupportsVolumeId`
- `viewportSupportsVolumeURI`

## 把类型判断改为能力判断 {#replace-class-checks-with-capability-checks}

这样的代码在通用视口下是脆弱的：

```ts
if (viewport instanceof StackViewport) {
  await viewport.setStack(imageIds);
}
```

优先判断你真正需要的那个行为：

```ts
if (utilities.viewportSupportsStackCompatibility(viewport)) {
  await viewport.setStack(imageIds);
}
```

对 `BaseVolumeViewport`、`VolumeViewport` 和 `VolumeViewport3D` 的判断同理。
当代码需要 `setVolumes()`、访问 actor、判断 volume id 或 volume URI 时，
请使用体数据相关的能力守卫。

## 小心使用 `viewport.type` {#be-careful-with-viewporttype}

如果启用了 `rendering.useGenericViewport`，那么以 `ViewportType.STACK` 或
`ViewportType.ORTHOGRAPHIC` 请求的视口，其运行时类型是
`ViewportType.PLANAR_NEXT`。

以前：

```ts
if (viewport.type === Enums.ViewportType.STACK) {
  // 堆栈专用路径
}
```

改为：

```ts
if (utilities.viewportSupportsImageSlices(viewport)) {
  // 影像切面路径
}
```

当你确实需要知道运行时实现时才用 `viewport.type`；
当你需要知道支持哪些操作时，用能力守卫。

## 通用的 `setDataIds()` 已被替换 {#generic-setdataids-is-replaced}

通用基类上的 `Viewport.setDataIds()` API 已被可变参数的 `setDisplaySets()` 替换。

直接使用通用视口的代码应当先注册逻辑显示集 id，再把它们挂载上去：

```ts
import { Enums, utilities, type PlanarViewport } from '@cornerstonejs/core';

const viewport = renderingEngine.getViewport<PlanarViewport>(viewportId);
const displaySetId = 'ct-stack';

utilities.genericViewportDisplaySetMetadataProvider.add(displaySetId, {
  kind: 'planar',
  imageIds,
  initialImageIdIndex: 0,
});

await viewport.setDisplaySets({
  displaySetId,
  options: {
    orientation: Enums.OrientationAxis.AXIAL,
  },
});
```

对基于体数据的平面切面，在注册的显示集里带上 `volumeId`：

```ts
utilities.genericViewportDisplaySetMetadataProvider.add(displaySetId, {
  kind: 'planar',
  imageIds,
  initialImageIdIndex: Math.floor(imageIds.length / 2),
  volumeId,
});
```

如果你是通过 `rendering.useGenericViewport` 使用被重新映射的旧视口类型，
迁移期间建议先保留旧方法：

```ts
await viewport.setStack(imageIds);
await viewport.setVolumes([{ volumeId }]);
```

## 直接使用的通用视口要用显示集 API {#direct-generic-viewports-use-display-set-apis}

以下这些直接使用的通用视口类型应当使用 `setDisplaySets()` 或 `addDisplaySet()`：

- `ViewportType.PLANAR_NEXT`
- `ViewportType.VIDEO_NEXT`
- `ViewportType.ECG_NEXT`
- `ViewportType.WHOLE_SLIDE_NEXT`
- `ViewportType.VOLUME_3D_NEXT`

不要假定直接使用的通用视口会暴露那些旧的数据加载方法名。
例如直接使用 `PLANAR_NEXT` 的代码应当用 `setDisplaySets()`，
而不是 `setStack()` 或 `setVolumes()`。

## 显示状态按作用域拆分 {#presentation-is-split-by-scope}

通用视口把视口导航与「每份数据各自的外观」分开了：

- 视图显示状态：平移、缩放（或 scale）、旋转、翻转和显示区域。
  直接使用的 Next 视口通过 `viewportProjection` 暴露这部分，
  而不是通过视口实例方法。
- 数据显示状态：某一份已挂载数据集的 VOI、不透明度、颜色映射表、
  混合模式、插值方式和可见性。

以前：

```ts
viewport.setProperties({
  voiRange,
  colormap,
  invert: true,
});
```

直接使用 Next 的 API：

```ts
viewport.setDisplaySetPresentation(displaySetId, {
  voiRange,
  colormap,
  invert: true,
});
```

旧版兼容适配器保留了 `setProperties()`，并在内部把这些值映射到显示集的显示状态上，
但这仅为迁移用途。由于这些适配器是临时的，能够直接迁到 Next 的代码
应当改用 `setDisplaySetPresentation()`。

## 相机兼容 {#camera-compatibility}

旧版适配器仍然暴露 `getCamera()` 和 `setCamera()`，
但干净的 Next 视口代码应当使用语义化 API。请把适配器上的这些方法视为
临时的迁移兼容，预期它们会在后续某个破坏性版本中移除，
而不要当作稳定的 Next 相机 API。`ViewState` 才是视口的唯一可信来源，
`setViewState()` 和 `updateViewState()` 是直接使用 Next 时的变更路径。

```ts
viewport.setViewState({
  flipHorizontal: true,
  rotation: 90,
});

viewport.updateViewState(({ rotation = 0 }) => ({
  rotation: rotation + 30,
}));

const nextViewState = viewportProjection.withPresentation(viewport, {
  zoom: 1.5,
  pan: [40, -20],
});

if (nextViewState) {
  viewport.setViewState(nextViewState);
}
```

读取显示状态请走投影服务：

```ts
const presentation = viewportProjection.getPresentation(viewport, {
  selector: {
    pan: true,
    zoom: true,
    rotation: true,
  },
});
```

直接使用的 Next 视口不暴露 `getViewPresentation()` 和 `setViewPresentation()`。
旧版兼容适配器可能仍然暴露这些方法，并把它们委托为
`viewportProjection.withPresentation(...)` 后接 `setViewState(...)`。
这些兼容方法是临时的，不应在新的 Next 代码中使用，
并且应当预期它们会在后续某个破坏性版本中移除。

以前：

```ts
viewport.setCamera({
  focalPoint,
  position,
});
```

现在，做显示导航：

```ts
const nextViewState = viewportProjection.withPresentation(viewport, {
  zoom: 2,
});

if (nextViewState) {
  viewport.setViewState(nextViewState);
}
```

跨视口的空间导航请使用引用：

```ts
targetViewport.setViewReference(sourceViewport.getViewReference());
targetViewport.render();
```

对平面兼容适配器而言，只带位置的相机补丁是不被支持的：

```ts
viewport.setCamera({ position });
```

请改用 `focalPoint`、`parallelScale`、`setViewState()`、`updateViewState()`、
视口投影，或视图引用这几套 API。

对于那些需要在不经过视口的情况下派生渲染器相机的自定义同步器和工具，
另有一批更底层的平面相机辅助函数。它们被归在 `planarProjection`
命名空间导出下，以表明它们位于稳定视口 API 之下一层，
并且可能在 3.0 稳定版之前发生变化：

```ts
import { planarProjection } from '@cornerstonejs/core';

const sliceBasis = planarProjection.createImageSliceBasis({
  image,
  canvasWidth,
  canvasHeight,
});
const icamera = planarProjection.resolveICamera({
  sliceBasis,
  camera: viewState,
  canvasWidth,
  canvasHeight,
});
planarProjection.applyToRenderer({ renderer, activeSourceICamera: icamera });
```

该命名空间还暴露了 `derivePresentation`（在画布空间中计算平移/缩放/旋转，
不含世界空间焦点那一步）和 `createVolumeSliceBasis`（用于基于体数据的平面视口）。
请把它们当作围绕平面相机模型的辅助 API，而不是主要的视口控制接口。

## 平面相机状态的差异 {#planar-camera-state-differences}

平面通用视口把「缩放到某点」的锚点作为语义化视图状态存储。
当一个存下来的锚点在另一张切片上被重放时，该锚点会被投影到当前切片平面上。
这能保证相机停留在平面内，但它在切片变化之间是不可逆的：
如果 cine 或同步代码在切片 N 上存下相机、在切片 M 上重放、之后又回到切片 N，
就可能看到锚点漂移。切片的空间同步请使用视图引用，
并把视图显示状态当作仅用于显示的状态。

当 `viewState.displayArea.scaleMode` 和 `viewState.scaleMode` 同时被设置时，
显示区域的缩放模式优先。除非你确实想让显示区域覆盖更大范围的视图状态缩放模式，
否则这两个字段只设置其中一个。

`PlanarViewport.resetViewState({ resetPan, resetZoom })` 默认会重置平移、缩放、
旋转、方位和翻转这些显示状态，但**不会**重置当前切片。
传入 `resetOrientation: false` 或 `resetFlip: false` 可以保留相应字段。
旧的堆栈与体数据视口通过兼容适配器暴露 `resetCamera`，
但这个名字属于临时迁移 API，应当预期会在后续某个破坏性版本中移除。
新的 Next 代码应当在直接使用的 Next 视口上调用 `resetViewState`，
并对那些不希望跟随默认重置的字段显式调用 `setImageIdIndex`、
`setOrientation` 或 `setViewState`。

## 事件与启用元素的注意事项 {#event-and-enabled-element-notes}

有些事件字段和启用元素字段现在是可选的，
因为并非每个 Next 视口在任何时刻都有参考坐标系或旧的相机快照：

- `CameraModifiedEventDetail.previousCamera`
- `CameraModifiedEventDetail.element`
- `CameraResetEventDetail.element`
- `IEnabledElement.FrameOfReferenceUID`

使用这些字段前请先做保护判断。

## 迁移检查清单 {#migration-checklist}

在你的代码库里搜索这些模式：

```sh
rg "getStackViewport|getStackViewports|getVolumeViewports|setDataIds"
rg "instanceof (StackViewport|VolumeViewport|BaseVolumeViewport|VolumeViewport3D)"
rg "viewport\.type === Enums\.ViewportType\.(STACK|ORTHOGRAPHIC|VIDEO|ECG|WHOLE_SLIDE|VOLUME_3D)"
rg "setCamera\(\{\s*position"
```

然后按这个顺序迁移：

1. 把已移除的渲染引擎访问器替换为 `getViewport()` 或 `getViewports()`
   加能力守卫。
2. 把具体类型判断替换为能力守卫。
3. 如果要启用 `rendering.useGenericViewport`，请审查那些针对旧类型的
   `viewport.type` 判断——它们现在以 Next 运行时类型运行。
4. 对直接使用的通用视口，把通用的 `setDataIds()` 和旧的数据加载调用
   替换为逻辑显示集 id 加 `setDisplaySets()`。
5. 把干净 Next 代码中的显示状态设置从 `setProperties()` 迁移到
   `setDisplaySetPresentation(displaySetId, ...)`。
6. 把持久化的相机状态存储替换为 `ViewState`、`viewportProjection`
   或视图引用这几套 API。
