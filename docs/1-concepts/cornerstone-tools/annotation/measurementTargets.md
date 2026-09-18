---
id: measurementTargets
title: 测量目标
description: 可配置地筛选标注工具为哪些目标（显示集 / 体数据）计算并显示统计量，包括在融合视口上同时显示多份统计量。本文说明 targetsFilter 与 targetPredicate 的分工、两个内置选择器、各类配置示例，以及候选项推导、targetId 复用与多目标统计的行为细节。
keywords:
  - 测量目标
  - targetsFilter
  - targetPredicate
  - measurementTargetFilters
  - cachedStats
  - allPixelData
  - forModality
  - PT/CT 融合
upstream: https://www.cornerstonejs.org/docs/concepts/cornerstone-tools/annotation/measurementTargets
---

# 测量目标 {#measurement-targets}

会计算统计量的标注工具（例如 `CircleROITool` 和 `RectangleROITool`）
把结果存放在标注的 `cachedStats` 中，以一个 **targetId** 为键——
该 id 标识这些统计量是在哪份影像数据上算出来的。在堆栈视口上，
targetId 由 imageId 推导；在体数据视口上，则由 volumeId 推导。

一个视口可以同时显示多份影像数据——PT/CT 融合视口就同时有一份 CT
和一份 PT 体数据。每一份被显示的体数据都是一个候选**测量目标**，
而工具配置决定该工具为其中哪些计算并显示统计量。

**默认情况下，ROI 统计类工具（`CircleROITool`、`RectangleROITool`）
会为每一个含有像素值的显示集计算并显示统计量**——
在 CT/PT 融合视口上，HU 和 SUV 两套统计量会同时显示。
那些模态本身不携带可测量像素值的显示集（SEG、RTSTRUCT、SR……）
永远不会被纳入，即便它们是当前唯一显示的内容。

## `targetsFilter` 与 `targetPredicate` 配置 {#the-targetsfilter-and-targetpredicate-configuration}

目标的选取被拆成两个可组合的半边，好让各自都保持为一个简单函数：

- **`targetsFilter`** —— **选择器**。它决定**基数**（取第一个还是取全部），
  接收整个候选数组以及一个 options 对象（包含视口和工具配置），
  返回要测量的那个子集。
- **`targetPredicate`** —— **逐候选谓词**。它判断**单个**候选项是否合格，
  返回 `true`/`false`。选择器会对每个候选项调用它一次；
  该谓词永远不必知道到底想要多少个目标。

```ts
type MeasurementTargetsFilter = (
  candidates: MeasurementTargetCandidate[],
  options: MeasurementTargetOptions // { viewport, configuration, data }
) => MeasurementTargetCandidate[];

type MeasurementTargetPredicate = (
  candidate: MeasurementTargetCandidate,
  options: MeasurementTargetOptions
) => boolean;
```

由于这两个决策彼此独立，同一个 `forModality('PT')` 谓词在
`firstPixelData` 选择器下表示「第一个 PT」，在 `allPixelData` 下表示
「每一个 PT」——完全不需要另写一个定制的组合过滤器。

每个候选项中与显示集相关的参数包括：

- `displaySet` —— 当前显示的那个显示集（若已注册）。它是来自
  `@cornerstonejs/metadata` 的 `IDisplaySet`，通过 `displaySetModule`
  元数据模块取得；也可能是注册到通用视口上的那个显示集
- `displaySetUID` —— 该显示集的 uid（若已知）
- `instance` —— 该显示集的一个样本（第一个）实例：naturalized 后的 DICOM
  元数据（含 `Modality`、`Rows`、`SeriesInstanceUID`……），若可用
- `index` —— 该显示集在该视口中的索引
- 另有若干便捷字段：`modality`、`imageIds` 和 `referencedId`
  （其背后的体数据 / 影像 id）

### 两个内置选择器 {#the-two-built-in-choosers}

现成的选择器会**先**应用「是否为像素数据」这项测试
（这样分割之类的东西永远不会被测量），
然后在配置了 `targetPredicate` 时再应用它：

- **`allPixelData`**（ROI 工具的默认值）—— 通过 `filter`
  取出每一个合格的候选项。在 CT/PT 融合视口上，这会同时测量两份体数据。
- **`firstPixelData`** —— 通过 `find` 只取第一个合格的候选项
  （它在第一个命中处就停下，而不会构建中间数组）；
  若没有任何候选项合格，则返回空数组。

