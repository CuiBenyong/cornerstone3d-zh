---
id: migration-notes
title: 5.x 迁移参考笔记
description: Cornerstone3D 4.x 升级到 5.x 过程中影响较小但值得留意的行为变化。包括 disableScale 与 imageFrame.preScale、instance 数据对象模型、SEG 适配器 createFromDicomSegImageId、ESM 打包与 TypeScript moduleResolution、斜切笔刷填充改用体素板迭代器，以及视口元素设置 touch-action none。
keywords:
  - Cornerstone3D 5.x 迁移
  - disableScale
  - preScale
  - createFromDicomSegImageId
  - moduleResolution
  - touch-action none
  - 体素板迭代器
upstream: https://www.cornerstonejs.org/docs/migration-guides/5x/migration-notes
---

# 5.x 迁移参考笔记 {#5x-migration-reference-notes}

这一页记录一些影响较小、但在 4.x → 5.x 升级过程中值得作为参考的行为变化。

## `disableScale` 与 `imageFrame.preScale` {#disablescale-and-imageframeprescale}

## 变化内容 {#what-changed}

在 5.x 中，当 `disableScale` 为 `true` 时，Cornerstone3D 不再设置
`imageFrame.preScale`，并保留原始的像素最小/最大取值范围
（`minAfterScale = minBeforeScale`，`maxAfterScale = maxBeforeScale`）。

这是有意为之，针对的是缩放本身就是恒等变换的情形（例如 slope/intercept 为 1/0）。

## 为什么这件事重要 {#why-this-matters}

在 4.x 中，某些工作流隐式地依赖 `imageFrame.preScale` 始终存在。
在 5.x 中，当缩放被禁用时这个对象可能是 `undefined`。

## 迁移建议 {#migration-guidance}

- 把 `imageFrame.preScale` 当作可选值，访问时做相应的保护判断。
- 如果下游逻辑确实需要一个 pre-scale 描述对象，
  请在启用 `disableScale` 时于应用代码中自行构造一个。
- 如果你只需要像素统计量，直接使用影像帧值中的
  `minPixelValue` / `maxPixelValue`，不要假定拿到的是缩放后的值。

## 元数据模块中的 `instance` 数据对象模型 {#instance-data-object-model-in-metadata-modules}

### 变化内容 {#what-changed-1}

在 5.x 中，这一条主要是文档层面的澄清，而不是新的运行时行为变化：
`instance` 数据应当被理解为一个「按帧」的单一对象，
其中已经把计算出的按帧取值合并进了同一个对象。

这个对象可以利用继承来组合来自多个元数据层级的取值。
正因如此，使用方**不应**假定所有属性都能直接在该对象上被迭代或枚举出来。

### 4.x 与 5.x 的理解差异 {#4x-vs-5x-interpretation}

- **4.x：** 这种结构和行为在实践中就已经存在，只是没有被清楚地写进文档。
- **5.x：** 同样的模型现在被明确地写入文档，便于各方集成依赖这份既定契约。

### 迁移建议 {#migration-guidance-1}

- 不要依赖对象枚举（`Object.keys`、`for...in`）来发现 instance 数据上
  所有可用的属性。
- 显式访问你已知的属性，或者使用那些理解这种「组合 / 继承」对象结构的模块工具函数。
- 从 naturalized 元数据构建 instance 数据时，优先使用 `combineFramesInstance`
  工具函数，这样下游模块才能收到预期的基础对象结构。

## SEG 适配器：`createFromDICOMSegBuffer` 已废弃，改用 `createFromDicomSegImageId` {#seg-adapter-createfromdicomsegbuffer-deprecated-in-favor-of-createfromdicomsegimageid}

### 变化内容 {#what-changed-2}

新增了入口
`adaptersSEG.Cornerstone3D.Segmentation.createFromDicomSegImageId`。
它的第二个参数是一个 SEG 实例的 `imageId`（像素来自你提供的按帧 `imageId` 或解码器）——
尽管旧名字听起来像是接受缓冲区，它**并不**接受 Part 10 的 `ArrayBuffer`。

