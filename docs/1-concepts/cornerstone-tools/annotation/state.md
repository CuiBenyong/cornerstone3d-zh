---
id: state
title: 状态
---

# 状态管理

`Cornerstone3DTools` 实现了一个 `FrameOfReference` 注释状态管理器，其中注释使用世界坐标来标记点。

## 注释数据

当创建新注释时（注释工具中的 `addNewAnnotation` 方法），根据元数据和工具的当前状态创建新注释数据，并将其添加到全局注释状态中。

下面我们展示了一个 `ProbeTool` 实例的注释数据。其他工具基本遵循相同的模式。

```js
// ProbeTool 注释数据
const annotation = {
  invalidated: boolean, // 注释数据是否被无效化，例如移动了其句柄
  highlighted: boolean, // 注释是否被鼠标经过高亮
  annotationUID: string, // 注释的唯一标识符（UID）
  metadata: {
    viewPlaneNormal: Types.Point3, // 摄像机的视图平面法线
    viewUp: Types.Point3, // 摄像机的向上视图向量
    FrameOfReferenceUID: string, // 注释绘制所在视口的 FrameOfReferenceUID
    referencedImageId?: string, // 注释绘制所在的图像 ID（如果适用）
    toolName: string, // 工具名称
  },
  data: {
    handles: {
      points: [Types.Point3], // 世界坐标中的句柄点（探针工具 = 1 个句柄 = 1 个 x,y,z 点）
    },
    cachedStats: {}, // 存储的注释统计信息
  },
}
```

## 注释状态

注释状态跟踪每个 FrameOfReference 的注释。状态由一个特定于 `FrameOfReference` 的状态对象组成，其中存储了每个注释特定的状态。下面可以看到状态对象的高级概述。

<div style={{textAlign: 'center', width:"80%"}}>

![](../../../assets/annotation-state.png)

</div>

## API

您可以使用以下 API 获取/添加注释：

```js
// 添加注释
cornerstone3DTools.annotation.state.addAnnotation(
  annotation,
  element,
  suppressEvents
);

// 删除给定注释引用的注释。
cornerstone3DTools.annotation.state.removeAnnotation(
  annotationUID,
  suppressEvents
);

// 返回给定工具的完整注释
cornerstone3DTools.annotation.state.getAnnotations(toolName, element);

// 返回匹配 UID 的单个注释条目的帮助程序。
cornerstone3DTools.annotation.state.getAnnotation(annotationUID);
```

## 阅读更多

:::note TIP
阅读更多关于状态 API 的信息 [这里](https://www.cornerstonejs.org/api/tools/namespace/annotation#state)
:::