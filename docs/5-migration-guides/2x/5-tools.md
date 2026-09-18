---
id: tools
title: "@cornerstonejs/tools"
description: 从 1.x 升级到 2.x 时 tools 包的全部变更。核心是全新的分割模型——分割从「绑定工具组」改为「按视口划分」，表示形式由 segmentationId 加 type 共同标识，数据与可视化彻底解耦。本文逐项给出状态结构、添加分割与表示形式、事件、样式配置、活动分割、可见性、加锁、颜色、PolySeg 以及各类重命名的前后对照。
keywords:
  - "@cornerstonejs/tools"
  - 分割模型
  - 按视口划分
  - addSegmentations
  - addLabelmapRepresentationToViewport
  - getStyle
  - setStyle
  - SegmentationDisplayTool
  - StackScrollTool
  - Cornerstone3D 2.x 迁移
upstream: https://www.cornerstonejs.org/docs/migration-guides/2x/tools
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# @cornerstonejs/tools {#cornerstonejstools}

## triggerAnnotationRenderForViewportIds {#triggerannotationrenderforviewportids}

现在只需要 viewportIds，不再需要传 renderingEngine。

```js
triggerAnnotationRenderForViewportIds(renderingEngine, viewportIds) ---> triggerAnnotationRenderForViewportIds(viewportIds)
```

<details>
<summary>为什么？</summary>
由于每个视口对应一个渲染引擎，就没必要再把渲染引擎作为参数传进来了。
</details>

## 工具 {#tools}

### StackScrollMouseWheelTool → StackScrollTool {#stackscrollmousewheeltool---stackscrolltool}

我们把鼠标滚轮与工具本身解耦了，使它可以像其他鼠标绑定一样以绑定的形式应用。

这项改动带来几个好处：

- 它可以与其他鼠标绑定组合使用
- 它可以与键盘绑定配对

<Tabs>
  <TabItem value="Before" label="迁移前 📦 " default>

```js
cornerstoneTools.addTool(StackScrollMouseWheelTool);
toolGroup.addTool(StackScrollMouseWheelTool.toolName);
toolGroup.setToolActive(StackScrollMouseWheelTool.toolName);
```

  </TabItem>
  <TabItem value="After" label="迁移后 🚀🚀">

```js
cornerstoneTools.addTool(StackScrollTool);
toolGroup.addTool(StackScrollTool.toolName);
toolGroup.setToolActive(StackScrollTool.toolName, {
  bindings: [
    {
      mouseButton: MouseBindings.Wheel,
    },
  ],
});
```

  </TabItem>
</Tabs>

### BaseTool {#basetool}

`getTargetVolumeId` 方法已被移除，改用 `getTargetId`；
`getTargetIdImage` 改名为 `getTargetImageData`，以更清楚地表明它是 image data。

### 用法示例 {#usage-example}

<Tabs>
<TabItem value="Before" label="迁移前 📦 " default>

```typescript
const volumeId = this.getTargetVolumeId(viewport);
const imageData = this.getTargetIdImage(targetId, renderingEngine);
```

</TabItem>
<TabItem value="After" label="迁移后 🚀">

```typescript
const imageData = this.getTargetImageData(targetId);
```

</TabItem>
</Tabs>

## 全新的分割模型 {#new-segmentation-model}

我们有了一套全新的分割模型，它更灵活、也更好用。

### 术语相同，架构不同 {#same-terminology-different-architecture}

在 Cornerstone3D 版本 2 中，我们对分割模型做了重大架构调整，
同时保留了大家熟悉的术语。这次重新设计的目标，是在不同视口之间处理分割时
提供一种更灵活、更直观的方式。下面是主要改动及其缘由：

1. **按视口划分，而非基于工具组**：
   - 旧：分割绑定在工具组上，而工具组通常包含多个视口。
     当用户想在同一工具组内只给某些视口加分割、而不给其他视口加时，就很麻烦。
   - 新：分割现在是按视口划分的。不再往工具组上添加或移除表示形式，
     用户可以直接把它们添加到视口上。这对「每个视口渲染什么」提供了细得多的控制。
   - 为什么：我们发现把渲染绑定到工具组不是个有效的做法。
     它常常迫使人为某个特定视口再建一个工具组，只为了定制或阻止渲染。

2. **简化分割表示形式的标识方式**：
   - 旧：需要一个唯一的 segmentationRepresentationUID 来标识。
   - 新：分割表示形式由 `segmentationId` 与表示形式 `type` 的组合来标识。
     这使得每个视口可以拥有同一份分割的不同表示形式。
   - 为什么：这样简化之后，跨视口管理和引用分割表示形式都更容易了。

3. **数据与可视化解耦**：
   - 旧：分割渲染与工具组紧密耦合。
   - 新：分割现在被纯粹当作数据看待，与用来操作它的工具分离。
   - 为什么：工具绑定到工具组是合适的，但像分割渲染这类按视口划分的功能，
     应当由各个视口自己负责。这种分离让不同视口的渲染与交互方式更灵活。

4. **支持多态分割**：
   - 新架构更好地支持「多态分割」这一概念：
     同一份分割可以有多种表示形式（标签图、轮廓、曲面），
     并且能在它们之间高效转换。
   - 为什么：这种灵活性让分割的存储、分析和实时可视化都更高效。

5. **各表示形式类型的 API 一致**：
   - 新 API 为处理不同的分割表示形式提供了统一的方式，
     在涉及多视口、多表示形式类型的复杂场景中更易于管理。
   - 为什么：一致性简化了开发，也降低了在处理不同分割类型时出错的概率。

这些架构改动为分割处理提供了更稳固的基础，在复杂的多视口场景中尤其明显。
新方案已被证明非常有效，也为将来的增强打开了空间。虽然核心概念大体不变，
但你在代码中与分割交互的方式会有显著变化。
这份迁移指南会带你走一遍这些改动，并提供前后对照的示例，
帮你把既有代码更新到新架构上。

### 分割状态 {#segmentation-state}

`Segmentation` 类型经过了重构，以更好地组织分段信息和表示形式数据。
在讨论迁移做法之前，先来看看这些变化。

<Tabs>
  <TabItem value="Before" label="迁移前 📦 " default>

```typescript
type Segmentation = {
  segmentationId: string;
  type: Enums.SegmentationRepresentations;
  label: string;
  activeSegmentIndex: number;
  segmentsLocked: Set<number>;
  cachedStats: { [key: string]: number };
  segmentLabels: { [key: string]: string };
  representationData: SegmentationRepresentationData;
};
```

  </TabItem>
  <TabItem value="After" label="迁移后 🚀🚀">

```typescript
type Segmentation = {
  segmentationId: string;
  label: string;
  segments: {
    [segmentIndex: number]: Segment;
  };
  representationData: RepresentationsData;
};

type Segment = {
  segmentIndex: number;
  label: string;
  locked: boolean;
  cachedStats: { [key: string]: unknown };
  active: boolean;
};
```

  </TabItem>
</Tabs>

