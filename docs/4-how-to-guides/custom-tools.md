---
id: custom-tools
title: 自定义工具
description: 自定义工具就是实现或继承 BaseTool、AnnotationTool 抽象类的类。本文说明这两个基类各自的定位与适用场景，并列出它们各自的内置工具示例。
keywords:
  - 自定义工具
  - BaseTool
  - AnnotationTool
  - addNewAnnotation
  - addTool
upstream: https://www.cornerstonejs.org/docs/how-to-guides/custom-tools
---

# 自定义工具 {#custom-tools}

Cornerstone 工具就是任何实现或继承了 `BaseTool` 或 `AnnotationTool`
抽象类所定义接口的类。创建一个自定义工具很简单：

```js
import csTools3d, { AnnotationTool, BaseTool } from '@Tools`

class MyCustomTool extends BaseTool {
  // ...
}

csTools3d.addTool(MyCustomTool, { /* 工具选项 */ })
```

## BaseTool {#basetool}

基础工具有名称、配置、选项、策略、绑定等等。基础工具通常用来响应用户输入，
并对视口（例如它的相机）产生某种改变。`BaseTool` 的例子包括：

- Pan（平移）
- PetThreshold（PET 阈值）
- StackScroll（堆栈滚动）
- StackScrollMouseWheel（滚轮堆栈滚动）
- WindowLevel（窗宽窗位）
- Zoom（缩放）

## AnnotationTool {#annotationtool}

标注工具通常带有与参考坐标系绑定的「标注」。它还有一些额外方法，
让工具能表明自己应当处理 / 捕获某次交互。这一点最常用于
「在控制点附近的交互」或「在已渲染的工具线条附近的交互」。

处于 `Active（激活）` 模式的标注工具有一个 `addNewAnnotation` 方法，
当某次鼠标事件没有被捕获时它会被调用。这让当前激活的工具可以为这次交互
创建标注。`AnnotationTool` 的例子包括：

- Bidirectional（双向）
- EllipticalROI（椭圆 ROI）
- CircleROI（圆形 ROI）
- Length（长度）
- Probe（探针）
- RectangleROI（矩形 ROI）
- PlanarFreehandROI（平面自由绘制 ROI）

## 下一步 {#next-steps}

接下来你可以：

- [从快速开始读起](../2-getting-started/index.md)
- [动手跑一遍教程](../3-tutorials/index.md)
- [查看官方在线示例源码](https://www.cornerstonejs.org/docs/examples)
