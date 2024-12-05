---
id: voxelManager
title: 体素管理器
---

# VoxelManager 文档

VoxelManager 是 Cornerstone 库用于处理体素数据和体积管理的新架构的关键组件。此更新的设计简化了数据流并增强了性能，为图像缓存和数据访问提供了单一事实来源，重点是减少内存使用并提高处理大型图像数据集的性能。

## 概述

通过集成 VoxelManager，体素数据处理从依赖大型标量数组转变为使用单个图像和目标体素数据访问方法。 VoxelManager 充当与体素数据交互的工具和功能的适配器，提供访问、修改和流式传输体素信息的有效方法。

### 主要特点

- **单一事实来源**：仅使用图像缓存，无需单独的体积缓存并减少同步问题。
- **高效的体积流**：逐个加载图像，仅缓存必要的内容并将数据直接流式传输到 GPU。
- **优化缓存**：数据以其本机格式存储，并仅根据需要进行转换，最大限度地减少内存和处理开销。
- **简化的 Web Worker 实现**：删除了 `SharedArrayBuffer` 依赖项，简化了安全性和工作人员要求。

## VoxelManager API

VoxelManager API 使用提供对体素数据的精确控制而无需生成大型数据数组的方法取代了直接标量数据访问。以下是主要方法和使用模式：

### 访问体素数据

- **`getScalarData()`**：返回单个图像的标量数据数组（仅适用于“IImage”）。
- **`getScalarDataLength()`**：提供总体素计数，替换“scalarData.length”。
- **`getAtIndex(index)`**：检索特定线性索引处的体素值。
- **`setAtIndex(index, value)`**：设置特定线性索引处的体素值。
- **`getAtIJK(i, j, k)`**：获取 IJK 坐标处的体素值。
- **`setAtIJK(i, j, k, value)`**：设置 IJK 坐标处的体素值。
- **`getArrayOfModifiedSlices()`**：列出修改后的切片索引。

### 数据操作

- **`forEach(callback, options)`**：使用回调迭代体素以处理或修改数据。
- **`toIndex(ijk)`**：将 IJK 坐标转换为线性索引。
- **`toIJK(index)`**：将线性索引转换回 IJK 坐标。

### 体积信息

- **`getConstructor()`**：返回标量数据类型构造函数。
- **`getBoundsIJK()`**：获取 IJK 坐标中的体积边界。

### 专用方法

- **`setTimePoint(timePoint)`**：对于 4D 数据集，设置当前时间点。
- **`getAtIndexAndTimePoint(index, timePoint)`**：检索指定索引和时间点处的体素值。

### 示例：迁移数据访问和操作

使用 VoxelManager 进行数据操作，而不是直接访问“scalarData”。这是一个迁移示例：

#### 之前

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

#### 之后

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

## 处理图像体构建

创建体时，不再需要“scalarData”。相反，在内部使用“VoxelManager”：

#### 之前

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

#### 之后

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

## 最佳实践

- **数据访问优化**：由于效率较高，请使用“getAtIndex”和“setAtIndex”进行批量操作。使用“forEach”进行大批量迭代。
- **内存管理**：避免使用“getCompleteScalarDataArray()”，因为它会重建大型数据数组并会降低性能。
- **处理 RGB 数据**：`getAtIndex` 和 `getAtIJK` 返回 RGB 体积的 `[r, g, b]` 数组。

## 结论

VoxelManager 是 Cornerstone 新体积管理策略的核心，为体素数据访问和操作提供灵活、高效的 API。迁移到 VoxelManager 可以提高内存使用效率、提高性能并提高与大型数据集的兼容性，从而确保开发人员处理复杂医学成像数据的工作流程更加顺畅。
