---
id: index
title: Cornerstone工具
---

# 工具介绍

## 工具

在 `Cornerstone3D` 核心库中，每个图像都在物理空间中渲染（即使是我们的堆栈视口也在空间中的实际位置和法线方向上渲染），而不是任意的2D平面，我们构建了一个 `Tools` 库，以便能够在3D空间中创建和操作工具。在 `Cornerstone3DTools` 中，注释现在存储在特定的DICOM参考框架（FoR）的3D患者空间中。通常，单个DICOM研究中的所有图像都存在于同一个FoR中（例如，在PET/CT采集中的PET和CT）。让我们看看在这个库中我们将使用的一些概念。