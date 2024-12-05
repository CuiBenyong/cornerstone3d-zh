---
id: related-libraries
title: 相关库
---

# 相关库

在本节中，我们将解释与 `Cornerstone3D` 相关的各种库。

## 历史

在解释这些库之前，我们将首先讨论 `Cornerstone3D` 的历史。在 `Cornerstone3D` 之前，自 2014 年以来我们便开发和维护了 [`cornerstone-core`](https://github.com/cornerstonejs/cornerstone) 和 [`cornerstone-tools`](https://github.com/cornerstonejs/cornerstoneTools)。由于 `Cornerstone3D` 相对于 `cornerstone-core` 的改进以及 `Cornerstone3DTools` 相对于 `cornerstone-tools` 的改进意义重大，长远来看，我们将把重点转移到 `Cornerstone3D` 上，并提供充分的文档以指导如何从旧版 `cornerstone` 升级到新的 `Cornerstone3D`。同时，我们将继续维护旧版 `cornerstone` 软件包并处理可能出现的关键错误。

除了 `cornerstone-core` 和 `cornerstone-tools` 软件包之外，我们还维护了 [`react-vtkjs-viewport`](https://github.com/OHIF/react-vtkjs-viewport)，这是我们的首次尝试，利用 [vtk-js](https://github.com/kitware/vtk-js) 在 React 中实现 3D 渲染。目前，`react-vtkjs-viewport` 正在当前主要的 OHIF 查看器中用于 MPR 视图。促使 `Cornerstone3D` 开发的主要动机之一是希望能够像 `cornerstone-core` 一样将渲染与 UI 通过 React 进行解耦。此外，`react-vtkjs-viewport` 的内存管理对于更复杂的场景（如具有 10 个视口的 PET/CT 融合）来说是一个主要挑战。与旧版 cornerstone 类似，我们将把精力从 `react-vtkjs-viewport` 转向使用新的 `Cornerstone3D` 和 `Cornerstone3DTools` 软件包。

## 库

### vtk.js

[`vtk-js`](https://github.com/kitware/vtk-js) 是一个用于 3D 计算机图形学、图像处理和可视化的开源 JavaScript 库。过去，我们在 `react-vtkjs-viewport` 库中使用 `vtk-js` 进行 3D 数据的渲染和交互。`Cornerstone3D` 的渲染引擎设计为使用 `vtk-js` 进行 3D 渲染。`vtk-js` 具有使用工具进行注释的支持，但我们决定使用 `Cornerstone3DTools` 来实现此目的，并且仅依赖 `vtk-js` 进行实际渲染。我们的路线图（尚未获得资助）包括在 `Cornerstone3D` 中启用 `vtk-js` 3D 注释工具的使用。

### OHIF 查看器

[开放健康成像基金会（OHIF）](https://ohif.org/) 图像查看器是一个被学术界和商业项目（例如[癌症影像档案 (TCIA)](https://www.cancerimagingarchive.net/) 和 [NCI 影像数据共享](https://datacommons.cancer.gov/repository/imaging-data-commons)）使用的开源图像查看器。它是一个可扩展的网络成像平台，无需任何足迹和安装。目前，OHIF 3.9 依赖于 `Cornerstone3D` monorepo 中的所有库来实现其图像渲染和注释功能。