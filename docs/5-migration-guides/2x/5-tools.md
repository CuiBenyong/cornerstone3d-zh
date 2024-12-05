---
id: tools
title: '@cornerstonejs/tools'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# @cornerstonejs/tools

## triggerAnnotationRenderForViewportIds

现在只需要 viewportIds，不再需要 renderingEngine

```js
triggerAnnotationRenderForViewportIds(renderingEngine, viewportIds) ---> triggerAnnotationRenderForViewportIds(viewportIds)
```

<details>
<summary>原因？</summary>
由于每个视口有一个渲染引擎，因此不需要将渲染引擎作为参数传递。
</details>

## 工具

### StackScrollMouseWheelTool -> StackScrollTool

我们已将鼠标滚轮与工具本身解耦，使其可以类似于其他鼠标绑定一样作为绑定应用。

此更改提供了几个优势：

- 可以与其他鼠标绑定结合使用
- 可以与键盘绑定配对使用

<Tabs>
  <TabItem value="Before" label="Before 📦 " default>

```js
cornerstoneTools.addTool(StackScrollMouseWheelTool);
toolGroup.addTool(StackScrollMouseWheelTool.toolName);
toolGroup.setToolActive(StackScrollMouseWheelTool.toolName);
```

  </TabItem>
  <TabItem value="After" label="After 🚀🚀">

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

### BaseTool

已移除 `getTargetVolumeId` 方法，改为使用 `getTargetId`，并将 `getTargetIdImage` 重命名为 `getTargetImageData` 以更明确表示这是图像数据。

### 使用示例

<Tabs>
<TabItem value="Before" label="Before 📦 " default>

```typescript
const volumeId = this.getTargetVolumeId(viewport);
const imageData = this.getTargetIdImage(targetId, renderingEngine);
```

</TabItem>
<TabItem value="After" label="After 🚀">

```typescript
const imageData = this.getTargetImageData(targetId);
```

</TabItem>
</Tabs>

## 新分割模型

我们有一个新的分割模型，更加灵活且易于使用。

### 相同术语，不同架构

在 Cornerstone3D 版本 2 中，我们对分割模型进行了重要的架构更改，同时保持了熟悉的术语。该重新设计旨在提供一种更灵活、更直观的方法来在不同视口中工作。以下是主要变更及其背后的原因：

1. **特定于视口，而不是基于工具组**：

   - 旧方式: 分割与工具组绑定，通常由多个视口组成。当用户想要将分割添加到某些视口而不是同一工具组中的其他视口时，会出现复杂情况。
   - 新方式: 分割现在特定于视口。用户可以直接向视口添加表示，而不是向工具组添加或移除表示。这样可以对每个视口渲染的内容进行更精细的控制。
   - 原因: 我们发现将渲染与工具组绑定不是有效的方法。这通常需要为特定视口创建额外的工具组以自定义或阻止渲染。

2. **简化分割表示的标识**：

   - 旧方式: 需要唯一的 segmentationRepresentationUID 来标识。
   - 新方式: 通过组合 `segmentationId` 和表示 `type` 来标识分割表示。这使得每个视口可以具有同一分割的不同表示。
   - 原因: 这种简化使得在不同视口中管理和引用分割表示变得更加容易。

3. **数据和可视化的解耦**：

   - 旧方式: 分割渲染与工具组紧密耦合。
   - 新方式: 分割现在纯粹作为数据处理，与用于交互的工具分开处理。
   - 原因: 尽管将工具绑定到工具组是合适的，但视口特定的功能（如分割渲染）应由各个视口自己负责。这种分离允许在不同视口之间进行更灵活的渲染和交互选择。

4. **多态分割支持**：

   - 新架构更好地支持多态分割的概念，即单个分割可以具有多种表示（例如，标签图、轮廓、表面），并且可以在它们之间高效转换。
   - 原因: 这种灵活性允许更高效地存储、分析和实时可视化分割。

5. **不同表示类型 API 一致性**：
   - 新的 API 提供了一种统一的方式来处理不同的分割表示，使得在涉及多个视口和表示类型的复杂场景中更易于管理。
   - 原因: 这种一致性简化了开发，并减少了在处理不同分割类型时的错误可能性。

这些架构更改为在复杂的多视口场景中处理分割提供了更强大的基础。新方法已被证明是非常有效的，并为未来的增强功能提供了可能性。在与分割交互的核心概念保持相似的同时，您在代码中与分割交互的方式将发生重大变化。本迁移指南将逐步引导您完成这些更改，通过前后对比示例帮助您更新现有的代码库以适应新架构。

### 分割状态

`Segmentation` 类型已重构，以更好地组织段信息和表示数据。让我们看一下更改，然后再讨论迁移指南。

<Tabs>
  <TabItem value="Before" label="Before 📦 " default>

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
  <TabItem value="After" label="After 🚀🚀">

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

新的分割状态模型提供了更有组织的数据结构。以前分散的信息如 `cachedStats`、`segmentLabels` 和 `activeSegmentIndex` 已被合并到 `segments` 属性中。这种重构提升了清晰度和效率。在以下章节中，我们将讨论迁移指南，以解释如何在新结构中访问和修改这些属性。这种重组主要影响分割存储级别。

#### 表示数据键

`SegmentationRepresentations` 枚举已更新为使用标题大小写，而非大写，以匹配其他枚举。

<Tabs>
  <TabItem value="Before" label="Before 📦 " default>

```typescript
enum SegmentationRepresentations {
  Labelmap = 'LABELMAP',
  Contour = 'CONTOUR',
  Surface = 'SURFACE',
}
```

  </TabItem>
  <TabItem value="After" label="After 🚀🚀">