新的分割状态模型提供了更有条理的数据结构。此前散落各处的信息——
例如 `cachedStats`、`segmentLabels` 和 `activeSegmentIndex`——
现在都被整合到了 `segments` 属性之下。这次重组提升了清晰度和效率。
后面几节会给出迁移做法，说明在新结构中如何访问和修改这些属性。
这次重组主要影响的是分割 store 这一层。

#### 表示形式数据的键 {#representation-data-key}

`SegmentationRepresentations` 枚举已从全大写改为首字母大写，
以与库中其余的 Enums 保持一致。

<Tabs>
  <TabItem value="Before" label="迁移前 📦 " default>

```typescript
enum SegmentationRepresentations {
  Labelmap = 'LABELMAP',
  Contour = 'CONTOUR',
  Surface = 'SURFACE',
}
```

  </TabItem>
  <TabItem value="After" label="迁移后 🚀🚀">

```typescript
enum SegmentationRepresentations {
  Labelmap = 'Labelmap',
  Contour = 'Contour',
  Surface = 'Surface',
}
```

  </TabItem>
</Tabs>

这会影响表示形式数据的访问方式：

<Tabs>
  <TabItem value="Before" label="迁移前 📦 " default>

```typescript
const representationData = segmentation.representationData.SURFACE;
const representationData = segmentation.representationData.LABELMAP;
const representationData = segmentation.representationData.CONTOUR;
```

  </TabItem>
  <TabItem value="After" label="迁移后 🚀🚀">

```typescript
const representationData = segmentation.representationData.Surface;
const representationData = segmentation.representationData.Labelmap;
const representationData = segmentation.representationData.Contour;
```

  </TabItem>
</Tabs>

#### 分割表示形式 {#segmentation-representation}

表示形式的结构被简化了，并且现在是按视口划分的。

<Tabs>
  <TabItem value="Before" label="迁移前 📦 " default>

```typescript
type ToolGroupSpecificRepresentation =
  | ToolGroupSpecificLabelmapRepresentation
  | ToolGroupSpecificContourRepresentation;

type ToolGroupSpecificRepresentationState = {
  segmentationRepresentationUID: string;
  segmentationId: string;
  type: Enums.SegmentationRepresentations;
  active: boolean;
  segmentsHidden: Set<number>;
  colorLUTIndex: number;
};

type SegmentationState = {
  toolGroups: {
    [key: string]: {
      segmentationRepresentations: ToolGroupSpecificRepresentations;
      config: SegmentationRepresentationConfig;
    };
  };
};
```

  </TabItem>
  <TabItem value="After" label="迁移后 🚀🚀">

```typescript
type SegmentationRepresentation =
  | LabelmapRepresentation
  | ContourRepresentation
  | SurfaceRepresentation;

type BaseSegmentationRepresentation = {
  colorLUTIndex: number;
  segmentationId: string;
  type: Enums.SegmentationRepresentations;
  visible: boolean;
  active: boolean;
  segments: {
    [segmentIndex: number]: {
      visible: boolean;
    };
  };
};

type SegmentationState = {
  viewportSegRepresentations: {
    [viewportId: string]: Array<SegmentationRepresentation>;
  };
};
```

  </TabItem>
</Tabs>

以前分割表示形式是按工具组划分的，这带来了一些问题。在新结构中，
分割表示形式按视口划分。它现在由一个 segmentationId、一个 type，
以及该分割的各项设置组成。由于这项改动，若干函数被移除或修改了。
下面是这些变化的汇总：

#### 被移除的函数 {#removed-functions}

- `getDefaultSegmentationStateManager`
- `getSegmentationRepresentations`
- `getAllSegmentationRepresentations`
- `getSegmentationIdRepresentations`
- `findSegmentationRepresentationByUID`
- `getToolGroupIdsWithSegmentation`
- `getToolGroupSpecificConfig`
- `setToolGroupSpecificConfig`
- `getGlobalConfig`
- `setGlobalConfig`
- `setSegmentationRepresentationSpecificConfig`
- `getSegmentationRepresentationSpecificConfig`
- `getSegmentSpecificRepresentationConfig`
- `setSegmentSpecificRepresentationConfig`
- `getToolGroupIdFromSegmentationRepresentationUID`
- `addSegmentationRepresentation`
- `getSegmentationRepresentationByUID`

#### 新增的函数 {#new-functions}

- `addSegmentations(segmentationInputArray)`
- `removeSegmentation(segmentationId)`
- `getSegmentation(segmentationId)`
- `getSegmentations()`
- `getSegmentationRepresentation(viewportId, specifier)`
- `getSegmentationRepresentations(viewportId, specifier)`
- `removeSegmentationRepresentation(viewportId, specifier, immediate)`
- `removeAllSegmentationRepresentations()`
- `removeLabelmapRepresentation(viewportId, segmentationId, immediate)`
- `removeContourRepresentation(viewportId, segmentationId, immediate)`
- `removeSurfaceRepresentation(viewportId, segmentationId, immediate)`
- `getViewportSegmentations(viewportId, type)`
- `getViewportIdsWithSegmentation(segmentationId)`
- `getCurrentLabelmapImageIdForViewport(viewportId, segmentationId)`
- `updateLabelmapSegmentationImageReferences(segmentationId, imageIds)`
- `getStackSegmentationImageIdsForViewport(viewportId, segmentationId)`
- `destroy()`

### 移除 SegmentationDisplayTool {#removal-of-segmentationdisplaytool}

不再需要把 SegmentationDisplayTool 添加到工具组里了。

迁移前

```js
toolGroup2.addTool(SegmentationDisplayTool.toolName);

toolGroup1.setToolEnabled(SegmentationDisplayTool.toolName);
```

现在

```js
// 什么都不用做
```

### 堆栈标签图 {#stack-labelmaps}

要创建堆栈标签图，你不再需要手工在标签图 imageId 与视口 imageId
之间建立引用关系。这个过程现在由我们自动处理。

下面这段「为什么」比较长……

旧模型要求用户提供一个 `imageIdReferenceMap`，把标签图 imageId
与视口 imageId 关联起来。在实现一些进阶分割场景时，这种做法带来了若干挑战：

1. 手工创建这个映射容易出错，尤其是在 imageId 顺序这件事上。

2. 一旦某份分割与特定的视口 imageId 绑定了，想在别处渲染它就很麻烦。例如：
   - 把一套 CT 影像堆栈的分割渲染到单张关键图像上。
   - 把一套 CT 影像堆栈的分割渲染到一个同时包含 CT 和其他影像的堆栈上。
   - 把 DX 双能量中能量 1 的分割渲染到能量 2 上。
   - 把堆栈视口的 CT 标签图渲染到同一空间的 PT 标签图上。

这些场景凸显了旧模型的局限。

我们现在改成了这样：用户只需提供 imageIds。渲染时，
我们把视口当前的 imageId 与那些标签图 imageId 做匹配，匹配上就渲染该分割。
这个匹配过程发生在 SegmentationStateManager 中，
判定标准是该分割必须与被引用视口处于同一平面。

这套新方案支持了大量额外场景，也让分割渲染更加灵活。

