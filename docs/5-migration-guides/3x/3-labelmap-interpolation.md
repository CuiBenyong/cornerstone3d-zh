---
id: labelmap-interpolation
title: 标签图插值
description: 标签图插值不再是笔刷的 composition，而成为一个任何人都能调用的独立工具函数（@cornerstonejs/labelmap-interpolation）。本文给出迁移前那套取当前工具实例的变通写法与迁移后的直接调用，以及如何从自定义笔刷策略中移除 labelmapInterpolation。
keywords:
  - 标签图插值
  - labelmap-interpolation
  - interpolate
  - BrushStrategy
  - itk-wasm
  - Cornerstone3D 3.x 迁移
upstream: https://www.cornerstonejs.org/docs/migration-guides/3x/labelmap-interpolation
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 它不再是 composition，而是一个工具函数 {#not-a-composition-but-a-utility}

以前插值是笔刷的一个 composition，这就把它的使用限制在了继承自笔刷的那些工具上。
但插值其实应该是任何人都能用的工具函数——即便手上没有工具也能用。

以前你必须用这样的变通写法来做插值：

```js
addButtonToToolbar({
  title: 'Run Overlapping Interpolation',
  onClick: () => {
    const toolGroup = ToolGroupManager.getToolGroup(toolGroupId);
    const activeName = toolGroup.getActivePrimaryMouseButtonTool();
    const brush = toolGroup.getToolInstance(activeName);
    brush.interpolate?.(element1, { extendedConfig: false });
  },
});
```

现在就这么简单：

```js
import * as labelmapInterpolation from '@cornerstonejs/labelmap-interpolation';

labelmapInterpolation.interpolate({
  segmentationId,
  segmentIndex,
});
```

:::note
我们曾经又一次为 `itk-wasm` 实现过一套「动态依赖」的变通方案，
以避免在 cornerstone3D 2.0 中出现打包问题。然而那引发了大量问题。
现在它是一个独立的、单独的工具包，不需要再与 cornerstone3D 打包在一起。
:::

## 迁移 {#migration}

把 `labelmap` 插值从你自定义工具的 composition 中移除。

迁移前：

```javascript
const RECTANGLE_STRATEGY = new BrushStrategy(
  'Rectangle',
  compositions.regionFill,
  compositions.setValue,
  initializeRectangle,
  compositions.determineSegmentIndex,
  compositions.preview,
  compositions.labelmapInterpolation
);
```

迁移后：

```javascript
const RECTANGLE_STRATEGY = new BrushStrategy(
  'Rectangle',
  compositions.regionFill,
  compositions.setValue,
  initializeRectangle,
  compositions.determineSegmentIndex,
  compositions.preview
);
```
