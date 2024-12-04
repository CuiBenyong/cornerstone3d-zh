---

id: legacy-to-3d

---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 从 Legacy 迁移到 1.0

随着我们过渡到 `Cornerstone3D` 库，我们引入了一组与旧版 `Cornerstone` 库不兼容的新 API。在本页面中，我们将为已经使用旧版 `Cornerstone` 库的用户提供迁移指南。

:::note 重要
请注意，这个指南仍在进行中，我们仍在完善迁移文档。
:::

### init

`Cornerstone`（旧版）不需要初始化，但 `CornerstoneTools`（旧版）应该已经初始化。
在 `Cornerstone3D` 中，核心和工具都应该在使用库之前进行初始化。

<Tabs>
<TabItem value="cornerstone" label="Cornerstone (旧版)">

```js
cornerstoneTools.init();
```

</TabItem>

<TabItem value="cornerstone3D" label="Cornerstone3D">

```js
// 检测 GPU 并决定是否使用 GPU 渲染或回退到 CPU 渲染
cornerstone3D.init();
cornerstone3DTools.init();
```

</TabItem>
</Tabs>

### enabledElement

在 `Cornerstone3D` 中，启用的元素不像在 Cornerstone 中那样独立存在。当设置布局时，元素会与渲染引擎绑定，作为输出目标。此时，元素被认为是“启用”的。

在 `Cornerstone3D` 中，我们有两个 API 来处理这个：

- `setViewports`: 一次启用一组视口
- `enableElement`: 一次启用一个视口

<Tabs>
<TabItem value="cornerstone" label="Cornerstone (旧版)">

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

// API1: 设置视口
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

// API2: 启用元素
renderingEngine.enableElement({
  viewportId: "CTAxial",
  type: ViewportType.ORTHOGRAPHIC,
  element,
  defaultOptions: {
    orientation: Enums.OrientationAxis.AXIAL,
  },
});


// ELEMENT_ENABLED 事件的 eventDetail 包括：
{
  element,
  viewportId,
  renderingEngineId,
}
```

</TabItem>
</Tabs>

### loadAndCacheImage

在 Cornerstone（旧版）中，你会使用 `loadAndCacheImage` API 加载并缓存图像。
然而，在 `Cornerstone3D` 中，你应该使用视口 API 来加载和缓存图像。

<Tabs>
<TabItem value="cornerstone" label="Cornerstone (旧版)">

```js
cornerstone.loadAndCacheImage(imageId).then((image) => {
  // 执行操作，例如显示图像
});
```

</TabItem>

<TabItem value="cornerstone3D" label="Cornerstone3D">

```js
const viewport = renderingEngine.getViewport('CTViewport');

// 加载一张图像
await viewport.setStack([imageId]);

// 多个 imageIds
await viewport.setStack(
  [imageId1, imageId2],
  1 // 第1帧
);
```

</TabItem>
</Tabs>

### displayImage

这点有所不同，现在你是为每个视口设置数据，而不是为每个元素设置数据（像在 Cornerstone 中一样）。
当视口渲染时，你会返回视口实例，它有一些辅助方法来访问 HTML 元素、渲染器等。

<Tabs>
<TabItem value="cornerstone" label="Cornerstone (旧版)">

```js
cornerstone.displayImage(image, element);

// 触发 cornerstone.events.IMAGE_RENDERED
// eventDetail 如下
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

// 我们在上节中为 `loadAndCacheImage` 提供了设置堆栈的示例，
// 这里我们提供关于体积的示例

// 定义一组 imageIds 作为一个体积。
const ctVolume = await cornerstone3D.volumeLoader.createAndCacheVolume(
  volumeId,
  { imageIds: volumeImageIds}
)

// 加载体积，回调函数会为每个 imageId 调用
ctVolume.load(callback)

// 回调函数中传递的 eventDetail 形式（当前）为：

// 成功：
{
  success: true,
  imageIdIndex, // 体积内 Z 索引
  imageId, // 图像ID
  framesLoaded, // 成功加载的帧数
  framesProcessed, // 处理过的帧数（成功 + 失败）
  numFrames, // 体积中的总帧数
}

// 失败：
{
  success: false,
  imageId,
  imageIdIndex,
  framesLoaded,
  framesProcessed,
  numFrames,
  error, // imageLoader 给出的错误
}
```

</TabItem>
</Tabs>

### updateImage

我们目前的做法基本相同，但我们有三个不同的助手方法可以用于渲染：

- 更新与渲染引擎关联的所有视口。
- 更新单个视口。

这些是使用可能影响多个视口的工具时的便捷助手（例如，在所有三个正交 MPR 视图中跳转到十字线位置时）。

<Tabs>
<TabItem value="cornerstone" label="Cornerstone (旧版)">

```js
cornerstone.updateImage(element, invalidated);
```

</TabItem>

<TabItem value="cornerstone3D" label="Cornerstone3D">

```js
// 更新渲染引擎中的所有视口
renderingEngine.render()

// 更新单个视口
const myViewport = myScene.getViewport('myViewportId')
myViewport.render()

// 对所有视口触发 IMAGE_RENDERED 事件时：
eventDetail: {
  viewport,
}
```

</TabItem>
</Tabs>

### disable

渲染引擎控制视口的启用/禁用，并会根据需要触发相应的事件。

<Tabs>
<TabItem value="cornerstone" label="Cornerstone (旧版)">

```js
cornerstone.disable(element);
// 触发 ELEMENT_DISABLED 事件
```

</TabItem>

<TabItem value="cornerstone3D" label="Cornerstone3D">

```js
renderingEngine.disableElement(element);

// 每个未保留的 canvas 会触发元素禁用事件。

// 或者

// 这将销毁所有元素。
renderingEngine.destroy();

// ELEMENT_DISABLED 事件只包含对现在已禁用的 canvas 元素和相关 ID 的引用。

eventDetail: {
  viewportId, renderingEngineId, canvas;
}
```

</TabItem>
</Tabs>

### pageToPixel 和 pixelToCanvas

我们不再一次渲染单个图像。在 `Cornerstone3D` 中，视口渲染的是 3D 空间中的特定平面，这由相机参数（例如焦点、视锥、剪切范围）决定。数据和标注会存储在 3D 空间（“世界空间”）中，因此，为了与标注进行交互并在屏幕上渲染表示，你需要能够在画布空间和世界空间之间进行转换。
需要注意的是，为了在 Stack 和 Volume 视口之间共享工具，我们还在 3D 空间中渲染 Stack 视口。基本上，它们是基于空间中元数据定位和定向的 2D 图像。

<Tabs>
<TabItem value="cornerstone" label="Cornerstone (旧版)">

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

### getPixels

在 3D 中，`getPixels` 的方法不再适用，因为你可能在任何（斜面的）平面上查看数据。此外，视口可能正在渲染一个融合了多个体积的数据（例如，PET/CT）。开发人员现在必须直接获取数据数组，并根据他们的特定使用案例使用这些数据。

<Tabs>
<TabItem value="cornerstone" label="Cornerstone (旧版)">

```js
cornerstone.getPixels(element, x, y, width, height);
```



</TabItem>

<TabItem value="cornerstone3D" label="Cornerstone3D">

```js
// 获取图像像素值：
const pixels = viewport.getPixelData();
``` 

</TabItem>
</Tabs>

---