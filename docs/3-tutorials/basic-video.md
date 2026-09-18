---
id: basic-video
title: 渲染视频影像
description: Cornerstone3D 入门教程：使用视频视口渲染 MP4 影像并支持标注。讲解 ViewportType.VIDEO 的创建方式、setVideoURL 与 play 的用法、对服务端字节范围请求与 fast start 编码的要求，以及视频标注的帧范围机制。
keywords:
  - Cornerstone3D 视频
  - ViewportType.VIDEO
  - setVideoURL
  - 视频标注
  - AnnotationMultiSelect
  - 超声影像
upstream: https://www.cornerstonejs.org/docs/tutorials/basic-video
---

# 渲染视频影像

本教程将演示如何渲染视频影像。

## 前提 {#preface}

要渲染视频，我们需要：

- 初始化 cornerstone 及相关库
- 一个 `element`（HTMLDivElement）作为视口的容器
- 视频的 URL
- 一台能以 MP4 格式、并支持字节范围请求（byte range requests）提供该视频的服务器
- 视频最好是 fast start 格式

## 实现 {#implementation}

**初始化 cornerstone 及相关库**

```js
import { init as coreInit } from '@cornerstonejs/core';

await coreInit();
```

**创建 HTML 元素**

为了本教程的演示，我们已经把影像放在了服务器上。

先创建一个 HTML 元素，并把它的样式设置成视口的样子。

```js
const content = document.getElementById('content');
const element = document.createElement('div');

element.style.width = '500px';
element.style.height = '500px';

content.appendChild(element);
```

接下来需要一个 `renderingEngine` 和一个 `viewport` 来渲染影像。

```js
const renderingEngineId = 'myRenderingEngine';
const renderingEngine = new RenderingEngine(renderingEngineId);
```

然后用 `enableElement` API 在渲染引擎里创建一个 `viewport`。
注意，因为要渲染的是视频，所以必须指定 `ViewportType.VIDEO`。

```js
const viewportId = 'CT_AXIAL_STACK';

const viewportInput = {
  viewportId,
  element,
  type: ViewportType.VIDEO,
};

renderingEngine.enableElement(viewportInput);
```

视口的创建由渲染引擎负责。我们可以取到视口对象，把视频 URL 设置到它上面，
并指定要显示第几帧。

```js
const viewport = renderingEngine.getViewport(viewportId);

await viewport.setVideoURL(
  'https://ohif-assets-new.s3.us-east-1.amazonaws.com/video/rendered.mp4'
);

await viewport.play();
```

:::note 提示
对于符合规范的 DICOMweb 服务器，视频会在 rendered 端点上提供。
如果原始格式是 MPEG2，可能需要指定 accept 头来强制它以 MP4 格式返回。
服务器也可能既不支持 fast start 编码、也不支持字节范围格式——缺少这两项会导致
无法在大体积视频里跳转。小体积视频通常会被整体缓冲下来，所以仍然可以跳转。

举个例子，可以看 OHIF 中这个使用 rendered 端点的示例：
`https://d33do7qe4w26qo.cloudfront.net/dicomweb/studies/2.25.96975534054447904995905761963464388233/series/2.25.15054212212536476297201250326674987992/instances/2.25.179478223177027022014772769075050874231/rendered`

:::

## 完整代码 {#final-code}

<details>
<summary>完整代码</summary>

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

  // 实例化一个渲染引擎
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
    'https://ohif-assets-new.s3.us-east-1.amazonaws.com/video/rendered.mp4'
  );

  await viewport.play();
}

run();
```

</details>

:::note 提示

- 到[示例](./examples.md#run-examples-locally)页面了解如何在本地运行这些示例。
- 调试示例的方法见[源码与调试](./examples.md#source-code-and-debugging)一节。

:::

## 视频标注 {#video-annotations}

如果视频视口是通过对某个带有关联元数据的 imageId 调用 setVideo 来初始化的，
那么就可以在视频视口上使用标注。这些标注会显示在某一段帧范围或某一帧上，
并允许一定的时间范围，以保证标注确实能被看到。

`AnnotationMultiSelect` 类支持读写标注上的时间范围。具体做法是修改 imageId 中
`/frames/<number>` 那一段或 `frameNumber=<number>` 属性。当标注适用于一段范围的取值时，
它们就变成一个范围。

帧范围在创建时会自动设置：视频正在播放时取当前播放的范围，未播放时取当前显示的帧号。
