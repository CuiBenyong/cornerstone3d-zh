---
id: planar-fill-iteration
title: 平面填充迭代
description: 圆形、球形和矩形笔刷填充如何改用共享的体素板迭代器枚举体素，而不再遍历轴对齐的三维包围盒。本文说明填充契约、包围盒遍历在斜切平面上失效的原因、视图板层厚度控制什么、厚层填充的面积语义，以及笔画重采样与轮廓转标签图的处理。
keywords:
  - 平面填充
  - 体素板迭代器
  - iterateVoxelsInShape
  - isInObject
  - regionFill
  - brushVoxelSlab
  - 斜切视口
  - 规则 F
upstream: https://www.cornerstonejs.org/docs/concepts/cornerstone-tools/segmentation/planar-fill-iteration
---

# 平面填充迭代 {#planar-fill-iteration}

本页说明一次笔刷填充会触及哪些体素，以及填充是怎么找到它们的。
它面向那些要编写填充策略、或者需要推理旋转 / 斜切视口下行为的贡献者。

笔刷填充使用与面积标注工具**相同**的迭代器、相同的形状和相同的归属规则。
那条规则是规范性的，由[体素统计](../annotation/voxel-statistics.md)定义。
请先读那一页；本页只讲填充特有的部分。

## 背景：填充契约 {#background-the-fill-contract}

笔刷策略的 `Initialize` 步骤会在 `operationData` 上放两样东西：

- **`isInObjectBoundsIJK`** —— 一个 IJK 包围盒
  `[[iMin, iMax], [jMin, jMax], [kMin, kMax]]`，限定填充要访问哪些体素。
- **`isInObject(pointLPS, pointIJK)`** —— 一个谓词，
  判断被访问到的某个体素是否在形状内部。

`Fill` 步骤（`regionFill`）把这两样交给体素管理器，
后者遍历包围盒中的每个体素并调用该谓词：

```ts
for (let k = kMin; k <= kMax; k++) {
  for (let j = jMin; j <= jMax; j++) {
    for (let i = iMin; i <= iMax; i++) {
      const pointLPS = indexToWorld([i, j, k]);
      if (pointInShapeFn(pointLPS, [i, j, k])) {
        // 填充
      }
    }
  }
}
```

### 为什么包围盒遍历在斜切平面上会失效 {#why-the-box-walk-fails-on-an-oblique-plane}

圆形或矩形笔刷绘制的是一张薄片。当这张薄片是轴对齐时，
它的 IJK 包围盒只有一个体素厚，所以上面那个循环本身已经很紧凑了。
但当薄片是斜切的，包裹它的轴对齐包围盒在**三个轴向上都很大**，
而其中真正落在里面的只是一张 `O(N²)` 的薄片。
于是这个循环要测试 `O(N³)` 个体素才能填出 `O(N²)`，而且倾斜得越厉害浪费越大。

开销反倒是较小的那个问题。谓词还必须把循环本就不该访问到的每个离平面体素
排除掉，而它是靠一个深度容差项来做这件事的。容差取得太小，薄片上会留下空洞；
取得太大，填充又会渗入相邻切片。没有哪个单一取值对所有方位都正确——
这正是斜切笔刷形状此前不正确的根源。

## 共享的体素板迭代器 {#the-shared-voxel-slab-iterator}

`strategies/utils/brushVoxelSlab.ts` 把上面两半都换掉了。
它把笔刷描述为一个锚定在视平面上的 `VoxelSlabShape`，
并用 `csUtils.voxelSlab.iterateVoxelsInShape` 枚举该形状的体素。

这个迭代器沿某一个体素轴发出精确的整数区间，并嵌套在板层自身沿法向的边界之内，
因此：

- 它只访问笔刷覆盖到的体素，加上它触及的那些行——绝不会遍历整个包围盒的体积；
- 它对每个体素恰好访问一次。这一点很重要，
  因为一次填充若对同一体素写两次，就会为它记下两条撤销记录；
- 它不需要任何深度容差，因为板层边界对任意方位都是精确的。

每个笔刷为笔画的每个中心点构建一个形状，
`createUnionShape` 再把它们的区间合并成一个互不重叠的序列：

| 笔刷           | 形状                                      | 深度                     |
| -------------- | ----------------------------------------- | ------------------------ |
| 圆形 / 椭圆    | `createEllipseShape`，扁平                | 取自视图板层厚度         |
| 球形           | `createCircleShape` 带 `depthRadius`      | 取自它自己的半径         |
| 矩形           | `createRectangleShape`，扁平              | 沿法向一个体素           |

