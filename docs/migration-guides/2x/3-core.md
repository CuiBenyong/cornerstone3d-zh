---  
id: core  
title: '@cornerstonejs/core'  
---  

import Tabs from '@theme/Tabs';  
import TabItem from '@theme/TabItem';  

# @cornerstonejs/core

## 初始化

### 移除 `detect-gpu` 和 `detectGPUConfig`

Cornerstone3D 2.x 版本已经移除了对 `detect-gpu` 的依赖。此更改解决了在互联网访问受限的环境中使用者所报告的问题，因为 `detect-gpu` 依赖于互联网连接来确定 GPU 型号。

#### 主要更改：

1. **默认 GPU 层级**：我们现在使用默认的 GPU 层级 2（中等层级）。
2. **无互联网依赖**：该库不再需要互联网连接来检测 GPU。
3. **可配置 GPU 层级**：如果需要，您仍然可以配置自定义 GPU 层级。

#### 如何迁移：

如果您之前依赖 `detect-gpu` 来检测 GPU 层级，您需要更新您的初始化代码。以下是如何使用自定义 GPU 层级初始化 Cornerstone3D 的示例：

```js
cornerstone3D.init({ gpuTier: 3 });
```

### 移除 `use16BitDataType`

此标志要求从 web worker 获取 16 位数据类型。现在，我们始终使用原生数据类型进行缓存存储，并在必要时进行渲染时转换。

### 移除 `enableCacheOptimization`

此功能不再需要，因为我们会自动为您优化缓存。

## Volume Viewports Actor UID、ReferenceId 和 VolumeId

### 以前的行为

在将一个体积添加到体积视口时，用来确定演员 UID 的逻辑如下：

```js
const uid = actorUID || volumeId;
volumeActors.push({
  uid,
  actor,
  slabThickness,
  referenceId: volumeId,
});
```

在这种设置中，演员的 UID 和 `referenceId` 都被设置为 `volumeId`。这是有问题的，因为它会创建具有相同 UID 的演员，即使它们本应是唯一的。在代码库中，我们依赖 `actor.uid` 从缓存中获取体积，这进一步导致了混乱。

### 更新后的行为

我们对逻辑进行了以下更改，以提高清晰度和功能性。现在，演员 UID 是独立的，使用以下逻辑：

```js
const uid = actorUID || uuidv4();
volumeActors.push({
  uid,
  actor,
  slabThickness,
  referencedId: volumeId,
});
```

### 主要更改

1. **唯一的演员 UID**：演员 UID 现在始终是唯一的标识符（`uuidv4()`），而 `referencedId` 被设置为 `volumeId`。如果您的代码依赖于 `actor.uid` 来获取体积，您现在应使用 `referencedId` 或新的 `viewport.getVolumeId()` 方法来获取 `volumeId`，这是推荐的方式。
   
2. **将 `referenceId` 重命名为 `referencedId`**：为了提高清晰度，`referenceId` 被重命名为 `referencedId`。此更改与我们库中的命名约定一致，例如 `referencedImageId` 和 `referencedVolumeId`。由于演员可以来源于体积或图像，使用 `referencedId` 更准确地描述了它的作用。

这些更改应使逻辑更加清晰，并防止出现重复 UID 的问题。

### 迁移

<Tabs>  
  <TabItem value="Before" label="之前 📦 " default>

```js
const defaultActor = viewport.getDefaultActor();
const volumeId = defaultActor.uid;
const volume = cache.getVolume(volumeId);
```

或

```js
volumeId = viewport.getDefaultActor()?.uid;
cache.getVolume(volumeId)?.metadata.Modality;
```

或

```js
const { uid: volumeId } = viewport.getDefaultActor();
```

  </TabItem>  
  <TabItem value="After" label="之后 🚀🚀">

```js
const volume = cache.getVolume(viewport.getVolumeId());
```

  </TabItem>  
</Tabs>

## Viewport API

### ImageDataMetaData

<Tabs>  
  <TabItem value="Before" label="之前 📦 " default>

