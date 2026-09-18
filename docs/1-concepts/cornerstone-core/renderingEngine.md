---
id: renderingEngine
title: 渲染引擎
description: 渲染引擎（RenderingEngine）负责创建视口、把视口关联到页面上的 HTML 元素，并借助离屏 WebGL 画布把数据渲染出来。本文说明屏上与离屏渲染的差异、共享体数据 mapper、TiledRenderingEngine 与 ContextPoolRenderingEngine 两种实现的取舍与配置，以及创建视口的两种方式。
keywords:
  - 渲染引擎
  - RenderingEngine
  - 离屏渲染
  - TiledRenderingEngine
  - ContextPoolRenderingEngine
  - webGLContextCount
  - setViewports
  - enableElement
upstream: https://www.cornerstonejs.org/docs/concepts/cornerstone-core/renderingEngine
---

# 渲染引擎 {#rendering-engine}

`RenderingEngine` 让使用者能够创建视口、把这些视口与页面上的 HTML 元素关联起来，
并借助一块离屏 WebGL 画布把数据渲染到这些元素上。

需要说明的是，`RenderingEngine` 本身就能渲染多个视口，你并不需要创建多个引擎。
不过确实可以创建多个 `RenderingEngine` 实例——例如你想做多显示器方案、
并用各自独立的 WebGL 上下文渲染每台显示器上的视口时。

