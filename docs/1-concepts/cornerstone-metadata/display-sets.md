---
id: display-sets
title: 显示集
description: 显示集（Display Set）是视口渲染的单位，把一个序列中应当一起显示的实例分为一组。本文讲解拆分—创建—消费三段管线、如何用显示集驱动视口、在元数据层缓存显示集、拆分规则模型（含混合 b 值 DWI 序列的完整示例），以及 IDisplaySet 的属性与模块增强方式。
keywords:
  - 显示集
  - IDisplaySet
  - splitImageIdsBySplitRules
  - createDisplaySetFromGroup
  - registerDisplaySetMetadata
  - SplitRule
  - DiffusionBValue
  - DWI
upstream: https://www.cornerstonejs.org/docs/concepts/cornerstone-metadata/display-sets
---

# 显示集 {#display-sets}

**显示集**是视口渲染的单位。它把一个序列中应当一起显示的实例分为一组，
并记录哪些视口类型能够渲染它们。这与 OHIF 的「display set」概念一致，
但它位于 `@cornerstonejs/metadata` 中，是一个与框架无关、
**数据形态**的对象（`IDisplaySet`），因此任何应用——不只是 OHIF——都能复用它。

一个序列并不总是对应单个显示集。最典型的情况，也正是这个模块被抽取出来所要解决的
那个问题：一个**扩散加权 MR（DWI）**序列里混有 4D 的 b 值帧，
以及尾部若干没有 b 值的帧。那些 b 值未定义的帧并不属于这份 4D 数据集，
所以把它们当作同一份体数据来渲染会套用错误的窗宽窗位。
`mixedDimensionalityBValue` 这条拆分规则会把它们分到各自独立的显示集里
（见[拆分规则](#split-rules)）。

## 拆分 → 创建 → 消费 三段管线 {#the-split--create--consume-pipeline}

端到端的流程分三个阶段：

1. **拆分**：用一组拆分规则，通过 `splitImageIdsBySplitRules`
   把一个序列的 imageId 拆成若干实例分组。
2. **创建**：用 `createDisplaySetFromGroup` 为每个分组创建一个 `IDisplaySet`。
3. **消费**：处理每个显示集——把它渲染到视口上，
   和 / 或把它缓存到元数据层，好让下游代码能按 imageId 解析到它。

在示例中，辅助函数 `splitDisplaySetsFromImageIds(imageIds)` 帮你完成了第 1–2 阶段
（它把帧级 imageId 归一化为基础形式、按 SOP 去重到每个实例一条，
再把帧级 imageId 重新挂回去）。它内部做的其实就是：

```ts
import {
  splitImageIdsBySplitRules,
  createDisplaySetFromGroup,
  defaultDisplaySetSplitRules,
  metaData,
  type IDisplaySet,
  type NaturalizedInstance,
} from '@cornerstonejs/metadata';

// 把一个（基础）imageId 解析为它对应的 naturalized DICOM 实例。
// 在真实应用里，这一步是读元数据缓存，例如 metaData.get('instance', imageId)，
// 其中 imageId 已被归一化为基础（第 1 帧）形式。
function getNaturalizedInstance(
  imageId: string
): NaturalizedInstance | undefined {
  return metaData.get('instance', imageId) as NaturalizedInstance | undefined;
}

const groups = splitImageIdsBySplitRules(seriesImageIds, {
  getNaturalizedInstance,
  splitRules: defaultDisplaySetSplitRules,
});

const displaySets: IDisplaySet[] = groups.map((group) =>
  createDisplaySetFromGroup(group)
);
```

## 用显示集驱动视口 {#driving-a-viewport-from-a-display-set}

每个显示集都会暴露它可以在哪些视口类型中显示（`viewportTypes`，
其中第一个就是 `preferredViewportType`）。视口的
`setDisplaySets({ displaySetId })` 是加载显示集的唯一入口：
它把 `displaySetId` 解析为可渲染的数据、调用该视口的原生 setter
（`setStack` / `setVolumes` / `setVideo` / `setWSI` / `setEcg`），
并记录这条已挂载的条目，使 `getDisplaySets()` 能反映出来。

视口 / 注册表中的 `displaySetId` 与显示集的 `displaySetId` 字段是同一个值——
一个显示集只有一个标识符，元数据对象和视口 API 两边用的都是它。

对旧视口来说，`setDisplaySets` 是通过**通用视口的显示集提供者**
来解析 `displaySetId` 的，因此你需要先把可渲染数据注册到那里。
注册时的数据结构取决于视口族：

```ts
import { Enums, utilities } from '@cornerstonejs/core';

const { ViewportType } = Enums;

const HINT_TO_VIEWPORT_TYPE: Record<string, Enums.ViewportType> = {
  stack: ViewportType.STACK,
  volume: ViewportType.ORTHOGRAPHIC,
  volume3d: ViewportType.VOLUME_3D,
  video: ViewportType.VIDEO,
  wholeslide: ViewportType.WHOLE_SLIDE,
  ecg: ViewportType.ECG,
};

const displaySetId = displaySet.displaySetId;

// 1. 注册可渲染数据，好让视口能解析 `displaySetId`。
//    stack / volume 用 { imageIds }；video / ecg 用 { kind, sourceDataId }；
//    wsi 用 { kind: 'wsi', imageIds, options: { webClient } }。
utilities.genericViewportDisplaySetMetadataProvider.add(displaySetId, {
  imageIds: [...displaySet.imageIds],
});

// 2. 按该显示集偏好的类型启用一个视口，然后把它挂载上去。
const viewportType =
  HINT_TO_VIEWPORT_TYPE[displaySet.preferredViewportType] ?? ViewportType.STACK;
renderingEngine.enableElement({ viewportId, type: viewportType, element });

const viewport = renderingEngine.getViewport(viewportId);
await viewport.setDisplaySets({ displaySetId });

viewport.getDisplaySets(); // [{ displaySetId }] —— 反映实际挂载了什么
```

`getDisplaySets()` 在旧的 `Viewport` 和通用视口上都可用，
因此无论哪套继承体系，都能以统一方式读取已挂载的显示集。

可运行的端到端版本（涵盖全部五个视口族，另有一个下拉框可以在某个显示集
所允许的视口类型之间切换）是 `packages/core/examples/displaySets`
下的 **Display Sets** 示例。

## 在元数据层缓存显示集 {#caching-display-sets-in-the-metadata-layer}

与渲染无关地，显示集也可以存入带类型的元数据缓存，
这样任何使用方（工具、测量、自定义 UI）都能从它的任意一个 imageId 解析到它：

```ts
import {
  registerDisplaySetProviders,
  registerDisplaySetMetadata,
  Enums,
  metaData,
} from '@cornerstonejs/metadata';

// 应用初始化时执行一次（在 registerDefaultProviders 之后）：
registerDisplaySetProviders();

// 创建显示集之后，以它（底层）的 imageId 为键缓存它：
registerDisplaySetMetadata(seriesImageIds, displaySet);

// 在下游任何地方，从它的某个 imageId 解析出该显示集：
const ds = metaData.getTyped(Enums.MetadataModules.DISPLAY_SET, imageId);
ds?.instances; // 完整的 IDisplaySet —— 包括 instances 和拆分规则
ds?.numImageFrames; // 诸如 isClip / numImageFrames / splitNumber 等属性
```

`getTyped(MetadataModules.DISPLAY_SET, …)` 返回的是当初注册的那个完整
`IDisplaySet`，而不是一个收窄后的投影，因此缓存中的结构与带类型的读取结果
永远不会彼此偏离。

## 拆分规则 {#split-rules}

拆分规则决定了一个序列的各实例如何被分组为显示集，以及每个分组支持哪些视口类型。
`defaultDisplaySetSplitRules` 覆盖了常见的 DICOM 情形
（视频、ECG、全片影像、单张影像模态、多帧影像片段、混合 b 值的 DWI、
体数据序列，以及一条兜底的影像规则）。规则**按顺序求值，
对每个实例第一条命中的规则生效**。

一条 `SplitRule` 最多有五个部分：

| 字段               | 用途                                                                                                   |
| ------------------ | ------------------------------------------------------------------------------------------------------ |
| `matches`          | 返回 true 表示某实例属于这条规则。省略则匹配所有实例。                                                  |
| `groupBy`          | 用来把已匹配实例划分到不同显示集的键（标签名或函数）。                                                  |
| `series`           | 可选。每次拆分中每条规则只运行一次，并**返回**该规则派生出的事实；`matches` / `groupBy` 通过 `series` 读取。 |
| `viewportTypes`    | 所产出显示集允许的视口类型；索引 `0` 为偏好类型。                                                       |
| `customAttributes` | 返回额外属性，会被平铺展开到显示集上（例如 `isClip`、`numImageFrames`）。                                |

大多数规则只需要 `matches` 和 `groupBy`：

```ts
{
  matches: (instance) => isVideoInstance(instance),
  groupBy: ['SOPInstanceUID'],
}
```

只有当某条规则需要一个从**整个序列**计算出来、
并被 `matches` 或 `groupBy` 复用的值时，才需要动用 `series`。
它是可选的，**每次拆分操作中每条规则只运行一次**，
并返回该规则的派生事实——它**不应**修改共享状态。
DWI 那个修复就是完整示例：`series` 判断该序列是否混有 b 值帧与非 b 值帧，
然后 `groupBy` 把它们分成两个显示集：

```ts
import type { SplitRule } from '@cornerstonejs/metadata';

const mixedDimensionalityBValue: SplitRule = {
  id: 'mixedDimensionalityBValue',
  viewportTypes: ['volume', 'volume3d', 'stack'],
  // 对整个序列计算一次；结果是返回出去的，不会写到共享状态上。
  series: ({ instances }) => ({
    mixedBValue:
      instances[0]?.Modality === 'MR' &&
      instances.some((i) => i.DiffusionBValue !== undefined) &&
      instances.some((i) => i.DiffusionBValue === undefined),
  }),
  // 读取这条规则自己派生出的事实。
  matches: (_instance, { series }) => series.mixedBValue,
  // 两个显示集：b 值未定义的帧从其余帧中分离出来。
  groupBy: [
    'SeriesInstanceUID',
    (instance) => instance.DiffusionBValue === undefined,
  ],
};
```

要自定义拆分行为，把你自己的规则前置到默认规则之前（或整体替换掉默认规则），
再把结果作为 `splitRules` 传入。`customAttributes` 可以设置任意属性，
但显示集所依赖的那几个已解析数据字段——`imageIds`、`underlyingImageIds`、
`instances` 和 `displaySetId`——是保留字段，不能被覆盖，
这样视口所依赖的「底层 imageId 与帧 imageId」这一不变量就始终成立。

写规则时有几条引擎层面的保证值得知道：

- **分桶按规则命名空间隔离。** 即使两条不同规则的 `groupBy` 取值恰好相同，
  它们也绝不会合并成同一个显示集。
- **分组顺序是确定的。** 分组返回时按一个稳定的、带规则命名空间的键排序，
  因此无论传入 imageId 的顺序如何，一个序列的显示集——
  以及任何由其位置派生出的 id——都是稳定的。
- **`series` 会采样 `instances[0]`** 来得出某些事实（例如是否多帧、是否体数据），
  所以那些规则假定序列是同质的。异质序列需要一条专门的规则来分离
  （正如 `mixedDimensionalityBValue` 对 DWI 所做的那样）。
- **`series` 的作用域限于它自己那条规则。** 一条规则只能看到它自己的
  `series` 钩子返回的事实，读不到别的规则的事实，也不得修改共享状态。
- **未匹配的实例会被丢弃。** 没有命中任何规则的实例（例如非影像类 SOP）
  不会产出显示集；给 `splitImageIdsBySplitRules` 传入 `onUnmatchedInstance`
  可以观察到它们。
- **`buildSeriesInfo` 对空实例列表是安全的**——它会返回全零的计数。
  它只做序列统计的聚合，与拆分规则无关。

### 实例分类器 {#instance-classifiers}

默认规则依赖一些小的 SOP 类 / 模态判断启发式，这些也被导出以供复用，
让你不必重新硬编码 UID 列表就能识别序列的种类：

- `isImageInstance(instance)` —— 该 SOP 类携带可渲染的像素数据。
- `isVideoInstance(instance)` —— 视频传输语法（复用共享的 `videoUIDs` 列表）、
  视频 SOP 类，或一个较长的多帧二次捕获。
- `isEcgInstance(instance)` —— ECG / 波形 SOP 类。
- `isWsiInstance(instance)` —— VL 全片显微影像存储，或模态为 `SM`。

## 显示集的属性（`IDisplaySet`） {#display-set-attributes-idisplayset}

显示集实现 `IDisplaySet`，它把从显示集上读取的**通用属性**声明为普通数据——
而不是访问器方法——因此它的行为与 OHIF 的 display set 对象一致：

```ts
const displaySet = createDisplaySetFromGroup(group);

displaySet.displaySetId;
displaySet.viewportTypes; // readonly ViewportTypeHint[]
displaySet.preferredViewportType; // viewportTypes[0]
displaySet.instances; // readonly NaturalizedInstance[]
displaySet.imageIds; // 帧级、可渲染的 imageId
displaySet.underlyingImageIds; // SOP 级 imageId（每个实例一个）
```

### 新增显示集属性 {#adding-new-display-set-attributes}

- **共享 / 通用属性**应当直接放在 `IDisplaySet` 上。除非每个显示集都会填充它，
  否则请声明为可选。其中许多属性由某条拆分规则的 `customAttributes` 回调产出，
  并在 `createDisplaySetFromGroup` 中平铺展开到显示集上
  （例如 `isMultiFrame`、`isClip`、`numImageFrames`、`splitNumber`）。
- **应用或扩展专属的属性**如果不属于通用模型，
  应当通过 **TypeScript 模块增强**来添加，这样它们既受类型检查、
  又不会把共享接口撑大：

  ```ts
  // my-extension.ts —— 位于某个扩展或使用方应用中
  import '@cornerstonejs/metadata';

  declare module '@cornerstonejs/metadata' {
    interface IDisplaySet {
      /** 该显示集是否支持窗宽窗位。 */
      supportsWindowLevel?: boolean;
    }
  }
  ```

请把增强出来的属性保持为可选——并非所有显示集类型都会定义它们。

## 相关文档 {#related-docs}

- [Cornerstone 元数据](./index.md)
- [元数据提供者](../cornerstone-core/metadataProvider.md)