```js
interface ImageDataMetaData {
  // ... 其他属性
  numComps: number;
  // ... 其他属性
}
```

  </TabItem>  
  <TabItem value="After" label="之后 🚀🚀">

```js
export interface ImageDataMetaData {
  // ... 其他属性
  numberOfComponents: number;
  // ... 其他属性
}
```

  </TabItem>  
</Tabs>

### 重置相机

之前，我们有一个 `resetCamera` 方法，它接受位置参数。现在它接受一个对象参数。

<Tabs>  
  <TabItem value="Before" label="之前 📦 " default>

```js
viewport.resetCamera(false, true, false);
```

  </TabItem>  
  <TabItem value="After" label="之后 🚀🚀">

```js
viewport.resetCamera({
  resetZoom: true,
  resetPan: false,
  resetToCenter: false,
});
```

  </TabItem>  
</Tabs>

### 旋转

`rotation` 属性已从 `getProperties` 和 `setProperties` 中移除，转移到了 `getViewPresentation` 和 `setViewPresentation` 或 `getCamera` 和 `setCamera` 中。

<Tabs>  
  <TabItem value="Before" label="之前 📦 " default>

```js
viewport.getProperties().rotation;
viewport.setProperties({ rotation: 10 });
```

  </TabItem>  
  <TabItem value="After" label="之后 🚀🚀">

```js
const { rotation } = viewport.getViewPresentation();

// 或

const { rotation } = viewport.getCamera();

viewport.setViewPresentation({ rotation: 10 });

// 或

viewport.setCamera({ rotation: 10 });
```

  </TabItem>  
</Tabs>

<details>  
<summary>为什么？</summary>  

`rotation` 不是视口的一个属性，而是视图的一个属性。现在您可以通过 `getViewPresentation` 来访问它。

</details>

### getReferenceId

`getReferenceId` 现在改为 `getViewReferenceId`

```js
viewport.getReferenceId() -- > viewport.getViewReferenceId();
```

<details>  
<summary>为什么？</summary>  

使用 `getViewReferenceId` 更准确地反映了该方法的实际功能，因为它返回的是特定视图的信息，而不是演员引用。

</details>

## 新的 PixelData 模型和 VoxelManager

Cornerstone 库在处理图像体积和纹理管理方面进行了重大更改。这些更改旨在提高性能、减少内存使用，并提供更高效的数据访问，特别是对于大型数据集。

1. 单一的数据来源

   - 之前：数据同时存在于图像缓存和体积缓存中，导致同步问题。
   - 现在：只有一个数据来源——图像缓存。
   - 好处：提高了堆栈和体积分割之间的同步。

2. 新的体积创建方式

   - 现在所有内容都以图像形式加载。
   - 体积流式传输按图像逐个进行。
   - 只有图像被缓存到图像缓存中。
   - 对于体积渲染，数据直接从图像缓存传输到 GPU，跳过 CPU 标量数据。
   - 好处：消除了 CPU 中标量数据的需求，减少了内存使用，提高了性能。

3. VoxelManager 为工具提供支持

   - 作为索引和标量数据之间的中介。
   - 提供从 IJK 到索引的映射。
   - 在不创建标量数据的情况下获取信息。
   - 每个图像单独处理。
   - 好处：高效处理需要 CPU 中像素数据的工具。

4. 处理非图像体积

   - 没有图像的体积（如 NIFTI）被切割并转换为堆栈格式。
   - 使得非图像体积与新的基于图像的方式兼容。

5. 优化的缓存机制

   - 数据以原生格式存储，而不是总是缓存为 float32。
   - 更新 GPU 纹理时按需转换为所需格式。
   - 好处：减少内存使用，消除了不必要的数据类型转换。

6. 消除 SharedArrayBuffer

   - 移除了对 SharedArrayBuffer 的依赖。
   - 每个解码后的图像直接进入 GPU 3D 纹理，按正确的大小和位置放置。
   - 好处：减少了安全限制，简化了 Web Worker 的实现。

**结果**

- 流程简化，数据从图像缓存直接传输到 GPU。
- 提高了内存使用和性能。
- 增强了对各种体积格式的兼容性。
- 优化了图像和体积处理的整体系统架构。
- 简化了 Web Worker 实现（现在只需要 ArrayBuffer）。