`createFromDICOMSegBuffer` **没有被移除**。它仍然作为一个已废弃的别名导出，
通过委托给 `createLabelmapsFromDICOMBuffer` 保留了它在 4.x 时的原始契约
（第二个参数是 Part 10 的 `ArrayBuffer`）。既有的基于缓冲区的调用方可以继续照常工作，
升级也不需要提升主版本号。新代码应当迁移到 `createFromDicomSegImageId`
（走按帧 `imageId` 的路径）或 `createLabelmapsFromDICOMBuffer`（走缓冲区路径）。

```ts
// 4.x
const results =
  await adaptersSEG.Cornerstone3D.Segmentation.createFromDICOMSegBuffer(
    referencedImageIds,
    arrayBuffer, // <-- ArrayBuffer
    { metadataProvider }
  );

// 5.x
const results =
  await adaptersSEG.Cornerstone3D.Segmentation.createFromDicomSegImageId(
    referencedImageIds,
    segImageId, // <-- SEG 实例的 imageId
    { metadataProvider, frameImageIds }
  );
```

### 为什么这件事重要 {#why-this-matters-1}

之所以启用新名字，是因为按帧 `imageId` 的路径把第二个参数的契约完全改变了
（`ArrayBuffer` → `imageId`）。与其悄悄把同名函数改成一个不兼容的契约，
不如让新行为使用新名字 `createFromDicomSegImageId`。原来的
`createFromDICOMSegBuffer` 则作为已废弃的别名保留其旧的 `ArrayBuffer` 契约，
这样既有调用方无需改代码就能继续工作，升级也不必提升主版本号。

### `frameImageIds` 选项（可选） {#the-frameimageids-option-optional}

`frameImageIds` 是**可选的**，大多数集成永远不需要设置它。

它是一份可加载的 imageId 列表——每个 SEG 帧对应一个——适配器会把它交给影像加载器
去读取像素数据。换句话说，它就是该分割所包含的那组帧，
与分割对象被加载时产生的结果完全一致。它之所以存在，是因为获取像素的方式变了：
旧的缓冲区路径从内存中持有的单个 Part 10 `ArrayBuffer` 解码出整个 SEG，
因此各个帧从不需要自己的 imageId；而新路径通过影像加载器逐帧加载像素，
因此**每一帧**都需要一个可寻址的 imageId。

只有在**其 imageId 不遵循 DICOMweb（WADO-RS）或 WADO-URI 约定的数据源**上，
你才需要传它。当 SEG 的 `imageId` 使用了适配器能识别的帧寻址方案时，
按帧列表会被自动推导出来，`frameImageIds` 可以省略：

- **WADO-RS / DICOMweb** —— 各帧是独立资源（`.../frames/1`、`.../frames/2`……），
  因此列表可通过替换帧号推导得出。
- **WADO-URI** —— 各帧通过查询参数选择（`?frame=1`、`&frame=2`……），
  因此列表可通过追加帧查询参数推导得出。

对于任何其他形式的 imageId（自定义方案、并非 WADO-URI 的 blob / object URL、
应用专属加载器等），并没有一条通用规则可以把一个基础 `imageId` 变成按帧的 imageId，
所以适配器无法自动生成这份列表。这种情况下请显式传入 `frameImageIds`
（或者传一个 `getFrameImageId(segImageId, frameNumber)` 回调）。
如果你对一个无法识别的多帧 `imageId` 省略了它，
那么每一帧都会回退到同一个基础 `imageId`，解码出完全相同的像素。