另外还有原始的 `first`/`all` 选择器，它们会忽略谓词和像素数据测试——
这是一个应急出口，用于字面意义上测量第一个或全部候选项。

被纳入的那些候选项同时驱动两件事：

- **主 targetId** —— `getTargetId` 返回第一个被纳入的目标，
  因此选择器控制了默认情况下哪份统计量被存储 / 读取。
- **多目标统计量** —— 每一个被纳入的目标都会被计算并显示统计量。
  在一个 CT 与 PT 的融合视口上，若选择器把两个显示集都纳入，
  那么这一个视口就会为两份体数据各自在自己的像素数据上计算统计量——
  即便没有任何其他视口算过它们。

谓词的判断应当尽可能基于**显示集的模态**。当显示集未知时——
例如某个堆栈视口使用了旧式的「设置 image id」方式——
该候选项就没有 `displaySet`/`instance`/`imageIds`/`modality`，
谓词可以依据这些字段为 undefined 来决定是否纳入它。

配置好的选择器，其结果是**权威的**：当它没有纳入任何候选项时
（在 CT 视口上用了只认 PT 的谓词，或者只显示了 SEG 时走默认的像素数据测试），
该标注仍然会被绘制，但那个视口不会计算也不会显示任何统计量。

现成的选择器和谓词都是从 `measurementTargetFilters` 导出的纯函数，
它们只在任何工具之外定义一次：

```ts
import { measurementTargetFilters } from '@cornerstonejs/tools';
```

## 示例 {#examples}

全部含像素值的显示集——这就是 ROI 工具的默认配置，只是显式写出来。
模态不含像素值的候选项（非像素模态有：SEG、RTSTRUCT、RTPLAN、SR、PR、KO）
会被排除，而显示集未知的候选项（旧式堆栈）会被纳入：

```ts
toolGroup.addTool(CircleROITool.toolName, {
  targetsFilter: measurementTargetFilters.allPixelData,
});
```

只统计 CT——在没有 CT 的视口上什么都不显示。选择器取谓词保留下来的
每一个候选项：

```ts
toolGroup.addTool(CircleROITool.toolName, {
  targetsFilter: measurementTargetFilters.allPixelData,
  targetPredicate: measurementTargetFilters.forModality('CT'),
});
```

只统计 PT（在融合视口上这会显示 SUV 统计量；
在没有 PT 的视口上什么都不显示）：

```ts
toolGroup.addTool(CircleROITool.toolName, {
  targetsFilter: measurementTargetFilters.allPixelData,
  targetPredicate: measurementTargetFilters.forModality('PT'),
});
```

显式指定 CT 与 PT 两者——与默认行为类似，但严格限定为这两种模态：

```ts
toolGroup.addTool(CircleROITool.toolName, {
  targetsFilter: measurementTargetFilters.allPixelData,
  targetPredicate: measurementTargetFilters.forModality('CT', 'PT'),
});
```

只取第一个像素数据目标（也就是 5.x 之前的单目标行为）：

```ts
toolGroup.addTool(CircleROITool.toolName, {
  targetsFilter: measurementTargetFilters.firstPixelData,
});
```

只取第一个 PT 目标——`firstPixelData` 选择器配 PT 谓词：

```ts
toolGroup.addTool(CircleROITool.toolName, {
  targetsFilter: measurementTargetFilters.firstPixelData,
  targetPredicate: measurementTargetFilters.forModality('PT'),
});
```

按 id 指定某一份体数据（这是子串匹配，所以 id 中包含的序列 UID 也能用）。
它取代了已废弃的 `isPreferredTargetId` 配置：

```ts
toolGroup.addTool(RectangleROITool.toolName, {
  targetsFilter: measurementTargetFilters.allPixelData,
  targetPredicate: measurementTargetFilters.forId(ptVolumeId),
});
```

谓词就是普通函数，所以任何逐候选的选取逻辑都能实现——
包括依据样本实例来判断，或者显式处理显示集未知的情形：

```ts
toolGroup.addTool(CircleROITool.toolName, {
  // 自定义谓词：只要 PT，依据样本实例来判断
  targetsFilter: measurementTargetFilters.firstPixelData,
  targetPredicate: (candidate) => candidate.instance?.Modality === 'PT',
});

toolGroup.addTool(CircleROITool.toolName, {
  // 显示集已知时统计 PT，另外把显示集未知的也都纳入
  //（没有 imageIds 数组的，例如旧式堆栈）
  targetsFilter: measurementTargetFilters.allPixelData,
  targetPredicate: (candidate) =>
    !candidate.imageIds || candidate.modality === 'PT',
});
```