### 引入 VoxelManager

引入了一个新的 `VoxelManager`

 类，用于管理和组织体积数据。此类负责提供有效的体积访问，同时处理渲染、处理、存储的所有细节。

```js
const voxelManager = new VoxelManager({
  volumeId,
  imageData: imageData,
});
```

**迁移步骤：**

1. 使用 `VoxelManager` 方法替换直接的标量数据访问：

   不再使用 `volume.getScalarData()`，改用 `volume.voxelManager` 来与数据交互。

2. 标量数据长度：

   使用 `voxelManager.getScalarDataLength()` 替代 `scalarData.length`。

3. 标量数据操作：

   a. 使用 `getAtIndex(index)` 和 `setAtIndex(index, value)` 来访问和修改体素数据。

   b. 对于 3D 坐标，使用 `getAtIJK(i, j, k)` 和 `setAtIJK(i, j, k, value)`。

4. 可用的 VoxelManager 方法：

   - `getScalarData()`：返回整个标量数据数组（仅对 IImage 有效，不适用于体积）。
   - `getScalarDataLength()`：返回体素的总数。
   - `getAtIndex(index)`：获取特定索引处的值。
   - `setAtIndex(index, value)`：设置特定索引处的值。
   - `getAtIJK(i, j, k)`：获取特定 IJK 坐标处的值。
   - `setAtIJK(i, j, k, value)`：设置特定 IJK 坐标处的值。
   - `getArrayOfModifiedSlices()`：返回已修改切片的索引数组。
   - `forEach(callback, options)`：使用回调函数迭代体素。
   - `getConstructor()`：返回标量数据类型的构造函数。
   - `getBoundsIJK()`：返回体积在 IJK 坐标中的边界。
   - `toIndex(ijk)`：将 IJK 坐标转换为线性索引。
   - `toIJK(index)`：将线性索引转换为 IJK 坐标。

5. 处理已修改的切片：

   使用 `voxelManager.getArrayOfModifiedSlices()` 获取已修改切片的列表。

6. 迭代体素：

   使用 `forEach` 方法进行高效的迭代：

   ```javascript
   voxelManager.forEach(
     ({ value, index, pointIJK, pointLPS }) => {
       // 操作或处理体素数据
     },
     {
       boundsIJK: optionalBounds,
       imageData: optionalImageData, // 用于 LPS 计算
     }
   );
   ```

7. 获取体积信息：

   - 尺寸：`volume.dimensions`
   - 间距：`volume.spacing`
   - 方向：`volume.direction`
   - 原点：`volume.origin`

8. 对于 RGB 数据：

   如果处理 RGB 数据，`getAtIndex` 和 `getAtIJK` 方法将返回一个数组 `[r, g, b]`。

9. 性能考虑：

   - 当可能时，使用 `getAtIndex` 和 `setAtIndex` 进行批量操作，因为它们通常比 `getAtIJK` 和 `setAtIJK` 更快。
   - 当迭代大部分体积时，考虑使用 `forEach` 来优化性能。

10. 动态体积：

    对于 4D 数据集，提供了额外的方法：

    - `setTimePoint(timePoint)`：设置当前时间点。
    - `getAtIndexAndTimePoint(index, timePoint)`：获取特定索引和时间点的值。

迁移一个简单体积处理函数的示例：

<Tabs>
  <TabItem value="Before" label="之前 📦 " default>

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

  </TabItem>
  <TabItem value="After" label="之后 🚀🚀">

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

  </TabItem>
</Tabs>

通过遵循这些扩展的迁移步骤并充分利用 `VoxelManager` 的功能，您可以高效地处理体积数据，同时享受新系统带来的性能提升和内存使用减少。

**体积（IImageVolume）的迁移步骤：**

1. 在处理体积数据时，搜索您的自定义代码库中的 `getScalarData` 或 `scalarData`。改为使用 `voxelManager` 来访问标量数据 API。

