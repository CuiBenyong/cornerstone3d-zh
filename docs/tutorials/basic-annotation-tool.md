# 注释工具

在本教程中，您将学习如何使用注释工具进行标注。

## 前言

为了渲染一个体积数据，我们需要：

- 初始化cornerstone和相关库。
- HTMLDivElements 用于渲染体积的不同方向（例如，Axial视图和Sagittal视图）。
- 图像路径（`imageId`）。

## 实现

**初始化cornerstone和相关库**

```js
import { init as coreInit } from '@cornerstonejs/core';
import { init as dicomImageLoaderInit } from '@cornerstonejs/dicom-image-loader';
import { init as cornerstoneToolsInit } from '@cornerstonejs/tools';

await coreInit();
await dicomImageLoaderInit();
await cornerstoneToolsInit();
```

我们已经在服务器上存储了图像，供本教程使用。

首先，创建两个HTMLDivElements并为其设置样式，用于包含视口。

```js
const content = document.getElementById('content');

// 用于轴向视图的元素
const element1 = document.createElement('div');
element1.style.width = '500px';
element1.style.height = '500px';

// 用于矢状面视图的元素
const element2 = document.createElement('div');
element2.style.width = '500px';
element2.style.height = '500px';

content.appendChild(element1);
content.appendChild(element2);
```

接下来，我们需要一个`renderingEngine`。

```js
const renderingEngineId = 'myRenderingEngine';
const renderingEngine = new RenderingEngine(renderingEngineId);
```

通过使用`volumeLoader` API加载体积数据。

```js
// 在内存中定义一个体积
const volume = await volumeLoader.createAndCacheVolume(volumeId, { imageIds });
```

然后，我们可以通过使用`setViewports` API在渲染引擎中创建`viewport`。

```js
const viewportId1 = 'CT_AXIAL';
const viewportId2 = 'CT_SAGITTAL';

const viewportInput = [
  {
    viewportId: viewportId1,
    element: element1,
    type: ViewportType.ORTHOGRAPHIC,
    defaultOptions: {
      orientation: Enums.OrientationAxis.AXIAL,
    },
  },
  {
    viewportId: viewportId2,
    element: element2,
    type: ViewportType.ORTHOGRAPHIC,
    defaultOptions: {
      orientation: Enums.OrientationAxis.SAGITTAL,
    },
  },
];

renderingEngine.setViewports(viewportInput);

await volume.load();
```

为了使用工具，需要通过`addTool` API将其添加到`Cornerstone3DTools`的内部状态中。

```js
addTool(BidirectionalTool);
```

接下来，创建一个ToolGroup并添加我们想要使用的工具。ToolGroup使得可以在多个视口之间共享工具，因此我们还需要告诉ToolGroup它应该作用于哪些视口。

```js
const toolGroupId = 'myToolGroup';
const toolGroup = ToolGroupManager.createToolGroup(toolGroupId);

// 将工具添加到ToolGroup
toolGroup.addTool(BidirectionalTool.toolName);

toolGroup.addViewport(viewportId1, renderingEngineId);
toolGroup.addViewport(viewportId2, renderingEngineId);
```

:::note 提示

为什么要将`renderingEngineUID`添加到ToolGroup中？因为`viewportId`在每个渲染引擎内是唯一的。

:::

接下来，设置工具为活动状态，这意味着我们还需要为工具定义绑定（哪个鼠标按钮使其激活）。

```js
// 设置BidirectionalTool为活动工具，左键点击时激活
toolGroup.setToolActive(BidirectionalTool.toolName, {
  bindings: [
    {
      mouseButton: csToolsEnums.MouseBindings.Primary, // 左键点击
    },
  ],
});
```

加载体积数据并设置视口以渲染体积数据。

```js
setVolumesForViewports(
  renderingEngine,
  [
    {
      volumeId,
      callback: ({ volumeActor }) => {
        // 在volumeActor创建后设置windowLevel
        volumeActor
          .getProperty()
          .getRGBTransferFunction(0)
          .setMappingRange(-180, 220);
      },
    },
  ],
  [viewportId1, viewportId2]
);

// 渲染图像
renderingEngine.renderViewports([viewportId1, viewportId2]);
```

## 完整代码

<details>
<summary>完整代码</summary>

