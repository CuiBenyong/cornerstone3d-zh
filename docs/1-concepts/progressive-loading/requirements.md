---
id: requirements
title: 服务端要求
description: 渐进式加载对服务端的能力要求。说明 HTJ2K RPCL（高吞吐 JPEG 2000 分辨率位置分量层）编码为何是前提、XHR 流式响应与字节范围请求各自的作用，以及各家 DICOMweb 实现在这方面差异很大这一现实。
keywords:
  - 服务端要求
  - HTJ2K
  - HTJ2K RPCL
  - XHR 流式
  - 字节范围请求
  - DICOMweb
  - JPIP
upstream: https://www.cornerstonejs.org/docs/concepts/progressive-loading/requirements
---

# 服务端要求 {#server-requirements}

要让影像尽快显示出来，就需要一种只取影像或体数据的一部分、
但仍能渲染成一张完整（尽管有损）影像的办法。举例来说，
一张影像可以用部分数据（分辨率）渲染出来，
或者体数据中的若干影像可以通过插值生成替代影像。
这些影像先被取来快速显示，随后再取完整分辨率的影像，
于是随着数据不断加载，显示效果逐步改善。

DICOM 标准委员会刚刚在 DICOM 中加入了对一种新编码方式的支持：
高吞吐 JPEG 2000（HTJ2K）。这种编码方式支持影像的渐进式解码——
也就是说，只要拿到影像编码的前 `N 个字节`，
就能把它解码成一张较低分辨率或有损的影像。
启用这一特性的那个配置叫做 `HTJ2K 渐进式分辨率（HTJ2K RPCL）`，
即 `High Throughput JPEG 2000 Resolution Position Component Layer`。

最后，有些服务器可以被配置为在另外的 URL 端点上
提供影像的降低（部分）分辨率版本。

渐进式加载会通过支持 HTJ2K 渐进式分辨率编码的数据，
改善堆栈影像的显示；而体数据方面，
所有后端首个体数据的加载耗时都会得到改善——
除非它们被专门配置成了自定义加载顺序。
不过，各家 DICOMweb 实现对不同类型的降分辨率与流式响应的支持程度差异相当大，
因此本指南会就如何配置各种情形给出更多细节。

## 服务端要求 {#server-requirements-1}

由于 HTJ2K 是一种新编码（并且尚未并入 DICOM 标准，虽然已获批准合并），
DICOMweb 服务器对它的支持还不普遍。各家服务器支持它的方式将来也可能变化。
不过我们预计大多数服务器会以两种主要方式来实现它，
但两种都要求服务器支持 DICOMweb 标准以及 HTJ2K RPCL 编码。

- **HTJ2K 支持**：对 HTJ2K 编码的影像，服务器必须以遵循 HTJ2K RPCL 配置的方式
  支持影像数据的流式传输，好让客户端能把部分数据解码成一张可显示的影像。

### 以流式数据响应 {#respond-with-streaming-data}

XHR（XMLHttpRequest）流式是浏览器级 XHR API 的一个扩展，
它让客户端能在数据到达的过程中就分片取用，而不必等整个响应完成。
XHR 流式的工作方式是在客户端与服务器之间保持一个持久连接，
数据一旦可用就增量发送。

### 以字节范围请求响应 {#respond-with-byte-range-request}

XHR 字节范围请求是 JavaScript 中 XMLHttpRequest 对象的一项特性，
它允许只从服务器取回某个特定范围的字节。这项特性通常用于分块下载大文件、
或者续传被中断的下载。通过指定起止字节位置，服务器只需发送文件中被请求的那部分，
从而减少带宽占用、提升下载效率。

- **部分内容传输**：服务器必须支持 HTTP Range 请求，
  好让客户端能请求并接收影像数据中特定的字节范围。
  这对处理大影像或大体数据至关重要——正是靠它才能渐进地取用并渲染部分数据。

:::info
既有的 JPEG 2000 编码，以及
[已进入标准的 HTJ2K](https://dicom.nema.org/medical/dicom/Supps/LB/sup235_lb_HTJ2K.pdf)，
也都有一种用于指定部分分辨率端点的格式。具体端点需要在 JPIP
引用的数据 URL 中指定。后续版本中可以用 options 数据来提供所需的确切 URL。
:::
