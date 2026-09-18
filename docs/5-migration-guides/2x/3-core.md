---
id: core
title: "@cornerstonejs/core"
description: 从 1.x 升级到 2.x 时 core 包的全部变更。涵盖初始化时移除 detect-gpu、体数据视口 actor UID 与 referencedId 的区分、视口 API 的调整、新的像素数据模型与 VoxelManager、volumeLoader 各函数的签名变化、targetBufferType 改为 targetBuffer 对象、Cache 类的更新，以及枚举与事件的重命名。
keywords:
  - "@cornerstonejs/core"
  - detect-gpu
  - gpuTier
  - referencedId
  - getVolumeId
  - VoxelManager
  - targetBuffer
  - createAndCacheDerivedLabelmapVolume
  - VIEWPORT_NEW_IMAGE_SET
  - Cornerstone3D 2.x 迁移
upstream: https://www.cornerstonejs.org/docs/migration-guides/2x/core
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# @cornerstonejs/core {#cornerstonejscore}

## 初始化 {#initialization}

### 移除 `detect-gpu` 与 `detectGPUConfig` {#removal-of-detect-gpu-and-detectgpuconfig}

Cornerstone3D 2.x 移除了对 `detect-gpu` 的依赖。这解决了那些在受限网络环境中
工作的用户所反馈的问题——因为 `detect-gpu` 需要联网才能判断 GPU 型号。

#### 主要变更 {#key-changes}

1. **默认 GPU 档位**：我们现在使用默认的 GPU 档位 2（中档）。
2. **不再依赖联网**：该库不再需要联网来做 GPU 检测。
3. **GPU 档位可配置**：如有需要，你仍然可以自行配置 GPU 档位。

#### 如何迁移 {#how-to-migrate}

如果你此前依赖 `detect-gpu` 来检测 GPU 档位，就需要更新初始化代码。
下面是以自定义 GPU 档位初始化 Cornerstone3D 的例子：

```js
cornerstone3D.init({ gpuTier: 3 });
```

### 移除 `use16BitDataType` {#removal-of-use16bitdatatype}

这个标志原本用来向 Web Worker 请求 16 位数据类型。
现在我们缓存时一律使用原生数据类型，需要渲染时再做转换。

### 移除 `enableCacheOptimization` {#removal-of-enablecacheoptimization}

不再需要它了，因为我们会自动为你优化缓存。

## 体数据视口的 Actor UID、ReferenceId 与 VolumeId {#volume-viewports-actor-uid-referenceid-and-volumeid}

### 此前的行为 {#previous-behavior}

以前给体数据视口添加体数据时，确定 actor UID 的逻辑是这样的：

```js
const uid = actorUID || volumeId;
volumeActors.push({
  uid,
  actor,
  slabThickness,
  referenceId: volumeId,
});
```

在这套写法里，actor UID 和 `referenceId` 都被设成了 `volumeId`。
这是有问题的：它会创建出 UID 完全相同的 actor，
而它们本该各自唯一。而且代码库中到处依赖 `actor.uid` 去缓存里取体数据，
这就更让人困惑了。

### 更新后的行为 {#updated-behavior}

我们做了下面这些改动，以提升清晰度和功能性。actor UID 现在是独立的，
逻辑如下：

```js
const uid = actorUID || uuidv4();
volumeActors.push({
  uid,
  actor,
  slabThickness,
  referencedId: volumeId,
});
```

### 主要变更 {#key-changes-1}

1. **actor UID 唯一**：actor UID 现在始终是一个唯一标识（`uuidv4()`），
   而 `referencedId` 被设为 `volumeId`。如果你的代码原先依赖 `actor.uid`
   去取体数据，现在应改用 `referencedId`，或者用新的
   `viewport.getVolumeId()` 方法来取 `volumeId`——后者是推荐做法。

2. **`referenceId` 改名为 `referencedId`**：为提升清晰度，
   `referenceId` 改名为 `referencedId`。这与我们库中的命名约定一致，
   例如 `referencedImageId` 和 `referencedVolumeId`。
   由于一个 actor 既可能派生自体数据、也可能派生自影像，
   用 `referencedId` 能更准确地描述它的作用。

这些改动应该能让逻辑更易理解，也避免 UID 重复带来的问题。

### 迁移做法 {#migrations}

<Tabs>
  <TabItem value="Before" label="迁移前 📦 " default>

```js
const defaultActor = viewport.getDefaultActor();
const volumeId = defaultActor.uid;
const volume = cache.getVolume(volumeId);
```

