---
id: developer-experience
title: '开发者体验'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# 开发者体验

### 依赖循环

我们已经移除了库中的所有依赖循环，确保其不再出现任何此类问题。为了维持这一点，我们在 linter 中添加了规则，这些规则将在持续集成期间捕获 pull requests 中的任何依赖循环。此外，您可以运行 `yarn run format-check` 以确保格式正确，并检查依赖关系。

### 发布的 API

我们现已发布 DICOM 图像加载器和 Nifti 体积加载器的 API。因此，在创建 PR 时，别忘了运行 `yarn run build:update-api` 并将生成的文件包含在您的 PR 中。

### Karma 测试

我们在清理测试方面做了大量工作，让我们深入了解一下

#### 设置和清理

以前，我们的逻辑是零散的：

```js
beforeEach(function () {
  csTools3d.init();
  csTools3d.addTool(BidirectionalTool);
  cache.purgeCache();
  this.DOMElements = [];
  this.stackToolGroup = ToolGroupManager.createToolGroup('stack');
  this.stackToolGroup.addTool(BidirectionalTool.toolName, {
    configuration: { volumeId: volumeId },
  });
  this.stackToolGroup.setToolActive(BidirectionalTool.toolName, {
    bindings: [{ mouseButton: 1 }],
  });

  this.renderingEngine = new RenderingEngine(renderingEngineId);
  imageLoader.registerImageLoader('fakeImageLoader', fakeImageLoader);
  volumeLoader.registerVolumeLoader('fakeVolumeLoader', fakeVolumeLoader);
  metaData.addProvider(fakeMetaDataProvider, 10000);
});

afterEach(function () {
  csTools3d.destroy();
  cache.purgeCache();
  eventTarget.reset();
  this.renderingEngine.destroy();
  metaData.removeProvider(fakeMetaDataProvider);
  imageLoader.unregisterAllImageLoaders();
  ToolGroupManager.destroyToolGroup('stack');

  this.DOMElements.forEach((el) => {
    if (el.parentNode) {
      el.parentNode.removeChild(el);
    }
  });
});
```

现在它被集中化了：

```js
beforeEach(function () {
  const testEnv = testUtils.setupTestEnvironment({
    renderingEngineId,
    toolGroupIds: ['default'],
    viewportIds: [viewportId],
    tools: [BidirectionalTool],
    toolConfigurations: {
      [BidirectionalTool.toolName]: {
        configuration: { volumeId: volumeId },
      },
    },
    toolActivations: {
      [BidirectionalTool.toolName]: {
        bindings: [{ mouseButton: 1 }],
      },
    },
  });
  renderingEngine = testEnv.renderingEngine;
  toolGroup = testEnv.toolGroups['default'];
});

afterEach(function () {
  testUtils.cleanupTestEnvironment({
    renderingEngineId,
    toolGroupIds: ['default'],
  });
});
```

<details>
<summary>为什么?</summary>

它导致了许多超时和竞争条件问题。

</details>

#### 视口创建

我们已将以前重复的视口创建逻辑集中到一个地方。

```js
const element = testUtils.createViewports(renderingEngine, {
  viewportId,
  viewportType: ViewportType.STACK,
  width: 512,
  height: 128,
});
```

#### 图像 Id

以前，对于伪图像加载器，您应使用：

```js
const imageId1 = 'fakeImageLoader:imageURI_64_64_10_5_1_1_0';
```

这个字符串编码了各种参数。现在，它已被重构为一个对象，以获得更好的清晰度：

```js
const imageInfo1 = {
  loader: 'fakeImageLoader',
  name: 'imageURI',
  rows: 64,
  columns: 64,
  barStart: 32,
  barWidth: 5,
  xSpacing: 1,
  ySpacing: 1,
  sliceIndex: 0,
};

const imageId1 = testUtils.encodeImageIdInfo(imageInfo1);
```

同样地，体积 Id 也分存在

```js
const volumeId = testUtils.encodeVolumeIdInfo({
  loader: 'fakeVolumeLoader',
  name: 'volumeURI',
  rows: 100,
  columns: 100,
  slices: 4,
  xSpacing: 1,
  ySpacing: 1,
  zSpacing: 1,
});