<Tabs>
  <TabItem value="Before" label="迁移前 📦 " default>

```js
segmentation.addSegmentations([
  {
    segmentationId,
    representation: {
      type: csToolsEnums.SegmentationRepresentations.Labelmap,
      data: {
        imageIdReferenceMap:
          cornerstoneTools.utilities.segmentation.createImageIdReferenceMap(
            imageIds,
            segmentationImageIds
          ),
      },
    },
  },
]);
```

  </TabItem>
  <TabItem value="After" label="迁移后 🚀🚀">

```js
segmentation.addSegmentations([
  {
    segmentationId,
    representation: {
      type: csToolsEnums.SegmentationRepresentations.Labelmap,
      data: {
        imageIds: segmentationImageIds,
      },
    },
  },
]);
```

  </TabItem>
</Tabs>

### 添加分割 {#adding-segmentations}

#### 函数签名的更新 {#function-signature-update}

`addSegmentations` 函数现在接受一个可选的 `suppressEvents` 参数。

<Tabs>
  <TabItem value="Before" label="迁移前 📦 " default>

```typescript
function addSegmentations(
  segmentationInputArray: SegmentationPublicInput[]
): void;
```

  </TabItem>
  <TabItem value="After" label="迁移后 🚀🚀">

```typescript
function addSegmentations(
  segmentationInputArray: SegmentationPublicInput[],
  suppressEvents?: boolean
): void;
```

  </TabItem>
</Tabs>

**迁移步骤：**

1. 如有需要，更新 `addSegmentations` 的调用以传入 `suppressEvents` 参数。
2. 如果不想抑制事件，可以省略第二个参数。

#### SegmentationPublicInput 类型的更新 {#segmentationpublicinput-type-updates}

`SegmentationPublicInput` 类型已扩展，增加了一个可选的 `config` 属性。

<Tabs>
  <TabItem value="Before" label="迁移前 📦 " default>

```typescript
type SegmentationPublicInput = {
  segmentationId: string;
  representation: {
    type: Enums.SegmentationRepresentations;
    data?: RepresentationData;
  };
};
```

  </TabItem>
  <TabItem value="After" label="迁移后 🚀🚀">

```typescript
type SegmentationPublicInput = {
  segmentationId: string;
  representation: {
    type: Enums.SegmentationRepresentations;
    data?: RepresentationData;
  };
  config?: {
    segments?: {
      [segmentIndex: number]: Partial<Segment>;
    };
    label?: string;
  };
};
```

  </TabItem>
</Tabs>

**迁移步骤：**

1. 如有需要，更新那些创建或操作 `SegmentationPublicInput` 对象的代码，
   加入新的 `config` 属性。
2. 把具体的分割数据类型替换为通用的 `RepresentationData` 类型。

### 添加分割表示形式 {#adding-segmentation-representations}

#### 以视口为中心的方式 {#viewport-centric-approach}

该 API 现在聚焦于视口而不是工具组，对分割表示形式提供了更细的控制粒度。

<Tabs>
  <TabItem value="Before" label="迁移前 📦 " default>

```typescript
function addSegmentationRepresentations(
  toolGroupId: string,
  representationInputArray: RepresentationPublicInput[],
  toolGroupSpecificRepresentationConfig?: SegmentationRepresentationConfig
): Promise<string[]>;
```

  </TabItem>
  <TabItem value="After" label="迁移后 🚀🚀">

```typescript
function addSegmentationRepresentations(
  viewportId: string,
  segmentationInputArray: RepresentationPublicInput[]
);
```

  </TabItem>
</Tabs>

**迁移步骤：**

1. 把函数调用中的 `toolGroupId` 换成 `viewportId`。
2. 去掉 `toolGroupSpecificRepresentationConfig` 参数。
3. 更新那些依赖「返回分割表示形式 UID 的 Promise」的代码。

#### RepresentationPublicInput 的变化 {#representationpublicinput-changes}

`RepresentationPublicInput` 类型被简化了，有些属性被改名或移除。

<Tabs>
  <TabItem value="Before" label="迁移前 📦 " default>

```typescript
type RepresentationPublicInput = {
  segmentationId: string;
  type: Enums.SegmentationRepresentations;
  options?: {
    segmentationRepresentationUID?: string;
    colorLUTOrIndex?: Types.ColorLUT | number;
    polySeg?: {
      enabled: boolean;
      options?: any;
    };
  };
};
```

  </TabItem>
  <TabItem value="After" label="迁移后 🚀🚀">

```typescript
type RepresentationPublicInput = {
  segmentationId: string;
  type?: Enums.SegmentationRepresentations;
  config?: {
    colorLUTOrIndex?: Types.ColorLUT[] | number;
  };
};
```

  </TabItem>
</Tabs>

**迁移步骤：**

1. 去掉 `options` 属性，把 `colorLUTOrIndex` 移到 `config` 对象里。
2. 如果用过 `segmentationRepresentationUID` 和 `polySeg` 属性，请去掉——
   polySEG 现在默认启用。
3. 把 `colorLUTOrIndex` 的类型改为接受 `Types.ColorLUT` 数组，而不是单个值。

#### 各表示形式专用的新函数 {#new-representation-specific-functions}

版本 2 引入了一批新函数，用于向视口添加特定类型的分割表示形式。

<Tabs>
  <TabItem value="Before" label="迁移前 📦 " default>

```typescript
// 版本 1 中没有对应的函数
```

  </TabItem>
  <TabItem value="After" label="迁移后 🚀🚀">

```typescript
function addContourRepresentationToViewport(
  viewportId: string,
  contourInputArray: RepresentationPublicInput[]
);

function addLabelmapRepresentationToViewport(
  viewportId: string,
  labelmapInputArray: RepresentationPublicInput[]
);

function addSurfaceRepresentationToViewport(
  viewportId: string,
  surfaceInputArray: RepresentationPublicInput[]
);
```

  </TabItem>
</Tabs>

**迁移步骤：**

1. 把通用的 `addSegmentationRepresentations` 调用替换为对应表示形式的专用函数。
2. 更新输入数组以匹配新的 `RepresentationPublicInput` 类型。
3. 把你代码里按类型分支的逻辑去掉，这些现在由这些新函数负责处理。

#### 多视口函数 {#multi-viewport-functions}

版本 2 引入了一批新函数，用于同时向多个视口添加分割表示形式。

<Tabs>
  <TabItem value="Before" label="迁移前 📦 " default>

```typescript
// 版本 1 中没有对应的函数
```

  </TabItem>
  <TabItem value="After" label="迁移后 🚀🚀">

```typescript
function addContourRepresentationToViewportMap(viewportInputMap: {
  [viewportId: string]: RepresentationPublicInput[];
});

function addLabelmapRepresentationToViewportMap(viewportInputMap: {
  [viewportId: string]: RepresentationPublicInput[];
});

function addSurfaceRepresentationToViewportMap(viewportInputMap: {
  [viewportId: string]: RepresentationPublicInput[];
});
```

  </TabItem>
</Tabs>