```typescript
enum SegmentationRepresentations {
  Labelmap = 'Labelmap',
  Contour = 'Contour',
  Surface = 'Surface',
}
```

  </TabItem>
</Tabs>

这项更改影响了如何访问表示数据：

<Tabs>
  <TabItem value="Before" label="Before 📦 " default>

```typescript
const representationData = segmentation.representationData.SURFACE;
const representationData = segmentation.representationData.LABELMAP;
const representationData = segmentation.representationData.CONTOUR;
```

  </TabItem>
  <TabItem value="After" label="After 🚀🚀">

```typescript
const representationData = segmentation.representationData.Surface;
const representationData = segmentation.representationData.Labelmap;
const representationData = segmentation.representationData.Contour;
```

  </TabItem>
</Tabs>

#### 分割表示

表示结构已简化，现在特定于视口。

<Tabs>
  <TabItem value="Before" label="Before 📦 " default>

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
  <TabItem value="After" label="After 🚀🚀">

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

以前，分割表示是特定于工具组的，这导致了一些问题。在新结构中，分割表示是特定于视口的。现在它包含一个 segmentationId、一个类型及一些该分割的设置。由于此更改，一些函数已被移除或修改。以下是这些更改的总结：

#### 已移除的函数

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

#### 新函数

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

### 移除了 SegmentationDisplayTool

不再需要将 SegmentationDisplayTool 添加到 toolGroup。

之前

```js
toolGroup2.addTool(SegmentationDisplayTool.toolName);

toolGroup1.setToolEnabled(SegmentationDisplayTool.toolName);
```

现在

```js
// nothing
```

### 堆栈标签图

要创建堆栈标签图，不再需要手动创建 labelmap imageIds 和 viewport imageIds 之间的引用。我们现在自动为您处理这个过程。

这是一段很长的原因...

以前的模型要求用户提供 imageIdReferenceMap，将 labelmap imageIds 链接到视口 imageIds。这种方法在实现高级分割用例时呈现了几个挑战：

1. 手动创建映射容易出错，特别是关于 imageIds 的顺序。

2. 一旦分割与特定的视口 imageIds 关联，在其他地方渲染它就变得有问题。例如：

   - 在单个关键图像上渲染 CT 图像堆栈分割。
   - 在包含 CT 和其他图像的堆栈中渲染 CT 图像堆栈分割。
   - 将 DX 双能量分割从能量 1 渲染到能量 2。
   - 在 PT 标签图相同空间中渲染来自堆栈视口的 CT 标签图。

这些场景突显了以前模型的局限性。

我们现在转向一个系统，用户只需提供 imageIds。在渲染期间，我们将视口的当前 imageId 与标签图 imageIds 进行匹配，如果匹配成功，则渲染分割。这个匹配过程发生在 SegmentationStateManager 中，匹配标准是分割必须与引用的视口处于同一平面。

这个新方法使得许多其他用例成为可能，并在分割渲染方面提供了更大的灵活性。

<Tabs>
  <TabItem value="Before" label="Before 📦 " default>

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
  <TabItem value="After" label="After 🚀🚀">

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

### 添加分割

#### 函数签名更新

`addSegmentations` 函数现在接受一个可选的 `suppressEvents` 参数。

<Tabs>
  <TabItem value="Before" label="Before 📦 " default>

```typescript
function addSegmentations(
  segmentationInputArray: SegmentationPublicInput[]
): void;
```

  </TabItem>
  <TabItem value="After" label="After 🚀🚀">

```typescript
function addSegmentations(
  segmentationInputArray: SegmentationPublicInput[],
  suppressEvents?: boolean
): void;
```

  </TabItem>
</Tabs>

**迁移步骤：**

1. 更新任何对 `addSegmentations` 的调用，以包括 `suppressEvents` 参数（如果需要）。
2. 如果不想抑制事件，可以省略第二个参数。

#### SegmentationPublicInput 类型更新

`SegmentationPublicInput` 类型已扩展，包含一个可选的 `config` 属性。

<Tabs>
  <TabItem value="Before" label="Before 📦 " default>

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
  <TabItem value="After" label="After 🚀🚀">

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

1. 更新任何创建或操作 `SegmentationPublicInput` 对象的代码，以包括新的 `config` 属性（如果需要）。
2. 用通用的 `RepresentationData` 类型替换特定的分割数据类型。

### 添加分割表示

#### 基于视口的方法

现在 API 聚焦于视口而不是工具组，提供了更细粒度的控制分割表示。

<Tabs>
  <TabItem value="Before" label="Before 📦 " default>

```typescript
function addSegmentationRepresentations(
  toolGroupId: string,
  representationInputArray: RepresentationPublicInput[],
  toolGroupSpecificRepresentationConfig?: SegmentationRepresentationConfig
): Promise<string[]>;
```

  </TabItem>
  <TabItem value="After" label="After 🚀🚀">

```typescript
function addSegmentationRepresentations(
  viewportId: string,
  segmentationInputArray: RepresentationPublicInput[]
);
```

  </TabItem>
</Tabs>

**迁移步骤：**

1. 在函数调用中将 `toolGroupId` 替换为 `viewportId`。
2. 移除 `toolGroupSpecificRepresentationConfig` 参数。
3. 更新依赖于返回的分割表示 UID 的代码。

#### RepresentationPublicInput 变化

`RepresentationPublicInput` 类型已简化，一些属性已被重命名或移除。

<Tabs>
  <TabItem value="Before" label="Before 📦 " default>

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
  <TabItem value="After" label="After 🚀🚀">

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

1. 移除 `options` 属性，并将 `colorLUTOrIndex` 移动到 `config` 对象中。
2. 移除 `segmentationRepresentation