或者

```js
volumeId = viewport.getDefaultActor()?.uid;
cache.getVolume(volumeId)?.metadata.Modality;
```

或者

```js
const { uid: volumeId } = viewport.getDefaultActor();
```

  </TabItem>
  <TabItem value="After" label="迁移后 🚀🚀">

```js
const volume = cache.getVolume(viewport.getVolumeId());
```

  </TabItem>
</Tabs>

## 视口 API {#viewport-apis}

### ImageDataMetaData {#imagedatametadata}

<Tabs>
  <TabItem value="Before" label="迁移前 📦 " default>

```js
interface ImageDataMetaData {
  // ……其他属性
  numComps: number;
  // ……其他属性
}
```

  </TabItem>
  <TabItem value="After" label="迁移后 🚀🚀">

```js
export interface ImageDataMetaData {
  // ……其他属性
  numberOfComponents: number;
  // ……其他属性
}
```

  </TabItem>
</Tabs>

### 重置相机 {#reset-camera}

以前 `resetCamera` 方法接收的是位置参数，现在改为接收一个对象参数。

<Tabs>
  <TabItem value="Before" label="迁移前 📦 " default>

```js
viewport.resetCamera(false, true, false);
```

  </TabItem>
  <TabItem value="After" label="迁移后 🚀🚀">

```js
viewport.resetCamera({
  resetZoom: true,
  resetPan: false,
  resetToCenter: false,
});
```

  </TabItem>
</Tabs>

### 旋转 {#rotation}

`rotation` 属性已从 `getProperties` 和 `setProperties` 中移除，
转移到了 `getViewPresentation` / `setViewPresentation`，
或 `getCamera` / `setCamera` 上。

<Tabs>
  <TabItem value="Before" label="迁移前 📦 " default>

```js
viewport.getProperties().rotation;
viewport.setProperties({ rotation: 10 });
```

  </TabItem>
  <TabItem value="After" label="迁移后 🚀🚀">

```js
const { rotation } = viewport.getViewPresentation();

// 或者

const { rotation } = viewport.getCamera();

viewport.setViewPresentation({ rotation: 10 });

// 或者

viewport.setCamera({ rotation: 10 });
```

  </TabItem>
</Tabs>

<details>
<summary>为什么？</summary>

`rotation` 不是视口的属性，而是视图层面的属性。
现在可以通过 `getViewPresentation` 访问它。

</details>

### getReferenceId {#getreferenceid}

`getReferenceId` 现在叫 `getViewReferenceId`。

```js
viewport.getReferenceId() -- > viewport.getViewReferenceId();
```

<details>
<summary>为什么？</summary>

用 `getViewReferenceId` 更准确地反映了该方法的实际作用——
它返回的是视图相关的信息，而不是关于 actor 引用的信息。

</details>

## 新的像素数据模型与 VoxelManager {#new-pixeldata-model-and-voxelmanager}

Cornerstone 库在「如何处理影像体数据与纹理管理」这件事上做了重大改动。
这些改动的目标是提升性能、降低内存占用、并提供更高效的数据访问——
对大型数据集尤其如此。

1. 唯一可信来源
   - 以前：数据同时存在于影像缓存和体数据缓存中，会带来同步问题。
   - 现在：只有一个可信来源——影像缓存。
   - 好处：堆栈分割与体数据分割之间的同步得到改善。

2. 新的体数据创建方式
   - 现在一切都以影像的形式加载。
   - 体数据的流式加载是逐张影像进行的。
   - 只有影像会被缓存进影像缓存。
   - 做体数据渲染时，数据直接从影像缓存进入 GPU，绕过 CPU 端的标量数据。
   - 好处：不再需要在 CPU 中保留标量数据，内存占用下降，性能提升。

3. 面向工具的 VoxelManager
   - 充当索引与标量数据之间的中间层。
   - 提供从 IJK 到索引的映射器。
   - 在不创建标量数据的前提下取得所需信息。
   - 逐张影像分别处理。
   - 好处：高效支持那些需要在 CPU 中拿到像素数据的工具。

4. 处理非影像类体数据
   - 没有影像的体数据（例如 NIfTI）会被切分并转换为堆栈形式。
   - 这让非影像类体数据也能适配新的「以影像为单位」的方案。

5. 优化后的缓存机制
   - 数据以其原生格式存储，而不再一律缓存为 float32。
   - 更新 GPU 纹理时再即时转换为所需格式。
   - 好处：内存占用下降，省掉了不必要的数据类型转换。

