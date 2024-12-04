## 渲染

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
const volumeId = 'VOLUME_ID';
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

// 创建并加载我们的图像体积
// 参考：`./examples/helpers/getImageIdsAndCacheMetadata.js`
const imageIds = [
  'wadors:https://wadoRsRoot.com/studies/studyInstanceUID/series/SeriesInstanceUID/instances/SOPInstanceUID/frames/1',
  'wadors:https://wadoRsRoot.com/studies/studyInstanceUID/series/SeriesInstanceUID/instances/SOPInstanceUID/frames/2',
  'wadors:https://wadoRsRoot.com/studies/studyInstanceUID/series/SeriesInstanceUID/instances/SOPInstanceUID/frames/3',
];

imageCache.makeAndCacheImageVolume(imageIds, volumeId);
imageCache.loadVolume(volumeId, (event) => {
  if (event.framesProcessed === event.numFrames) {
    console.log('加载完成！');
  }
});

// 将场景与一个或多个图像体积绑定
const scene = renderingEngine.getScene(sceneUID);

scene.setVolumes([
  {
    volumeId,
    callback: ({ volumeActor, volumeId }) => {
      // 在这里可以设置传输函数或 PET 色彩图
      console.log('图像体积已加载！');
    },
  },
]);

const viewport = scene.getViewport(viewports[0].viewportId);

// 这将初始化 GPU 内存中的体积
renderingEngine.render();
```

大多数情况下，更新操作很简单，只需使用：

- `RenderingEngine.setViewports` 和
- `Scene.setVolumes`

如果你使用的是客户端路由和/或需要更强力地清理资源，大多数构造都有 `.destroy` 方法。例如：

```js
renderingEngine.destroy();
```

## 工具

工具是一个未实例化的类，至少实现了 `BaseTool` 接口。工具可以通过其构造函数进行配置。要使用工具，必须：

- 使用库的顶级 `addTool` 函数添加未实例化的工具
- 将同一工具通过名称添加到 ToolGroup

工具的行为依赖于与其 Tool Group 关联的渲染引擎、场景和视口，以及工具当前的模式。

### 添加工具

@Tools 库自带了几个常用工具，所有这些工具都实现了 `BaseTool` 或 `AnnotationTool` 接口。添加工具使其可以用于 ToolGroups。还提供了一个高层次的 `.removeTool` 方法。

```js
import * as csTools3d from '@cornerstonejs/tools';

// 将未实例化的工具类添加到库
// 这些将用于在显式将每个工具添加到一个或多个工具组时初始化工具实例
const { PanTool, StackScrollMouseWheelTool, ZoomTool, LengthTool } = csTools3d;

csTools3d.addTool(PanTool);
csTools3d.addTool(StackScrollMouseWheelTool);
csTools3d.addTool(ZoomTool);
csTools3d.addTool(LengthTool);
```

### 工具组管理器

工具组是用于在一组 `RenderingEngine`、`Scene` 和/或 `Viewport` 之间共享工具配置、状态和模式的一种方式。工具组由工具组管理器管理。工具组管理器用于创建、搜索和销毁工具组。

```js
import { ToolGroupManager } from '@cornerstonejs/tools';
import { ctVolumeId } from './constants';

const toolGroupId = 'TOOL_GROUP_ID';
const sceneToolGroup = ToolGroupManager.createToolGroup(TOOL_GROUP_ID);

// 向工具组添加工具
sceneToolGroup.addTool(PanTool.toolName);
sceneToolGroup.addTool(ZoomTool.toolName);
sceneToolGroup.addTool(StackScrollMouseWheelTool.toolName);
sceneToolGroup.addTool(LengthTool.toolName, {
  configuration: { volumeId: ctVolumeId },
});
```

### 工具模式

工具可以处于四种模式之一。每种模式都会影响工具如何响应交互。以下是这些模式：

<table>
  <tr>
    <td>工具模式</td>
    <td>描述</td>
  </tr>
  <tr>
    <td>激活</td>
    <td>
      <ul>
        <li>具有激活绑定的工具将响应交互</li>
        <li>如果工具是注释工具，点击事件在现有注释上方时将创建一个新注释。</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>被动（默认）</td>
    <td>
      <ul>
        <li>如果工具是注释工具，选择其手柄或线条时，可以移动并重新定位。</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>启用</td>
    <td>
      <ul>
        <li>工具将渲染，但无法与之交互。</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td>禁用</td>
    <td>
      <ul>
        <li>工具不会渲染，无法进行交互。</li>
      </ul>
    </td>
  </tr>
</table>

_注意：_

- 不应有两个具有相同绑定的激活工具。

```js
// 设置 ToolGroup 中每个工具的 ToolMode
// 可用模式包括：'Active', 'Passive', 'Enabled', 'Disabled'
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

### 同步器

SynchronizerManager 提供了与 ToolGroupManager 类似的 API。创建的 Synchronizer 具有 `addTarget`、`addSource`、`add`（将视口作为“源”和“目标”添加）及相应的 `remove*` 方法。

同步器通过监听在任何 `source` 上引发的指定事件来工作。如果检测到事件，回调函数会为每个 `target` 调用一次。其思路是，`source` 的更改应同步到 `target`。

如果视口被禁用，同步器会自动删除源/目标。同步器还暴露了一个 `disabled` 标志，可以用来临时阻止同步。

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
    // 同步逻辑在这里实现
  }
);

// 添加需要同步的视口
const firstViewport = { renderingEngineId, sceneUID, viewportId };
const secondViewport = {
  /* */
};

sync.add(firstViewport);
sync.add(secondViewport);
```

## 下一步

接下来的步骤，你可以：

- [查看使用文档](#)
- [探索我们的示例应用程序的源代码](#)