```ts
// 单帧 SEG、WADO-RS 和 WADO-URI 形式的 imageId：不需要 frameImageIds。
const results =
  await adaptersSEG.Cornerstone3D.Segmentation.createFromDicomSegImageId(
    referencedImageIds,
    segImageId,
    { metadataProvider }
  );

// 仅非 WADO 方案：提供加载 SEG 时得到的按帧 imageId。
const results =
  await adaptersSEG.Cornerstone3D.Segmentation.createFromDicomSegImageId(
    referencedImageIds,
    segImageId,
    {
      metadataProvider,
      frameImageIds, // 每个 SEG 帧对应一个可加载的 imageId
    }
  );

// 也可以传一个构造函数代替完整列表：
//   getFrameImageId: (segImageId, frameNumber) => `${segImageId}?frame=${frameNumber}`
```

### 迁移建议 {#migration-guidance-2}

- 如果你是通过按帧 `imageId` 加载 SEG（即 OHIF / imageLoader 路径），
  把调用改为 `createFromDicomSegImageId`，并把 SEG 实例的 `imageId`
  作为第二个参数传入。
- 如果你手上仍然是 Part 10 的 `ArrayBuffer`，请使用
  `createLabelmapsFromDICOMBuffer`
  （`(referencedImageIds, arrayBuffer, metadataProvider, options)`）
  或 `generateToolState`，它们保留了基于缓冲区的入口。
- 既有的
  `createFromDICOMSegBuffer(referencedImageIds, arrayBuffer, { metadataProvider })`
  调用可以继续照常工作——该函数现在是缓冲区路径的一个已废弃别名。
  你可以按自己的节奏迁移到 `createLabelmapsFromDICOMBuffer`。

## ESM 打包与 TypeScript 的 `moduleResolution` {#esm-packaging-and-typescript-moduleresolution}

### 变化内容 {#what-changed-3}

发布的 `@cornerstonejs/*` 包现在声明自己为 ESM（`"type": "module"`），
并且在运行时的 `.js` 文件和 `.d.ts` 声明文件中，都为相对导入写出了显式的
`.js` 扩展名。这让这些包在**原生 Node ESM** 环境下也能正确解析
（服务端渲染、Node 测试运行器、打包检查工具，以及对缺失扩展名直接报错的 Node 25+），
而不再只是在打包工具内部才能用。

### 为什么这件事重要 {#why-this-matters-2}

- **使用打包工具的用户不受影响。** webpack、Vite、Next 等工具对 `./foo`
  和 `./foo.js` 的解析结果相同，所以像 OHIF 这样的应用无需改动。
- **原生 Node 现在可用了。** 在 Node 代码路径中引入这些包，
  不会再因为缺少扩展名而报 `ERR_MODULE_NOT_FOUND`。
- **CommonJS 的 `require()` 不是受支持的包入口方式。** 请用 ESM 的 `import`、
  动态 `import()`，或者一个能解析 ESM export map 的打包工具来使用
  `@cornerstonejs/*`。

### 迁移建议 {#migration-guidance-3}

请使用现代的 TypeScript 模块解析模式——`"bundler"`、`"node16"` 或 `"nodenext"`。
这也是当前工具链的默认值，它们能理解随包发布的 `.d.ts` 文件里带 `.js` 扩展名的导入。

旧的 `moduleResolution: "node"`（也就是 `node10`）**不会**把声明文件里的
`.js` 标识符映射回对应的 `.d.ts`，而且会完全忽略包的 `exports` 映射。
在这个设置下，某些深层 re-export 的类型可能解析成 `any` 或者解析失败。
这**只是类型解析**层面的问题——运行时行为不受影响——
但如果你发现类型缺失，请切换到 `"bundler"` / `"node16"` / `"nodenext"`。

## 斜切笔刷填充改用共享的体素板迭代器 {#oblique-brush-fills-use-the-shared-voxel-slab-iterator}

### 变化内容 {#what-changed-4}

圆形、球形和矩形笔刷的填充不再遍历笔刷周围那个轴对齐的 IJK 包围盒。
它们把笔刷描述为一个锚定在平面上的形状，并用
`csUtils.voxelSlab.iterateVoxelsInShape` 来枚举其体素——
这与面积标注工具做测量时使用的迭代器、形状和归属规则（规则 M）完全相同。

