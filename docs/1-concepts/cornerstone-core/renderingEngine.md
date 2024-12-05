---  
id: renderingEngine  
title: 渲染引擎  
---  

# 渲染引擎  

`RenderingEngine` 允许用户创建视口，将这些视口与屏幕上的 HTML 元素关联，并使用离屏 WebGL 画布将数据渲染到这些元素上。

需要注意的是，`RenderingEngine` 能够渲染多个视口，因此不需要创建多个引擎。然而，也可以创建多个 `RenderingEngine` 实例，例如，如果你希望拥有多个显示器的设置，并使用独立的 WebGL 上下文渲染每个显示器的视口。

在 `Cornerstone3D` 中，我们从头开始构建了 `RenderingEngine`，并使用 [vtk.js](https://github.com/kitware/vtk-js) 作为渲染的核心。`vtk.js` 是一个 3D 渲染库，能够使用 WebGL 进行 GPU 加速渲染。

## 屏幕渲染和离屏渲染

在之前的 Cornerstone（遗留版）中，我们使用 WebGL 画布在每个视口中处理数据。这种方式扩展性较差，因为随着视口数量的增加，对于复杂的成像用例（例如同步视口），我们会面临许多屏幕画布更新，性能随着视口数量的增加而下降。

在 `Cornerstone3D` 中，我们在离屏画布中处理数据。这意味着我们有一个大型的不可见画布（离屏），其中包含所有屏幕上的画布。当用户操作数据时，离屏画布中的相应像素会被更新，在渲染时，我们将离屏内容复制到每个视口的屏幕画布上。由于复制过程比每次操作后重新渲染每个视口要快得多，因此我们解决了性能下降的问题。

## 共享体积映射器

`vtk.js` 提供了标准的渲染功能，我们使用这些功能进行渲染。此外，在 `Cornerstone3D` 中，我们引入了 `共享体积映射器`，以便在需要时重复使用纹理，而无需重复数据。

例如，对于具有 3x3 布局的 PET-CT 融合图像（包括 CT（轴位、矢状位、冠状位）、PET（轴位、矢状位、冠状位）和融合（轴位、矢状位、冠状位）），我们分别为 CT 和 PET 创建两个体积映射器，对于融合视口，我们重复使用已创建的纹理，而不是重新创建一个新的纹理。

## 一般用法

创建 `RenderingEngine` 后，我们可以将视口分配给它进行渲染。创建 `Stack` 或 `Volume` 视口有两种主要方法，接下来我们将讨论这些方法。

### 实例化 `RenderingEngine`

你可以通过调用 `new RenderingEngine()` 方法实例化一个 `RenderingEngine`。

```js
import { RenderingEngine } from '@cornerstonejs/core';

const renderingEngineId = 'myEngine';
const renderingEngine = new RenderingEngine(renderingEngineId);
```

### 视口创建

然后，你可以使用两种方法来创建视口：`setViewports` 或 `enable/disable` API。对于这两种方法，都会传递一个 ViewportInput 对象作为参数。

```js
PublicViewportInput = {
  /** DOM 中的 HTML 元素 */
  element: HTMLDivElement
  /** 渲染引擎中的视口唯一 ID */
  viewportId: string
  /** 视口类型：VolumeViewport 或 StackViewport */
  type: ViewportType
  /** 视口的选项 */
  defaultOptions: ViewportInputOptions
}
```

#### setViewports API

`setViewports` 方法适用于一次性创建多个视口。在设置视口数组后，`renderingEngine` 会调整其离屏画布的大小，以适应提供的画布大小，并触发相应的事件。

```js
const viewportInput = [
  // CT 体积视口 - 轴位
  {
    viewportId: 'ctAxial',
    type: ViewportType.ORTHOGRAPHIC,
    element: htmlElement1,
    defaultOptions: {
      orientation: Enums.OrientationAxis.AXIAL,
    },
  },
  // CT 体积视口 - 矢状位
  {
    viewportId: 'ctSagittal',
    type: ViewportType.ORTHOGRAPHIC,
    element: htmlElement2,
    defaultOptions: {
      orientation: Enums.OrientationAxis.SAGITTAL,
    },
  },
  // CT 轴位堆叠视口
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

#### 启用/禁用 API

为了对每个视口进行单独启用/禁用的完全控制，你可以使用 `enableElement` 和 `disableElement` API。启用元素后，`renderingEngine` 会调整其大小和状态以适应新元素。

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

你可以通过使用视口的 `viewportId` 禁用任何视口，禁用后，`renderingEngine` 会调整其离屏画布的大小。

```js
renderingEngine.disableElement(viewportId: string)
```