:::info
如果无法通过 `getAtIndex` 和 `getAtIJK` 使用原子数据 API，您可以回退到使用 `voxelManager.getCompleteScalarDataArray()` 来重新构建完整的标量数据数组，像在 cornerstone3D 1.0 中那样。然而，由于性能和内存方面的考虑，这并不推荐，仅在最后的情况下使用。

您也可以使用 `.setCompleteScalarDataArray`。
:::

**堆栈图像（IImage）的迁移步骤：**

1. 对于堆栈图像，变化不大，您仍然可以使用 `image.getPixelData()` 或通过 `image.voxelManager.getScalarData()` 访问标量数据数组。

:::info
仅对体积而言，没有直接的 `scalarData` 数组。请使用 `voxelManager` 来访问标量数据（通过索引或 IJK 坐标）。单个图像的标量数据操作保持不变。
:::

### 图像体积构建

图像体积的构建已经更新为使用 `VoxelManager` 和新属性，消除了大规模标量数据数组的需求。

:::info
如前所述，体积对象中没有 `scalarData` 数组，`imageIds` 足以描述体积。
:::

<Tabs>
  <TabItem value="Before" label="之前 📦 " default>

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

  </TabItem>
  <TabItem value="After" label="之后 🚀🚀">

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

  </TabItem>
</Tabs>

**迁移步骤：**

1. 从构造函数参数中移除 `scalarData` 和 `sizeInBytes`。
2. 将 `dataType` 和 `numberOfComponents` 添加到构造函数参数中。
3. `VoxelManager` 将根据这些参数在内部创建。

**解释：**
此更改反映了从使用大规模标量数据数组转向使用 `VoxelManager` 进行数据管理。这可以实现更高效的内存使用，并更好地处理流数据。

#### 访问体积属性

由于 `VoxelManager` 的集成，一些体积属性的访问方式发生了变化。原因是我们不再为体积完全创建 `vtkScalarData`，因此无法像以前那样访问。

<Tabs>
  <TabItem value="Before" label="Before 📦 " default>

```typescript
const numberOfComponents = imageData
  .getPointData()
  .getScalars()
  .getNumberOfComponents();
```

  </TabItem>
  <TabItem value="After" label="After 🚀🚀">

```typescript
const { numberOfComponents } = imageData.get('numberOfComponents');
```

  </TabItem>
</Tabs>

**迁移步骤：**

1. 将 `getPointData().getScalars().getNumberOfComponents()` 替换为 `get('numberOfComponents')`。
2. 使用解构语法提取 `numberOfComponents` 属性。

::info
这些更改代表了 Cornerstone 库对图像体积和纹理处理的重大更新。引入 `VoxelManager` 和消除体积的巨大标量数据数组带来了以下几个好处：

1. **减少内存使用：** 通过依赖单个图像而不是大型数组缓冲区，显著减少了内存使用，尤其是对于大型数据集。
2. **提高性能：** `VoxelManager` 允许更高效的数据访问和操作，从而提高整体性能。
3. **更好的流式支持：** 新方法更适合流式处理大型数据集，因为它不需要一次性将整个体积加载到内存中。
4. **更灵活的数据管理：** `VoxelManager` 提供了一个统一的接口，用于访问和修改体素数据，无论底层数据结构如何。

开发人员需要更新代码以使用新的 `VoxelManager` API，并调整与体积数据和纹理的交互方式。虽然这些更改可能需要对现有代码进行重大更新，但它们为处理大型医学影像数据集提供了更高效和灵活的基础。
:::

我们已将这一新设计应用于体积和堆栈视口。

## 图像加载器

## 体积加载器

版本 2 中的体积加载和缓存功能发生了重大变化。主要更新包括 API 的简化、移除某些工具函数，以及体积创建和缓存方式的变化。

### 体积创建函数的变化

`createLocalVolume` 函数已更新，`volumeId` 作为第一个参数，`options` 作为第二个参数。

<Tabs>
  <TabItem value="Before" label="Before 📦 " default>

```typescript
function createLocalVolume(
  options: LocalVolumeOptions,
  volumeId: string,
  preventCache = false
): IImageVolume {
  // ...
}
```

  </TabItem>
  <TabItem value="After" label="After 🚀🚀">

