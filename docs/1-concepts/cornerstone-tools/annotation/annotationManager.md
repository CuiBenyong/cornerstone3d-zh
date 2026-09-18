---
id: annotationManager
title: 标注管理器
description: 标注管理器是一个单例类，负责标注的存储、检索、保存与恢复。默认实现 FrameOfReferenceSpecificAnnotationManager 按 FrameOfReferenceUID 分开存放标注。本文给出 IAnnotationManager 接口，并说明自定义管理器中 getGroupKey 为何最关键。
keywords:
  - 标注管理器
  - AnnotationManager
  - FrameOfReferenceSpecificAnnotationManager
  - IAnnotationManager
  - getGroupKey
  - setAnnotationManager
upstream: https://www.cornerstonejs.org/docs/concepts/cornerstone-tools/annotation/annotationManager
---

标注管理器是 Cornerstone Tools 中的一个单例类，负责管理标注。
我们用标注管理器来存储标注、检索标注，以及保存和恢复标注。

## 默认的标注管理器 {#default-annotation-manager}

默认的标注管理器 `FrameOfReferenceSpecificAnnotationManager`
依据 FrameOfReferenceUID 存储标注。也就是说，
不同 FrameOfReferenceUID 的标注是分开存放的。

在目前的渲染管线中，如果两个 VolumeViewport 共享同一个 FrameOfReferenceUID，
它们就会共享同一批标注。而 StackViewport 是按单个 imageId 工作的，
因此多个 StackViewport 之间不共享标注。

### GroupKey {#groupkey}

标注分组由 groupKey 标识。groupKey 是一个字符串，用于标识某一组标注。
如上所述，默认的标注管理器依据 FrameOfReferenceUID 存储标注，
因此这里的 groupKey 就是 `FrameOfReferenceUID`。

## 自定义标注管理器 {#custom-annotation-manager}

你可以通过实现 `IAnnotationManager` 接口来创建自己的标注管理器：

```ts
interface IAnnotationManager {
  getGroupKey: (annotationGroupSelector: any) => string;
  getAnnotations: (
    groupKey: string,
    toolName?: string
  ) => Annotations | GroupSpecificAnnotations | undefined;
  addAnnotation: (annotation: Annotation, groupKey?: string) => void;
  removeAnnotation: (annotationUID: string) => void;
  removeAnnotations: (groupKey: string, toolName?: string) => void;
  saveAnnotations: (
    groupKey?: string,
    toolName?: string
  ) => AnnotationState | GroupSpecificAnnotations | Annotations;
  restoreAnnotations: (
    state: AnnotationState | GroupSpecificAnnotations | Annotations,
    groupKey?: string,
    toolName?: string
  ) => void;
  getNumberOfAllAnnotations: () => number;
  removeAllAnnotations: () => void;
}
```

要使用你的标注管理器，可以用下面的方式把它设为默认的标注管理器：

```js
import { annotation } from '@cornerstonejs/tools';
import myCustomAnnotationManager from './myCustomAnnotationManager';

annotation.state.setAnnotationManager(myCustomAnnotationManager);
```

自定义标注管理器中最重要的方法是 `getGroupKey`。这个方法用来为给定元素
确定它的 groupKey。举例来说，如果你的场景是要在两个共享同一
FrameOfReferenceUID 的视口上显示两批彼此独立的标注（比如两位不同阅片者的标注），
那就可以用 `getGroupKey` 方法针对给定元素为每个视口返回不同的 groupKey
（毕竟你肯定不希望这两个视口共享同一批标注）。
