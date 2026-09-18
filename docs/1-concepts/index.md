---
id: concepts-index
title: 核心概念
description: Cornerstone3D 核心概念总览：渲染引擎与视口的创建、工具的添加与工具组管理、四种工具模式，以及视口之间的同步器。本节是概念章节的入口，各子主题有各自的详细页面。
keywords:
  - Cornerstone3D 概念
  - 渲染引擎
  - 工具组
  - 工具模式
  - 同步器
  - ToolGroupManager
upstream: https://www.cornerstonejs.org/docs/concepts
---

:::caution 本页示例代码已过时

官方英文原文这一页的示例代码仍在使用早期 API——例如从 `vtkjs-viewport` 引入、
`scene` / `sceneUID` 这套概念，以及 `imageCache.makeAndCacheImageVolume`。
这些在当前版本中都已经变了：`scene` 概念已被移除，视口直接由渲染引擎管理，
体数据则通过 `volumeLoader.createAndCacheVolume` 创建。

本页按原文翻译保留，作为概念性的整体介绍来读是有价值的；
但**不要照抄这里的代码**。可运行的当前写法请看：

- [渲染一组堆栈影像](../3-tutorials/basic-stack.md)、[渲染体数据](../3-tutorials/basic-volume.md)
- [渲染引擎](./cornerstone-core/renderingEngine.md)、[视口](./cornerstone-core/viewports.md)
- [工具](./cornerstone-tools/tools.md)、[工具组](./cornerstone-tools/toolGroups.md)、[同步器](./cornerstone-tools/synchronizers.md)

:::

## 渲染 {#rendering}

_index.html_

```html
<canvas class="target-canvas"></canvas>
```

_app.js_

```js
import {
  RenderingEngine, // 类
  ORIENTATION, // 常量
  ViewportType, // 枚举
} from 'vtkjs-viewport';

// 渲染
const renderingEngine = new RenderingEngine('ExampleRenderingEngineID');
const volumeId = 'VOLUME_ID ';
const viewports = [];
const viewport = {
  sceneUID,
  viewportId: 'viewportUID_0',
  type: ViewportType.ORTHOGRAPHIC,
  canvas: document.querySelector('.target-canvas'),
  defaultOptions: {
    orientation: Enums.OrientationAxis.AXIAL,
    background: [Math.random(), Math.random(), Math.random()],
  },
};

// 启动渲染
viewports.push(viewport);
renderingEngine.setViewports(viewports);

// 渲染背景
renderingEngine.render();

// 创建并加载我们的影像体数据
// 可参考：`./examples/helpers/getImageIdsAndCacheMetadata.js`
const imageIds = [
  'wadors:https://wadoRsRoot.com/studies/studyInstanceUID/series/SeriesInstanceUID/instances/SOPInstanceUID/frames/1',
  'wadors:https://wadoRsRoot.com/studies/studyInstanceUID/series/SeriesInstanceUID/instances/SOPInstanceUID/frames/2',
  'wadors:https://wadoRsRoot.com/studies/studyInstanceUID/series/SeriesInstanceUID/instances/SOPInstanceUID/frames/3',
];

imageCache.makeAndCacheImageVolume(imageIds, volumeId);
imageCache.loadVolume(volumeId, (event) => {
  if (event.framesProcessed === event.numFrames) {
    console.log('done loading!');
  }
});

// 把 scene 与一份或多份影像体数据关联起来
const scene = renderingEngine.getScene(sceneUID);

scene.setVolumes([
  {
    volumeId,
    callback: ({ volumeActor, volumeId }) => {
      // 可以在这里设置传递函数或 PET 颜色映射表
      console.log('volume loaded!');
    },
  },
]);

const viewport = scene.getViewport(viewports[0].viewportId);

// 这一步会在 GPU 内存中初始化体数据
renderingEngine.render();
```

大部分情况下，更新只需用到：

- `RenderingEngine.setViewports`
- `Scene.setVolumes`

如果你用了客户端路由、或者需要更积极地清理资源，
大多数构件都带有 `.destroy` 方法。例如：

```js
renderingEngine.destroy();
```

## 工具 {#tools}

工具是一个未实例化的类，至少实现 `BaseTool` 接口。
工具可以通过其构造函数进行配置。要使用一个工具，必须：

- 使用库的顶层 `addTool` 函数添加未实例化的工具
- 按名称把同一个工具添加到某个工具组（ToolGroup）中

:::note 与原文的一处差异

官方英文原文中，上面这段说明因编辑失误被连续重复了四遍。
这里只保留一遍。
:::

工具的行为随后取决于：哪些渲染引擎、scene 和视口与它所属的工具组相关联，
以及该工具当前处于什么模式。

### 添加工具 {#adding-tools}

