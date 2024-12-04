---

id: streaming-loader  
title: '@cornerstonejs/streaming-image-volume-loader'  
---  

import Tabs from '@theme/Tabs';  
import TabItem from '@theme/TabItem';  

# @cornerstonejs/streaming-image-volume-loader

经过多年的 Cornerstone3D 开发，我们认识到体积加载应该作为一个一流功能，而不是一个独立的库。因此，我们已将与流式图像加载相关的所有功能合并到核心库中。

1. **移除独立库**：`@cornerstonejs/streaming-image-volume-loader` 包已被移除。
2. **集成到核心库**：所有流式图像体积加载功能现已成为 `@cornerstonejs/core` 包的一部分。

## 如何迁移：

如果您之前使用的是 `@cornerstonejs/streaming-image-volume-loader`，您需要更新您的导入，并可能需要调整代码以使用 `@cornerstonejs/core` 中的新集成体积加载 API。

<Tabs>
  <TabItem value="Before" label="之前 📦 " default>

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
  <TabItem value="After" label="之后 🚀🚀">

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