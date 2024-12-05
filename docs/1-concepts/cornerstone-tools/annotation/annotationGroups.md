---
id: annotationGroups
title: 标注组
---

# 标注组

为了表明注释是相关的，有一个`AnnotationGroup`类可以用来对注释进行分组。目前，分组功能非常基础，并且不会在适配器中自动保存/恢复。增强分组功能的需求仍在收集中，但基本功能已经可以使用。可以将注释添加到一个组中，并通过查找下一个/上一个注释在它们之间导航。

## 创建新分组

要创建新的注释分组，只需创建一个 AnnotationGroup 实例。

## 向分组添加注释

如果分组处于活动状态，并在其上调用了 addListeners 方法，则可以自动将注释添加到该分组。另外，也可以通过调用注释分组的 add 方法手动添加注释。

例如：

```javascript
const group = new cornerstoneTools.annotation.AnnotationGroup();
group.add(annotation.annotationUID);
```

## 设置注释的可见性

可以通过调用注释组的 setVisibility 方法来显示/隐藏注释。这需要一个可选的第二个参数，该参数将防止隐藏任何被过滤元素（那些过滤函数返回 false 的情况）。提供了一个默认的过滤函数，该函数排除了因组中的可见性标志而可见的当前组的任何成员。这允许使用重叠的组，只有当所有注释组不可见时，注释才会被隐藏。

```javascript
// 切换仅对组成员可见。需要其他信息以触发事件。
group.setVisibility(!group.isVisible, { viewportId, renderingEngineId });
```
