---
id: annotationManager 
title: 注释管理器
---

注释管理器是一个单例类，用于管理 Cornerstone Tools 中的注释。 我们使用注释管理器来存储注释、检索注释以及保存和恢复注释。

## 默认注释管理器 默认的注释管理器 `FrameOfReferenceSpecificAnnotationManager` 基于 FrameOfReferenceUID 存储注释。 这意味着注释根据每个 FrameOfReferenceUID 单独存储。

目前在我们的渲染管道中，如果两个 VolumeViewports 共享相同的 FrameOfReferenceUID，它们将共享相同的注释。然而，StackViewports 基于每个 imageId 进行工作，因此注释不会在 StackViewports 之间共享。

### GroupKey 注释组通过 groupKey 识别。groupKey 是用于标识注释组的字符串。 如上所述，默认的注释管理器基于 FrameOfReferenceUID 存储注释，因此 groupKey 为 `FrameOfReferenceUID`。

## 自定义注释管理器

您可以通过实现 `IAnnotationManager` 接口来创建自己的自定义注释管理器：

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

要使用注释管理器，您可以将其设置为默认的注释管理器

```js
import { annotation } from '@cornerstonejs/tools';
import myCustomAnnotationManager from './myCustomAnnotationManager';

annotation.state.setAnnotationManager(myCustomAnnotationManager);
```

自定义注释管理器中最重要的方法是 `getGroupKey` 方法。 该方法用于确定给定元素的 groupKey。例如， 如果您有一个用例要在共享相同 FrameOfReferenceUID 的两个视口上显示两个单独的注释（例如两个不同的读者），则可以使用 `getGroupKey` 方法为每个视口返回不同的 groupKey 给定的元素。（当然您不希望在两个视口之间共享相同的注释）。