6. 去掉 SharedArrayBuffer
   - 移除了对 SharedArrayBuffer 的依赖。
   - 每张解码后的影像直接以正确的尺寸和位置进入 GPU 的三维纹理。
   - 好处：安全限制减少，Web Worker 的实现得以简化。

**结果**

- 数据流从影像缓存直达 GPU，链路更顺。
- 内存占用与性能都有改善。
- 对各类体数据格式的兼容性更好。
- 影像与体数据处理的整体系统架构得到优化。
- Web Worker 的实现被简化（现在 ArrayBuffer 就够了）。

### VoxelManager 的引入 {#introduction-of-voxelmanager}

新增了一个 `VoxelManager` 类来更高效地处理体素数据。
这项改动使我们不必再为体数据分配大型标量数据数组，
而是依赖单张影像加上一个名为 VoxelManager 的适配器。

**迁移步骤：**

1. 把直接访问标量数据改为调用 `VoxelManager` 的方法：

   不要再用 `volume.getScalarData()`，改用 `volume.voxelManager` 来与数据交互。

2. 标量数据长度：

   用 `voxelManager.getScalarDataLength()` 替代 `scalarData.length`。

3. 标量数据的操作：

   a. 用 `getAtIndex(index)` 和 `setAtIndex(index, value)` 访问和修改体素数据。

   b. 对三维坐标，用 `getAtIJK(i, j, k)` 和 `setAtIJK(i, j, k, value)`。

4. VoxelManager 可用的方法：
   - `getScalarData()`：返回整个标量数据数组（仅适用于 IImage，不适用于体数据）。
   - `getScalarDataLength()`：返回体素总数。
   - `getAtIndex(index)`：取得指定索引处的取值。
   - `setAtIndex(index, value)`：设置指定索引处的取值。
   - `getAtIJK(i, j, k)`：取得指定 IJK 坐标处的取值。
   - `setAtIJK(i, j, k, value)`：设置指定 IJK 坐标处的取值。
   - `getArrayOfModifiedSlices()`：返回被修改过的切片索引数组。
   - `forEach(callback, options)`：带回调函数地遍历体素。
   - `getConstructor()`：返回标量数据类型的构造函数。
   - `getBoundsIJK()`：返回该体数据在 IJK 坐标下的边界。
   - `toIndex(ijk)`：把 IJK 坐标转换为线性索引。
   - `toIJK(index)`：把线性索引转换为 IJK 坐标。

5. 处理被修改过的切片：

   用 `voxelManager.getArrayOfModifiedSlices()` 取得被修改切片的列表。

6. 遍历体素：

   用 `forEach` 方法做高效遍历：

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

7. 取得体数据信息：
   - 维度：`volume.dimensions`
   - 间距：`volume.spacing`
   - 方向：`volume.direction`
   - 原点：`volume.origin`

8. 对 RGB 数据：

   处理 RGB 数据时，`getAtIndex` 和 `getAtIJK` 方法返回的是数组 `[r, g, b]`。

9. 性能方面的考虑：
   - 批量操作时尽量用 `getAtIndex` 和 `setAtIndex`，
     它们通常比 `getAtIJK` 和 `setAtIJK` 更快。
   - 要遍历体数据中较大一部分时，可以考虑用 `forEach` 以获得更优性能。

10. 动态体数据：

    对四维数据集，还有额外的方法可用：
    - `setTimePoint(timePoint)`：设置当前时间点。
    - `getAtIndexAndTimePoint(index, timePoint)`：取得指定索引与时间点处的取值。

一个简单的体数据处理函数的迁移示例：

<Tabs>
  <TabItem value="Before" label="迁移前 📦 " default>

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
  <TabItem value="After" label="迁移后 🚀🚀">

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

按上面这些扩展后的迁移步骤来做、并充分利用 VoxelManager 的能力，
你就能高效地处理体数据，同时享受到新系统带来的性能提升与内存占用下降。

**体数据（IImageVolume）的迁移步骤：**

1. 处理体数据时，在你自己的代码库里搜索 `getScalarData` 或 `scalarData`。
   改用 `voxelManager` 提供的标量数据 API。

:::info
如果你无法使用 `getAtIndex` 和 `getAtIJK` 这种逐个取值的 API，
可以退而使用 `voxelManager.getCompleteScalarDataArray()`
来像 cornerstone3D 1.0 那样重建出完整的标量数据数组。
但出于性能和内存方面的考虑，并不推荐这么做，只应作为最后手段。

同理也可以用 `.setCompleteScalarDataArray`。
:::