```typescript
function createLocalVolume(
  volumeId: string,
  options = {} as LocalVolumeOptions
): IImageVolume {
  // ...
}
```

  </TabItem>
</Tabs>

**迁移步骤：**

1. 更新所有对 `createLocalVolume` 的调用，将 `volumeId` 参数移到第一个位置。
2. 移除 `preventCache` 参数，如果需要，单独处理缓存。

### 派生体积创建的变化

`createAndCacheDerivedVolume` 函数现在同步返回，而不是返回一个 Promise。

<Tabs>
  <TabItem value="Before" label="Before 📦 " default>

```typescript
async function createAndCacheDerivedVolume(
  referencedVolumeId: string,
  options: DerivedVolumeOptions
): Promise<IImageVolume> {
  // ...
}
```

  </TabItem>
  <TabItem value="After" label="After 🚀🚀">

```typescript
function createAndCacheDerivedVolume(
  referencedVolumeId: string,
  options: DerivedVolumeOptions
): IImageVolume {
  // ...
}
```

  </TabItem>
</Tabs>

**迁移步骤：**

1. 移除调用 `createAndCacheDerivedVolume` 时的 `await` 关键字。
2. 更新任何期望 Promise 的代码，以处理同步返回值。

### 重命名函数

一些函数已被重命名以增强清晰度：

- `createAndCacheDerivedSegmentationVolume` 现在是 `createAndCacheDerivedLabelmapVolume`
- `createLocalSegmentationVolume` 现在是 `createLocalLabelmapVolume`

**迁移步骤：**

1. 更新所有调用这些函数的地方，使用它们的新名称。
2. 确保任何引用这些函数的代码也被相应地更新。

### 目标缓冲区类型迁移

`targetBufferType` 选项已被替换为库中各个地方的 `targetBuffer` 对象。这一更改影响了多个函数和接口。

<Tabs>
  <TabItem value="Before" label="Before 📦 " default>

```typescript
interface DerivedImageOptions {
  targetBufferType?: PixelDataTypedArrayString;
  // ...
}

function createAndCacheDerivedImage(
  referencedImageId: string,
  options: DerivedImageOptions = {
    targetBufferType: 'Uint8Array',
  }
): Promise<IImage> {
  // ...
}

function createAndCacheDerivedImages(
  referencedImageIds: Array<string>,
  options: DerivedImageOptions & {
    targetBufferType?: PixelDataTypedArrayString;
  } = {}
): DerivedImages {
  // ...
}
```

  </TabItem>
  <TabItem value="After" label="After 🚀🚀">

```typescript
interface DerivedImageOptions {
  targetBuffer?: {
    type: PixelDataTypedArrayString;
  };
  // ...
}

function createAndCacheDerivedImage(
  referencedImageId: string,
  options: DerivedImageOptions = {}
): IImage {
  // ...
}

function createAndCacheDerivedImages(
  referencedImageIds: string[],
  options: DerivedImageOptions & {
    targetBuffer?: {
      type: PixelDataTypedArrayString;
    };
  } = {}
): IImage[] {
  // ...
}
```

  </TabItem>
</Tabs>

**迁移步骤：**

1. 更新所有使用 `targetBufferType` 的接口和函数签名，改为使用 `targetBuffer`。
2. 将所有出现的 `targetBufferType: 'SomeType'` 改为 `targetBuffer: { type: 'SomeType' }`。
3. 更新所有之前使用 `targetBufferType` 的函数调用，改为使用新的 `targetBuffer` 对象结构。
4. 检查并更新所有依赖 `targetBufferType` 属性的代码，确保现在使用的是 `targetBuffer.type`。

### `createAndCacheDerivedImage` 函数的变更

`createAndCacheDerivedImage` 函数现在直接返回一个 `IImage` 对象，而不是一个 Promise。

<Tabs>
  <TabItem value="Before" label="Before 📦 " default>

```typescript
export function createAndCacheDerivedImage(
  referencedImageId: string,
  options: DerivedImageOptions = {},
  preventCache = false
): Promise<IImage> {
  // ...
  return imageLoadObject.promise;
}
```

  </TabItem>
  <TabItem value="After" label="After 🚀🚀">

