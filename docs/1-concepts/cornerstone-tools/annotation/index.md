---
id: index
title: 注释
---

# 注释

在 `Cornerstone3DTools` 中，注释工具将其状态保存在一个 `state` 对象中。这个对象是一个普通的 JavaScript 对象，用于存储注释实例的状态。诸如注释的统计信息、数据和摄像机位置等信息都存储在此对象中。

对于添加/删除、选择、锁定和解锁注释，有多种方法。可以通过在 `Cornerstone3DTools` 中调用 `annotations` 命名空间来访问它们：

```js
import { annotation } from '@cornerstonejs/tools';

// 处理注释状态的所有方法可以通过以下方式访问
annotation.state.XYZ;

// 注释选择的所有方法可以通过以下方式访问
annotation.selection.XYZ;

// 注释锁定的所有方法可以通过以下方式访问
annotation.locking.XYZ;

// 注释样式的所有方法可以通过以下方式访问
annotation.config.XYZ;

// AnnotationGroup 类允许对注释进行分组
annotation.AnnotationGroup;
```

让我们开始更深入地了解这些方法中的每一个。