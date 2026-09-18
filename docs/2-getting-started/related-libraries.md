---
id: related-libraries
title: 相关库
description: Cornerstone3D 的来历及其与周边库的关系，包括旧版 cornerstone-core 与 cornerstone-tools、react-vtkjs-viewport、用于三维渲染的 vtk.js，以及基于它构建的 OHIF Viewer。
keywords:
  - cornerstone-core
  - cornerstone-tools
  - react-vtkjs-viewport
  - vtk.js
  - OHIF Viewer
  - Cornerstone3D 历史
upstream: https://www.cornerstonejs.org/docs/getting-started/related-libraries
---

# 相关库

本节介绍与 `Cornerstone3D` 相关的各个库。

## 历史

在介绍这些库之前，先说说 `Cornerstone3D` 的来历。在 `Cornerstone3D` 之前，
我们从 2014 年起开发并维护了
[`cornerstone-core`](https://github.com/cornerstonejs/cornerstone) 和
[`cornerstone-tools`](https://github.com/cornerstonejs/cornerstoneTools)。
由于 `Cornerstone3D` 相对 `cornerstone-core`、`Cornerstone3DTools` 相对
`cornerstone-tools` 的改进幅度相当大，长期来看我们会把重心转向 `Cornerstone3D`，
并提供从旧版 `cornerstone` 升级到新版 `Cornerstone3D` 的完整文档。
在此期间，旧版 `cornerstone` 系列包仍会继续维护，关键缺陷也会照常修复。

除了 `cornerstone-core` 和 `cornerstone-tools`，我们还维护了
[`react-vtkjs-viewport`](https://github.com/OHIF/react-vtkjs-viewport)——
这是我们借助 [vtk-js](https://github.com/kitware/vtk-js) 在 React 中实现三维渲染的
第一次尝试。`react-vtkjs-viewport` 目前仍用于 OHIF Viewer 主线版本的 MPR 视图。

促使我们开发 `Cornerstone3D` 的主要动因之一，是希望像 `cornerstone-core` 那样
把渲染与 React 的 UI 解耦。此外，在更复杂的场景下——例如带 10 个视口的 PET/CT 融合——
`react-vtkjs-viewport` 的内存管理是个很大的挑战。与旧版 cornerstone 类似，
我们也会把投入从 `react-vtkjs-viewport` 转移到新的 `Cornerstone3D`
和 `Cornerstone3DTools` 上。

## 相关库

### vtk.js

[`vtk-js`](https://github.com/kitware/vtk-js) 是一个用于三维计算机图形、图像处理与
可视化的开源 JavaScript 库。过去我们在 `react-vtkjs-viewport` 中用 `vtk-js` 渲染
三维数据并处理交互。`Cornerstone3D` 的渲染引擎在设计上就使用 `vtk-js` 完成三维渲染。

`vtk-js` 本身带有基于工具的标注能力，但我们决定这部分交给 `Cornerstone3DTools`，
只依赖 `vtk-js` 做实际渲染。我们的路线图中包含在 `Cornerstone3D` 里启用 `vtk-js`
三维标注工具这一项（目前尚未获得资助）。

### OHIF Viewer

[Open Health Imaging Foundation（OHIF）](https://ohif.org/) 影像阅片器是一个开源阅片器，
已被用于学术和商业项目，例如
[The Cancer Imaging Archive（TCIA）](https://www.cancerimagingarchive.net/) 和
[NCI Imaging Data Commons](https://datacommons.cancer.gov/repository/imaging-data-commons)。
它是一个可扩展的 Web 影像平台，零占用、无需安装。目前 OHIF 3.9 的影像渲染与标注功能
全部依赖 `Cornerstone3D` monorepo 中的各个库。
