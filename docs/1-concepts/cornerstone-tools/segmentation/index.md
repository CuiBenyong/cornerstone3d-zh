---

id: index
title: 分割

---

# 分割

在 `Cornerstone3DTools` 中，我们将 `分割` 的概念与 `分割表示` 解耦。这意味着从一个 `分割` 我们可以创建多个 `分割表示`。例如，可以从 `分割` 数据创建一个 3D 标记图的 `分割表示`，而从相同的 `分割` 数据创建一个轮廓的 `分割表示`（尚不支持）。这样我们就将 `分割` 的表现部分与底层数据解耦。

![](../../../assets/segmentation-representation.png)

:::note 提示
这种类似的关系结构已被流行的医学成像软件采用，例如 [3D Slicer](https://www.slicer.org/) 加上 [polymorph segmentation](https://github.com/PerkLab/PolySeg)。
:::



## API

`分割` 相关的函数和类可在 `segmentation` 模块中找到。

```js
import { segmentation } from '@cornerstonejs/tools';

// segmentation state holding all segmentations and their toolGroup specific representations
segmentations.state.XYZ;

// active segmentation methods (set/get)
segmentations.activeSegmentation.XYZ;

// locking for a segment index (set/get)
segmentations.locking.XYZ;

// segment index manipulations (set/get)
segmentations.segmentIndex.XYZ;
```

让我们开始深入了解每个方法。