```typescript
export function createAndCacheDerivedImage(
  referencedImageId: string,
  options: DerivedImageOptions = {}
): IImage {
  // ...
  return localImage;
}
```

  </TabItem>
</Tabs>

**迁移步骤：**

1. 更新任何期望从 `createAndCacheDerivedImage` 获得 Promise 的代码，改为使用直接返回的 `IImage` 对象。
2. 移除函数调用中的 `preventCache` 参数，因为该参数不再使用。

### 派生图像创建

`createAndCacheDerivedImage` 函数已经更新，直接返回 `IImage` 对象，而不是一个 Promise。

<Tabs>
  <TabItem value="Before" label="Before 📦 " default>

```typescript
function createAndCacheDerivedImage(
  referencedImageId: string,
  options: DerivedImageOptions = {}
): Promise<IImage> {
  // ...
}
```

  </TabItem>
  <TabItem value="After" label="After 🚀🚀">

```typescript
function createAndCacheDerivedImage(
  referencedImageId: string,
  options: DerivedImageOptions = {}
): IImage {
  // ...
}
```

  </TabItem>
</Tabs>

**迁移步骤：**

1. 移除使用 `createAndCacheDerivedImage` 时的 `await` 或 `.then()` 调用。
2. 更新错误处理，捕获同步错误，而不是 Promise 拒绝错误。

### 图像加载选项

`targetBufferType` 选项已被 `targetBuffer` 对象替换。

<Tabs>
  <TabItem value="Before" label="Before 📦 " default>

```typescript
const options: DerivedImageOptions = {
  targetBufferType: 'Uint8Array',
};
```

  </TabItem>
  <TabItem value="After" label="After 🚀🚀">

```typescript
const options: DerivedImageOptions = {
  targetBuffer: { type: 'Uint8Array' },
};
```

  </TabItem>
</Tabs>

**迁移步骤：**

1. 在所有选项对象中将 `targetBufferType` 替换为 `targetBuffer`。
2. 更新值为一个包含 `type` 属性的对象。

### 分割图像助手

分割图像助手函数已经重命名并更新。

<Tabs>
  <TabItem value="Before" label="Before 📦 " default>

```typescript
function createAndCacheDerivedSegmentationImages(
  referencedImageIds: Array<string>,
  options: DerivedImageOptions = {
    targetBufferType: 'Uint8Array',
  }
): DerivedImages {
  // ...
}

function createAndCacheDerivedSegmentationImage(
  referencedImageId: string,
  options: DerivedImageOptions = {
    targetBufferType: 'Uint8Array',
  }
): Promise<IImage> {
  // ...
}
```

  </TabItem>
  <TabItem value="After" label="After 🚀🚀">

```typescript
function createAndCacheDerivedLabelmapImages(
  referencedImageIds: string[],
  options = {} as DerivedImageOptions
): IImage[] {
  return createAndCacheDerivedImages(referencedImageIds, {
    ...options,
    targetBuffer: { type: 'Uint8Array' },
  });
}

function createAndCacheDerivedLabelmapImage(
  referencedImageId: string,
  options = {} as DerivedImageOptions
): IImage {
  return createAndCacheDerivedImage(referencedImageId, {
    ...options,
    targetBuffer: { type: 'Uint8Array' },
  });
}
```

  </TabItem>
</Tabs>

**迁移步骤：**

1. 将 `createAndCacheDerivedSegmentationImages` 重命名为 `createAndCacheDerivedLabelmapImages`。
2. 将 `createAndCacheDerivedSegmentationImage` 重命名为 `createAndCacheDerivedLabelmapImage`。
3. 更新函数调用，使用新的名称和参数结构。
4. 使用 `createAndCacheDerivedLabelmapImage` 时，移除任何 `await` 或 `.then()` 调用。

## 缓存类

`Cache` 类在版本 2 中经历了显著的变化。以下是主要的更新和不兼容的更改：

### 移除特定于体积的缓存大小