**堆栈影像（IImage）的迁移步骤：**

1. 堆栈影像这边变化不大，你仍然可以用 `image.getPixelData()`，
   或者通过 `image.voxelManager.getScalarData()` 访问标量数据数组。

:::info
**只有**体数据没有直接的 `scalarData` 数组，需要改用 `voxelManager`
按索引或 IJK 访问标量数据。单张影像的标量数据操作方式保持不变。
:::

### 影像体数据的构建 {#image-volume-construction}

影像体数据的构建方式已更新为使用 `VoxelManager` 和新的属性，
不再需要大型标量数据数组。

:::info
如前所述，体数据对象里没有 scalarData 数组，
用 imageIds 就足以描述这份体数据了。
:::

<Tabs>
  <TabItem value="Before" label="迁移前 📦 " default>

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
  <TabItem value="After" label="迁移后 🚀🚀">

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

1. 从构造函数参数中去掉 `scalarData` 和 `sizeInBytes`。
2. 向构造函数参数中加入 `dataType` 和 `numberOfComponents`。
3. `VoxelManager` 会依据这些参数在内部创建。

**说明：**
这项改动体现了从「使用大型标量数据数组」转向「用 VoxelManager 管理数据」
的思路转变。它带来更高效的内存使用，也更好地支持流式数据。

#### 访问体数据的属性 {#accessing-volume-properties}

由于整合了 `VoxelManager`，有些体数据属性的访问方式变了。
原因是我们不再为体数据完整创建 vtkScalarData，所以不能像以前那样访问。

<Tabs>
  <TabItem value="Before" label="迁移前 📦 " default>

```typescript
const numberOfComponents = imageData
  .getPointData()
  .getScalars()
  .getNumberOfComponents();
```

  </TabItem>
  <TabItem value="After" label="迁移后 🚀🚀">

```typescript
const { numberOfComponents } = imageData.get('numberOfComponents');
```

  </TabItem>
</Tabs>

**迁移步骤：**

1. 把 `getPointData().getScalars().getNumberOfComponents()` 替换为
   `get('numberOfComponents')`。
2. 用解构语法取出 `numberOfComponents` 属性。

:::info
这些改动是 Cornerstone 库在影像体数据与纹理处理方面的一次重大更新。
引入 VoxelManager、并取消体数据的大型标量数据数组，带来若干好处：

1. 内存占用下降：依赖单张影像而不是一整个大数组缓冲区，
   内存占用显著减少，对大型数据集尤其明显。
2. 性能提升：VoxelManager 让数据访问和操作更高效，整体性能更好。
3. 更好地支持流式加载：这套新方式更适合流式处理大型数据集，
   因为它不需要一次把整份体数据载入内存。
4. 数据管理更灵活：无论底层数据结构如何，VoxelManager
   都提供了统一的访问与修改体素数据的接口。

开发者需要更新代码以使用新的 VoxelManager API，
并调整与体数据及纹理交互的方式。虽然这些改动可能需要对既有代码做不小的更新，
但它们为处理大型医学影像数据集提供了一个更高效、更灵活的基础。
:::

我们已经把这套新设计同时应用到了体数据视口和堆栈视口上。

## 影像加载器 {#image-loader}

:::note 上游此节为空

官方英文原文中「Image Loader」这一节只有标题、没有正文。
影像加载器在 2.x 中的相关变更，可以参考
[@cornerstonejs/dicom-image-loader](./6-dicom-image-loader.md) 那一页，
概念性说明见[影像加载器](../../1-concepts/cornerstone-core/imageLoader.md)。

:::

## VolumeLoader {#volumeloader}

体数据的加载与缓存功能在版本 2 中有较大改动，
主要包括 API 的简化、部分工具函数的移除，
以及体数据创建与缓存方式的变化。

### 体数据创建函数的变化 {#changes-in-volume-creation-functions}

`createLocalVolume` 函数已更新：现在第一个参数是 `volumeId`，
第二个参数是 options。

<Tabs>
  <TabItem value="Before" label="迁移前 📦 " default>

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
  <TabItem value="After" label="迁移后 🚀🚀">

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

1. 更新所有 `createLocalVolume` 的调用，把 `volumeId` 参数挪到第一位。
2. 去掉 `preventCache` 参数；如有需要，另行处理缓存。

### 派生体数据创建的变化 {#changes-in-derived-volume-creation}

`createAndCacheDerivedVolume` 函数现在同步返回，不再返回 Promise。

