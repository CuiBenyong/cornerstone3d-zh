---
id: dynamic-volume-api
title: 动态体数据 API 的变化
description: 4.x 中基于时间点（timepoint）的动态体数据 API 已被移除，改用基于维度组（dimension group）的 API。本文列出被移除的属性、方法与事件，给出逐项的前后对照，并特别提醒维度组编号是从 1 开始的、而旧的 timePointIndex 是从 0 开始的。
keywords:
  - 动态体数据
  - dimensionGroupNumber
  - timePointIndex
  - StreamingDynamicImageVolume
  - DYNAMIC_VOLUME_DIMENSION_GROUP_CHANGED
  - 四维体数据
  - Cornerstone3D 4.x 迁移
upstream: https://www.cornerstonejs.org/docs/migration-guides/4x/dynamic-volume-api
---

# 动态体数据 API 的变化 {#dynamic-volume-api-changes}

## 变化内容 {#what-changed}

在 4.x 版本中，已废弃的、基于时间点（timepoint）的动态体数据 API 被移除，
改用基于维度组（dimension group）的 API。

### 被移除的 API {#removed-apis}

以下这些已废弃的属性和方法被移除：

#### IDynamicImageVolume 接口 {#idynamicimagevolume-interface}

- `timePointIndex` getter / setter
- `numTimePoints` 属性

#### StreamingDynamicImageVolume 类 {#streamingdynamicimagevolume-class}

- `timePointIndex` getter / setter
- `numTimePoints` 属性
- `getCurrentTimePointImageIds()` 方法
- `flatImageIdIndexToTimePointIndex()` 方法
- `isTimePointLoaded()` 方法
- `checkTimePointCompletion()` 方法

#### 事件 {#events}

- `DYNAMIC_VOLUME_TIME_POINT_INDEX_CHANGED`
- `DYNAMIC_VOLUME_TIME_POINT_LOADED`

## 迁移指南 {#migration-guide}

如果你已经在用基于维度组的 API，那就不需要迁移。
如果你仍在用那套已废弃的时间点 API，请按下面的方式更新代码。

### 属性的更新 {#property-updates}

```javascript
// 迁移前（3.x）
volume.timePointIndex = 2; // 从 0 开始
const index = volume.timePointIndex;
const count = volume.numTimePoints;

// 迁移后（4.x）
volume.dimensionGroupNumber = 3; // 从 1 开始（2 + 1）
const groupNumber = volume.dimensionGroupNumber;
const count = volume.numDimensionGroups;
```

### 方法的更新 {#method-updates}

```javascript
// 迁移前（3.x）
const imageIds = volume.getCurrentTimePointImageIds();
const tpIndex = volume.flatImageIdIndexToTimePointIndex(flatIndex);
const isLoaded = volume.isTimePointLoaded(timePointIndex);

// 迁移后（4.x）
const imageIds = volume.getCurrentDimensionGroupImageIds();
const groupNumber = volume.flatImageIdIndexToDimensionGroupNumber(flatIndex);
const isLoaded = volume.isDimensionGroupLoaded(groupNumber);
```

### 事件的更新 {#event-updates}

```javascript
// 迁移前（3.x）
eventTarget.addEventListener(
  Events.DYNAMIC_VOLUME_TIME_POINT_INDEX_CHANGED,
  handler
);
eventTarget.addEventListener(Events.DYNAMIC_VOLUME_TIME_POINT_LOADED, handler);

// 迁移后（4.x）
eventTarget.addEventListener(
  Events.DYNAMIC_VOLUME_DIMENSION_GROUP_CHANGED,
  handler
);
eventTarget.addEventListener(
  Events.DYNAMIC_VOLUME_DIMENSION_GROUP_LOADED,
  handler
);
```

## 重要提示 {#important-notes}

- 维度组编号是**从 1 开始**的（从 1 起算）
- 旧的 timePointIndex 是**从 0 开始**的（从 0 起算）
- 换算时，把 timePointIndex 加 1 就得到 dimensionGroupNumber

## 为什么要做这项改动 {#why-we-changed-this}

「维度组」这个术语更贴合实际的数据结构，也与 DICOM 标准保持一致，
使这套 API 更直观、更统一。
