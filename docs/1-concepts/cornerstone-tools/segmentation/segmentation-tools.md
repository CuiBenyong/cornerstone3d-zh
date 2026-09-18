---
id: segmentation-tools
title: 分割工具
description: Cornerstone3DTools 提供一组用于修改分割的工具，包括笔刷工具、矩形剪刀、圆形剪刀、球形剪刀，以及基于阈值的矩形 ROI 工具。所有分割工具都能在轴位、冠状位、矢状位三种三维视图中编辑分割。
keywords:
  - 分割工具
  - BrushTool
  - RectangleScissorTool
  - CircleScissorTool
  - SphereScissorTool
  - RectangleROIThresholdTool
  - 笔刷
upstream: https://www.cornerstonejs.org/docs/concepts/cornerstone-tools/segmentation/segmentation-tools
---

# 分割工具 {#segmentation-tools}

`Cornerstone3DTools` 提供了一组用于修改分割的工具，包括 `BrushTool`、
各类剪刀工具（例如 `RectangleScissor`、`CircleScissor`、`SphereScissor`），
以及 `RectangleRoiThresholdTool`。下面逐个详细介绍。

:::note Tip
所有分割工具都能在全部三种三维视图（轴位、冠状位、矢状位）中编辑分割。
:::

## 笔刷工具 {#brush-tool}

`BrushTool` 是分割中最常用的工具。它让你可以通过点击并拖拽来绘制分割
（如下图所示）。

要使用这个工具，需要像其他工具一样把它加入你的工具组。关于如何激活一个工具，
详见[工具](../tools.md#adding-tools)和[工具组](../toolGroups.md#toolgroup-creation-and-tool-addition)两节。

![](../../../assets/brush-tool.gif)

## 矩形剪刀工具 {#rectangle-scissor-tool}

`RectangleScissorTool` 可以用来创建矩形的分割。

![](../../../assets/rectangle-scissor.gif)

## 圆形剪刀工具 {#circle-scissor-tool}

`CircleScissorTool` 可以用来创建圆形的分割。

![](../../../assets/circle-scissor.gif)

## 球形剪刀工具 {#sphere-scissor-tool}

`SphereScissorTool` 可以用来创建球形的分割。它会在鼠标指针周围绘制一个三维球体。

![](../../../assets/sphere-scissor.gif)

## 阈值工具 {#threshold-tool}

`RectangleROIThresholdTool` 可以对用户绘制出的区域做阈值处理，从而创建分割。

（下图中设置了某个特定阈值来创建分割）

![](../../../assets/threshold-segmentation-tool.gif)