<Tabs>
  <TabItem value="Before" label="迁移前 📦 " default>

```typescript
async function createAndCacheDerivedVolume(
  referencedVolumeId: string,
  options: DerivedVolumeOptions
): Promise<IImageVolume> {
  // ...
}
```

  </TabItem>
  <TabItem value="After" label="迁移后 🚀🚀">

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

1. 调用 `createAndCacheDerivedVolume` 时去掉 `await`。
2. 把那些期待 Promise 的代码改为处理同步返回值。

### 被重命名的函数 {#renamed-functions}

有些函数为表意清晰而改了名：

- `createAndCacheDerivedSegmentationVolume` 现在叫 `createAndCacheDerivedLabelmapVolume`
- `createLocalSegmentationVolume` 现在叫 `createLocalLabelmapVolume`

**迁移步骤：**

1. 把所有对这些函数的调用改用新名字。
2. 确认引用了这些函数的代码都已相应更新。

### targetBuffer 类型的迁移 {#target-buffer-type-migration}

整个库中，`targetBufferType` 选项都已被 `targetBuffer` 对象取代。
这项改动影响多个函数和接口。

<Tabs>
  <TabItem value="Before" label="迁移前 📦 " default>

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
  <TabItem value="After" label="迁移后 🚀🚀">

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

1. 把所有使用 `targetBufferType` 的接口和函数签名改为使用 `targetBuffer`。
2. 把所有 `targetBufferType: 'SomeType'` 改为 `targetBuffer: { type: 'SomeType' }`。
3. 更新所有此前使用 `targetBufferType` 的函数调用，改用新的 `targetBuffer` 对象结构。
4. 检查并更新所有依赖 `targetBufferType` 属性的代码，确保它们改用 `targetBuffer.type`。

### `createAndCacheDerivedImage` 函数的变化 {#changes-in-createandcachederivedimage-function}

`createAndCacheDerivedImage` 函数现在直接返回一个 `IImage` 对象，
而不再返回 Promise。

<Tabs>
  <TabItem value="Before" label="迁移前 📦 " default>

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
  <TabItem value="After" label="迁移后 🚀🚀">

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

1. 把那些期待 `createAndCacheDerivedImage` 返回 Promise 的代码，
   改为直接使用返回的 `IImage` 对象。
2. 从函数调用中去掉 `preventCache` 参数，它已不再使用。

### 派生影像的创建 {#derived-image-creation}

`createAndCacheDerivedImage` 函数已更新为直接返回 `IImage` 对象，
而不再返回 Promise。

<Tabs>
  <TabItem value="Before" label="迁移前 📦 " default>

```typescript
function createAndCacheDerivedImage(
  referencedImageId: string,
  options: DerivedImageOptions = {}
): Promise<IImage> {
  // ...
}
```

  </TabItem>
  <TabItem value="After" label="迁移后 🚀🚀">

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

1. 使用 `createAndCacheDerivedImage` 时去掉所有 `await` 或 `.then()`。
2. 把错误处理改为捕获同步抛出的错误，而不是 Promise 的 rejection。

### 影像加载选项 {#image-loading-options}

`targetBufferType` 选项已被 `targetBuffer` 对象取代。

<Tabs>
  <TabItem value="Before" label="迁移前 📦 " default>

```typescript
const options: DerivedImageOptions = {
  targetBufferType: 'Uint8Array',
};
```

  </TabItem>
  <TabItem value="After" label="迁移后 🚀🚀">

```typescript
const options: DerivedImageOptions = {
  targetBuffer: { type: 'Uint8Array' },
};
```

  </TabItem>
</Tabs>

**迁移步骤：**

1. 把所有选项对象里的 `targetBufferType` 替换为 `targetBuffer`。
2. 把取值改为一个带 `type` 属性的对象。

### 分割影像辅助函数 {#segmentation-image-helpers}

分割影像的辅助函数已被重命名并更新。

<Tabs>
  <TabItem value="Before" label="迁移前 📦 " default>

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
  <TabItem value="After" label="迁移后 🚀🚀">

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

1. 把 `createAndCacheDerivedSegmentationImages` 改名为 `createAndCacheDerivedLabelmapImages`。
2. 把 `createAndCacheDerivedSegmentationImage` 改名为 `createAndCacheDerivedLabelmapImage`。
3. 更新函数调用，使用新名字和新的参数结构。
4. 使用 `createAndCacheDerivedLabelmapImage` 时去掉所有 `await` 或 `.then()`。

## Cache 类 {#cache-class}

