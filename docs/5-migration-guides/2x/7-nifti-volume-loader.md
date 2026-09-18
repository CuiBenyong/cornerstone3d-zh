---
id: nifti-volume-loader
title: "@cornerstonejs/nifti-volume-loader"
description: 从 1.x 升级到 2.x 时 NIfTI 加载器的变化。它从「体数据加载器」改为专门的「影像加载器」，先流式解码文件头取得元数据、再据此生成 imageId，因此 NIfTI 文件现在也可以用堆栈视口渲染。本文给出前后对照代码。
keywords:
  - nifti-volume-loader
  - cornerstoneNiftiImageLoader
  - createNiftiImageIdsAndCacheMetadata
  - NIfTI
  - 堆栈视口
  - Cornerstone3D 2.x 迁移
upstream: https://www.cornerstonejs.org/docs/migration-guides/2x/nifti-volume-loader
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# `@cornerstonejs/nifti-image-volume-loader` {#cornerstonejsnifti-image-volume-loader}

在迁移到体数据的新像素数据模型之后，我们也更新了 NIfTI 影像体数据加载器，
让它与这个模型保持一致。

这项改动让该加载器更贴合 Cornerstone3D 的 API 以及库的其余部分。
现在我们有了一个专门的 NIfTI **影像**加载器（而不是体数据加载器）来加载
NIfTI 文件，从而让库中所有影像加载器的 API 更加一致。

一个显著的改进是：现在可以用**堆栈视口**来显示 NIfTI 文件了。
渲染 NIfTI 文件不再必须使用体数据视口（当然你仍然可以用体数据视口）。

<details>
<summary>为什么？</summary>

现在的流程是：先请求 NIfTI 的 URL，并解析该文件最开头的一部分字节
（通过流式解码）来取得元数据。然后我们基于这份元数据创建 imageId，
再用这些 imageId 来创建体数据。

这把我们此前「体数据优先」的做法转变为「imageId 优先」，
与 Cornerstone3D 其余部分的 API 保持一致。

</details>

<Tabs>
  <TabItem value="Before" label="迁移前 📦 " default>

```js
const niftiURL =
  'https://ohif-assets-new.s3.us-east-1.amazonaws.com/nifti/MRHead.nii.gz';
const volumeId = 'nifti:' + niftiURL;

const volume = await volumeLoader.createAndCacheVolume(volumeId);

setVolumesForViewports(
  renderingEngine,
  [{ volumeId }],
  viewportInputArray.map((v) => v.viewportId)
);
```

  </TabItem>
  <TabItem value="After" label="迁移后 🚀🚀">

```js
import {
  cornerstoneNiftiImageLoader,
  createNiftiImageIdsAndCacheMetadata,
} from '@cornerstonejs/nifti-volume-loader';

const niftiURL =
  'https://ohif-assets-new.s3.us-east-1.amazonaws.com/nifti/CTACardio.nii.gz';

// 为 nifti 文件注册影像加载器
imageLoader.registerImageLoader('nifti', cornerstoneNiftiImageLoader);

// 与 cornerstone3D 其余影像加载器的用法一致
const imageIds = await createNiftiImageIdsAndCacheMetadata({ url: niftiURL });

// 用于堆栈视口
viewport.setStack(imageIds);

// 用于体数据视口
const volume = await volumeLoader.createAndCacheVolume(volumeId, {
  imageIds,
});

await volume.load();
setVolumesForViewports(
  renderingEngine,
  [{ volumeId }],
  viewportInputArray.map((v) => v.viewportId)
);
```

  </TabItem>
</Tabs>

---
