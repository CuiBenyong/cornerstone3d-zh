---
id: scope
title: 项目范围
description: Cornerstone3D 负责医学影像的渲染与缓存，不负责影像加载和 DICOM 元数据解析——后两者通过注册加载器和元数据提供者接入。本文说明项目边界、TypeScript 支持、浏览器要求与 monorepo 结构。
keywords:
  - Cornerstone3D 项目范围
  - registerImageLoader
  - registerVolumeLoader
  - addProvider
  - 浏览器支持
  - WebGL 2.0
  - monorepo
upstream: https://www.cornerstonejs.org/docs/getting-started/scope
---

# 项目范围

## 范围

`Cornerstone3D` 是一个纯粹基于 Web 标准实现医学影像三维渲染的 JavaScript 库，
在条件允许时使用 WebGL 进行 GPU 加速渲染。`Cornerstone3DTools` 是它的对等库，
包含一系列用于与影像交互的操作工具和标注工具。

`Cornerstone3D` 的范围**不包含**影像 / 体数据的加载和元数据解析；
**包含**影像渲染与缓存。合适的影像加载器需要通过 `imageLoader.registerImageLoader`
和 `volumeLoader.registerVolumeLoader` **注册到** Cornerstone3D 上。
这类加载器的例子包括：基于 `cornerstoneDICOMImageLoader` 的 `wadors` 加载器
（通过 `dicomweb` 获取 DICOM P10 实例），以及 `wadouri` 加载器
（通过 HTTP 获取 DICOM P10 实例）。

此外，`Cornerstone3D` 提供了一套元数据注册机制，元数据解析器可以通过
`metaData.addProvider` **注册到** `Cornerstone3D` 上。使用
`cornerstoneDICOMImageLoader` 时，它的影像加载器和元数据提供者会自行完成注册。
如果想了解从元数据解析到影像加载再到影像渲染的完整流程，可以随时查看示例中的辅助代码。

## TypeScript

`Cornerstone3D` monorepo 中的所有库都用 TypeScript 编写，因此提供类型安全的 API。
这意味着你可以在 TypeScript 环境中使用本库，并借助类型信息确认传给任何方法的参数
都符合预期。

## 浏览器支持

`Cornerstone3D` 使用 HTML5 canvas 元素和 WebGL 2.0 的 GPU 渲染来显示影像，
所有现代浏览器都支持这两项能力。体数据渲染部分最近做过一轮重构，
性能和内存管理都有改善，并且不再需要 `sharedArrayBuffer`——早前渲染体数据时它是必需的。

- Chrome > 68
- Firefox > 79
- Edge > 79

如果你使用的是更老的浏览器，或者设备没有显卡，那么可能无法用 `Cornerstone3D`
渲染体数据影像。不过堆栈影像仍然可以显示：`Cornerstone3D` 为这类场景实现了 CPU 回退方案。

## Monorepo 结构

`Cornerstone3D` 是一个 monorepo，包含以下几个包：

- `/packages/core`：核心库，负责影像与体数据的渲染和缓存。
- `/packages/tools`：工具库，负责影像操作、标注，以及分割的渲染与工具。
- `/packages/dicom-image-loader`：影像加载器，处理通过 HTTP 获取的 `wadors` 与 `wadouri` DICOM P10 实例。
- `/packages/nifti-volume-loader`：NIfTI 文件的加载器。
- `/packages/docs`：全部包的文档，包括指南、示例和 API 参考。