**迁移步骤：**

1. 如果你此前是向多个工具组添加表示形式，请重构代码改用这些新的多视口函数。
2. 构造一个 `viewportInputMap` 对象，以视口 ID 为键、
   `RepresentationPublicInput` 数组为值。
3. 依据表示形式类型调用相应的多视口函数。

### 事件 {#events}

由于我们从工具组转向了视口，许多事件被改名，把 `toolGroupId` 换成了
`viewportId`；一些事件详情也做了改动，用 `segmentationId` 取代
`segmentationRepresentationUID` 或 toolGroupId。

#### 移除工具组专属的事件 {#removal-of-toolgroup-specific-events}

`triggerSegmentationRepresentationModified` 和
`triggerSegmentationRepresentationRemoved` 这两个函数已被移除。
取而代之的是，该库现在用一种更通用的方式来处理分割事件。

<Tabs>
  <TabItem value="Before" label="迁移前 📦 " default>

```typescript
function triggerSegmentationRepresentationModified(
  toolGroupId: string,
  segmentationRepresentationUID?: string
): void {
  // ...
}

function triggerSegmentationRepresentationRemoved(
  toolGroupId: string,
  segmentationRepresentationUID: string
): void {
  // ...
}
```

  </TabItem>
  <TabItem value="After" label="迁移后 🚀🚀">

```typescript
function triggerSegmentationRepresentationModified(
  viewportId: string,
  segmentationId: string,
  type?: SegmentationRepresentations
): void {
  // ...
}

function triggerSegmentationRepresentationRemoved(
  viewportId: string,
  segmentationId: string,
  type: SegmentationRepresentations
): void {
  // ...
}
```

  </TabItem>
</Tabs>

**迁移步骤：**

1. 把函数调用中的 `toolGroupId` 换成 `viewportId`。
2. 把 `segmentationRepresentationUID` 换成 `segmentationId`。
3. 加上 `type` 参数以指定分割表示形式的类型。

#### 简化后的分割修改事件 {#simplified-segmentation-modified-event}

`triggerSegmentationModified` 函数已被简化为始终要求传入 `segmentationId`。

<Tabs>
  <TabItem value="Before" label="迁移前 📦 " default>

```typescript
function triggerSegmentationModified(segmentationId?: string): void {
  // ...
}
```

  </TabItem>
  <TabItem value="After" label="迁移后 🚀🚀">

```typescript
function triggerSegmentationModified(segmentationId: string): void {
  // ...
}
```

  </TabItem>
</Tabs>

**迁移步骤：**

1. 确保调用 `triggerSegmentationModified` 时总是提供 `segmentationId`。
2. 去掉那些处理 `segmentationId` 为 undefined 情形的逻辑。

#### 更新后的事件详情类型 {#updated-event-detail-types}

若干事件详情类型已更新，以反映分割体系的变化：

<Tabs>
  <TabItem value="Before" label="迁移前 📦 " default>

```typescript
type SegmentationRepresentationModifiedEventDetail = {
  toolGroupId: string;
  segmentationRepresentationUID: string;
};

type SegmentationRepresentationRemovedEventDetail = {
  toolGroupId: string;
  segmentationRepresentationUID: string;
};

type SegmentationRenderedEventDetail = {
  viewportId: string;
  toolGroupId: string;
};
```

  </TabItem>
  <TabItem value="After" label="迁移后 🚀🚀">

```typescript
type SegmentationRepresentationModifiedEventDetail = {
  segmentationId: string;
  type: string;
  viewportId: string;
};

type SegmentationRepresentationRemovedEventDetail = {
  segmentationId: string;
  type: string;
  viewportId: string;
};

type SegmentationRenderedEventDetail = {
  viewportId: string;
  segmentationId: string;
  type: string;
};
```

  </TabItem>
</Tabs>

**迁移步骤：**

1. 更新事件监听器以使用新的事件详情类型。
2. 在适用处把 `toolGroupId` 换成 `viewportId`。
3. 用 `segmentationId` 取代 `segmentationRepresentationUID`。
4. 为事件详情中新增的 `type` 字段加上相应处理。

### 分割的配置 / 样式 {#segmentation-configstyle}

在 Cornerstone3D 2.x 中，我们对分割配置的 API 做了大幅重构，
以提供一种更灵活、更统一的方式来管理不同表示形式
（标签图、轮廓、曲面）的分割样式。旧的那套获取和设置分割配置的 API
已被新函数取代——新函数通过一个 specifier 对象来定位
具体的分割、视口和分段。

#### 被移除的函数 {#removed-functions-1}

- `getGlobalConfig`
- `setGlobalConfig`
- `getGlobalRepresentationConfig`
- `setGlobalRepresentationConfig`
- `getToolGroupSpecificConfig`
- `setToolGroupSpecificConfig`
- `getSegmentSpecificConfig`
- `setSegmentSpecificConfig`
- `getSegmentationRepresentationSpecificConfig`
- `setSegmentationRepresentationSpecificConfig`

#### 新增的函数 {#new-functions-1}

- `getStyle(specifier)`
- `setStyle(specifier, style)`
- `setRenderInactiveSegmentations(viewportId, renderInactiveSegmentations)`
- `getRenderInactiveSegmentations(viewportId)`
- `resetToGlobalStyle()`
- `hasCustomStyle(specifier)`

#### 获取全局分割配置 {#getting-global-segmentation-config}

<Tabs>
<TabItem value="Before" label="迁移前 📦" default>

```js
// 取得全局分割配置
const globalConfig = getGlobalConfig();

// 取得某种表示形式类型的全局表示形式配置
const labelmapConfig = getGlobalRepresentationConfig(
  SegmentationRepresentations.Labelmap
);
```

</TabItem>
<TabItem value="After" label="迁移后 🚀">

```js
// 取得某种表示形式类型的全局样式
const labelmapStyle = getStyle({ type: SegmentationRepresentations.Labelmap });
```

</TabItem>
</Tabs>

##### 设置全局分割配置 {#setting-global-segmentation-config}

<Tabs>
<TabItem value="Before" label="迁移前 📦" default>

```js
// 设置全局分割配置
setGlobalConfig(newGlobalConfig);

// 设置某种表示形式类型的全局表示形式配置
setGlobalRepresentationConfig(
  SegmentationRepresentations.Labelmap,
  newLabelmapConfig
);
```

</TabItem>
<TabItem value="After" label="迁移后 🚀">

```js
// 设置某种表示形式类型的全局样式
setStyle({ type: SegmentationRepresentations.Labelmap }, newLabelmapStyle);
```

</TabItem>
</Tabs>

#### 获取与设置工具组专属配置 {#getting-and-setting-toolgroup-specific-config}

工具组专属的配置已被移除，取而代之的是按视口的样式。
下面的写法会为某个特定视口中的某份特定分割设置样式。

<Tabs>
<TabItem value="Before" label="迁移前 📦" default>

```js
// 取得工具组专属配置
const toolGroupConfig = getToolGroupSpecificConfig(toolGroupId);

// 设置工具组专属配置
setToolGroupSpecificConfig(toolGroupId, newToolGroupConfig);
```

