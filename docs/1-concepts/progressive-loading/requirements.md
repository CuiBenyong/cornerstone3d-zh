---
id: requirements
title: 服务器要求
---

# 服务器要求

快速初始显示图像需要一种方法来检索图像或体积的一部分，这部分可以渲染为完整但有损的图像。例如，图像可以使用部分数据（分辨率）进行渲染，或体积中的图像可以进行插值以生成替代图像。这些图像最初是为了快速显示而检索的，随后检索完整分辨率的图像，随着加载更多数据，显示逐步改进。

DICOM 标准委员会刚刚在 DICOM 中添加了对一种新的编码方法的支持，称为高通量 JPEG 2000（HTJ2K）。这种编码方法支持图像的渐进解码，这意味着如果图像编码的前 `N 个字节` 已可用，则可以将其解码为较低分辨率或有损的图像。启用此功能的配置称为 `HTJ2K 渐进分辨率（HTJ2K RPCL）` 或 `高通量 JPEG 2000 分辨率位置组件层`。

最后，可以配置一些服务器以在其他 URL 端点上提供图像的简化（部分）分辨率版本。

通过支持 HTJ2K 渐进分辨率编码数据，逐步加载将改善堆叠图像的显示。同时，除非特别为自定义加载顺序而配置，否则体积数据在首次加载所有后端的体积所需时间上将得到增强。然而，对于不同类型的简化分辨率和流响应的支持在 DICOMweb 实现中差异很大。因此，本指南提供了关于如何配置各种配置的更多细节。

## 服务器要求

由于 HTJ2K 是一种新的编码（虽然已批准合并但尚未合并到 DICOM 标准中），因此 DICOMweb 服务器尚未广泛支持它。服务器支持它的各种方式在未来可能会改变。然而，我们设想大多数服务器将以两种主要方式实现此功能，但两者均要求服务器支持 DICOMWeb 标准和 HTJ2K RPCL 编码。

- **HTJ2K 支持**：对于 HTJ2K 编码的图像，服务器必须支持以符合 HTJ2K RPCL 配置的方式流式传输图像数据，使客户端可以将部分数据解码为可显示的图像。

### 使用流数据响应

XHR（XMLHttpRequest）流是一种扩展的 XHR 浏览器级 API，允许客户端在数据到达时检索数据部分，而不是等待整个响应。XHR 流通过在客户端和服务器之间保持持久连接，并随着数据变得可用而增量发送数据来工作。

### 使用字节范围请求响应

XHR 字节范围请求是 JavaScript 中 XMLHttpRequest 对象的一项功能，允许仅从服务器检索特定范围的字节。该功能通常用于分块下载大文件或恢复中断的下载。通过指定开始和结束的字节位置，服务器可以仅发送请求的文件部分，从而减少带宽使用并提高下载效率。

- **部分内容交付**：服务器必须支持 HTTP Range 请求，允许客户端请求并接收图像数据的特定字节范围。这对于处理大型图像或体积，通过逐步获取和渲染数据部分至关重要。

:::info
现有的 JPEG 2000 编码和标准中的新的 [HTJ2K](https://dicom.nema.org/medical/dicom/Supps/LB/sup235_lb_HTJ2K.pdf) 也有一种格式，可以指定部分分辨率端点。需要在 JPIP 参考数据 URL 中指定确切的端点。选项数据可以用于在未来修订中提供所需的确切 URL。
:::