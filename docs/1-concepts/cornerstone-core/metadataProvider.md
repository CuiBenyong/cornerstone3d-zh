---
id: metadataProvider
title: 元数据提供者
description: 元数据提供者（Metadata Provider）是一个函数，充当访问影像相关非像素元数据的接口。本文说明它的函数签名、元数据类型的开放性、多个提供者之间的优先级机制，以及标定像素间距、计算型元数据与 metaData 辅助方法。
keywords:
  - 元数据提供者
  - metadataProvider
  - addProvider
  - MetadataModules
  - calibratedPixelSpacingMetadataProvider
  - getNormalized
  - DICOM 元数据
upstream: https://www.cornerstonejs.org/docs/concepts/cornerstone-core/metadataProvider
---

# 元数据提供者 {#metadata-providers}

关于包级别的架构以及 5.x 当前的元数据行为，见
[元数据模块](../cornerstone-metadata/index.md)。

医学影像通常带有大量非像素级的元数据，例如影像的像素间距、患者 ID，
或者扫描采集日期。对某些文件类型（例如 DICOM）来说，这些信息存放在文件头里，
可以被读取、解析并在你的应用中传递。对另一些类型（例如 JPEG、PNG）来说，
这些信息需要独立于实际像素数据另行提供。不过即便是 DICOM 影像，
应用开发者也常常把元数据与像素数据分开、从服务端独立传给客户端——
因为这样能显著提升性能。

元数据提供者是一个 JavaScript 函数，充当访问 Cornerstone 中影像相关元数据的接口。
使用者可以定义自己的提供者函数，为每一张特定影像返回他们想要的任何元数据。
元数据提供者函数具有如下原型：

```
function metadataProvider(type: string, ...queries: any): any
```

不过通常来说，提供者实现的是下面这个更简单的原型：

```
function metadataProvider(type: string, imageId: string): Record<string, any>
```

这是因为大多数元数据是针对 [ImageId](./imageId.md) 提供的，
但 Cornerstone 同时也为「针对任何信息定义和使用元数据提供者」提供了基础设施。

## 元数据的类型 {#types-of-metadata}

传给元数据提供者的 `type` 参数可以是任意字符串。你可以用任意 type 调用
`cornerstone.metaData.get()`，只要有任何一个元数据提供者能为给定的 imageId
提供该 type，你就能拿到响应。举例来说，你可以借此轻松地提供应用专属的信息，
例如金标准（ground truth）或患者信息。

Cornerstone 的 core 和 tools 也会自动为所显示的影像请求各类元数据。
标准元数据模块的清单见 API 参考的
[MetadataModules 一节](https://www.cornerstonejs.org/docs/api/core/namespaces/enums/enumerations/metadatamodules/)。
其中许多模块遵循 DICOM 标准。如果你想在
[自定义元数据提供者](../../4-how-to-guides/custom-metadata-provider.md)中实现它们，
最省事的办法是参考某个既有元数据提供者是怎么实现的，例如
[WADOURI 元数据提供者](https://github.com/cornerstonejs/cornerstone3D/blob/main/packages/dicomImageLoader/src/imageLoader/wadouri/metaData/metaDataProvider.ts#L65)。

## 元数据提供者的优先级 {#priority-of-metadata-providers}

由于可以注册多个元数据提供者，添加提供者时可以为它指定一个优先级数值。
到了需要请求元数据的时候，Cornerstone 会按提供者的优先级顺序为该 `imageId`
请求元数据（如果某个提供者对该 imageId 返回 `undefined`，
Cornerstone 就转向下一个提供者）。

举例来说，如果 provider1 以优先级 10 注册、provider2 以优先级 100 注册，
那么该 imageId 的元数据会先问 provider2。

## 提供计算型元数据 {#provided-computed-metadata}

有少数几个元数据提供者，或者存放运行期间被更新 / 修改过的元数据信息，
或者把既有元数据转换成其他格式，或者提供静态元数据。

### 临时性元数据 {#transient-metadata}

#### 标定后的像素间距 {#calibrated-pixel-spacing}

`calibratedPixelSpacingMetadataProvider` 允许存放标定元数据的覆盖值，
使用户或系统能够在不改动原始元数据的前提下，为某张影像补充间距标定信息。

### 计算型元数据 {#computed-metadata}

有些元数据可以基于系统中已有的其他元数据计算出来。例如 adapters 模块可以基于
既有的默认元数据提供者，生成 dcmjs 的「Normalized」格式的 study 模块信息。

我们建议：凡是仅从原始 DICOM 数据计算得出、但经过某种方式改造的元数据，
都使用计算型元数据提供者。这个模式使得我们可以对各种不同形态的底层数据
（多帧实例、已格式化的数据、或用于产出新实例的数据）
统一地创建标准的计算型改造。

#### `referencedMetadataProvider` {#referencedmetadataprovider}

adapters 模块提供 referenced 元数据，在基于某个既有模块创建新实例时很有用。
它同时也提供 Part 10 前缀头以及被引用对象所需的常量。

##### Study、Series、Instance 数据 {#study-series-instance-data}

这些数据模块以 dcmjs 的「Normal」格式提供 study 级或 series 级信息，
不包含完整的实例头，并且是基于为 WADO-URI、WADO-RS 以及 OHIF
所定义的那些底层标准模块得出的。

##### Part 10 常量 {#part-10-constants}

dcmjs 中的 part 10 `_meta` 字段可以写死，但那样一来，
若想改动生成出来的对象，就只能在创建之后再改对象、或者改创建代码。
Part 10 常量元数据提供了标准的 `0002` 头模块，供 dcmjs 在编码 DICOM 时使用。

##### Referenced 与 Predecessor 数据 {#referenced-and-predecessor-data}

referenced 数据与 predecessor 序列提供者允许把 SR 或 SEQ 类序列中的默认实例
替换为一个引用了此前所用数据的新实例。

## metaData 辅助方法 {#metadata-helpers}

metaData 服务提供了几个辅助方法，用来处理命名差异和计算结果。

### `getNormalized` {#getnormalized}

getNormalized 模块方法接收一组小驼峰命名版本的模块，
把它们合并成大驼峰（dcmjs 的 NormalCase）版本。它用于从非 dcmjs 数据源创建
`instance` 模块，也用于创建 study / series / instance 数据模块。

### `capitalizeTag` 与 `lowerTag` {#capitalizetag-and-lowertag}

在 dcmjs `normalized` 模块所用的大驼峰名称、与 metaData 模块所用的小驼峰名称
之间转换时，需要遵循一些特定规则。这些规则被封装成辅助函数，
可以从 CS3D core 导出的 metaData 对象上取用。
