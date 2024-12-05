---
id: segment-index
title: 分段索引
---

# 分段索引

使用分段工具进行绘制时，可以指定要使用的分段索引。下图中，我们使用 SegmentIndex API 更改了 `segmentIndex` 以绘制第二个分段。

<div style={{textAlign: 'center', width: '500px'}}>

![](../../../assets/segment-index.png)

</div>

## API

```js
import { segmentation } from '@cornerstonejs/tools';

// 获取指定分段 ID 的活动分段索引
segmentation.segmentIndex.getActiveSegmentIndex(segmentationId);

// 设置指定分段 ID 的活动分段索引
segmentation.segmentIndex.setActiveSegmentIndex(segmentationId, segmentIndex);
```