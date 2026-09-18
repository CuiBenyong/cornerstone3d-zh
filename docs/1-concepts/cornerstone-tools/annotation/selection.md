---
id: selection
title: 选择
description: 标注可以被选中和取消选中，默认通过按住 Shift 键点击标注来完成。本文介绍 annotation.selection 命名空间下设置选中状态、获取全部已选标注，以及按工具名获取已选标注的 API。
keywords:
  - 标注选择
  - setAnnotationSelected
  - getAnnotationsSelected
  - getAnnotationsSelectedByToolName
  - Shift 点击
upstream: https://www.cornerstonejs.org/docs/concepts/cornerstone-tools/annotation/selection
---

# 选择 {#selection}

标注可以被选中和取消选中。默认做法是按住 `Shift` 键并点击标注。

## API {#api}

选中与取消选中标注有多个 API，另有相应的 get / set 方法：

```js
import { annotation } from '@cornerstonejs/tools';

// 选中某个标注
annotation.selection.setAnnotationSelected(
  annotationUID,
  (selected = true),
  (preserveSelected = false)
);

// 取得所有已选中的标注
annotation.selection.getAnnotationsSelected();

// 取得某个特定工具下所有已选中的标注
annotation.selection.getAnnotationsSelectedByToolName(toolName);
```

## 延伸阅读 {#read-more}

:::note TIP
关于选择 API 的更多内容见[**这里**](https://www.cornerstonejs.org/docs/api/tools/namespaces/annotation/namespaces/selection/)
:::