</TabItem>
<TabItem value="After" label="迁移后 🚀">

```js
// 为某个特定视口中的某个分割表示形式设置样式
setStyle(
  {
    viewportId: 'viewport1',
    segmentationId: 'segmentation1',
    type: SegmentationRepresentations.Labelmap,
  },
  newLabelmapStyle
);

// 取得某个特定视口中某个分割表示形式的样式
const style = getStyle({
  viewportId: 'viewport1',
  segmentationId: 'segmentation1',
  type: SegmentationRepresentations.Labelmap,
});
```

</TabItem>
</Tabs>

#### 获取与设置分割表示形式专属配置 {#getting-and-setting-segmentation-representation-specific-config}

在 Cornerstone3D 2.x 中，用于获取和设置「分割表示形式专属配置」的函数
已被统一的样式管理 API 取代。以下这两个旧函数：

`getSegmentationRepresentationSpecificConfig`
`setSegmentationRepresentationSpecificConfig`

已不再可用。请改用 getStyle 和 setStyle，并通过 specifier 对象
来定位具体的分割和表示形式。

<Tabs>
<TabItem value="Before" label="迁移前 📦 " default>

```js
// 取得分割表示形式专属配置
const representationConfig = getSegmentationRepresentationSpecificConfig(
  toolGroupId,
  segmentationRepresentationUID
);

// 设置分割表示形式专属配置
setSegmentationRepresentationSpecificConfig(
  toolGroupId,
  segmentationRepresentationUID,
  {
    LABELMAP: {
      renderOutline: true,
      outlineWidth: 2,
    },
  }
);
```

</TabItem>
<TabItem value="After" label="迁移后 🚀🚀">

```js
// 取得某个分割表示形式的样式
const style = getStyle({
  segmentationId: 'segmentation1',
  type: SegmentationRepresentations.Labelmap,
});

// 在所有视口中为某个分割表示形式设置样式
setStyle(
  {
    segmentationId: 'segmentation1',
    type: SegmentationRepresentations.Labelmap,
  },
  {
    renderOutline: true,
    outlineWidth: 2,
  }
);
```

</TabItem>
</Tabs>

#### 获取与设置分段专属配置 {#getting-and-setting-segment-specific-config}

<Tabs>
<TabItem value="Before" label="迁移前 📦 " default>

```js
// 取得分段专属配置
const segmentConfig = getSegmentSpecificConfig(
  toolGroupId,
  segmentationRepresentationUID,
  segmentIndex
);

// 设置分段专属配置
setSegmentSpecificConfig(
  toolGroupId,
  segmentationRepresentationUID,
  segmentIndex,
  newSegmentConfig
);
```

</TabItem>
<TabItem value="After" label="迁移后 🚀">

```js
// 为某个特定分段设置样式
setStyle(
  {
    segmentationId: 'segmentation1',
    type: SegmentationRepresentations.Labelmap,
    segmentIndex: 1,
  },
  newSegmentStyle
);

// 取得某个特定分段的样式
const segmentStyle = getStyle({
  segmentationId: 'segmentation1',
  type: SegmentationRepresentations.Labelmap,
  segmentIndex: 1,
});
```

</TabItem>
</Tabs>

#### 设置是否渲染非活动分割 {#setting-render-inactive-segmentations}

用于开启或关闭「渲染非活动分割」的函数已更新。

**迁移前**

它此前是分割配置的一部分：

```js
setGlobalConfig({ renderInactiveSegmentations: true });
```

**迁移后**

改用 `setRenderInactiveSegmentations`：

```js
// 设置某个视口中是否渲染非活动分割
setRenderInactiveSegmentations(viewportId, true);

// 取得某个视口中非活动分割是否被渲染
const renderInactive = getRenderInactiveSegmentations(viewportId);
```

#### 重置为全局样式 {#resetting-to-global-style}

要把所有分割样式重置为全局样式：

```js
resetToGlobalStyle();
```

#### 迁移示例 {#example-migration}

<Tabs>
  <TabItem value="Before" label="迁移前 📦 " default>

```js
import {
  getGlobalConfig,
  getGlobalRepresentationConfig,
  getToolGroupSpecificConfig,
  setGlobalConfig,
  setGlobalRepresentationConfig,
  setToolGroupSpecificConfig,
  setSegmentSpecificConfig,
  getSegmentSpecificConfig,
  setSegmentationRepresentationSpecificConfig,
  getSegmentationRepresentationSpecificConfig,
} from './segmentationConfig';

// 取得全局分割配置
const globalConfig = getGlobalConfig();

// 设置全局表示形式配置
setGlobalRepresentationConfig(SegmentationRepresentations.Labelmap, {
  renderOutline: true,
  outlineWidth: 2,
});

// 设置工具组专属配置
setToolGroupSpecificConfig(toolGroupId, {
  representations: {
    LABELMAP: {
      renderOutline: false,
    },
  },
});

// 设置分段专属配置
setSegmentSpecificConfig(
  toolGroupId,
  segmentationRepresentationUID,
  segmentIndex,
  {
    LABELMAP: {
      renderFill: false,
    },
  }
);
```

  </TabItem>
  <TabItem value="After" label="迁移后 🚀🚀">

```js
import {
  getStyle,
  setStyle,
  setRenderInactiveSegmentations,
  getRenderInactiveSegmentations,
  resetToGlobalStyle,
  hasCustomStyle,
} from '@cornerstonejs/core';

// 取得标签图表示形式的全局样式
const labelmapStyle = getStyle({ type: SegmentationRepresentations.Labelmap });

// 设置标签图表示形式的全局样式
setStyle(
  { type: SegmentationRepresentations.Labelmap },
  {
    renderOutline: true,
    outlineWidth: 2,
  }
);

// 为某个特定视口与分割设置样式
setStyle(
  {
    viewportId: 'viewport1',
    segmentationId: 'segmentation1',
    type: SegmentationRepresentations.Labelmap,
  },
  {
    renderOutline: false,
  }
);

// 为某个特定分段设置样式
setStyle(
  {
    segmentationId: 'segmentation1',
    type: SegmentationRepresentations.Labelmap,
    segmentIndex: segmentIndex,
  },
  {
    renderFill: false,
  }
);

// 设置某个视口是否渲染非活动分割
setRenderInactiveSegmentations('viewport1', true);

// 取得某个视口「是否渲染非活动分割」的设置
const renderInactive = getRenderInactiveSegmentations('viewport1');

// 把所有样式重置为全局样式
resetToGlobalStyle();
```

  </TabItem>
</Tabs>

---

#### 小结 {#summary}

- **统一的样式管理**：新的 `getStyle` 和 `setStyle` 函数提供了一种统一的方式，
  来管理不同层级的分割样式——全局、按分割、按视口、按分段。