`tmtv` 示例在一个 PT/CT 融合布局上，把上面几种配置接成了几个分别带标签的
下拉项（默认两者、只看 PT SUV、只看 CT HU）；
而 `petCt` 示例演示的是 `forId` 那个变体。

## 具体行为 {#how-it-behaves}

### 候选项的推导 {#candidate-derivation}

传给过滤器的那些候选项，是由 `BaseTool.getMeasurementTargetCandidates`
从视口的 actor 中构建出来的：

- 每个 `referencedId` 对应缓存中确实存在的体数据的 actor 产生一个候选项——
  其中 `displaySet`/`displaySetUID` 来自视口已注册的显示集中与该体数据匹配的那个，
  样本 `instance` 来自该显示集的实例、或第一个 image id 的 `instance` 元数据，
  `modality` 来自该实例或该体数据的元数据；
- 不是从缓存体数据派生出来的 actor（工具 / 画布类 actor）会被跳过。
  分割表示形式（标签图等）在这一步**不会**被跳过——
  它们会作为携带 `representationUID` 的候选项被纳入，
  由配置的选择器 / 谓词来决定是否把它们纳入。
  默认的 `isPixelData` 谓词（由 `firstPixelData`/`allPixelData`
  这两个选择器应用）会排除任何带有 `representationUID` 的候选项，
  所以默认情况下分割永远不会被测量；但自定义谓词可以选择把它们纳入；
- 当没有任何 actor 产生候选项时（例如在堆栈视口上），
  会为该视口的默认视图引用使用单个候选项。如果该视口显示的是一个已注册的显示集
  （通用视口上的 `setDisplaySets`），那么该候选项的显示集相关字段会从
  `displaySetModule` 元数据（来自 `@cornerstonejs/metadata` 的 `IDisplaySet`）
  或通用视口的显示集注册信息中解析出来；而旧式堆栈
  （用普通 image id 调 `setStack`）没有显示集，
  因此该候选项不带任何显示集字段——过滤器可以通过
  `imageIds`/`instance` 的缺失来识别这种情况。

### targetId 的计算与复用 {#targetid-computation-and-reuse}

统计量在 `cachedStats` 中以视图引用 ID 为键。体数据候选项使用形如
`volumeId:<volumeId>?sliceIndex=...&viewPlaneNormal=...` 的 ID；
堆栈候选项继续使用由 imageId 推导出的 target ID。对每个体数据候选项，
如果该标注已经有一个 `cachedStats` 键、其中内嵌的体数据 ID 与该候选项完全一致，
就复用那个既有的键。标注的世界空间几何、以及由此得出的统计量，
都不依赖观察方位，所以按视图重复计算只会既重复劳动、又重复显示条目。
只有在该体数据尚无对应键时，才会依据本视口对该体数据的视图引用生成新的 targetId。

### 多份统计量的播种与计算 {#seeding-and-computing-multiple-statistics}

工具的统计计算器会遍历标注 `cachedStats` 的各个键。当某个工具在某个视口上渲染时，
它会为每一个被筛选出来、但还没有对应条目的目标播种一条 `cachedStats` 条目
（通过 `BaseTool.ensureCachedStatsTargets`），然后重新计算——
于是一个融合视口会自己播种并计算它的 CT 和 PT 两份统计量，
即便该标注最初是在某个单体数据视口上绘制并计算的。反过来，
在配了多目标过滤器的融合视口上绘制的标注，
会把两份体数据的统计量带到每一个显示它的其他视口上。

文本框随后会为每个指标渲染一行，其中包含各个目标的取值，
例如 `Mean: 34 HU 2.3 SUV`，并跳过重复的取值。

### 与 `isPreferredTargetId` 的关系 {#relation-to-ispreferredtargetid}

较早的 `isPreferredTargetId` 配置（以及 `BaseTool.isSpecifiedTargetId`
辅助方法）只能在「某个视口已经算过的那些统计量」里挑出首选的 targetId。
它已被 `targetsFilter` 取代——后者是在视口实际显示的那些显示集里做选择，
因此还能让那些尚无任何视口算过的目标也被计算出来。为了向后兼容，
配置过的 `isPreferredTargetId` 会**先于**过滤器被采信
（包括 ROI 工具的默认过滤器），因此早于 `targetsFilter` 的那些配置
仍保持原有行为。

:::note
多目标选取目前只对**屏幕上显示着的**体数据有效。
基于堆栈的融合、以及当前未显示的目标，暂不支持。
:::