对于旋转过的或斜切的视口，由此带来三点变化：

- 圆形、球形和矩形笔刷在任意方位下画出的都是用户实际画的那个形状。
- 平面笔刷在薄层视图中绘制一层斜切的体素，在全厚度视图中则绘制贯穿整个板层的
  每一层。它不再渗入相邻切片。
- 新增了 `csUtils.voxelSlab.createUnionShape`。它把若干形状的区间合并成一个
  互不重叠的序列——笔刷笔画正是靠它，把每个采样点对应的一个圆盘取并集绘制出来，
  而不会对同一个体素写入两次。

`operationData.isInObject` 和 `operationData.isInObjectBoundsIJK` 保持不变，
当某个策略没有构建填充时，`regionFill` 仍然会使用它们。

### 为什么这件事重要 {#why-this-matters-3}

包围盒遍历为了填充一个 `O(N²)` 的面，要测试 `O(N³)` 个体素，
而且它还需要一个深度容差来排除那些本就不该访问到的离平面体素。
没有哪个容差值对所有方位都合适：取得太小会在面上留下空洞，
取得太大会让填充渗入相邻切片。共享迭代器的板层边界对任意方位都是精确的，
因此完全不需要容差。

### 迁移建议 {#migration-guidance-4}

- 使用内置笔刷工具的应用无需任何改动。
- 自定义笔刷策略通过 `isInObject` 和 `isInObjectBoundsIJK` 继续有效。
  若要改用新的迭代器，请在你的 `Initialize` 回调中设置
  `operationData.brushVoxelSlabFill`；`strategies/utils/brushVoxelSlab.ts`
  里的构造函数展示了具体做法。
- 填充契约见
  [平面填充迭代](../../1-concepts/cornerstone-tools/segmentation/planar-fill-iteration.md)，
  规则 M 本身见
  [体素统计](../../1-concepts/cornerstone-tools/annotation/voxel-statistics.md)。

## 视口元素会设置 `touch-action: none` {#viewport-elements-set-touch-action-none}

### 变化内容 {#what-changed-5}

渲染引擎现在会为它启用为视口的每个元素设置 `touch-action: none`，
并在视口被禁用时恢复该元素此前的行内取值。以前这件事是交给应用自己做的。

### 为什么这件事重要 {#why-this-matters-4}

如果没有 `touch-action: none`，浏览器会在 Cornerstone 看到手势之前就把它接管掉：
单指拖动会滚动页面而不是运行当前工具，双指捏合会缩放整个文档而不是影像，
双击会触发浏览器自身的缩放。触摸类工具在一个仍被浏览器接管的元素上无法工作——
这正是它被无条件应用、而不是藏在某个配置开关后面的原因：
开关的另一侧并没有什么值得保留的行为。

一个可见的后果是：在触摸设备上，**在视口上拖动不再滚动页面**。
那些原本依赖「视口是可以起手滚动页面的区域」的应用，
需要改为在视口周围提供可滚动区域。

关于影响范围的两点说明：

- 只有视口元素会受影响，你布局中的其余部分不受影响。
- 该取值是以行内样式应用的，因此在视口处于启用状态期间，
  它会覆盖来自 CSS 类的 `touch-action`。视口被禁用时，
  元素原本的行内取值会被恢复，CSS 中设置的值随之重新生效。

### 迁移建议 {#migration-guidance-5}

- **移除应用层的变通代码。** 如果你曾经为了让触摸工具能用，
  在视口元素上设置 `touch-action: none`（或挂了 `preventDefault` 的触摸监听器），
  那些代码现在是多余的，可以删掉。
- **检查小屏幕上的滚动可用性。** 如果某个页面此前依赖在视口上拖动来滚动，
  请在视口元素外侧增加内边距、滚动容器或留白区域，
  以保证页面在手机或平板上仍然可以滚动。
