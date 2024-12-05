---
id: usage
title: 用法
---

现在我们已经了解了检索配置，让我们看看如何在 Cornerstone3D 中使用它。

## `imageRetrieveMetadataProvider`

这是我们添加到 Cornerstone3D 库中的一个新的元数据提供者。它负责检索图像（或体积，我们稍后会探讨）的元数据。因此，为了对一组 imageId 执行渐进加载，您需要将检索配置添加到此提供者中。

### 堆栈视口

您可以通过将 imageIds 作为元数据的键来指定特定于 imageId 的检索配置。考虑到我们在上一节中的一个阶段检索配置，我们有以下内容：

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

如果您不需要定义特定于 imageId 的检索配置，则可以将元数据范围限定为 `stack`，以便将其应用于所有 imageId。

```js
utilities.imageRetrieveMetadataProvider.add('stack', retrieveConfiguration);
```

### 体积视口

对于加载渐进加载的体积，您可以使用 `volumeId` 作为元数据的键。

```js
import { utilities } from '@cornerstone3d/core';

const volumeId = ....get volume id....
utilities.imageRetrieveMetadataProvider.add(volumeId, retrieveConfiguration);
```

或者您可以将元数据范围限定为 `volume`，以便将其应用于所有 volumeId。

```js
utilities.imageRetrieveMetadataProvider.add('volume', retrieveConfiguration);
```

:::tip
这就是您需要做的全部！其他渐进加载图像的操作由 Cornerstone3D 库处理。
:::