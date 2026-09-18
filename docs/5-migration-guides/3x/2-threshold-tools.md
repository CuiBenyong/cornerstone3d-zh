---
id: threshold-tools
title: 标签图阈值工具
description: 升级到 Cornerstone3D 3.x 时标签图阈值工具的变更。嵌套的 strategySpecificConfiguration 被完全移除，配置项上移到根层级；threshold 数组改为 threshold 对象中的 range 属性；setBrushThresholdForToolGroup 的签名也随之改变。本文给出逐项的前后对照。
keywords:
  - 阈值工具
  - strategySpecificConfiguration
  - setBrushThresholdForToolGroup
  - threshold range
  - isDynamic
  - dynamicRadius
  - Cornerstone3D 3.x 迁移
upstream: https://www.cornerstonejs.org/docs/migration-guides/3x/threshold-tools
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

## 主要变更 {#key-changes}

- 嵌套的 `strategySpecificConfiguration` 对象被完全移除
- 各配置属性上移到配置对象的根层级
- 阈值配置的结构被重新组织：
  - `threshold` 数组现在变成了 `threshold` 对象内部的 `range` 属性
  - 其他阈值相关属性（`isDynamic`、`dynamicRadius`）也属于同一个对象
- `setBrushThresholdForToolGroup()` 的函数签名改为接受一个结构化的阈值对象
- 策略专有的属性（例如 `useCenterSegmentIndex`）被移到了配置的根层级
- `activeStrategy` 现在是工具操作数据中的一个独立属性，不再位于某个嵌套配置内部

## 迁移步骤 {#migration-steps}

### 1. 用直接属性替换 strategySpecificConfiguration {#1-replace-strategyspecificconfiguration-with-direct-properties}

**迁移前：**

```diff
- configuration: {
-   activeStrategy: 'THRESHOLD_INSIDE_SPHERE_WITH_ISLAND_REMOVAL',
-   strategySpecificConfiguration: {
-     THRESHOLD: {
-       threshold: [-150, -70],
-       // 其他阈值属性
-     },
-     useCenterSegmentIndex: true,
-   },
- }
```

**迁移后：**

```diff
+ configuration: {
+   activeStrategy: 'THRESHOLD_INSIDE_SPHERE_WITH_ISLAND_REMOVAL',
+   threshold: {
+     range: [-150, -70],
+     isDynamic: false,
+     // 其他阈值属性直接写在这里
+   },
+   useCenterSegmentIndex: true,
+ }
```

### 2. 更新阈值配置的结构 {#2-update-threshold-configuration-structure}

**迁移前：**

```diff
- strategySpecificConfiguration: {
-   THRESHOLD: {
-     threshold: [-150, -70], // 旧的 threshold 数组形式
-     isDynamic: false,
-     dynamicRadius: 5
-   }
- }
```

**迁移后：**

```diff
+ threshold: {
+   range: [-150, -70], // 新的 'range' 属性取代了 'threshold'
+   isDynamic: false,
+   dynamicRadius: 5
+ }
```

### 3. 更新 setBrushThresholdForToolGroup 的调用 {#3-update-setbrushthresholdfortoolgroup-calls}

**迁移前：**

```diff
- segmentationUtils.setBrushThresholdForToolGroup(
-   toolGroupId,
-   thresholdArgs.threshold,
-   thresholdArgs
- );
```

**迁移后：**

```diff
+ segmentationUtils.setBrushThresholdForToolGroup(
+   toolGroupId,
+   fullThresholdArgs
+ );
```

注意 `thresholdArgs` 现在应当是一个具有如下结构的对象：

```javascript
{
  range: [min, max], // 原先叫 'threshold'
  isDynamic: boolean,
  dynamicRadius: number
}
```