独立的体积缓存大小已被移除，简化了缓存管理，因为我们现在只依赖图像缓存。

**迁移步骤：**

1. 如果曾经使用过 `_volumeCacheSize`，请移除相关引用。

### `isCacheable` 方法更新

`isCacheable` 方法已经更新，以考虑共享缓存键。这意味着，由于我们现在只使用图像缓存，因此需要小心哪些图像可以被移除，以免删除仍由视图引用的体积。

### 新增 `putImageSync` 和 `putVolumeSync` 方法

新增了 `putImageSync` 方法，允许直接同步将图像放入缓存。

<Tabs>
  <TabItem value="Before" label="Before 📦 " default>

```typescript
// 方法不存在
```

  </TabItem>
  <TabItem value="After" label="After 🚀🚀">

```typescript
public putImageSync(imageId: string, image: IImage): void {
  // ... (验证代码)
}

public putVolumeSync(volumeId: string, volume: IImageVolume): void {
  // ... (验证代码)
}
```

  </TabItem>
</Tabs>

**迁移步骤：**

1. 当需要将图像或体积同步添加到缓存时，使用新的 `putImageSync` 和 `putVolumeSync` 方法。

## 重命名和命名法

### 枚举

#### 移除 `SharedArrayBufferModes`

由于不再使用 `SharedArrayBuffer`，该枚举已被移除。

以下方法也已从 `@cornerstonejs/core` 中移除：

- `getShouldUseSharedArrayBuffer`
- `setUseSharedArrayBuffer`
- `resetUseSharedArrayBuffer`

#### `ViewportType.WholeSlide` -> `ViewportType.WHOLE_SLIDE`

为了与库中的其他部分保持一致，做了名称更改。

变更前：

```js
const viewportInput = {
    viewportId,
    type: ViewportType.WholeSlide,
    element,
    defaultOptions: {
      background: <Types.Point3>[0.2, 0, 0.2],
    },
  };

renderingEngine.enableElement(viewportInput);
```

变更后：

```js
const viewportInput = {
    viewportId,
    type: ViewportType.WHOLE_SLIDE,
    element,
    defaultOptions: {
      background: <Types.Point3>[0.2, 0, 0.2],
    },
  };

renderingEngine.enableElement(viewportInput);
```

### 事件和事件详情

#### `VOLUME_SCROLL_OUT_OF_BOUNDS` -> `VOLUME_VIEWPORT_SCROLL_OUT_OF_BOUNDS`

现在是 `VOLUME_VIEWPORT_SCROLL_OUT_OF_BOUNDS`。

#### `STACK_VIEWPORT_NEW_STACK` -> `VIEWPORT_NEW_IMAGE_SET`

现在是 `VIEWPORT_NEW_IMAGE_SET`，我们将逐步让所有视口使用该事件。此外，该事件现在发生在元素上，而不是事件目标。

变更前：

```js
eventTarget.addEventListener(Events.VIEWPORT_NEW_IMAGE_SET, newStackHandler);
```

变更后：

```js
element.addEventListener(Events.VIEWPORT_NEW_IMAGE_SET, newStackHandler);
```

<details>
<summary>为什么？</summary>

我们做出这个更改是为了保持一致性，因为所有其他事件（如 `VOLUME_NEW_IMAGE`）都是发生在元素上的。此修改更加合理，因为当视口有新的堆栈时，应该触发该事件在视口元素上。
</details>

#### `CameraModifiedEventDetail`

不再发布 `rotation`，它已移至 `ICamera`，并在事件中发布。

```js
type CameraModifiedEventDetail = {
  previousCamera: ICamera,
  camera: ICamera,
  element: HTMLDivElement,
  viewportId: string,
  renderingEngineId: string,
};
```

从相机对象中访问 `rotation`，该对象之前在事件详情根部。

#### `ImageVolumeModifiedEventDetail`

`imageVolume` 不再在事件详情中提供。现在，事件详情中只显示 `volumeId`，以保持与库中其他条目的一致性。这个更改确保了整个库内容的统一方法。

如果需要 `imageVolume`，可以通过 `cache.getVolume` 方法获取。

---