- **specifier 对象**：`specifier` 对象让你可以定位具体的视口、分割和分段。
  - `type` 是必需的
  - 若提供了 `segmentationId`，样式会应用到**所有视口**中该分割的表示形式上
  - 若同时提供了 `segmentationId` 和 `segmentIndex`，
    样式会应用到该分割表示形式中那个特定分段上
  - 若提供了 `viewportId`，样式会应用到该特定视口中的**所有**分割上
  - 若同时提供了 `viewportId`、`segmentationId` 和 `segmentIndex`，
    样式会应用到该特定视口中、该特定分割的那个特定分段上
- **样式的层级关系**：最终生效的样式由一套层级决定，
  它会综合考虑全局样式、按分割的样式和按视口的样式。

### 活动分割 {#active}

#### 基于视口的操作 {#viewport-based-operations}

该 API 现在用视口 ID 而不是工具组 ID 来标识分割操作的上下文。

<Tabs>
  <TabItem value="Before" label="迁移前 📦 " default>

```typescript
function getActiveSegmentationRepresentation(toolGroupId: string);

function getActiveSegmentation(toolGroupId: string);

function setActiveSegmentationRepresentation(
  toolGroupId: string,
  segmentationRepresentationUID: string
);
```

  </TabItem>
  <TabItem value="After" label="迁移后 🚀🚀">

```typescript
function getActiveSegmentation(viewportId: string);

function setActiveSegmentation(
  viewportId: string,
  segmentationId: string,
  suppressEvent: boolean = false
);
```

  </TabItem>
</Tabs>

#### 迁移步骤 {#migration-steps}

1. 把函数调用中所有的 `toolGroupId` 换成 `viewportId`。
2. 把对 `getActiveSegmentationRepresentation` 和 `getActiveSegmentation`
   的调用统一改为使用新的 `getActiveSegmentation` 函数。
3. 把 `setActiveSegmentationRepresentation` 的调用改为 `setActiveSegmentation`，
   并使用新的参数结构。

#### 返回类型的变化 {#return-type-changes}

`getActiveSegmentation` 的返回类型从隐式的 `undefined`
改为了显式的 `Segmentation` 类型。

<Tabs>
  <TabItem value="Before" label="迁移前 📦 " default>

```typescript
function getActiveSegmentation(toolGroupId: string);
```

  </TabItem>
  <TabItem value="After" label="迁移后 🚀🚀">

```typescript
function getActiveSegmentation(viewportId: string): Segmentation;
```

  </TabItem>
</Tabs>

#### 迁移步骤 {#migration-steps-1}

1. 把所有对 `getActiveSegmentationRepresentation` 的调用改为 `getActiveSegmentation`。
2. 更新那些依赖 `ToolGroupSpecificRepresentation` 类型的代码，
   改为处理 `Segmentation` 类型。

这些改动的目标是简化 API、让它更直观。通过聚焦于基于视口的操作、
并取消「分割表示形式」与「分割」之间的区分，
新 API 在保留库核心功能的同时应当更好用。

### 可见性 {#visibility}

#### 以视口为中心 {#viewport-centric-approach-1}

该 API 现在关注的是视口而不是工具组，这反映了库架构上的转变。

<Tabs>
  <TabItem value="Before" label="迁移前 📦 " default>

```typescript
function setSegmentationVisibility(
  toolGroupId: string,
  segmentationRepresentationUID: string,
  visibility: boolean
): void {
  // ...
}
```

  </TabItem>
  <TabItem value="After" label="迁移后 🚀🚀">

```typescript
function setSegmentationRepresentationVisibility(
  viewportId: string,
  specifier: {
    segmentationId: string;
    type?: SegmentationRepresentations;
  },
  visibility: boolean
): void {
  // ...
}
```

  </TabItem>
</Tabs>

**迁移步骤：**

1. 把函数调用中的 `toolGroupId` 换成 `viewportId`。
2. 用一个 `specifier` 对象替代 `segmentationRepresentationUID`。
3. 在 `specifier` 对象中带上 `segmentationId`。
4. 可以选择性地指定分割表示形式的 `type`。

#### 分割表示形式的类型 {#segmentation-representation-types}

版本 2 引入了「分割表示形式类型」这一概念，
使你能更细粒度地控制不同的表示形式样式。

<Tabs>
  <TabItem value="Before" label="迁移前 📦 " default>

```typescript
function getSegmentationVisibility(
  toolGroupId: string,
  segmentationRepresentationUID: string
): boolean | undefined {
  // ...
}
```

  </TabItem>
  <TabItem value="After" label="迁移后 🚀🚀">

```typescript
function getSegmentationRepresentationVisibility(
  viewportId: string,
  specifier: {
    segmentationId: string;
    type: SegmentationRepresentations;
  }
): boolean | undefined {
  // ...
}
```

  </TabItem>
</Tabs>

**迁移步骤：**

1. 把函数名从 `getSegmentationVisibility` 改为
   `getSegmentationRepresentationVisibility`。
2. 把 `toolGroupId` 换成 `viewportId`。
3. 用带 `segmentationId` 和 `type` 的 `specifier` 对象替代
   `segmentationRepresentationUID`。

#### 分段级别的可见性控制 {#segment-level-visibility-control}

控制单个分段可见性的 API 也做了更新，以与新的「以视口为中心」保持一致。

<Tabs>
  <TabItem value="Before" label="迁移前 📦 " default>

```typescript
function setSegmentVisibility(
  toolGroupId: string,
  segmentationRepresentationUID: string,
  segmentIndex: number,
  visibility: boolean
): void {
  // ...
}
```

  </TabItem>
  <TabItem value="After" label="迁移后 🚀🚀">

```typescript
function setSegmentIndexVisibility(
  viewportId: string,
  specifier: {
    segmentationId: string;
    type?: SegmentationRepresentations;
  },
  segmentIndex: number,
  visibility: boolean
): void {
  // ...
}
```

  </TabItem>
</Tabs>

**迁移步骤：**

1. 把函数名从 `setSegmentVisibility` 改为 `setSegmentIndexVisibility`。
2. 把 `toolGroupId` 换成 `viewportId`。
3. 用带 `segmentationId` 和可选 `type` 的 `specifier` 对象替代
   `segmentationRepresentationUID`。

#### 新增的工具函数 {#new-utility-functions}

版本 2 新增了几个用于管理分割可见性的工具函数。

```typescript
function getHiddenSegmentIndices(
  viewportId: string,
  specifier: {
    segmentationId: string;
    type: SegmentationRepresentations;
  }
): Set<number> {
  // ...
}
```

这个新函数让你可以取得某个特定分割表示形式中被隐藏的分段索引集合。

#### 被移除的函数 {#removed-functions-2}

以下函数在版本 2 中被移除：

- `setSegmentsVisibility`
- `getSegmentVisibility`

请改用上面介绍的那套新 API。

<details>
<summary>为什么？</summary>

因为可见性应当设置在「表示形式」上——分割本身并不是可见性的归属者。
同一份分割可以有两种表示形式，并且在各个视口中拥有各自不同的可见性。

</details>

### 加锁 {#locking}

#### 取得被锁定的分段 {#retrieving-locked-segments}

用于取得被锁定分段的函数已改名，其实现也有变化：

