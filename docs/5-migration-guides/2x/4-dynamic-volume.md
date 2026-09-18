---
id: dynamic-volume
title: 四维 / 动态体数据
description: 从 1.x 升级到 2.x 时四维（动态）体数据的迁移。splitImageIdsBy4DTags 的返回字段由 imageIdsGroups 改为 imageIdGroups，StreamingDynamicImageVolume 构造参数改用 imageIdGroups，getScalarData 被移除转由 VoxelManager 承担，getDataInTime 的 imageCoordinate 改名为 worldCoordinate，generateImageFromTimeData 的签名也有变化。
keywords:
  - 四维体数据
  - 动态体数据
  - imageIdGroups
  - StreamingDynamicImageVolume
  - VoxelManager
  - getDataInTime
  - generateImageFromTimeData
  - Cornerstone3D 2.x 迁移
upstream: https://www.cornerstonejs.org/docs/migration-guides/2x/dynamic-volume
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 四维 / 动态体数据 {#4d-or-dynamic-volume}

我们认为这块内容足够重要，值得单独设一节。

## imageIdsGroups 改名为 imageIdGroups {#imageidsgroups-is-now-imageidgroups}

如果你原先是用 `splitImageIdsBy4DTags` 来取 imageIdsGroups 的，
那么现在返回对象里的字段是 `imageIdGroups`，而不是 `imageIdsGroups`。

迁移做法：

```js
const { imageIdsGroups } = splitImageIdsBy4DTags(imageIds);
```

应改为

```js
const { imageIdGroups } = splitImageIdsBy4DTags(imageIds);
```

## StreamingDynamicImageVolume {#streamingdynamicimagevolume}

### 构造函数的变化 {#constructor-changes}

构造函数签名已更新：改为接收 `imageIdGroups`，而不是若干独立的
`scalarData` 数组。

<Tabs>
  <TabItem value="Before" label="迁移前 📦 " default>

```typescript
constructor(
  imageVolumeProperties: Types.ImageVolumeProps & { splittingTag: string },
  streamingProperties: Types.IStreamingVolumeProperties
) {
  // ...
}
```

  </TabItem>
  <TabItem value="After" label="迁移后 🚀🚀">

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

1. 修改构造函数的调用，传入 `imageIdGroups` 而不是 `scalarData`。
2. 删掉此前处理 `scalarData` 数组的那些代码。

### 管理 ImageId 的新方法 {#new-methods-for-imageid-management}

版本 2 引入了几个管理 image ID 的新方法：

- `getCurrentTimePointImageIds()`
- `flatImageIdIndexToTimePointIndex()`
- `flatImageIdIndexToImageIdIndex()`

**迁移步骤：**

1. 用 `getCurrentTimePointImageIds()` 取得当前时间点的 image ID。
2. 用 `flatImageIdIndexToTimePointIndex()` 和
   `flatImageIdIndexToImageIdIndex()` 在扁平索引与时间点 / 影像索引之间换算。

### getScalarData 方法被移除，动态影像体数据改用 VoxelManager {#removal-of-getscalardata-method-and-using-voxelmanager-for-dynamic-image-volumes}

`getScalarData()` 方法在版本 2 中被移除，改由新的 VoxelManager 承担。

在版本 2 中，`StreamingDynamicImageVolume` 类现在使用 `VoxelManager`
来处理时间点数据。这带来了更高效的内存管理，
也让跨时间点访问体素数据更容易。下面是用 `VoxelManager`
访问和操作动态影像体数据的方式。

#### 访问体素数据 {#accessing-voxel-data}

访问当前时间点的体素数据：

```typescript
const voxelValue = volume.voxelManager.get(index);
```

访问某个特定时间点的体素数据：

```typescript
const voxelValue = volume.voxelManager.getAtIndexAndTimePoint(index, timePoint);
```

#### 取得标量数据 {#getting-scalar-data}

取得当前时间点完整的标量数据数组：

```typescript
const scalarData = volume.voxelManager.getCurrentTimePointScalarData();
```

取得某个特定时间点的标量数据：

```typescript
const scalarData = volume.voxelManager.getTimePointScalarData(timePoint);
```

#### 取得体数据信息 {#getting-volume-information}

可以通过 `VoxelManager` 访问体数据的各项属性：

```typescript
const scalarDataLength = volume.voxelManager.getScalarDataLength();
const dataType = volume.voxelManager.getConstructor();
const dataRange = volume.voxelManager.getRange();
const middleSliceData = volume.voxelManager.getMiddleSliceData();
```

**迁移步骤：**

1. 把对 `scalarData` 数组的直接访问，替换为调用相应的 `VoxelManager` 方法。
2. 把此前手工管理时间点的代码，改用 `VoxelManager` 那些「知道时间点」的方法。
3. 用 `getCurrentTimePointScalarData()` 或 `getTimePointScalarData(tp)`
   替代已被移除的 `getScalarData()` 方法。
4. 如果需要跨所有时间点做操作，可以借助 `numTimePoints` 属性
   配合 `getTimePointScalarData(tp)` 方法来遍历。

借助 `VoxelManager`，你就能高效地处理动态影像体数据，
而不必手工管理多个标量数据数组。这种方式带来更好的性能和内存占用，
对时间点很多的大型数据集尤其明显。

## 导出与引入 {#exports-imports}

如果你此前使用的是 `@cornerstonejs/streaming-image-volume-loader`，
就需要更新 import，并可能要调整代码以使用 `@cornerstonejs/core`
中那套整合后的体数据加载 API。

<Tabs>
  <TabItem value="Before" label="迁移前 📦 " default>

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
  <TabItem value="After" label="迁移后 🚀🚀">

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

## getDataInTime {#getdataintime}

`imageCoordinate` 选项现在改名为 `worldCoordinate`，
以更准确地反映它是一个世界坐标、而不是影像坐标。

<Tabs>
<TabItem value="Before" label="迁移前 📦 " default>

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
<TabItem value="After" label="迁移后 🚀">

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

### 用法示例 {#usage-example}

<Tabs>
<TabItem value="Before" label="迁移前 📦 " default>

```typescript
const result = getDataInTime(dynamicVolume, {
  frameNumbers: [0, 1, 2],
  imageCoordinate: [100, 100, 100],
});
```

</TabItem>
<TabItem value="After" label="迁移后 🚀">

```typescript
const result = getDataInTime(dynamicVolume, {
  frameNumbers: [0, 1, 2],
  worldCoordinate: [100, 100, 100],
});
```

</TabItem>
</Tabs>

## generateImageFromTimeData {#generateimagefromtimedata}

<Tabs>
<TabItem value="Before" label="迁移前 📦 " default>

```typescript
function generateImageFromTimeData(
  dynamicVolume: Types.IDynamicImageVolume,
  operation: string,
  frameNumbers?: number[]
);
```

</TabItem>
<TabItem value="After" label="迁移后 🚀">

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

### 主要变化 {#key-changes}

1. `operation` 现在使用 `Enums.GenerateImageType` 枚举。
2. 帧号改为放在一个 options 对象里传入。
3. 该函数现在显式返回 `Float32Array`。

### 用法示例 {#usage-example-1}

<Tabs>
<TabItem value="Before" label="迁移前 📦 " default>

```typescript
const result = generateImageFromTimeData(dynamicVolume, 'SUM', [0, 1, 2]);
```

</TabItem>
<TabItem value="After" label="迁移后 🚀">

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

## 其他变化汇总 {#summary-of-other-changes}

- 新增了 `updateVolumeFromTimeData` 函数，用于就地更新体数据。
- 这两个函数现在都使用 `voxelManager`，性能更好。
- 错误处理得到加强，错误信息也做了统一。
- 各项操作现在使用 `Enums.GenerateImageType`，类型安全性更好。

:::note 后续版本的进一步变化

本页描述的是 2.x 的状态。基于**时间点**（time point）的这套 API
在 4.x 中已被移除，改为基于**维度组**（dimension group）的 API——
`timePointIndex` 变为从 1 起算的 `dimensionGroupNumber`，
相关事件也一并改名。如果你要升级到 4.x 或更高版本，请接着看
[动态体数据 API 的变化](../4x/2-dynamic-volume-api.md)。

:::
