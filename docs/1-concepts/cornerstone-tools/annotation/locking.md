---
id: locking
title: 锁定
---

# 锁定

可以锁定注释以避免意外更改。您可以使用锁定 API 来锁定/解锁注释。

## API

有多种用于锁定和解锁注释的 API，以及获取/设置方法

```js
import { annotation } from '@cornerstonejs/tools';

// 锁定注释
annotation.locking.setAnnotationLocked(annotationUID, (locked = true));

// 获取所有锁定的注释
annotation.locking.getAnnotationsLocked();

// 解锁所有注释
annotation.locking.unlockAllAnnotations();
```

## 阅读更多

:::note TIP
在[这里](https://www.cornerstonejs.org/api/tools/namespace/annotation#locking)阅读更多关于锁定 API 的信息
:::