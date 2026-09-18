---
id: index
title: 标注
description: 在 Cornerstone3DTools 中，标注工具把自己的状态保存在一个 state 对象里，其中包含标注的统计量、数据和相机位置。本文介绍 annotation 命名空间下 state、selection、locking、config 四组 API 以及 AnnotationGroup 类的入口。
keywords:
  - 标注
  - Annotation
  - annotation.state
  - annotation.selection
  - annotation.locking
  - annotation.config
  - AnnotationGroup
upstream: https://www.cornerstonejs.org/docs/concepts/cornerstone-tools/annotation/
---

import DocCardList from '@theme/DocCardList';
import {useCurrentSidebarCategory} from '@docusaurus/theme-common';

# 标注 {#annotations}

在 `Cornerstone3DTools` 中，标注工具把自己的状态保存在一个 `state` 对象里。
这个对象是一个普通的 JavaScript 对象，用于存放该标注实例的状态——
诸如标注的统计量、它的数据以及相机位置等信息都存在这个对象中。

添加 / 移除、选择、加锁与解锁标注有多种方法。它们都可以通过
`Cornerstone3DTools` 中的 `annotation` 命名空间访问：

```js
import { annotation } from '@cornerstonejs/tools';

// 所有处理标注状态的方法都可以通过这里访问
annotation.state.XYZ;

// 所有标注选择相关的方法都可以通过这里访问
annotation.selection.XYZ;

// 所有标注加锁相关的方法都可以通过这里访问
annotation.locking.XYZ;

// 所有标注样式相关的方法都可以通过这里访问
annotation.config.XYZ;

// AnnotationGroup 类用于对标注进行分组
annotation.AnnotationGroup;
```

下面逐一深入这些方法。

<DocCardList items={useCurrentSidebarCategory().items}/>
