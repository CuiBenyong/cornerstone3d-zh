---
id: segmentation-tools
title: 切割工具
---

# 切割工具

`Cornerstone3DTools` 提供了一组工具来修改分割。这些工具包括 `BrushTool`，剪刀（例如 `RectangleScissor`，`CircleScissor`，`SphereScissor`），和 `RectangleRoiThresholdTool`。我们将在下面更详细地介绍每个工具。

:::note 提示
所有分割工具都可以在所有 3D 视图（轴向，冠状和矢状）中编辑分割。
:::

## 刷子工具

`BrushTool` 是最常用的分割工具。它允许您通过点击和拖动来绘制分割（如下所示）。

要使用此工具，您需要将其像其他工具一样添加到您的工具组中。有关如何激活工具的更多信息，请参阅 [工具](../tools.md#adding-tools) 和 [工具组](../toolGroups.md#toolgroup-creation-and-tool-addition) 部分。

![](../../../assets/brush-tool.gif)

## 矩形剪刀工具

`RectangleScissorTool` 可用于创建矩形分割。

![](../../../assets/rectangle-scissor.gif)

## 圆形剪刀工具

`CircleScissorTool` 可用于创建圆形分割。

![](../../../assets/circle-scissor.gif)

## 球形剪刀工具

`SphereScissorTool` 可以用来创建球形分割。它会在鼠标指针周围绘制一个 3D 球体。

![](../../../assets/sphere-scissor.gif)

## 阈值工具

`RectangleROIThresholdTool` 可以通过用户绘制区域的阈值化来创建分割。

（在下面的图片中，设置了特定的阈值来创建分割）

![](../../../assets/threshold-segmentation-tool.gif)