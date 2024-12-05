---

id: dynamic-volume  
title: '4D 或 动态体积'

---

import Tabs from '@theme/Tabs';  
import TabItem from '@theme/TabItem';

# 4D 或 动态体积

我们认为这个话题足够重要，值得单独设立一个章节。

## imageIdsGroups 现在是 imageIdGroups

如果你之前使用 `splitImageIdsBy4DTags` 获取 `imageIdsGroups`，现在你应该期望返回的对象包含 `imageIdGroups` 而不是 `imageIdsGroups`。

迁移步骤：

```js
const { imageIdsGroups } = splitImageIdsBy4DTags(imageIds);
```

应改为：

```js
const { imageIdGroups } = splitImageIdsBy4DTags(imageIds);
```

## StreamingDynamicImageVolume

### 构造函数变化

构造函数的签名已更新，现在包含 `imageIdGroups`，而不是独立的 `scalarData` 数组。

<Tabs>  
  <TabItem value="Before" label="Before 📦 " default>  

```typescript  
constructor(  
  imageVolumeProperties: Types.ImageVolumeProps & { splittingTag: string },  
  streamingProperties: Types.IStreamingVolumeProperties  
) {  
  // ...  
}  
```  

  </TabItem>  
  <TabItem value="After" label="After 🚀🚀">  

```typescript  
constructor(  
  imageVolumeProperties: ImageVolumeProps & {  
    splittingTag: string;  
    imageIdGroups: string[][];  
  },  
  streamingProperties: IStreamingVolumeProperties  
) {  
  // ...  
}  
```  

  </TabItem>  
</Tabs>

**迁移步骤：**

1. 更新构造函数调用，包含 `imageIdGroups`，而不是 `scalarData`。
2. 移除任何处理 `scalarData` 数组的代码。

### 新的图像 ID 管理方法

版本 2 引入了新的方法来管理图像 ID：

- `getCurrentTimePointImageIds()`
- `flatImageIdIndexToTimePointIndex()`
- `flatImageIdIndexToImageIdIndex()`

**迁移步骤：**

1. 使用 `getCurrentTimePointImageIds()` 获取当前时间点的图像 ID。
2. 使用 `flatImageIdIndexToTimePointIndex()` 和 `flatImageIdIndexToImageIdIndex()` 来转换平坦索引和时间点/图像索引。

### 移除 `getScalarData` 方法并使用 VoxelManager 管理动态图像体积

在版本 2 中，`getScalarData()` 方法已被移除，取而代之的是新的 `VoxelManager`。

在版本 2 中，`StreamingDynamicImageVolume` 类现在使用 `VoxelManager` 来处理时间点数据。这一变化提供了更高效的内存管理，并且使得跨不同时间点访问体素数据变得更加容易。以下是如何使用 `VoxelManager` 访问和操作动态图像体积中的数据：

#### 访问体素数据

要访问当前时间点的体素数据：

```typescript
const voxelValue = volume.voxelManager.get(index);
```

要访问特定时间点的体素数据：

```typescript
const voxelValue = volume.voxelManager.getAtIndexAndTimePoint(index, timePoint);
```

#### 获取标量数据

要获取当前时间点的完整标量数据数组：

```typescript
const scalarData = volume.voxelManager.getCurrentTimePointScalarData();
```

要获取特定时间点的标量数据：

```typescript
const scalarData = volume.voxelManager.getTimePointScalarData(timePoint);
```

#### 获取体积信息

你可以通过 `VoxelManager` 访问各种体积属性：

```typescript
const scalarDataLength = volume.voxelManager.getScalarDataLength();
const dataType = volume.voxelManager.getConstructor();
const dataRange = volume.voxelManager.getRange();
const middleSliceData = volume.voxelManager.getMiddleSliceData();
```

**迁移步骤：**

1. 替换直接访问 `scalarData` 数组的代码，改为调用适当的 `VoxelManager` 方法。
2. 更新任何手动管理时间点的代码，改为使用 `VoxelManager` 的时间点感知方法。
3. 使用 `getCurrentTimePointScalarData()` 或 `getTimePointScalarData(tp)` 替代已移除的 `getScalarData()` 方法。
4. 如果需要对所有时间点执行操作，可以使用 `numTimePoints` 属性和 `getTimePointScalarData(tp)` 方法进行迭代。

