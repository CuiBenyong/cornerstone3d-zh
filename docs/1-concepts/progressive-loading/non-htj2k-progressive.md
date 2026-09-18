---
id: non-htj2k-progressive
title: 非 HTJ2K 数据的渐进式加载
description: 对非 HTJ2K 渐进编码的数据，用 JLS 缩略图配合顺序取回配置来实现渐进式加载。本文给出 static-dicomweb 创建 JLS 缩略图的命令、顺序取回配置的两个阶段，以及 JLS 与 HTJ2K 在堆栈和交错体数据两种场景下的完整性能对比数据。
keywords:
  - 非 HTJ2K 渐进式
  - JLS 缩略图
  - 顺序取回配置
  - singleFast
  - singleFinal
  - IRetrieveConfiguration
  - 性能对比
upstream: https://www.cornerstonejs.org/docs/concepts/progressive-loading/non-htj2k-progressive
---

# 非 HTJ2K 渐进编码数据的渐进式加载 {#progressive-loading-for-non-htj2k-progressive-encoded-data}

## JLS 缩略图 {#jls-thumbnails}

JLS 缩略图可以用 static-dicomweb 工具包创建，例如：

```
# 创建一个 JLS 目录，把 JLS 编码的数据放在 /jls 子路径下
mkdicomweb create -t jhc --recompress true --alternate jlsLossless --alternate-name jls "/dicom/DE Images for Rad"
# 创建一个 jlsThumbnail 子目录，其中存放降分辨率数据
mkdicomweb create -t jhc --recompress true --alternate jls --alternate-name jlsThumbnail --alternate-thumbnail "/dicom/DE Images for Rad"
```

之后通过下面这样的配置来使用它：

```javascript
cornerstoneDicomImageLoader.configure({
  retrieveOptions: {
    default: {
      default: {
        framesPath: '/jls/',
      },
    },
    singleFast: {
      default: {
        imageQualityStatus: ImageQualityStatus.SUBRESOLUTION,
        framesPath: '/jlsThumbnail/',
```

:::note 上游代码片段不完整

官方英文原文中上面这段配置代码是被截断的，缺少收尾的花括号，
直接复制无法运行。这里按原文保留，以免擅自补写出与上游不一致的内容。
完整的取回配置结构见[取回配置](./retrieve-Configuration.md)一节。

:::

## 顺序取回配置 {#sequential-retrieve-configuration}

顺序取回配置指定了两个阶段，每个阶段都作用于整批 imageId。
第一阶段用 `singleFast` 取回类型加载每张影像，
第二阶段再用 `singleFinal` 取回。如果第一阶段得到的已经是无损影像，
第二阶段就永远不会执行，此时其行为与此前堆栈影像的行为完全一致。

这份配置也可以用于体数据，产生的正是此前那套流式体数据加载的行为。

配置如下：

```javascript
stages: [
    {
      id: 'lossySequential',
      retrieveType: 'singleFast',
    },
    {
      id: 'finalSequential',
      retrieveType: 'singleFinal',
    },
  ],
```

堆栈视口的影像可以先加载一个较低分辨率 / 有损的版本，
随后是分辨率逐步提高的版本，最终那一版是无损表示。

对 HTJ2K 来说，只要影像是按渐进式分辨率顺序编码的，
这件事就是自动完成的——靠的是一个流式读取器，
它会在低分辨率版本可用时就把它们返回。

对其他影像类型，则需要一个单独的较低分辨率 / 有损版本。
Static DICOMweb 工具包提供了一些选项来创建这类影像。

## 性能 {#performance}

一般来说，影像的有损 / 首个版本只需取回大约 1/16 到 1/10 的数据量。
这让首批影像的速度有了显著提升。这个提升幅度受影像总体尺寸、
网络性能和压缩比的影响相当大。

完整尺寸影像为 3036 × 3036，而 JLS 降分辨率影像为 759 × 759。

