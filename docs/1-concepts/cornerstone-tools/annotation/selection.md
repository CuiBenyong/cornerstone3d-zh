---
id: selection
title: 选择
---

# 选择

可以选择和取消选择注释。通过按住 `Shift` 键（默认情况下）并点击注释来实现。

## API

有各种 API 用于选择和取消选择注释以及获取/设置方法

```js
import { annotation } from '@cornerstonejs/tools';

// 选择一个注释
annotation.selection.setAnnotationSelected(
  annotationUID,
  (selected = true),
  (preserveSelected = false)
);

// 获取所有选中的注释
annotation.selection.getAnnotationsSelected();

// 获取特定工具的所有选中注释
annotation.selection.getAnnotationsSelectedByToolName(toolName);
```

## 阅读更多

:::note TIP
在 [**这里**](/api/tools/namespace/annotation#selection) 阅读更多关于选择 API 的内容
:::