---
id: statistics
title: 分割统计量 API
description: 迁移到 Cornerstone3D 3.x 时分割统计量 API 的变更。统计量计算从笔刷工具的方法改为一个独立工具函数，改在 Web Worker 中异步计算，函数签名完全变化，并会在计算过程中派发进度事件。
keywords:
  - 分割统计量
  - getStatistics
  - segmentationUtils
  - Web Worker
  - 进度事件
  - Cornerstone3D 3.x 迁移
upstream: https://www.cornerstonejs.org/docs/migration-guides/3x/statistics
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## 主要变更 {#key-changes}

- 统计量计算从笔刷工具的方法中移出，改由一个专门的工具函数负责
- 统计量现在使用 Web Worker 异步计算
- 获取统计量的函数签名完全改变了
- 计算过程中现在会派发进度事件

## 迁移步骤 {#migration-steps}

### 1. 用独立工具函数替换基于工具的统计量方法 {#1-replace-tool-based-statistics-methods-with-the-standalone-utility}

**迁移前：**

```diff
- const toolGroup = ToolGroupManager.getToolGroup(toolGroupId);
- const activeName = toolGroup.getActivePrimaryMouseButtonTool();
- const brush = toolGroup.getToolInstance(activeName);
- const stats = brush.getStatistics(viewport.element, { indices });
```

**迁移后：**

```diff
+ const stats = await segmentationUtils.getStatistics({
+   segmentationId,
+   segmentIndices: indices,
+   viewportId: viewport.id,
+ });
```

:::note
需要传 viewportId，是因为有些统计量的计算与该视口中的基础影像有关。
:::