当某个策略没有构建出填充时——退化的笔刷，或者尚未迁到迭代器上的策略——
`regionFill` 会回退到包围盒遍历，所以 `isInObject`
和 `isInObjectBoundsIJK` 仍然是必需的。

## 视图板层厚度控制什么 {#what-the-view-slab-thickness-controls}

圆形或矩形笔刷是扁平的：它躺在视平面内，自身不带任何深度。
因此参考平面的厚度决定了填充沿法向能伸展多深。

- **薄层（单切片）视图** —— 这是默认情形，也是视口未报告板层厚度时你得到的结果。
  深度是沿法向量得的一个体素，因此填充绘制出一层斜切的层。
  规则 F 让半宽为 `T_v / 2`，而这个厚度的板层正是一个标准数字平面：
  它包含该平面穿过的每一个体素，并且与相距一个 `T_v` 的那次填充不共享任何体素。
  板层更薄会留下空洞，更厚则会写出两层。规则 F 的深度区间是半开的，
  这把共享边界恰好判给两次连续填充中的一次。若改成开区间，
  那条边界就两边都不属于；而在 45 度时，开区间会使一半的体素
  无法被任何一次填充触及。
- **全厚度（厚层）视图** —— 视图厚度会直接作为填充深度传下去，
  于是那个扁平圆盘变成一段短圆柱，填充会绘制贯穿该板层的每一层。
  半开区间使层数恰好为 `F / T_v`，无论该平面落在两层之间的什么位置。

球形笔刷是例外。它自带深度，通过 `getRequiredThickness` 报告该深度，
因此完全忽略视图板层。球形沿用规则 M，
因为该形状自己的区间已经限定了填充范围。

:::caution
填充与视口必须按相同的距离步进。规则 F 的数字平面相距 `T_v`，
而 `T_v` 是 L1 度量。体数据视口是按 `getSpacingInNormalDirection` 步进的，
那是 L2 度量，而对斜切法向而言 L2 比 L1 短。
于是两张连续的斜切切片会落在同一个数字平面内，两张切片显示同一份填充。
这种情况下填充是正确的，错的是步进。
:::

### 厚层填充的面积语义 {#area-semantics-for-a-thick-slab-fill}

薄层填充只有一个体素深，所以它的平面内面积就是被绘制体素数乘以体素面积。
而厚层填充是一个体积，不是一个平面区域：在它的体素上计算**面积**时，
必须除以以体素计的深度，否则多出来的那些层会把面积算多。
这一点只影响面积测量。不计算面积的自由填充不受影响。

## 一次笔画 {#a-stroke}

指针每次笔画只报告少数几个位置，快速拖拽时这些位置之间的间隔会比笔刷宽度还大。
只在这些位置上取圆盘的并集会画成一条虚线，
所以 `brushVoxelSlab.ts` 会以较小半径的一半为间隔对笔画重采样，
从而保证相邻圆盘彼此重叠。

圆形笔刷会把每个圆盘投影到同一个视平面上，因此无论指针移动了多远，
一次笔画只绘制出单独一层斜切的层。球形笔刷不投影它的中心点，
因此一次笔画扫出的是一根真正的管状体。

## 轮廓转为标签图 {#a-contour-that-becomes-a-labelmap}

`LabelmapBaseTool` 把一个闭合轮廓标注转换为标签图体素，
而这个转换过程就是一次填充。因此它采用同样的设计：
多段线就是那个形状——通过 `createPolylineShape`——
再由 `iterateVoxelsInShape` 枚举体素。

`createPolylineShape` 是扁平的，所以它不报告自身厚度。
该转换沿轮廓自己的法向取一个体素的深度，
覆盖方式取 `'centerInside'`，也就是规则 F。轮廓所在平面来自标注本身、
绝不来自相机，因此同一个轮廓作用在同一份体数据上时，
无论缩放、平移和板层厚度如何，写出的体素都相同。

## 代码位置 {#where-the-code-lives}

| 文件                                                                 | 作用                                       |
| -------------------------------------------------------------------- | ------------------------------------------ |
| `core/src/utilities/voxelSlab/iterateVoxelsInShape.ts`               | 迭代器                                     |
| `core/src/utilities/voxelSlab/shapes/`                               | 各种形状，包含 `createUnionShape`          |
| `tools/src/tools/segmentation/strategies/utils/brushVoxelSlab.ts`    | 笔刷形状与填充                             |
| `tools/src/tools/segmentation/strategies/compositions/regionFill.ts` | `Fill` 回调                                |
| `tools/src/tools/segmentation/LabelmapBaseTool.ts`                   | 轮廓转标签图的填充                         |
| `tools/src/utilities/sampleAreaAnnotationVoxels.ts`                  | 标注侧的实现，以及共享的索引边界           |
