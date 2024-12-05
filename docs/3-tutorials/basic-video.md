# 渲染视频

在本教程中，您将学习如何渲染视频。

## 前言

为了渲染视频，我们需要：

- 初始化cornerstone和相关库。
- 一个`element`（HTMLDivElement）作为视口的容器。
- 视频的URL。
- 一个支持通过字节范围请求提供MP4格式视频的服务器。
- 最好使用“快速启动”格式的视频。

## 实现

**初始化cornerstone和相关库**

```js
import { init as coreInit } from '@cornerstonejs/core';

await coreInit();
```

**创建HTML元素**

为了本教程的目的，我们已经将图像存储在服务器上。

首先创建一个HTML元素，并为它设置样式，使其看起来像一个视口。

```js
const content = document.getElementById('content');
const element = document.createElement('div');

element.style.width = '500px';
element.style.height = '500px';

content.appendChild(element);
```

接下来，我们需要一个`renderingEngine`和一个视口来渲染图像。

```js
const renderingEngineId = 'myRenderingEngine';
const renderingEngine = new RenderingEngine(renderingEngineId);
```

然后，我们可以通过使用`enableElement` API在`renderingEngine`中创建一个视口。请注意，由于我们要渲染视频，我们必须指定`ViewportType.VIDEO`。

```js
const viewportId = 'CT_AXIAL_STACK';

const viewportInput = {
  viewportId,
  element,
  type: ViewportType.VIDEO,
};

renderingEngine.enableElement(viewportInput);
```

RenderingEngine将处理视口的创建，我们可以获取视口对象并设置视频URL，然后选择要显示的图像索引。

```js
const viewport = renderingEngine.getViewport(viewportId);

await viewport.setVideoURL(
  'https://ohif-assets.s3.us-east-2.amazonaws.com/video/rendered.mp4'
);

await viewport.play();
```

:::note 提示
对于合规的DICOMweb服务器，视频将通过rendered端点提供。
如果视频是MPEG2格式，可能需要一个accept头来强制它以MP4格式提供。
它可能不支持快速启动编码或字节范围格式，如果没有这些格式，将无法在大型视频中进行快速跳转。小视频可能会被完全缓冲，因此仍然可以跳转。

例如，您可以查看OHIF中的这个例子，它使用了rendered端点：
`https://d33do7qe4w26qo.cloudfront.net/dicomweb/studies/2.25.96975534054447904995905761963464388233/series/2.25.15054212212536476297201250326674987992/instances/2.25.179478223177027022014772769075050874231/rendered`

:::

## 完整代码

<details>
<summary>查看完整代码</summary>

```js
import { init as coreInit, RenderingEngine, Enums } from '@cornerstonejs/core';

const { ViewportType } = Enums;

const content = document.getElementById('content');
const element = document.createElement('div');

element.style.width = '500px';
element.style.height = '500px';

content.appendChild(element);
// ============================= //

/**
 * 运行演示
 */
async function run() {
  await coreInit();

  // 实例化渲染引擎
  const renderingEngineId = 'myRenderingEngine';
  const renderingEngine = new RenderingEngine(renderingEngineId);

  const viewportId = 'CT_AXIAL_STACK';

  const viewportInput = {
    viewportId,
    element,
    type: ViewportType.VIDEO,
  };

  renderingEngine.enableElement(viewportInput);

  const viewport = renderingEngine.getViewport(viewportId);

  await viewport.setVideoURL(
    'https://ohif-assets.s3.us-east-2.amazonaws.com/video/rendered.mp4'
  );

  await viewport.play();
}

run();
```

</details>

:::note 提示

- 访问[示例](examples.md#run-examples-locally)页面以查看如何在本地运行示例。
- 检查如何调试示例，请参阅[调试](examples.md#debugging)部分。

:::

# 视频注释

如果视频视口是通过图像ID和关联元数据的`setVideo`调用实例化的，那么可以使用注释与视频视口一起使用。这些注释将显示在一个或多个帧的范围内，允许一定的时间范围，以便注释可以实际显示。

`annotationFrameRange`类支持在注释上设置和获取时间范围。这是通过修改`/frames/<number>`部分中的imageID或`frameNumber=<number>`属性来完成的。当注释适用于一个范围的值时，它们就成为一个范围。

当视频播放时，帧范围会自动设置为当前播放的范围；当视频不播放时，它会设置为当前显示的帧编号。