@Tools 库内置了若干常用工具，它们都实现了 `BaseTool` 或 `AnnotationTool`。
添加一个工具就是让工具组能够使用它。另有一个顶层的 `.removeTool`。

```js
import * as csTools3d from '@cornerstonejs/tools';

// 把未实例化的工具类添加到库中
// 之后当我们把每个工具显式加入一个或多个工具组时，
// 会用它们来初始化工具实例
const { PanTool, StackScrollMouseWheelTool, ZoomTool, LengthTool } = csTools3d;

csTools3d.addTool(PanTool);
csTools3d.addTool(StackScrollMouseWheelTool);
csTools3d.addTool(ZoomTool);
csTools3d.addTool(LengthTool);
```

### 工具组管理器 {#tool-group-manager}

工具组是一种在一组 `RenderingEngine`、`Scene` 和 / 或 `Viewport` 之间
共享工具配置、状态和模式的方式。工具组由工具组管理器管理，
后者用于创建、查找和销毁工具组。

```js
import { ToolGroupManager } from '@cornerstonejs/tools';
import { ctVolumeId } from './constants';

const toolGroupId = 'TOOL_GROUP_ID';
const sceneToolGroup = ToolGroupManager.createToolGroup(TOOL_GROUP_ID);

// 把工具加入工具组
sceneToolGroup.addTool(PanTool.toolName);
sceneToolGroup.addTool(ZoomTool.toolName);
sceneToolGroup.addTool(StackScrollMouseWheelTool.toolName);
sceneToolGroup.addTool(LengthTool.toolName, {
  configuration: { volumeId: ctVolumeId },
});
```

### 工具模式 {#tool-modes}

工具可以处于四种模式之一。每种模式都会影响工具如何响应交互。这些模式是：

<table>
  <tr>
    <td>工具模式</td>
    <td>说明</td>
  </tr>
  <tr>
    <td>Active（激活）</td>
    <td>
      <ul>
        <li>具有 active 绑定的工具会响应交互</li>
        <li>如果是标注工具，在已有标注之外的位置点击会创建一个新标注。</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Passive（被动，默认）</td>
    <td>
      <ul>
        <li>如果是标注工具，当它的控制点或线条被选中时，可以移动和重新定位。</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Enabled（启用）</td>
    <td>
      <ul>
        <li>工具会渲染，但无法交互。</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>Disabled（禁用）</td>
    <td>
      <ul>
        <li>工具不渲染，也无法交互。</li>
      </ul>
    </td>
  </tr>
</table>

_注意：_

- 绝不应该存在两个绑定相同的 Active 工具

```js
// 为每个工具设置该工具组中的工具模式
// 可能的模式包括：'Active'、'Passive'、'Enabled'、'Disabled'
sceneToolGroup.setToolActive(StackScrollMouseWheelTool.toolName);
sceneToolGroup.setToolActive(LengthTool.toolName, {
  bindings: [{ mouseButton: MouseBindings.Primary }],
});
sceneToolGroup.setToolActive(PanTool.toolName, {
  bindings: [{ mouseButton: MouseBindings.Auxiliary }],
});
sceneToolGroup.setToolActive(ZoomTool.toolName, {
  bindings: [{ mouseButton: MouseBindings.Secondary }],
});
```

### 同步器 {#synchronizers}

SynchronizerManager 暴露的 API 与 ToolGroupManager 类似。
创建出来的同步器带有 `addTarget`、`addSource`、`add`
（把该视口同时作为「源」和「目标」加入）等方法，以及对应的 `remove*` 方法。

同步器的工作方式是：监听某个指定事件在任意**源**上被触发。
一旦检测到，就为每个**目标**各调用一次回调函数。
其思路是：对**源**的改动应当被同步到各个**目标**上。

当某个视口被禁用时，同步器会自行把它从源 / 目标中移除。
同步器还暴露了一个 `disabled` 标志，可用于临时阻止同步。

```js
import { Events as RENDERING_EVENTS } from 'vtkjs-viewport';
import { SynchronizerManager } from '@cornerstonejs/tools';

const cameraPositionSyncrhonizer = SynchronizerManager.createSynchronizer(
  synchronizerName,
  RENDERING_EVENTS.CAMERA_MODIFIED,
  (
    synchronizerInstance,
    sourceViewport,
    targetViewport,
    cameraModifiedEvent
  ) => {
    // 同步逻辑写在这里
  }
);

// 添加要同步的视口
const firstViewport = { renderingEngineId, sceneUID, viewportId };
const secondViewport = {
  /* */
};

sync.add(firstViewport);
sync.add(secondViewport);
```

## 下一步 {#next-steps}

接下来你可以：

- [从快速开始读起](../2-getting-started/index.md)
- [动手跑一遍教程](../3-tutorials/index.md)
- [查看官方在线示例源码](https://www.cornerstonejs.org/docs/examples)
