---
id: voxelManager
title: 体素管理器
description: 体素管理器（VoxelManager）取代了直接访问 scalarData 的做法，为体素数据提供精确的读写接口而不生成大型数组。本文列出 getAtIndex、setAtIJK、forEach 等完整 API，给出从 scalarData 迁移过来的前后对照代码，以及内存与性能方面的最佳实践。
keywords:
  - 体素管理器
  - VoxelManager
  - getAtIndex
  - setAtIJK
  - getScalarDataLength
  - getCompleteScalarDataArray
  - scalarData 迁移
upstream: https://www.cornerstonejs.org/docs/concepts/cornerstone-core/voxelManager
---

# 体素管理器 {#voxelmanager-documentation}

VoxelManager 是 Cornerstone 库在体素数据与体数据管理方面新架构的关键组件。
这套重新设计的方案简化了数据流、提升了性能，为影像缓存和数据访问提供了
唯一可信来源，重点在于降低内存占用、提升处理大型影像数据集时的性能。

## 概览 {#overview}

引入 VoxelManager 之后，体素数据的处理方式从「依赖大型标量数组」
转变为「使用单张影像加有针对性的体素数据访问方法」。VoxelManager 为那些
需要与体素数据交互的工具和函数充当适配器，
提供访问、修改和流式处理体素信息的高效方法。

### 主要特性 {#key-features}

- **唯一可信来源**：只使用影像缓存，从而不再需要独立的体数据缓存，
  也减少了同步问题。
- **高效的体数据流式加载**：逐张影像加载，只缓存必要的部分，
  并把数据直接流向 GPU。
- **优化的缓存**：数据以其原生格式存储，仅在需要时才转换，
  把内存与处理开销降到最低。
- **简化的 Web Worker 实现**：移除了对 `SharedArrayBuffer` 的依赖，
  简化了安全性与 worker 方面的要求。

## VoxelManager API {#voxelmanager-api}

VoxelManager API 用一组方法取代了对标量数据的直接访问，
这些方法能精确控制体素数据，而不必生成大型数据数组。
下面是主要方法及用法模式：

### 访问体素数据 {#accessing-voxel-data}

- **`getScalarData()`**：返回单张影像的标量数据数组（仅适用于 `IImage`）。
- **`getScalarDataLength()`**：给出体素总数，用于替代 `scalarData.length`。
- **`getAtIndex(index)`**：取得指定线性索引处的体素值。
- **`setAtIndex(index, value)`**：设置指定线性索引处的体素值。
- **`getAtIJK(i, j, k)`**：取得 IJK 坐标处的体素值。
- **`setAtIJK(i, j, k, value)`**：设置 IJK 坐标处的体素值。
- **`getArrayOfModifiedSlices()`**：列出被修改过的切片索引。

### 数据操作 {#data-manipulation}

- **`forEach(callback, options)`**：遍历体素，通过回调处理或修改数据。
- **`toIndex(ijk)`**：把 IJK 坐标转换为线性索引。
- **`toIJK(index)`**：把线性索引转换回 IJK 坐标。

### 体数据信息 {#volume-information}

- **`getConstructor()`**：返回标量数据类型的构造函数。
- **`getBoundsIJK()`**：获取体数据在 IJK 坐标下的边界。

### 专用方法 {#specialized-methods}

- **`setTimePoint(timePoint)`**：用于四维数据集，设置当前时间点。
- **`getAtIndexAndTimePoint(index, timePoint)`**：取得指定索引与时间点处的体素值。

### 示例：迁移数据访问与操作 {#example-migrating-data-access-and-manipulation}

不要再直接访问 `scalarData`，改用 VoxelManager 来操作数据。
下面是一个迁移示例：

#### 迁移前 {#before}

```javascript
function processVolume(volume) {
  const scalarData = volume.getScalarData();
  for (let i = 0; i < scalarData.length; i++) {
    if (scalarData[i] > 100) {
      scalarData[i] = 100;
    }
  }
}
```

#### 迁移后 {#after}

```javascript
function processVolume(volume) {
  const voxelManager = volume.voxelManager;
  const length = voxelManager.getScalarDataLength();
  for (let i = 0; i < length; i++) {
    const value = voxelManager.getAtIndex(i);
    if (value > 100) {
      voxelManager.setAtIndex(i, 100);
    }
  }
}
```

## 构建影像体数据 {#handling-image-volume-construction}

创建体数据时不再需要 `scalarData`，改为在内部使用 `VoxelManager`：

#### 迁移前 {#before-1}

```typescript
const streamingImageVolume = new StreamingImageVolume({
  volumeId,
  metadata,
  dimensions,
  spacing,
  origin,
  direction,
  scalarData,
  sizeInBytes,
  imageIds,
});
```

#### 迁移后 {#after-1}

```typescript
const streamingImageVolume = new StreamingImageVolume({
  volumeId,
  metadata,
  dimensions,
  spacing,
  origin,
  direction,
  imageIds,
  dataType,
  numberOfComponents,
});
```

## 最佳实践 {#best-practices}

- **优化数据访问**：批量操作请用 `getAtIndex` 和 `setAtIndex`，它们效率更高；
  遍历大体数据时用 `forEach`。
- **内存管理**：避免使用 `getCompleteScalarDataArray()`，
  它会重建大型数据数组，可能导致性能下降。
- **处理 RGB 数据**：对 RGB 体数据，`getAtIndex` 和 `getAtIJK`
  返回的是 `[r, g, b]` 数组。

## 小结 {#conclusion}

VoxelManager 是 Cornerstone 新的体数据管理策略的核心，
为体素数据的访问与操作提供了一套灵活、高效的 API。
迁移到 VoxelManager 之后，内存使用更高效、性能更快，
对大型数据集的兼容性也更好，让处理复杂医学影像数据的开发流程更顺畅。
