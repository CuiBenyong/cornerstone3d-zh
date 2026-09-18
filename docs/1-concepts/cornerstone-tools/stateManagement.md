---
id: state-management
title: 状态管理
description: 标注管理器从基于 imageId 转向基于参考坐标系（FrameOfReference），标注点使用世界坐标。本文给出标注状态的嵌套结构、单条长度标注的实际字段，以及 addAnnotation、getAnnotationsByFrameOfReference 等管理器 API。
keywords:
  - 标注状态管理
  - annotationManager
  - getAnnotationsByFrameOfReference
  - viewPlaneNormal
  - 世界坐标
  - FrameOfReferenceUID
upstream: https://www.cornerstonejs.org/docs/concepts/cornerstone-tools/state-management
---

# 状态管理 {#state-management}

我们将从「基于影像 ID 的默认标注管理器」转向「基于参考坐标系
（FrameOfReference）的标注管理器」，其中标注的点使用世界坐标。
在底层，这个标注管理器的结构与当前 cornerstoneTools 的标注管理器非常相似：

```js
const annotations = {
  myFrameOfReferenceUID: {
    myToolID: [
      {
        viewPlaneNormal: [0, 0, 1], // 绘制该工具时所在平面的法向量
        toolUID: 'someUniqueIdentifier.1.231.4.12.5', // 该标注的唯一标识
        FrameOfReferenceUID: 'myFrameOfReference.1.2.3',
        toolName: 'myToolID', // 该标注专有的属性。
      }, // ... myToolID 下的其他标注条目
    ], // 该 frameOfReference 上的其他标注
  }, //... 其他 FrameOfReference
};
```

其中单条标注条目大致长这样：

```js
// 长度标注条目的例子：

const annotation = {
  viewPlaneNormal: [0, 0, 1], // 绘制在轴位平面上。
  uid: 'someUniqueIdentifier.1.231.4.12.5', // 该标注的唯一标识。
  FrameOfReferenceUID: 'myFrameOfReference.1.2.3', // FrameOfReferenceUID
  toolName: LengthTool.toolName, // 工具名
  handles: {
    points: [
      // 世界空间中定义这条线段的两个点。
      [23.54, 12.42, -27.6],
      [13.54, 14.42, -27.6],
    ],
  },
};
```

标注可以带有各自工具专有的属性，但必须包含 viewPlaneNormal、UID 和工具名。
开发者可以通过下面这些 API 与标注管理器交互：

```js
// 添加标注
annotationManager.addAnnotation(annotation);

// 依据标注引用移除标注。
annotationManager.removeAnnotation(annotation.annotationUID);

// 返回给定参考坐标系下的全部标注。
// 可选：若给出 toolName，则只返回该工具的标注。
// 可选：若给出 annotationUID，则只返回那一条特定标注。
annotationManager.getAnnotationsByFrameOfReference(
  FrameOfReferenceUID,
  toolName,
  annotationUID
);

// 一个辅助方法，返回与该 UID 匹配的那一条标注。
// 比带全部参数的 getAnnotationsByFrameOfReference 效率低，
// 但在你并不掌握全部信息时也能找到该标注。
annotationManager.getAnnotation(annotationUID);

// 删除由给定 UID 找到的那条标注。
// 比 removeAnnotation 效率低，但在你只有 UID 时也能调用。
annotationManager.removeAnnotation(annotationUID);
```