<Tabs>
  <TabItem value="Before" label="迁移前 📦 " default>

```typescript
function getLockedSegments(segmentationId: string): number[] | [];
```

  </TabItem>
  <TabItem value="After" label="迁移后 🚀🚀">

```typescript
function getLockedSegmentIndices(segmentationId: string): number[] | [];
```

  </TabItem>
</Tabs>

**迁移步骤：**

1. 把所有 `getLockedSegments` 调用改为 `getLockedSegmentIndices`。
2. 注意其实现现在用的是 `Object.keys` 加 `filter`，
   而不是把 Set 转成数组。

### 颜色 {#color}

#### 以视口为中心 {#viewport-centric-approach-2}

该 API 已从「基于工具组」转为「以视口为中心」。
这项改动影响了若干函数签名，也改变了分割的引用方式。

<Tabs>
  <TabItem value="Before" label="迁移前 📦 " default>

```typescript
function setColorLUT(
  toolGroupId: string,
  segmentationRepresentationUID: string,
  colorLUTIndex: number
): void {
  // ...
}
```

  </TabItem>
  <TabItem value="After" label="迁移后 🚀🚀">

```typescript
function setColorLUT(
  viewportId: string,
  segmentationId: string,
  colorLUTsIndex: number
): void {
  // ...
}
```

  </TabItem>
</Tabs>

**迁移步骤：**

1. 把函数调用中的 `toolGroupId` 换成 `viewportId`。
2. 把 `segmentationRepresentationUID` 换成 `segmentationId`。
3. 把依赖「基于工具组」管理分割的代码，改为按视口管理。

#### 颜色 LUT 的管理 {#color-lut-management}

`addColorLUT` 现在会返回所添加颜色 LUT 的索引，
并且 `colorLUTIndex` 参数变为可选。

<Tabs>
  <TabItem value="Before" label="迁移前 📦 " default>

```typescript
function addColorLUT(colorLUT: Types.ColorLUT, colorLUTIndex: number): void {
  // ...
}
```

  </TabItem>
  <TabItem value="After" label="迁移后 🚀🚀">

```typescript
function addColorLUT(colorLUT: Types.ColorLUT, colorLUTIndex?: number): number {
  // ...
}
```

  </TabItem>
</Tabs>

**迁移步骤：**

1. 如有需要，修改 `addColorLUT` 的调用以接收它返回的索引。
2. 在调用时把 `colorLUTIndex` 参数当作可选参数处理。

#### 分段颜色的读取与设置 {#segment-color-retrieval-and-setting}

获取和设置分段颜色的函数已改名，签名也做了更新，
以与新的「以视口为中心」保持一致。

<Tabs>
  <TabItem value="Before" label="迁移前 📦 " default>

```typescript
function getColorForSegmentIndex(
  toolGroupId: string,
  segmentationRepresentationUID: string,
  segmentIndex: number
): Types.Color {
  // ...
}

function setColorForSegmentIndex(
  toolGroupId: string,
  segmentationRepresentationUID: string,
  segmentIndex: number,
  color: Types.Color
): void {
  // ...
}
```

  </TabItem>
  <TabItem value="After" label="迁移后 🚀🚀">

```typescript
function getSegmentIndexColor(
  viewportId: string,
  segmentationId: string,
  segmentIndex: number
): Types.Color {
  // ...
}

function setSegmentIndexColor(
  viewportId: string,
  segmentationId: string,
  segmentIndex: number,
  color: Types.Color
): void {
  // ...
}
```

  </TabItem>
</Tabs>

**迁移步骤：**

1. 把 `getColorForSegmentIndex` 改名为 `getSegmentIndexColor`。
2. 把 `setColorForSegmentIndex` 改名为 `setSegmentIndexColor`。
3. 修改函数调用，用 `viewportId` 替代 `toolGroupId`。
4. 在函数调用中把 `segmentationRepresentationUID` 换成 `segmentationId`。

### 其他变化 {#other-changes}

#### 重命名 {#renaming}

```js
getSegmentAtWorldPoint-- > getSegmentIndexAtWorldPoint;
getSegmentAtLabelmapBorder-- > getSegmentIndexAtLabelmapBorder;
```

:::note 关于上面这段代码

上游文档里这段代码块被代码格式化工具处理过，把箭头 `-->` 拆成了
`-- >`。它表达的意思是「改名为」，即
`getSegmentAtWorldPoint` → `getSegmentIndexAtWorldPoint`、
`getSegmentAtLabelmapBorder` → `getSegmentIndexAtLabelmapBorder`，
并不是真的要你写这样的代码。

:::

#### getToolGroupIdsWithSegmentation {#gettoolgroupidswithsegmentation}

<Tabs>
  <TabItem value="Before" label="迁移前 📦 " default>

```typescript
function getToolGroupIdsWithSegmentation(segmentationId: string): string[];
```

  </TabItem>
  <TabItem value="After" label="迁移后 🚀🚀">

```typescript
function getViewportIdsWithSegmentation(segmentationId: string): string[];
```

  </TabItem>
</Tabs>

**迁移步骤：**

1. 把 `getToolGroupIdsWithSegmentation` 换成 `getViewportIdsWithSegmentation`。

#### 分割表示形式的管理 {#segmentation-representation-management}

添加、获取、移除分割表示形式的方式有了显著变化。

<Tabs>
  <TabItem value="Before" label="迁移前 📦 " default>

```typescript
function addSegmentationRepresentation(
  toolGroupId: string,
  segmentationRepresentation: ToolGroupSpecificRepresentation,
  suppressEvents?: boolean
): void;

function getSegmentationRepresentationByUID(
  toolGroupId: string,
  segmentationRepresentationUID: string
): ToolGroupSpecificRepresentation | undefined;

function removeSegmentationRepresentation(
  toolGroupId: string,
  segmentationRepresentationUID: string
): void;
```

  </TabItem>
  <TabItem value="After" label="迁移后 🚀🚀">

```typescript
function addSegmentationRepresentation(
  viewportId: string,
  segmentationRepresentation: SegmentationRepresentation,
  suppressEvents?: boolean
): void;

function getSegmentationRepresentation(
  viewportId: string,
  specifier: {
    segmentationId: string;
    type: SegmentationRepresentations;
  }
): SegmentationRepresentation | undefined;

function removeSegmentationRepresentation(
  viewportId: string,
  specifier: {
    segmentationId: string;
    type: SegmentationRepresentations;
  },
  immediate?: boolean
): void;
```

  </TabItem>
</Tabs>

**迁移步骤：**

1. 把所有 `addSegmentationRepresentation` 调用改为传 `viewportId`
   而不是 `toolGroupId`。
2. 把 `getSegmentationRepresentationByUID` 换成
   `getSegmentationRepresentation`，并使用新的 specifier 对象。
3. 修改 `removeSegmentationRepresentation` 的调用，
   用新的 specifier 对象替代 `segmentationRepresentationUID`。

### PolySEG {#polyseg}

#### 引入 {#import}