```js
import {
  init as coreInit,
  RenderingEngine,
  Enums,
  volumeLoader,
  setVolumesForViewports,
} from '@cornerstonejs/core';
import { init as dicomImageLoaderInit } from '@cornerstonejs/dicom-image-loader';
import {
  init as cornerstoneToolsInit,
  ToolGroupManager,
  WindowLevelTool,
  ZoomTool,
  Enums as csToolsEnums,
  addTool,
  BidirectionalTool,
} from '@cornerstonejs/tools';
import { createImageIdsAndCacheMetaData } from '../../../../utils/demo/helpers';

const { ViewportType } = Enums;

const content = document.getElementById('content');

// 用于轴向视图的元素
const element1 = document.createElement('div');
element1.style.width = '500px';
element1.style.height = '500px';

// 用于矢状面视图的元素
const element2 = document.createElement('div');
element2.style.width = '500px';
element2.style.height = '500px';

content.appendChild(element1);
content.appendChild(element2);
// ============================= //

/**
 * 运行示例
 */
async function run() {
  await coreInit();
  await dicomImageLoaderInit();
  await cornerstoneToolsInit();

  const imageIds = await createImageIdsAndCacheMetaData({
    StudyInstanceUID:
      '1.3.6.1.4.1.14519.5.2.1.7009.2403.334240657131972136850343327463',
    SeriesInstanceUID:
      '1.3.6.1.4.1.14519.5.2.1.7009.2403.226151125820845824875394858561',
    wadoRsRoot: 'https://d14fa38qiwhyfd.cloudfront.net/dicomweb',
  });

  // 实例化渲染引擎
  const renderingEngineId = 'myRenderingEngine';
  const volumeId = 'myVolume';
  const renderingEngine = new RenderingEngine(renderingEngineId);
  const volume = await volumeLoader.createAndCacheVolume(volumeId, {
    imageIds,
  });
  const viewportId1 = 'CT_AXIAL';
  const viewportId2 = 'CT_SAGITTAL';

  const viewportInput = [
    {
      viewportId: viewportId1,
      element: element1,
      type: ViewportType.ORTHOGRAPHIC,
      defaultOptions: {
        orientation: Enums.OrientationAxis.AXIAL,
      },
    },
    {
      viewportId: viewportId2,
      element: element2,
      type: ViewportType.ORTHOGRAPHIC,
      defaultOptions: {
        orientation: Enums.OrientationAxis.SAGITTAL,
      },
    },
  ];

  renderingEngine.setViewports(viewportInput);

  await volume.load();

  addTool(BidirectionalTool);

  const toolGroupId = 'myToolGroup';
  const toolGroup = ToolGroupManager.createToolGroup(toolGroupId);

  // 将工具添加到ToolGroup
  toolGroup.addTool(BidirectionalTool.toolName);

  toolGroup.addViewport(viewportId1, renderingEngineId);
  toolGroup.addViewport(viewportId2, renderingEngineId);

  toolGroup.setToolActive(BidirectionalTool.toolName, {
    bindings: [
      {
        mouseButton: csToolsEnums.MouseBindings.Primary, // 左键点击
      },
    ],
  });

  setVolumesForViewports(
    renderingEngine,
    [
      {
        volumeId,
        callback: ({ volumeActor }) => {
          // 在volumeActor创建后设置windowLevel
          volumeActor
            .getProperty()
            .getRGBTransferFunction(0)
            .setMappingRange(-180, 220);
        },
      },
    ],
    [viewportId1, viewportId2]
  );

  // 渲染图像
  renderingEngine.renderViewports([viewportId1, viewportId2]);
}

run();
```

</details>

您应该能够使用添加的工具对图像进行标注。

![](../assets/tutorial-annotation.png)

## 阅读更多

了解更多内容：

- [ToolGroup](../concepts/cornerstone-tools/toolGroups.md)
- [注释](../concepts/cornerstone-tools/annotation/index.md)

要了解更高级的注释工具用法，请访问<a href="/live-examples/volumeAnnotationTools.html" target="_blank">Volume Annotation Tools</a>示例页面。

:::note 提示

- 访问[示例](examples.md#run-examples-locally)页面，了解如何在本地运行示例。
- 查看[调试](examples.md#debugging)部分，了解如何调试示例。

:::