`Cache` 类在版本 2 中有较大改动。以下是主要更新和破坏性变更：

### 移除体数据专属的缓存大小 {#removal-of-volume-specific-cache-size}

独立的体数据缓存大小已被移除，缓存管理得以简化——
因为我们现在只依赖影像缓存这一处。

**迁移步骤**：

1. 如果你有引用 `_volumeCacheSize` 的地方，请删掉。

### isCacheable 方法的更新 {#iscacheable-method-update}

`isCacheable` 方法已更新为会考虑共享缓存键。也就是说，
既然我们已经改为只用影像缓存，就必须小心判断哪些影像可以被清出缓存，
以免把视图仍在引用的那份体数据给移除掉。

### 新增 putImageSync 与 putVolumeSync 方法 {#new-putimagesync-and-putvolumesync-methods}

新增了 `putImageSync` 方法，用于同步地把一张影像直接放入缓存。

<Tabs>
  <TabItem value="Before" label="迁移前 📦 " default>

```typescript
// 该方法此前不存在
```

  </TabItem>
  <TabItem value="After" label="迁移后 🚀🚀">

```typescript
public putImageSync(imageId: string, image: IImage): void {
  // ...（校验代码）
}

public putVolumeSync(volumeId: string, volume: IImageVolume): void {
  // ...（校验代码）
}
```

  </TabItem>
</Tabs>

:::note 与原文的一处差异

官方英文原文中上面这段代码的围栏位置有误：`putVolumeSync` 那一半
漏在了代码块之外，被当作正文渲染，并且 `putImageSync` 缺少收尾的花括号。
这里已修正为一个完整的代码块。

:::

**迁移步骤**：

1. 需要同步地把影像或体数据加入缓存时，使用新的 `putImageSync`
   和 `putVolumeSync` 方法。

## 重命名与术语 {#renaming-and-nomenclature}

### 枚举 {#enums}

#### 移除 SharedArrayBufferModes {#removal-of-sharedarraybuffermodes}

由于我们不再使用 SharedArrayBuffer，这个枚举已被移除。

以下方法也已从 @cornerstonejs/core 中移除：

- getShouldUseSharedArrayBuffer
- setUseSharedArrayBuffer
- resetUseSharedArrayBuffer

#### ViewportType.WholeSlide → ViewportType.WHOLE_SLIDE {#viewporttypewholeslide---viewporttypewhole_slide}

以与库中其余部分保持一致。

迁移前

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

迁移后

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

### 事件与事件详情 {#events-and-event-details}

#### VOLUME_SCROLL_OUT_OF_BOUNDS → VOLUME_VIEWPORT_SCROLL_OUT_OF_BOUNDS {#volume_scroll_out_of_bounds---volume_viewport_scroll_out_of_bounds}

现在叫 `VOLUME_VIEWPORT_SCROLL_OUT_OF_BOUNDS`。

#### STACK_VIEWPORT_NEW_STACK → VIEWPORT_NEW_IMAGE_SET {#stack_viewport_new_stack---viewport_new_image_set}

现在叫 VIEWPORT_NEW_IMAGE_SET，我们会逐步让所有视口都改用这个事件。

此外，该事件现在是在**元素**上触发的，而不是在 eventTarget 上。

```js
eventTarget.addEventListener(Events.VIEWPORT_NEW_IMAGE_SET, newStackHandler);

// 现在应改为

element.addEventListener(Events.VIEWPORT_NEW_IMAGE_SET, newStackHandler);
```

<details>
<summary>为什么？</summary>

我们这样改是为了保持一致性——因为其他所有事件（例如 VOLUME_NEW_IMAGE）
都是在元素上触发的。这样做也更合理：当视口拿到一批新的堆栈时，
就应该在该视口元素本身上触发事件。

</details>

#### CameraModifiedEventDetail {#cameramodifiedeventdetail}

它不再发布 `rotation`，该字段已移入事件中所发布的 ICamera。

```js
type CameraModifiedEventDetail = {
  previousCamera: ICamera,
  camera: ICamera,
  element: HTMLDivElement,
  viewportId: string,
  renderingEngineId: string,
};
```

请从 camera 对象中取 rotation——它此前位于事件详情的根层级。

#### ImageVolumeModifiedEventDetail {#imagevolumemodifiedeventdetail}

事件详情中不再提供 `imageVolume`，只提供 `volumeId`，
以与库中其他条目保持一致。这项改动确保了整个库的做法统一。

如果你需要 imageVolume，可以通过 `cache.getVolume` 方法取得。

---
