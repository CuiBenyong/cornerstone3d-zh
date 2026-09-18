---
id: index
title: Cornerstone 工具
description: Cornerstone3DTools 是用于在三维空间中创建和操作工具的库。由于核心库中每张影像都渲染在物理空间中，标注得以存储在 DICOM 参考坐标系下的三维患者空间里，而不是任意的二维平面上。
keywords:
  - Cornerstone3DTools
  - 医学影像工具
  - 参考坐标系
  - FrameOfReferenceUID
  - 三维标注
upstream: https://www.cornerstonejs.org/docs/concepts/cornerstone-tools/
---

import DocCardList from '@theme/DocCardList';
import {useCurrentSidebarCategory} from '@docusaurus/theme-common';

# 工具介绍 {#tools-introduction}

## 工具 {#tools}

在 `Cornerstone3D` 核心库中，每张影像都渲染在物理空间里——
即便是堆栈视口，也是按其在空间中的实际位置和法向方向渲染的，
而不是渲染在某个任意的二维平面上。基于这一点，我们构建了 `Tools` 库，
以便能在三维空间中创建和操作工具。

在 `Cornerstone3DTools` 中，标注现在存储在三维患者空间中，
归属于某个特定的 DICOM 参考坐标系（Frame of Reference，FoR）。
一般来说，同一次 DICOM 检查中的所有影像都处于同一个参考坐标系下
（例如 PET/CT 采集中的 PET 和 CT 都是）。下面来看看这个库中会用到的一些概念。

<DocCardList items={useCurrentSidebarCategory().items}/>
