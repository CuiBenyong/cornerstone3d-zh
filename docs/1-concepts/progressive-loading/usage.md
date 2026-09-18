---
id: usage
title: 用法
description: 通过 imageRetrieveMetadataProvider 在 Cornerstone3D 中启用渐进式加载。本文说明如何为堆栈视口按 imageId 或按 stack 作用域注册取回配置，以及为体数据视口按 volumeId 或按 volume 作用域注册配置。
keywords:
  - imageRetrieveMetadataProvider
  - 渐进式加载用法
  - retrieveConfiguration
  - 堆栈视口
  - 体数据视口
upstream: https://www.cornerstonejs.org/docs/concepts/progressive-loading/usage
---

既然已经了解了取回配置，下面看看在 Cornerstone3D 中怎么用它。

## `imageRetrieveMetadataProvider` {#imageretrievemetadataprovider}

这是我们为 Cornerstone3D 新增的一个元数据提供者。它负责取回影像
（以及体数据，后面会讲到）的元数据。因此，要对一批 imageId 做渐进式加载，
你需要把你的取回配置添加到这个提供者上。

### 堆栈视口 {#stack-viewport}

可以把 imageId 作为元数据的键，从而指定针对某个 imageId 的取回配置。
沿用上一节那个单阶段的取回配置，写法如下：

```js
import { utilities } from '@cornerstone3d/core';

const retrieveConfiguration = {
  stages: [
    {
      id: 'initialImages',
      retrieveType: 'single',
    },
  ],
  retrieveOptions: {
    single: {
      streaming: true,
    },
  },
};

utilities.imageRetrieveMetadataProvider.add('imageId1', retrieveConfiguration);
```

如果你并不需要按 imageId 单独指定取回配置，
那么可以把元数据的作用域设为 `stack`，让它应用到所有 imageId 上。

```js
utilities.imageRetrieveMetadataProvider.add('stack', retrieveConfiguration);
```

### 体数据视口 {#volume-viewport}

要以渐进式方式加载体数据，可以把 `volumeId` 作为元数据的键。

```js
import { utilities } from '@cornerstone3d/core';

const volumeId = ....get volume id....
utilities.imageRetrieveMetadataProvider.add(volumeId, retrieveConfiguration);
```

或者把元数据的作用域设为 `volume`，让它应用到所有 volumeId 上。

```js
utilities.imageRetrieveMetadataProvider.add('volume', retrieveConfiguration);
```

:::tip
这就是你需要做的全部！渐进式加载影像的其余一切，
都由 Cornerstone3D 库来处理。
:::