PolySEG 已从主包中剥离，放进了一个独立的外部包。
要使用它，请在 Cornerstone Core 的 `init` 调用中加上 `peerImport` 函数。

```js
async function peerImport(moduleId) {
  if (moduleId === '@icr/polyseg-wasm') {
    return import('@icr/polyseg-wasm');
  }
}

import { init } from '@cornerstonejs/core';

await init({ peerImport });
```

#### 配置项 {#options}

你不再需要为分割表示形式提供 polyseg 配置项。
当指定的表示形式不可用时，它会自动使用 PolySeg。

<Tabs>
  <TabItem value="Before" label="迁移前 📦 " default>

```js
await segmentation.addSegmentationRepresentations(toolGroupId2, [
  {
    segmentationId,
    type: csToolsEnums.SegmentationRepresentations.Labelmap,
    options: {
      polySeg: {
        enabled: true,
      },
    },
  },
]);
```

  </TabItem>
  <TabItem value="After" label="迁移后 🚀🚀">

```js
await segmentation.addSegmentationRepresentations(viewportId2, [
  {
    segmentationId,
    type: csToolsEnums.SegmentationRepresentations.Labelmap,
  },
]);
```

  </TabItem>
</Tabs>

#### 标签图的 Actor UID {#actor-uid-for-labelmaps}

actorUID 的生成方式变了，现在由 segmentationId 与
`SegmentationRepresentations.Labelmap` 组合而成。

<Tabs>
<TabItem value="Before" label="迁移前 📦 " default>

```js
const volumeInputs: Types.IVolumeInput[] = [
  {
    volumeId: labelMapData.volumeId,
    actorUID: segmentationRepresentationUID,
    visibility,
    blendMode: Enums.BlendModes.MAXIMUM_INTENSITY_BLEND,
  },
];
```

</TabItem>
<TabItem value="After" label="迁移后 🚀">

```js
const volumeInputs: Types.IVolumeInput[] = [
  {
    volumeId,
    actorUID: `${segmentationId}-${SegmentationRepresentations.Labelmap}`,
    visibility,
    blendMode: Enums.BlendModes.MAXIMUM_INTENSITY_BLEND,
  },
];
```

</TabItem>
</Tabs>

我们把 `actorUID` 改成了
`${segmentationId}-${SegmentationRepresentations.Labelmap}`。
这项改动让我们能唯一地标识表示形式，而不必依赖
`segmentationRepresentationUID`。

为此我们新增了 `getSegmentationActor`，供你取得某个标签图对应的 actor：

```ts
export function getSegmentationActor(
  viewportId: string,
  specifier: {
    segmentationId: string;
    type: SegmentationRepresentations;
  }
): Types.VolumeActor | Types.ImageActor | undefined;
```

### 新增的工具函数 {#new-utilities}

新增了 `clearSegmentValue`，用于清除分割中某个特定分段的值——
它会把该分段的值置为 0。

```js
 function clearSegmentValue(
  segmentationId: string,
  segmentIndex: number
)
```

## 重命名与命名规范 {#renaming-and-nomenclature}

### 类型 {#types}

PointsManager 现在叫 IPointsManager。

迁移做法：

```js
import { IPointsManager } from '@cornerstonejs/tools/types';
```

### 单位 {#units}

#### getCalibratedLengthUnitsAndScale 的签名 {#getcalibratedlengthunitsandscale-signature}

你直接调用这个函数的可能性很小，不过如果你确实用到了，迁移做法如下：
该函数的返回类型略有变化，`units` 和 `areaUnits` 分别改名为
`unit` 和 `areaUnit`。

<Tabs>
<TabItem value="Before" label="迁移前 📦 " default>

```typescript
const getCalibratedLengthUnitsAndScale = (image, handles) => {
  // ...
  return { units, areaUnits, scale };
};
```

</TabItem>
<TabItem value="After" label="迁移后 🚀">

```typescript
const getCalibratedLengthUnitsAndScale = (image, handles) => {
  // ...
  return { unit, areaUnit, scale };
};
```

</TabItem>
</Tabs>

#### getModalityUnit 改名为 getPixelValueUnits {#getmodalityunit---getpixelvalueunits}

这样命名更合理。

<details>
<summary>为什么？</summary>
库里各处用到的「单位」此前太不统一了。我们有 `unit`、`areaUnits`、
`modalityUnit` 以及其他各种叫法。现在这些单位已经被整合到一起。
如果你要在 Cornerstone3D 中水合（hydrate）标注，
就需要更新代码以适配新的单位体系。

另外，modalityUnit 现在叫 pixelValueUnits，这个术语更准确——
因为同一个模态可以对应多种像素值（例如 PT SUV、PT RAW、PT PROC）。

</details>

### BasicStatsCalculator {#basicstatscalculator}

配置项 `noPointsCollection` 已改名为 `storePointData`。

### getSegmentAtWorldPoint 改名为 getSegmentIndexAtWorldPoint {#getsegmentatworldpoint---getsegmentindexatworldpoint}

### getSegmentAtLabelmapBorder 改名为 getSegmentIndexAtLabelmapBorder {#getsegmentatlabelmapborder---getsegmentindexatlabelmapborder}

---

## 其他 {#others}

### roundNumber {#roundnumber}

该工具函数已从 `@cornerstonejs/tools` 的 utilities 移到了
`@cornerstonejs/core/utilities`。

迁移做法：

```js
import { roundNumber } from '@cornerstonejs/core/utilities';
```

### jumpToSlice {#jumptoslice}

该工具函数已从 `@cornerstonejs/tools` 的 utilities 移到了
`@cornerstonejs/core/utilities`。

迁移做法：

```js
import { jumpToSlice } from '@cornerstonejs/core/utilities';
```

### pointInShapeCallback {#pointinshapecallback}

### 1. 新的引入路径 {#1-new-import-path}

`pointInShapeCallback` 函数换了位置。请按下面的方式更新 import：

```js
import { pointInShapeCallback } from '@cornerstonejs/core/utilities';
```

### 2. 用法的变化 {#2-updated-usage}

为了更清晰、也更灵活，该函数的签名改为使用一个 options 对象。
下面说明用法上的变化。

**旧写法：**

```js
const pointsInShape = pointInShapeCallback(
  imageData,
  shapeFnCriteria,
  (point) => {
    // 针对每个点的回调逻辑
  },
  boundsIJK
);
```

**新写法：**

```js
const pointsInShape = pointInShapeCallback(imageData, {
  pointInShapeFn: shapeFnCriteria,
  callback: (point) => {
    // 针对每个点的回调逻辑
  },
  boundsIJK: boundsIJK,
  returnPoints: true, // 可选，用于返回形状内部的那些点
});
```

### 主要变化 {#key-changes}

- **options 对象**：`pointInShapeFn`、`callback`、`boundsIJK`、
  `returnPoints` 等配置参数现在都通过一个 options 对象传入。
- **返回点集**：用 `returnPoints` 选项来指定是否返回形状内部的点；
  此前它总是会返回这些点。如果你依赖它直接返回点集，
  请确保在激活工具时于工具配置中带上 `storePointData: true`。
