---
id: locking
title: 加锁
description: 标注可以被加锁以避免误改动。本文介绍 annotation.locking 命名空间下加锁、解锁、查询已加锁标注以及一次性解锁全部标注的 API。
keywords:
  - 标注加锁
  - setAnnotationLocked
  - getAnnotationsLocked
  - unlockAllAnnotations
upstream: https://www.cornerstonejs.org/docs/concepts/cornerstone-tools/annotation/locking
---

# 加锁 {#locking}

标注可以被加锁，以避免误改动。你可以用加锁 API 给标注加锁 / 解锁。

## API {#api}

加锁与解锁标注有多个 API，另有相应的 get / set 方法：

```js
import { annotation } from '@cornerstonejs/tools';

// 给某个标注加锁
annotation.locking.setAnnotationLocked(annotationUID, (locked = true));

// 取得所有已加锁的标注
annotation.locking.getAnnotationsLocked();

// 解锁全部标注
annotation.locking.unlockAllAnnotations();
```

## 延伸阅读 {#read-more}

:::note TIP
关于加锁 API 的更多内容见[这里](https://www.cornerstonejs.org/docs/api/tools/namespaces/annotation/namespaces/locking)
:::