通过利用 `VoxelManager`，你可以高效地处理动态图像体积，而无需手动管理多个标量数据数组。这种方法在性能和内存使用上具有更好的表现，特别是对于包含大量时间点的大型数据集。

## 导出与导入

如果你之前使用过 `@cornerstonejs/streaming-image-volume-loader`，你需要更新你的导入，并可能需要调整代码以使用 `@cornerstonejs/core` 中的新集成体积加载 API。

<Tabs>  
  <TabItem value="Before" label="Before 📦 " default>  

```js  
import {  
  cornerstoneStreamingDynamicImageVolumeLoader,  
  StreamingDynamicImageVolume,  
  helpers,  
  Enums,  
} from '@cornerstonejs/streaming-image-volume-loader';  

Enums.Events.DYNAMIC_VOLUME_TIME_POINT_INDEX_CHANGED;  
```  

  </TabItem>  
  <TabItem value="After" label="After 🚀🚀">  

```js  
import {  
  cornerstoneStreamingDynamicImageVolumeLoader,  
  StreamingDynamicImageVolume,  
} from '@cornerstonejs/core';  

import { getDynamicVolumeInfo } from '@cornerstonejs/core/utilities';  
import { Enums } from '@cornerstonejs/core/enums';  

Enums.Events.DYNAMIC_VOLUME_TIME_POINT_INDEX_CHANGED;  
```  

  </TabItem>  
</Tabs>

## getDataInTime

现在 `imageCoordinate` 选项已更名为 `worldCoordinate`，以更准确地反映它是世界坐标而非图像坐标。

<Tabs>  
  <TabItem value="Before" label="Before 📦 " default>  

```typescript  
function getDataInTime(  
  dynamicVolume: Types.IDynamicImageVolume,  
  options: {  
    frameNumbers?;  
    maskVolumeId?;  
    imageCoordinate?;  
  }  
): number[] | number[][];  
```  

  </TabItem>  
  <TabItem value="After" label="After 🚀">  

```typescript  
function getDataInTime(  
  dynamicVolume: Types.IDynamicImageVolume,  
  options: {  
    frameNumbers?;  
    maskVolumeId?;  
    worldCoordinate?;  
  }  
): number[] | number[][];  
```  

  </TabItem>  
</Tabs>

### 使用示例

<Tabs>  
  <TabItem value="Before" label="Before 📦 " default>  

```typescript  
const result = getDataInTime(dynamicVolume, {  
  frameNumbers: [0, 1, 2],  
  imageCoordinate: [100, 100, 100],  
});  
```  

  </TabItem>  
  <TabItem value="After" label="After 🚀">  

```typescript  
const result = getDataInTime(dynamicVolume, {  
  frameNumbers: [0, 1, 2],  
  worldCoordinate: [100, 100, 100],  
});  
```  

  </TabItem>  
</Tabs>

## generateImageFromTimeData

<Tabs>  
  <TabItem value="Before" label="Before 📦 " default>  

```typescript  
function generateImageFromTimeData(  
  dynamicVolume: Types.IDynamicImageVolume,  
  operation: string,  
  frameNumbers?: number[]  
);  
```  

  </TabItem>  
  <TabItem value="After" label="After 🚀">  

```typescript  
function generateImageFromTimeData(  
  dynamicVolume: Types.IDynamicImageVolume,  
  operation: Enums.GenerateImageType,  
  options: {  
    frameNumbers?: number[];  
  }  
): Float32Array;  
```  

  </TabItem>  
</Tabs>

### 关键变化

1. `operation` 现在使用 `Enums.GenerateImageType` 枚举。
2. 帧编号通过选项对象传递。
3. 函数显式返回 `Float32Array`。

### 使用示例

<Tabs>  
  <TabItem value="Before" label="Before 📦 " default>  

```typescript  
const result = generateImageFromTimeData(dynamicVolume, 'SUM', [0, 1, 2]);  
```  

  </TabItem>  
  <TabItem value="After" label="After 🚀">  

```typescript  
const result = generateImageFromTimeData(  
  dynamicVolume,  
  Enums.GenerateImageType.SUM,  
  {  
    frameNumbers: [0, 1, 2],  
  }  
);  
```  

  </TabItem>  
</Tabs>

## 其他变更概述

- 新增 `updateVolumeFromTimeData` 函数，用于就地更新体积。
- 两个函数现在使用 `voxelManager` 提高性能。
- 增强了错误处理和标准化的错误消息。
- 各种小的 API 和代码组织改进。

