# 分割工具

在本教程中，您将学习如何使用分割工具来绘制和编辑分割区域。

## 前言

为了渲染一个体积数据，我们需要：

- 初始化Cornerstone和相关库。
- 使用HTMLDivElements来渲染不同方向的体积（例如，一个用于轴向视图，一个用于矢状视图）。
- 图像的路径（`imageId`）。

## 实现

**初始化Cornerstone和相关库**

```js
import { init as coreInit } from '@cornerstonejs/core';
import { init as dicomImageLoaderInit } from '@cornerstonejs/dicom-image-loader';
import { init as cornerstoneToolsInit } from '@cornerstonejs/tools';

await coreInit();
await dicomImageLoaderInit();
await cornerstoneToolsInit();
```

为了本教程的演示，我们已经将图像存储在服务器上。

首先，让我们创建三个HTMLDivElements，并通过CSS样式设置它们来包含轴向、矢状和冠状视图的视口。

```js
const content = document.getElementById('content');

const viewportGrid = document.createElement('div');
viewportGrid.style.display = 'flex';
viewportGrid.style.flexDirection = 'row';

// 轴向视图的元素
const element1 = document.createElement('div');
element1.style.width = '500px';
element1.style.height = '500px';

// 矢状视图的元素
const element2 = document.createElement('div');
element2.style.width = '500px';
element2.style.height = '500px';

// 冠状视图的元素
const element3 = document.createElement('div');
element3.style.width = '500px';
element3.style.height = '500px';

viewportGrid.appendChild(element1);
viewportGrid.appendChild(element2);
viewportGrid.appendChild(element3);

content.appendChild(viewportGrid);
```

对于刷子工具，添加`BrushTool`。这两个工具应通过`addTool` API和`ToolGroup`添加到`Cornerstone3D`中：

```js
addTool(BrushTool);
```

对于工具组：

```js
const toolGroupId = 'CT_TOOLGROUP';
// 定义工具组，将分割显示工具添加到其中
const toolGroup = ToolGroupManager.createToolGroup(toolGroupId);

// 分割工具
toolGroup.addTool(BrushTool.toolName);
```

为了让刷子工具在按下鼠标左键时处于激活状态，设置`BrushTool`为活动工具：

```js
toolGroup.setToolActive(BrushTool.toolName, {
  bindings: [{ mouseButton: csToolsEnums.MouseBindings.Primary }],
});
```

接下来，我们可以处理体积加载。首先，让我们加载用于渲染的实际CT体积数据。

```js
const volumeName = 'CT_VOLUME_ID';
const volumeId = `${volumeName}`;

// 在内存中定义CT体积
const volume = await volumeLoader.createAndCacheVolume(volumeId, {
  imageIds,
});
```

我们需要另一个体积来进行分割（我们不希望修改CT体积来进行分割）。我们可以使用CT体积（`volumeId`）作为元数据的参考，来创建一个新的分割体积。

```js
const segmentationId = 'MY_SEGMENTATION_ID';

// 创建一个与CT体积源数据分辨率相同的分割体积
await volumeLoader.createAndCacheDerivedLabelmapVolume(volumeId, {
  volumeId: segmentationId,
});
```

然后，将创建的分割体积添加到`Cornerstone3DTools`的分割状态中。通过`addSegmentation` API实现：

```js
// 将分割添加到状态中。正如所见，标签图数据
// 即缓存的volumeId，提供给状态
segmentation.addSegmentations([
  {
    segmentationId,
    representation: {
      // 分割类型
      type: csToolsEnums.SegmentationRepresentations.Labelmap,
      // 实际的分割数据，对于标签图来说，这是一
      // 参考源体积数据的分割。
      data: {
        volumeId: segmentationId,
      },
    },
  },
]);
```

:::note 重要
创建并将分割添加到`Cornerstone3DTools`的分割状态中并不会立即在视口中渲染它。`Cornerstone3DTools`已将`Segmentation`与`Segmentation Representation`解耦。简而言之，`Segmentation`包含渲染不同`Segmentation Representation`（如`Labelmap`、`Contour`，后者尚不支持，详见路线图）所需的数据。因此，您可以拥有单一`Segmentation`的多个`representation`。更多信息，请参考本教程的末尾部分。
:::

让我们创建一个渲染引擎并添加视口，并让工具组知道它正在操作的视口：

```js
// 实例化渲染引擎
const renderingEngineId = 'myRenderingEngine';
const renderingEngine = new RenderingEngine(renderingEngineId);

// 创建视口
const viewportId1 = 'CT_AXIAL';
const viewportId2 = 'CT_SAGITTAL';
const viewportId3 = 'CT_CORONAL';

const viewportInputArray = [
  {
    viewportId: viewportId1,
    type: ViewportType.ORTHOGRAPHIC,
    element: element1,
    defaultOptions: {
      orientation: Enums.OrientationAxis.AXIAL,
    },
  },
  {
    viewportId: viewportId2,
    type: ViewportType.ORTHOGRAPHIC,
    element: element2,
    defaultOptions: {
      orientation: Enums.OrientationAxis.SAGITTAL,
    },
  },
  {
    viewportId: viewportId3,
    type: ViewportType.ORTHOGRAPHIC,
    element: element3,
    defaultOptions: {
      orientation: Enums.OrientationAxis.CORONAL,
    },
  },
];

renderingEngine.setViewports(viewportInputArray);

toolGroup.addViewport(viewportId1, renderingEngineId);
toolGroup.addViewport(viewportId2, renderingEngineId);
toolGroup.addViewport(viewportId3, renderingEngineId);
```

