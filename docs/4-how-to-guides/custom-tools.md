---
id: custom-tools
title: 自定义工具
---

# 自定义工具

一个基石工具是指实现或扩展由 `BaseTool` 或 `AnnotationTool` 抽象类定义的接口的任何类。创建自定义工具简单如：

```js
import csTools3d, { AnnotationTool, BaseTool } from '@Tools`

class MyCustomTool extends BaseTool {
  // ...
}

csTools3d.addTool(MyCustomTool, { /* 工具选项 */ })
```

## BaseTool

基础工具具有名称、配置、选项、策略、绑定等等。基础工具通常用于响应用户输入并对视口产生一些变化（例如其相机）。`BaseTool` 的示例包括：

- Pan
- PetThreshold
- StackScroll
- StackScrollMouseWheel
- WindowLevel
- Zoom

## AnnotationTool

一个标注工具通常具有与参考帧绑定的“标注”。它有额外的方法，允许工具指示它们应该处理/捕获一个交互。这通常用于“靠近句柄的交互”或“靠近渲染工具线的交互”。

处于 `Active` 模式的标注工具具有一个 `addNewAnnotation` 方法，当鼠标事件未被捕获时调用。这样活跃工具可以为该交互创建标注。`AnnotationTool` 的示例包括：

- Bidirectional
- EllipticalROI
- CircleROI
- Length
- Probe
- RectangleROI
- PlanarFreehandROI

## 下一步

对于接下来的步骤，您可以：

- [查看使用文档](#)
- [探索我们的示例应用程序的源代码](#)