在 `Cornerstone3D` 中，`RenderingEngine` 是我们从零构建的，
并以 [vtk.js](https://github.com/kitware/vtk-js) 作为渲染的底层支撑。
`vtk.js` 是一个三维渲染库，能够利用 WebGL 做 GPU 加速渲染。

## 屏上渲染与离屏渲染 {#onscreen-and-offscreen-rendering}

在早前的 Cornerstone（旧版）中，我们用一块 WebGL 画布处理每个视口的数据。
这种做法扩展性不好：随着视口数量增加，以及面对复杂的影像使用场景
（例如相互同步的视口），最终会产生大量对屏上画布的更新，
性能随视口数量增加而下降。

在 `Cornerstone3D` 中，我们在离屏画布上处理数据。也就是说，
我们有一块很大的、不可见的画布（离屏画布），它把所有屏上画布都包含在自己内部。
当用户操作数据时，离屏画布上相应的像素会被更新；到渲染时，
我们再为每个视口把内容从离屏拷贝到屏上。由于拷贝过程比每次操作都重新渲染
各个视口快得多，性能下降的问题就此解决。

## 共享体数据 Mapper {#shared-volume-mappers}

`vtk.js` 提供了我们用于渲染的标准渲染能力。在此之外，`Cornerstone3D` 还引入了
**共享体数据 Mapper**（Shared Volume Mappers），
使任何需要某份纹理的视口都能复用它，而不必复制数据。

举例来说，PET-CT 融合使用 3×3 布局，包含 CT（轴位、矢状位、冠状位）、
PET（轴位、矢状位、冠状位）和融合（轴位、矢状位、冠状位）。
我们分别为 CT 和 PET 各创建一个体数据 mapper，
而融合视口则复用这两份已创建的纹理，而不是重新创建新的。

## 渲染引擎的两种实现 {#rendering-engine-implementations}

Cornerstone3D 提供两种渲染引擎实现，以应对不同的使用场景、并克服技术限制：

### TiledRenderingEngine {#tiledrenderingengine}

`TiledRenderingEngine` 是最初的实现，它为所有视口使用同一块大型离屏画布。
这种方案：

- 创建一块巨大的离屏画布，并随着视口的添加在水平方向扩展
- 把所有视口渲染到这块单一离屏画布上的特定坐标处
- 再把像素数据从离屏画布拷贝到各个屏上视口

**TiledRenderingEngine 的限制：**

- **画布尺寸上限**：浏览器对画布尺寸设有上限（例如 Chrome 中为 16,384px）。
  当所有视口的总宽度超过这个上限时，离屏画布会被静默裁切，
  造成严重的视觉错乱、视口错位和空白视口。
- **性能下降**：当离屏画布接近尺寸上限时，性能会显著下降，
  在高分辨率显示器或视口数量很多的布局下尤其明显。
- **多显示器问题**：由于画布尺寸限制，几乎无法用于多台高分辨率显示器。
- **内存占用**：无论实际用到多少视口，都会分配一块巨大且耗内存的离屏画布。

**TiledRenderingEngine 的优点：**

- **简单**：实现直白，在视口数量较少时工作良好。
- **久经检验**：五年来可靠性得到验证，对大多数基础场景表现足够好。

### ContextPoolRenderingEngine（SequentialRenderingEngine） {#contextpoolrenderingengine-sequentialrenderingengine}

`ContextPoolRenderingEngine`（内部名为 `SequentialRenderingEngine`）
通过一种不同的渲染策略，从根本上解决了平铺方案的那些限制：

- 把每个视口分别渲染到一块与该视口等大的离屏画布上
- 再把结果拷贝到对应的屏上画布
- 然后顺序处理下一个视口，复用同一块离屏画布
- 利用 WebGL 上下文池做批量渲染（例如 8 个 WebGL 上下文就以 8 个为一批）

**ContextPoolRenderingEngine 的优点：**

- **没有画布尺寸上限问题**：浏览器的最大画布尺寸现在只作用于单个视口，
  而不是所有视口的总宽度。
- **性能提升**：无论视口数量或显示分辨率如何，性能都保持稳定。
- **更好的内存使用**：避免分配巨大的离屏画布。
- **支持多显示器**：能在多台高分辨率显示器上流畅工作。
- **稳定性更好**：减少了因超大画布表面而导致的 WebGL 上下文丢失。

### 配置渲染引擎 {#configuring-the-rendering-engine}

`ContextPoolRenderingEngine` 现在是 Cornerstone3D 的默认实现。
如果你需要使用旧的 `TiledRenderingEngine`，可以在初始化时配置：

```js
import { init } from '@cornerstonejs/core';

// 使用旧的 TiledRenderingEngine
init({
  rendering: {
    renderingEngineMode: 'standard',
  },
});

// ContextPoolRenderingEngine 是默认值，你也可以显式指定它
init({
  rendering: {
    renderingEngineMode: 'next',
  },
});
```

对 `ContextPoolRenderingEngine`，你还可以配置批量渲染所用的 WebGL 上下文数量：

```js
import { init } from '@cornerstonejs/core';

// 使用 ContextPoolRenderingEngine 并指定 WebGL 上下文数量
init({
  rendering: {
    renderingEngineMode: 'next',
    webGLContextCount: 7, // 默认为 7，可根据需要调整
  },
});
```

## 一般用法 {#general-usage}

创建好 renderingEngine 之后，就可以给它分配视口用于渲染。
创建 `Stack` 或 `Volume` 视口主要有两种方式，下面分别介绍。

### 实例化一个 `RenderingEngine` {#instantiating-a-renderingengine}

调用 `new RenderingEngine()` 即可实例化一个 `RenderingEngine`。

```js
import { RenderingEngine } from '@cornerstonejs/core';

const renderingEngineId = 'myEngine';
const renderingEngine = new RenderingEngine(renderingEngineId);
```

### 创建视口 {#viewport-creation}

接下来可以用两种方式创建视口：`setViewports`，或者 `enable`/`disable` 这组 API。
两种方式都需要传入一个 ViewportInput 对象作为参数。

```js
PublicViewportInput = {
  /** DOM 中的 HTML 元素 */
  element: HTMLDivElement
  /** 该视口在 renderingEngine 内的唯一 id */
  viewportId: string
  /** 视口类型，VolumeViewport 或 StackViewport */
  type: ViewportType
  /** 视口的选项 */
  defaultOptions: ViewportInputOptions
}
```

#### setViewports API {#setviewports-api}

`setViewports` 方法适合一次性创建一组视口。传入视口数组之后，
`renderingEngine` 会把它的离屏画布尺寸调整为所提供画布的尺寸，
并触发相应的事件。

```js
const viewportInput = [
  // CT 体数据视口 —— 轴位
  {
    viewportId: 'ctAxial',
    type: ViewportType.ORTHOGRAPHIC,
    element: htmlElement1,
    defaultOptions: {
      orientation: Enums.OrientationAxis.AXIAL,
    },
  },
  // CT 体数据视口 —— 矢状位
  {
    viewportId: 'ctSagittal',
    type: ViewportType.ORTHOGRAPHIC,
    element: htmlElement2,
    defaultOptions: {
      orientation: Enums.OrientationAxis.SAGITTAL,
    },
  },
  // CT 轴位堆栈视口
  {
    viewportId: 'ctStack',
    type: ViewportType.STACK,
    element: htmlElement3,
    defaultOptions: {
      orientation: Enums.OrientationAxis.AXIAL,
    },
  },
];

renderingEngine.setViewports(viewportInput);
```

#### Enable / Disable API {#enabledisable-api}

如果需要对每个视口的启用 / 禁用做完全控制，可以使用 `enableElement`
和 `disableElement` 这组 API。启用某个元素之后，
`renderingEngine` 会依据这个新元素调整自身的尺寸和状态。

```js
const viewport = {
  viewportId: 'ctAxial',
  type: ViewportType.ORTHOGRAPHIC,
  element: element1,
  defaultOptions: {
    orientation: Enums.OrientationAxis.AXIAL,
  },
};

renderingEngine.enableElement(viewport);
```

你可以用视口的 `viewportId` 来禁用任意视口；禁用之后，
renderingEngine 会重新调整其离屏画布的尺寸。

```js
renderingEngine.disableElement(viewportId: string)
```
