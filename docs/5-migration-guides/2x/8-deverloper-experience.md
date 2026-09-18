---
id: developer-experience
title: 开发体验
description: 从 1.x 升级到 2.x 时开发体验方面的改进。库内已消除全部依赖循环并由 linter 在 CI 中把关；Karma 测试的准备与清理逻辑集中到 setupTestEnvironment / cleanupTestEnvironment，视口创建被统一，假加载器的 imageId 也从编码字符串改为结构化对象。
keywords:
  - 开发体验
  - 依赖循环
  - setupTestEnvironment
  - cleanupTestEnvironment
  - createViewports
  - encodeImageIdInfo
  - Karma 测试
  - Cornerstone3D 2.x 迁移
upstream: https://www.cornerstonejs.org/docs/migration-guides/2x/developer-experience
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 开发体验 {#developer-experience}

### 依赖循环 {#dependency-cycles}

我们已经移除了库中所有的依赖循环，现在它不存在任何这类问题。
为了保持这一状态，我们在 linter 中加了规则，
会在持续集成阶段捕获 pull request 中出现的任何依赖循环。
此外，你也可以运行 `yarn run format-check` 来确认格式正确，
同时顺带检查依赖问题。

### Karma 测试 {#karma-tests}

测试这块做了大量清理工作，下面细看。

#### 准备与清理 {#setup-and-cleanup}

以前，这些逻辑是散落各处的：

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

现在它们被集中起来了：

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
<summary>为什么？</summary>

旧写法引发了很多超时和竞态条件方面的问题。

</details>

#### 视口的创建 {#viewport-creation}

我们把此前到处重复的视口创建逻辑集中到了一处。

```js
const element = testUtils.createViewports(renderingEngine, {
  viewportId,
  viewportType: ViewportType.STACK,
  width: 512,
  height: 128,
});
```

#### Image Id {#image-id}

以前，对那个假的影像加载器你得这么写：

```js
const imageId1 = 'fakeImageLoader:imageURI_64_64_10_5_1_1_0';
```

这个字符串把各种参数编码在了里面。现在它被改造成了一个对象，更清晰：

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

volumeId 也有对应的写法：

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
```
