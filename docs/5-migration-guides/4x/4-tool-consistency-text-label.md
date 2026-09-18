---
id: tool-consistency-text-label
title: 工具统一使用 label 而非 text
description: 4.x 中所有工具统一使用 annotation.data.label，不再使用 annotation.data.text。此前箭头标注、标签和关键图像工具混用这两个字段，导致显示值不一致。本文说明需要改什么，以及 addNewAnnotation 为何应改为调用 createAnnotation。
keywords:
  - annotation.data.label
  - ArrowAnnotateTool
  - LabelTool
  - KeyImageTool
  - createAnnotation
  - Cornerstone3D 4.x 迁移
upstream: https://www.cornerstonejs.org/docs/migration-guides/4x/tool-consistency-text-label
---

# 工具统一使用 label 而非 text {#tool-consistency-of-using-label-instead-of-text}

## 变化内容 {#what-changed}

在 4.x 版本中，所有工具现在都统一使用 `annotation.data.label`，
而不再使用 `annotation.data.text`。此前箭头标注、标签和关键图像这几个工具
混用了 text 和 label，导致显示出来的值彼此不一致。

为了让所创建的标注数据在结构上更一致，`addNewAnnotation` 方法已改为
调用 `createAnnotation` 方法，而不再由每个工具各自创建自己的数据。

## 你需要改什么？ {#what-you-need-to-change}

如果你此前使用的是 `ArrowAnnotateTool`、`LabelTool` 或 `KeyImageTool`
的 text 字段，现在需要改用 label 字段。

此外还建议：对于你在 CS3D 之外自行定义的任何标注工具，
把它的 addNewAnnotation 方法改为调用 `this.createAnnotation`，
而不要手工创建标注数据。这有助于在标注数据的基础结构今后发生变化时
保持一致性。

## 为什么要做这项改动 {#why-we-changed-this}

标签字段命名上的不一致，偶尔会导致用错字段：
有人以为该设 text、有人以为该设 label，结果改错了值。
统一之后，所有标注都可以用同一种方式对待。

一致地创建标注，也使得在新增字段或修改字段取值时，
能够统一更新所有标注。
