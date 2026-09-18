---
id: streaming-loader
title: "@cornerstonejs/streaming-image-volume-loader"
description: 从 1.x 升级到 2.x 时流式影像体数据加载器的变化。@cornerstonejs/streaming-image-volume-loader 这个独立包已被移除，全部功能并入 @cornerstonejs/core。本文给出 import 的前后对照。
keywords:
  - streaming-image-volume-loader
  - StreamingImageVolume
  - StreamingDynamicImageVolume
  - getDynamicVolumeInfo
  - Cornerstone3D 2.x 迁移
upstream: https://www.cornerstonejs.org/docs/migration-guides/2x/streaming-loader
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# @cornerstonejs/streaming-image-volume-loader {#cornerstonejsstreaming-image-volume-loader}

在 Cornerstone3D 开发多年之后，我们认识到：体数据加载应当被当作一项一等特性来对待，
而不是放在一个独立的库里。因此，我们把所有与流式影像加载相关的功能
都合并进了核心库。

1. **移除独立库**：`@cornerstonejs/streaming-image-volume-loader` 包已被移除。
2. **并入 core**：所有流式影像体数据加载功能现在都属于 `@cornerstonejs/core` 包。

## 如何迁移 {#how-to-migrate}

如果你此前使用的是 `@cornerstonejs/streaming-image-volume-loader`，
就需要更新 import，并可能要调整代码以使用 `@cornerstonejs/core` 中
那套整合后的体数据加载 API。

<Tabs>
  <TabItem value="Before" label="迁移前 📦 " default>

```js
import {
  cornerstoneStreamingImageVolumeLoader,
  cornerstoneStreamingDynamicImageVolumeLoader,
  StreamingImageVolume,
  StreamingDynamicImageVolume,
  helpers,
  Enums,
} from '@cornerstonejs/streaming-image-volume-loader';

Enums.Events.DYNAMIC_VOLUME_TIME_POINT_INDEX_CHANGED;
```

  </TabItem>
  <TabItem value="After" label="迁移后 🚀🚀">

```js
import {
  cornerstoneStreamingImageVolumeLoader,
  cornerstoneStreamingDynamicImageVolumeLoader,
  StreamingImageVolume,
  StreamingDynamicImageVolume,
} from '@cornerstonejs/core';

import { getDynamicVolumeInfo } from '@cornerstonejs/core/utilities';
import { Enums } from '@cornerstonejs/core/enums';

Enums.Events.DYNAMIC_VOLUME_TIME_POINT_INDEX_CHANGED;
```

  </TabItem>
</Tabs>

:::note 后续版本的进一步变化

上面示例中的 `DYNAMIC_VOLUME_TIME_POINT_INDEX_CHANGED` 事件
在 4.x 中已被移除，改为基于维度组的 `DYNAMIC_VOLUME_DIMENSION_GROUP_CHANGED`。
如果你要一路升级到 4.x 或更高版本，请接着看
[动态体数据 API 的变化](../4x/2-dynamic-volume-api.md)。

:::
