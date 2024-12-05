---
id: state-management
title: 状态管理
---

# 状态管理

我们将从使用基于图像 ID 的默认注释管理器转变为 FrameOfReference 注释管理器，其中注释使用世界坐标来表示点。在底层，注释管理器的结构将非常类似于当前 cornerstoneTools 注释管理器结构：

```js
const annotations = {
  myFrameOfReferenceUID: {
    myToolID: [
      {
        viewPlaneNormal: [0, 0, 1], // 绘制工具的法线
        toolUID: 'someUniqueIdentifier.1.231.4.12.5', // 此注释的唯一标识符
        FrameOfReferenceUID: 'myFrameOfReference.1.2.3',
        toolName: 'myToolID', // 注释特定的属性
      }, // ... myToolID 的其他注释条目
    ], // frameOfReference 上存在的其他注释
  }, //... 其他 FramesOfReference
};
```

其中一个单独的注释条目将如下所示：

```js
// 示例长度注释条目：

const annotation = {
  viewPlaneNormal: [0, 0, 1], // 在轴平面上绘制
  uid: 'someUniqueIdentifier.1.231.4.12.5', // 此注释的唯一标识符
  FrameOfReferenceUID: 'myFrameOfReference.1.2.3', // FrameOfReferenceUID
  toolName: LengthTool.toolName, // 工具名称
  handles: {
    points: [
      // 在世界空间中定义线条的两点
      [23.54, 12.42, -27.6],
      [13.54, 14.42, -27.6],
    ],
  },
};
```

注释可能具有其自有工具的特定属性，但必须包含 viewPlaneNormal, UID 和工具。开发人员将能够通过以下 API 与注释管理器交互：

```js
// 添加注释
annotationManager.addAnnotation(annotation);

// 根据注释引用删除注释
annotationManager.removeAnnotation(annotation.annotationUID);

// 返回给定参考帧的完整注释
// 可选：如果提供了工具名称，则仅返回该工具的注释
// 可选：如果提供了注释 UID，则仅返回特定的注释
annotationManager.getAnnotationsByFrameOfReference(
  FrameOfReferenceUID,
  toolName,
  annotationUID
);

// 返回与 UID 匹配的单个注释条目
// 效率低于具有所有参数的 getAnnotationsByFrameOfReference，但允许
// 如果您没有所有信息，则查找注释
annotationManager.getAnnotation(annotationUID);

// 删除由给定 UID 查找到的注释
// 效率低于 removeAnnotation，但如果您只有 UID 可以调用
annotationManager.removeAnnotation(annotationUID);