| 类型             | 网络 | 数据量 | 首帧渲染 | 完整渲染 |
| ---------------- | ---- | ------ | -------- | -------- |
| JLS              | 4g   | 10.6 M |          | 4586 ms  |
| JLS 降分辨率     | 4g   | 766 K  | 359 ms   | 4903 ms  |
| HTJ2K            | 4g   | 11.1 M | 66 ms    | 5053 ms  |
| HTJ2K 字节范围   | 4g   | 128 K  | 45 ms    | 4610 ms  |

- JLS 降分辨率使用的是 1/16 尺寸的 JLS「缩略图」
- HTJ2K 使用流式数据
- HTJ2K 字节范围先取 64k 初始数据，之后再取剩余数据

## 交错方式的性能 {#interleave-performance}

注意下面这些时间都**不**包含加载解码器的时间——那可能要一秒甚至更久，
但只在首次渲染时出现，而且两种方式在这一点上是相近的。

| 类型             | 数据量 | 网络  | 首帧渲染 | 完成     |
| ---------------- | ------ | ----- | -------- | -------- |
| JLS              | 30 M   | 4g    | 2265 ms  | 8106 ms  |
| JLS 降分辨率     | 3.6 M  | 4g    | 1028 ms  | 8455 ms  |
| HTJ2K            | 33 M   | 4g    | 2503 ms  | 8817 ms  |
| HTJ2K 字节范围   | 11.1M  | 4g    | 1002 ms  | 8813 ms  |
| JLS              | 30 M   | 本地  | 1322 ms  | 1487 ms  |
| JLS 降分辨率     | 3.6 M  | 本地  | 1084 ms  | 1679 ms  |
| HTJ2K            | 33 M   | 本地  | 1253 ms  | 1736 ms  |
| HTJ2K 字节范围   | 11.1M  | 本地  | 1359 ms  | 1964 ms  |

HTJ2K 字节范围比纯 JLS 略慢一点，但它可以在任何支持 HTJ2K
和字节范围请求的 DICOMweb 服务器上使用。

- 4g 速率 —— 下行 30 mbit/s，上行 5 mbit/s，延迟 10 ms
- JLS 和 HTJ2K 的完成时间与非渐进式的基线基本相同
- 完整尺寸影像为 512×512
- 降分辨率影像为 128×128 且经有损压缩

## 配置 {#configuration}

堆栈方面的细节见 stackProgressive 示例。

堆栈视口要启用渐进式流式加载，需要为该 imageId、
或为默认的 `stack` 元数据注册一个 `IRetrieveConfiguration` 值。
这个值包含要执行的各个阶段，以及每个阶段的取回配置。
具体来说，需要在 `single` 这个 retrieveType 的取回配置上设置 `streaming` 值。

取回配置由两部分构成：stages 和 retrieve options
（此外它还可以用一个自定义取回器把整个取回器替换掉）。
stages 用于选取要取回哪些 image ID，并给出要使用的取回类型；
随后 retrieve options 把取回类型映射到实际要用的选项上。
这使得多个阶段可以为不同目的使用同一个取回类型。

堆栈渐进式渲染所用的两个取回类型（定义在 `sequentialRetrieveConfiguration` 中）
是 `singleFast` 和 `singleFinal`。这让「快速的初始请求」
与「最终的无损请求」可以发出不同的请求。
示例 `stackProgressive` 展示了这方面几种可能的配置，
演示了如何在多次重复请求中加载不同的 URL 路径、
或者用字节范围取回来加载影像的不同部分。

:::note 与原文的一处结构差异

官方英文原文中「性能」「交错方式的性能」「配置」这三节使用的是一级标题，
与页面标题同级，导致一页内出现多个 `h1`。本页把它们降为二级标题
以保持正确的文档结构，同时通过 `{#...}` 固定了原有锚点，
因此指向这些小节的外部链接仍然有效。

:::
