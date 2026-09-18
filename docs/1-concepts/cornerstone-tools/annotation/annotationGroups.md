---
id: annotationGroups
title: 标注分组
description: AnnotationGroup 类用于表示若干标注彼此相关，支持整组切换可见性、以及在组内查找上一个 / 下一个标注。本文说明如何创建分组、把标注加入分组，以及 setVisibility 的过滤函数行为。
keywords:
  - 标注分组
  - AnnotationGroup
  - setVisibility
  - 标注导航
upstream: https://www.cornerstonejs.org/docs/concepts/cornerstone-tools/annotation/annotationGroups
---

# 标注分组 {#annotation-groups}

为了表示若干标注彼此相关，这里提供了一个 `AnnotationGroup` 类用于对标注分组。
目前这套分组机制还很基础，也不会在适配器中自动保存 / 恢复。
增强分组能力的需求仍在收集中，但基本能力已经可用。
标注可以被加入某个分组，并通过查找上一个 / 下一个标注在组内导航。

## 创建一个新分组 {#creating-a-new-group}

要创建新的标注分组，只需创建一个 AnnotationGroup 实例。

## 把标注加入分组 {#adding-an-annotation-to-a-group}

如果分组处于活动状态、并且已经调用过它的 addListeners 方法，
那么标注可以被自动加入该分组。另一种方式是手动调用标注分组的 add 方法加入。

例如：

```javascript
const group = new cornerstoneTools.annotation.AnnotationGroup();
group.add(annotation.annotationUID);
```

## 设置标注的可见性 {#setting-visibility-of-annotations}

调用标注分组的 setVisibility 方法可以显示 / 隐藏标注。
该方法接受一个可选的第二个参数，用来阻止隐藏那些被过滤掉的元素
（即过滤函数返回 false 的那些）。它自带一个默认过滤函数，
会排除当前分组中那些因组内可见性标志而处于可见状态的成员。
这使得可以使用相互重叠的分组——只有当所有标注分组都不可见时，标注才会被隐藏。

```javascript
// 只切换本组成员的可见性。
// 需要另外那些信息来触发事件
group.setVisibility(!group.isVisible, { viewportId, renderingEngineId });
```