接下来，设置体积并将其加载到视口中：

```js
// 设置加载的体积
await volume.load();

// 将体积设置到视口中
await setVolumesForViewports(
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
  [viewportId1, viewportId2, viewportId3]
);
```

最后，我们创建一个标签图表示的分割并将其添加到工具组中：

```js
await segmentation.addLabelmapRepresentationToViewportMap({
  [viewportId1]: [
    {
      segmentationId,
      type: csToolsEnums.SegmentationRepresentations.Labelmap,
    },
  ],
  [viewportId2]: [
    {
      segmentationId,
      type: csToolsEnums.SegmentationRepresentations.Labelmap,
    },
  ],
  [viewportId3]: [
    {
      segmentationId,
      type: csToolsEnums.SegmentationRepresentations.Labelmap,
    },
  ],
});

// 渲染图像
renderingEngine.render();
```

## 最终代码

<details>
<summary>最终代码</summary>

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
  Enums as csToolsEnums,
  addTool,
  BidirectionalTool,
  BrushTool,
  segmentation,
} from '@cornerstonejs/tools';
import { createImageIdsAndCacheMetaData } from '../../../../utils/demo/helpers';

const { ViewportType } = Enums;

const content = document.getElementById('content');

const viewportGrid = document.createElement('div');
viewportGrid.style.display = 'flex';
viewportGrid.style.flexDirection = 'row';

// 轴向视图的元素
const element1 = document.createElement('div');
element1.style.width = '500px';
element1.style.height = '500px';

// 矢状视图的元素
const element2 = document.createElement('div');
element2.style.width = '500px';
element2.style.height = '500px';

// 冠状视图的元素
const element3 = document.createElement('div');
element3.style.width = '500px';
element3.style.height = '500px';

viewportGrid.appendChild(element1);
viewportGrid.appendChild(element2);
viewportGrid.appendChild(element3);

content.appendChild(viewportGrid);
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
      '1.3.6.1.4.1.14519.5.2.1.

7009.2403.179742323407226418032100354694',
    skipSeriesWithNoFrames: false,
  });

  const volumeName = 'CT_VOLUME_ID';
  const volumeId = `${volumeName}`;
  const volume = await volumeLoader.createAndCacheVolume(volumeId, { imageIds });

  const segmentationId = 'MY_SEGMENTATION_ID';
  await volumeLoader.createAndCacheDerivedLabelmapVolume(volumeId, {
    volumeId: segmentationId,
  });

  // 工具组
  const toolGroupId = 'CT_TOOLGROUP';
  const toolGroup = ToolGroupManager.createToolGroup(toolGroupId);
  addTool(BrushTool);

  // 启用Brush Tool
  toolGroup.setToolActive(BrushTool.toolName, {
    bindings: [{ mouseButton: csToolsEnums.MouseBindings.Primary }],
  });

  const renderingEngineId = 'myRenderingEngine';
  const renderingEngine = new RenderingEngine(renderingEngineId);

  const viewportId1 = 'CT_AXIAL';
  const viewportId2 = 'CT_SAGITTAL';
  const viewportId3 = 'CT_CORONAL';

  const viewportInputArray = [
    {
      viewportId: viewportId1,
      type: ViewportType.ORTHOGRAPHIC,
      element: element1,
      defaultOptions: { orientation: Enums.OrientationAxis.AXIAL },
    },
    {
      viewportId: viewportId2,
      type: ViewportType.ORTHOGRAPHIC,
      element: element2,
      defaultOptions: { orientation: Enums.OrientationAxis.SAGITTAL },
    },
    {
      viewportId: viewportId3,
      type: ViewportType.ORTHOGRAPHIC,
      element: element3,
      defaultOptions: { orientation: Enums.OrientationAxis.CORONAL },
    },
  ];

  renderingEngine.setViewports(viewportInputArray);

  toolGroup.addViewport(viewportId1, renderingEngineId);
  toolGroup.addViewport(viewportId2, renderingEngineId);
  toolGroup.addViewport(viewportId3, renderingEngineId);

  await volume.load();

  await setVolumesForViewports(
    renderingEngine,
    [
      {
        volumeId,
        callback: ({ volumeActor }) => {
          volumeActor
            .getProperty()
            .getRGBTransferFunction(0)
            .setMappingRange(-180, 220);
        },
      },
    ],
    [viewportId1, viewportId2, viewportId3]
  );

  await segmentation.addLabelmapRepresentationToViewportMap({
    [viewportId1]: [
      {
        segmentationId,
        type: csToolsEnums.SegmentationRepresentations.Labelmap,
      },
    ],
    [viewportId2]: [
      {
        segmentationId,
        type: csToolsEnums.SegmentationRepresentations.Labelmap,
      },
    ],
    [viewportId3]: [
      {
        segmentationId,
        type: csToolsEnums.SegmentationRepresentations.Labelmap,
      },
    ],
  });

  renderingEngine.render();
}

run();
```

</details>