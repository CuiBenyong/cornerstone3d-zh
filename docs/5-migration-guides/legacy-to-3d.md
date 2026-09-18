---
id: legacy-to-3d
title: 从旧版迁移到 Cornerstone3D 1.0
description: 从旧版 Cornerstone 迁移到 Cornerstone3D 1.0 的完整对照指南。逐项对比 init、enabledElement、loadAndCacheImage、displayImage、updateImage、disable、坐标换算与 getPixels 的新旧写法，并给出事件数据结构的变化及其缘由。
keywords:
  - 旧版 Cornerstone 迁移
  - legacy to 3D
  - enableElement
  - setStack
  - canvasToWorld
  - getImageData
  - 世界坐标
  - 事件结构变化
upstream: https://www.cornerstonejs.org/docs/migration-guides/legacy-to-3d
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 从旧版迁移到 1.0 {#legacy-to-10}

随着我们转向 `Cornerstone3D` 库，我们引入了一套新的 API，
它与旧的 `Cornerstone` 库并不向后兼容。本页为已经在用旧版 `Cornerstone`
的用户提供一份迁移指南。

:::note Important
请注意这份内容仍在完善中，我们还在继续补全这些迁移指南。
:::

### init {#init}

旧版 `Cornerstone` 不需要初始化，但旧版 `CornerstoneTools` 需要初始化。
在 `Cornerstone3D` 中，core 和 tools **两者**在使用前都需要初始化。

<Tabs>
<TabItem value="cornerstone" label="Cornerstone（旧版）">

```js
cornerstoneTools.init();
```

</TabItem>

<TabItem value="cornerstone3D" label="Cornerstone3D">

```js
// 检测 GPU，并决定使用 GPU 渲染还是回退到 CPU
cornerstone3D.init();
cornerstone3DTools.init();
```

</TabItem>
</Tabs>

### enabledElement {#enabledelement}

`Cornerstone3D` 中的「已启用元素」不像 Cornerstone 那样孤立存在。
设置布局时，元素是作为输出目标与某个渲染引擎绑定在一起的；
绑定发生时，它们才被视为「已启用」。

`Cornerstone3D` 为此提供了两个 API：

- `setViewports`：一次性启用一组视口
- `enableElement`：一次启用一个视口

<Tabs>
<TabItem value="cornerstone" label="Cornerstone（旧版）">

```js
const element = document.getElementById('div-element');
cornerstone.enable(element);

// 触发 ELEMENT_ENABLED 事件
```

</TabItem>

<TabItem value="cornerstone3D" label="Cornerstone3D">

```js
const element = document.getElementById("viewport-HTML-element");
const renderingEngine = new RenderingEngine();

// API1：setViewports
renderingEngine.setViewports([
  {
    viewportId: "CTAxial",
    type: ViewportType.ORTHOGRAPHIC,
    element,
    defaultOptions: {
      orientation: Enums.OrientationAxis.AXIAL,
    },
  },
]);

// API2：enableElement
renderingEngine.enableElement({
  viewportId: "CTAxial",
  type: ViewportType.ORTHOGRAPHIC,
  element,
  defaultOptions: {
    orientation: Enums.OrientationAxis.AXIAL,
  },
});


// ELEMENT_ENABLED 的 eventDetail 包含：
{
  element,
  viewportId,
  renderingEngineId,
}
```

</TabItem>
</Tabs>

### loadAndCacheImage {#loadandcacheimage}

在旧版 Cornerstone 中，你会用 `loadAndCacheImage` API 加载并缓存影像。
但在 `Cornerstone3D` 中，应当用视口的 API 来加载和缓存影像。

<Tabs>
<TabItem value="cornerstone" label="Cornerstone（旧版）">

```js
cornerstone.loadAndCacheImage(imageId).then((image) => {
  // 做事情，例如显示一张影像
});
```

</TabItem>

<TabItem value="cornerstone3D" label="Cornerstone3D">

```js
const viewport = renderingEngine.getViewport('CTViewport');

// 堆栈里只有一张影像
await viewport.setStack([imageId]);

// 多个 imageId
await viewport.setStack(
  [imageId1, imageId2],
  1 // 第 1 帧
);
```

</TabItem>
</Tabs>

### displayImage {#displayimage}

这里的差别在于：你现在是**按视口**设置数据，而不像 Cornerstone 那样按元素设置。
视口稍后被渲染时，会把视口实例返回给你，
其上带有访问 HTML 元素、渲染器等等的辅助方法。

<Tabs>
<TabItem value="cornerstone" label="Cornerstone（旧版）">

```js
cornerstone.displayImage(image, element);

// 触发 cornerstone.events.IMAGE_RENDERED
// 其 eventDetail 如下
const eventDetail = {
  viewport: enabledElement.viewport,
  element,
  image,
  enabledElement,
  canvasContext: enabledElement.canvas.getContext('2d'),
  renderTimeInMs,
};
```

</TabItem>

<TabItem value="cornerstone3D" label="Cornerstone3D">

```js

// 上一节 `loadAndCacheImage` 已经给出了设置堆栈的例子，
// 这里给出体数据的例子

// 把一组 imageId 定义为一份体数据。
const ctVolume = await cornerstone3D.volumeLoader.createAndCacheVolume(
  volumeId,
  { imageIds: volumeImageIds}
)

// 加载该体数据，每个 imageId 都会回调一次
ctVolume.load(callback)

// 传给该回调的 eventDetail（当前）形如：

// 成功：
{
  success: true,
  imageIdIndex, // 体数据内的 Z 索引
  imageId, // 该 imageId
  framesLoaded, // 已成功加载的帧总数
  framesProcessed, // 已处理的帧总数（成功 + 失败）
  numFrames, // 该体数据的帧总数
}

// 失败：
{
  success: false,
  imageId,
  imageIdIndex,
  framesLoaded,
  framesProcessed,
  numFrames,
  error, // 由 imageLoader 给出的错误
}
```

</TabItem>
</Tabs>

### updateImage {#updateimage}

目前的思路基本相同，只是我们提供了三个不同的辅助方法可用于触发渲染：

- 某个渲染引擎下的所有视口。
- 单个视口。

当使用那些可能同时影响多个、且都需要更新的视口的工具时
（例如在三个正交 MPR 视图上同时跳到某个十字定位线位置），
这些便捷辅助方法就很有用。

<Tabs>
<TabItem value="cornerstone" label="Cornerstone（旧版）">

```js
cornerstone.updateImage(element, invalidated);
```

</TabItem>

<TabItem value="cornerstone3D" label="Cornerstone3D">

```js
// 更新该渲染引擎下的每一个视口。
renderingEngine.render()

// 更新单个视口
const myViewport = myScene.getViewport('myViewportId')
myViewport.render()

// 所有视口都会触发 IMAGE_RENDERED 事件，其 eventDetail 为：
eventDetail: {
  viewport,
}
```

</TabItem>
</Tabs>

### disable {#disable}

视口何时被启用 / 禁用由渲染引擎控制，它会在需要时触发相应的事件。

<Tabs>
<TabItem value="cornerstone" label="Cornerstone（旧版）">

```js
cornerstone.disable(element);
// 触发 ELEMENT_DISABLED 事件
```

</TabItem>

<TabItem value="cornerstone3D" label="Cornerstone3D">

```js
renderingEngine.disableElement(element);

// 每一个未被保留的画布都会触发一次 element disabled 事件。

// 或者

// 这会销毁所有元素。
renderingEngine.destroy();

// ELEMENT_DISABLED 事件只包含指向那个已被禁用画布元素的引用，以及相关的各个 ID。

eventDetail: {
  (viewportId, renderingEngineId, canvas);
}
```

</TabItem>
</Tabs>

### pageToPixel 与 pixelToCanvas {#pagetopixel-and-pixeltocanvas}

我们不再一次只渲染一张影像。在 `Cornerstone3D` 中，
视口渲染的是三维空间中某个特定的平面，由相机参数
（焦点、视锥体、裁剪范围等）决定。数据和标注都存储在三维空间中
（「世界空间」，按参考坐标系划分），因此要在屏幕上与标注交互、
并渲染出它们的呈现形式，你就必须能在画布空间与世界空间之间做换算。

需要说明的是，为了让堆栈视口与体数据视口能共用工具，
我们也在三维空间中渲染堆栈视口。所以本质上，
它们就是依据自身元数据在空间中定好位置和方位的二维影像。

<Tabs>
<TabItem value="cornerstone" label="Cornerstone（旧版）">

```js
// 坐标映射函数
cornerstone.pageToPixel(element, pageX, pageY);
cornerstone.pixelToCanvas(element, { x, y });
```

</TabItem>

<TabItem value="cornerstone3D" label="Cornerstone3D">

```js
const canvasCoord = viewport.canvasToWorld([xCanvas, yCanvas]);
const worldCoord = viewport.worldToCanvas([xWorld, yWorld, zWorld]);
```

</TabItem>
</Tabs>

### getPixels {#getpixels}

`getPixels` 那套做法在三维下不再成立，因为你可能正在以任意（斜切）平面查看数据。
此外，该视口里可能正在渲染包含多份体数据的融合结果（例如 PET/CT）。
开发者现在需要自己取得数据数组，再按各自的具体场景使用这些数据。

<Tabs>
<TabItem value="cornerstone" label="Cornerstone（旧版）">

```js
cornerstone.getPixels(element, x, y, width, height);
```

</TabItem>

<TabItem value="cornerstone3D" label="Cornerstone3D">

```js
const {
  dimensions,
  direction,
  spacing,
  origin,
  scalarData,
  imageData,
  metadata,
} = viewport.getImageData();

/**
 *
 * 你可以取得 vtkImageData 来获取像素信息
 *
 * - `dimensions` —— 该体数据的 x、y、z 维度
 * - `spacing` —— 该体数据的 x、y、z 间距
 * - `origin` —— 第一个体素中心的 x、y、z 位置
 * - `direction` —— 行、列和法向的方向余弦
 * - `imageData` —— 底层的 vtkImageData 对象（底层 vtk.js 渲染库中用于渲染的那个对象）
 * - `scalarData` —— 一个 TypedArray（例如 Float32Array），包含该体数据全部体素的取值。
 *   通过 VTK API 也可以用 vtkImageData 底层 vtkDataArray 的 getScalars() 来访问。
 *
 */
```

</TabItem>
</Tabs>

## 事件 {#events}

下表展示了事件数据结构的一些预期变化。关键差异在于：

- 若干 ID 会作为核心 API 方法的查找键（renderingEngineId、viewportId、volumeId）。
  这类似于目前自定义事件中提供的 `enabledElement` 属性，
  可用来取得正在被可视化的全部影像数据。
- 交互发生时的状态快照，会以该视口参考坐标系下的世界坐标返回相机属性和坐标。

<table style={{tableLayout:"fixed", display: "block", width: "100%"}}>
<thead>
  <tr>
    <th>CornerstoneTools</th>
    <th>CornerstoneTools3D</th>
    <th>结构变化的原因</th>
  </tr>
</thead>
<tbody>
  <tr>
    <td>无</td>
    <td>renderingEngineId</td>
    <td>驱动该视口的渲染引擎实例的 Id。</td>
  </tr>
  <tr>
    <td>无</td>
    <td>viewportId</td>
    <td>该视口自身的 Id。</td>
  </tr>
  <tr>
<td>
<div style={{width: "300px"}}>

```js
viewport: {
  scale,
  translation: { x, y },
  voi: { windowWidth, windowCenter, windowWidth, windowCenter},
  invert,
  pixelReplication,
  rotation,
  hflip,
  vflip,
  modalityLUT,
  voiLUT,
  colormap,
  labelmap,
  displayedArea: {
    tlhc: { x, y },
    brhc: { x, y },
    rowPixelSpacing,
    columnPixelSpacing,
    presentationSizeMode: 'NONE'
  }
}
```

</div>
</td>
<td>
<div style={{width: "300px"}}>

```js
camera: {
  (viewUp,
    viewPlaneNormal,
    position,
    focalPoint,
    orthogonalOrPerspective,
    viewAngle);
}
```

</div>
</td>
    <td>以前 viewport 描述的是二维状态，而要唯一确定三维视图我们需要更多信息。
    水平和垂直翻转不再是对视图的改动，而是施加在场景中体数据 actor 本身上的一个变换。</td>
  </tr>
  <tr>
<td>
<div style={{width: "300px"}}>

```js
// 影像内的二维位置

startPoints / lastPoints / currentPoints / deltaPoints: {
    Page,
    Image,
    Client,
}
```

</div>
</td>
<td>
<div style={{width: "300px"}}>

```js
// 世界空间中的三维位置
{
  (CanvasCoord, WorldCoord);
}
```

</div>
</td>
    <td>画布坐标定义了该事件发生在二维画布上的什么位置。我们同时还给出在「由焦点和相机法向所确定的那个平面」上投影得到的世界坐标（三维）。</td>
  </tr>
</tbody>
</table>
