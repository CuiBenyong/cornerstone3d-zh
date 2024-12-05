---
id: scope
title: 项目范围
---

# 项目范围

## 范围

`Cornerstone3D` 是一个 JavaScript 库，使用纯粹的 Web 标准来实现医学图像的 3D 渲染。该库在可能时使用 WebGL 进行 GPU 加速渲染。 `Cornerstone3DTools` 是 `Cornerstone3D` 的一个配套库，包含用于与图像交互的多种操作和注释工具。

`Cornerstone3D` 的范围 **不包括** 图像/体积加载和元数据解析。 `Cornerstone3D` 的范围 **包括** 图像渲染和缓存。合适的图像加载器应使用 `imageLoader.registerImageLoader` 和 `volumeLoader.registerVolumeLoader` 注册 **到** `cornerstone3D`。此类图像加载器的示例包括使用 `cornerstoneDICOMImageLoader` 的 `wadors` 加载器用于 `dicomweb` 上的 DICOM P10 实例和 `wadouri` 用于 HTTP 上的 DICOM P10 实例。

此外，`Cornerstone3D` 具有一个元数据注册机制，允许元数据解析器使用 `metaData.addProvider` 注册 **到** `Cornerstone3D`。使用 `cornerstoneDICOMImageLoader`，其图像加载器和元数据提供者会自动注册到 `Cornerstone3D`。您可以随时查看示例帮助程序，以了解如何实现从元数据解析到图像加载和图像渲染的端到端示例。

## Typescript

由于 `Cornerstone3D` monorepo 中的所有库都是用 TypeScript 编写的，它们提供了一个类型安全的 API。这意味着您可以在 TypeScript 环境中使用该库，并通过类型信息确保传递给任何方法的参数符合预期。

## 浏览器支持

`Cornerstone3D` 使用 HTML5 canvas 元素和 WebGL 2.0 GPU 渲染来渲染图像，这得到了所有现代浏览器的支持。我们最近对高级体积渲染进行了改进，以实现更好的性能和内存管理，并且不再需要使用之前用于渲染体积的 sharedArrayBuffer。

- Chrome > 68
- Firefox > 79
- Edge > 79

如果您使用的是较旧的浏览器，或者没有任何显卡，您的设备可能无法使用 `Cornerstone3D` 渲染体积图像。然而，您仍然可以使用我们在 `Cornerstone3D` 中为此类场景实现的 CPU 回退渲染堆叠图像。

## Monorepo 层次结构

`Cornerstone3D` 是一个包含以下包的 monorepo:

- `/packages/core`: 负责渲染图像和体积及缓存的核心库。
- `/packages/tools`: 用于操作、注释和分割渲染及工具的工具库。
- `/packages/dicom-image-loader`: 用于通过 HTTP 加载 `wadors` 和 `wadouri` DICOM P10 实例的图像加载器。
- `/packages/nifti-volume-loader`: 用于 NIfTI 文件的图像加载器。
- `/packages/docs`: 包含所有软件包的文档，包括指南、示例和 API 参考。