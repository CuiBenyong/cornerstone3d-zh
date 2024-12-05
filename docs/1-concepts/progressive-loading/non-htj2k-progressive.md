---
id: non-htj2k-progressive
title: 非 HTJ2K 的渐进加载
---

# 非 HTJ2K 渐进编码数据的渐进加载

## JLS 缩略图

可以使用 static-dicomweb 工具包创建 JLS 缩略图，例如，通过以下方式：

```
# 在 /jls 子路径中创建包含 JLS 编码数据的 JLS 目录
mkdicomweb create -t jhc --recompress true --alternate jlsLossless --alternate-name jls "/dicom/DE Images for Rad"
# 创建包含降低分辨率数据的 jlsThumbnail 子目录
mkdicomweb create -t jhc --recompress true --alternate jls --alternate-name jlsThumbnail --alternate-thumbnail "/dicom/DE Images for Rad"
```

然后可以通过以下方式进行配置：

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

## 顺序检索配置

顺序检索配置指定了两个阶段，每个阶段适用于整个图像 ID 堆栈。第一阶段将使用 `singleFast` 检索类型加载每个图像，然后第二阶段使用 `singleFinal` 检索。如果第一阶段产生无损图像，则第二阶段不会运行，因此行为与堆栈图像的先前行为相同。

此配置也可用于体积，产生旧的/先前的流式体积加载行为。

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

堆栈视口的图像可以先加载低分辨率/有损版本，然后是越来越高的分辨率，最后是无损表示的最终版本。

对于 HTJ2K，当图像以渐进分辨率顺序编码时，通过使用流式读取器自动完成，在图像可用时返回较低分辨率的版本。

对于其他图像类型，需要单独的低分辨率/有损版本。Static DICOMweb 工具包包含一些创建此类图像的选项。

# 性能

通常，图像的有损/第一版本检索大约为完整图像的 1/16 到 1/10。这显著提高了首次图像的加载速度。受整体图像大小、网络性能和压缩比的影响非常大。

完整尺寸图像为 3036 x 3036，而 JLS 缩小图像为 759 x 759。

| 类型             | 网络  | 大小    | 首次渲染     | 最终渲染     |
| ---------------- | ----- | ------- | ------------ | ------------ |
| JLS              | 4g    | 10.6 M  |              | 4586 毫秒    |
| JLS 缩略图       | 4g    | 766 K   | 359 毫秒     | 4903 毫秒    |
| HTJ2K            | 4g    | 11.1 M  | 66 毫秒      | 5053 毫秒    |
| HTJ2K 字节范围   | 4g    | 128 K   | 45 毫秒      | 4610 毫秒    |

- JLS 缩略图使用 1/16 尺寸的 JLS '缩略图'
- HTJ2K 使用流数据
- HTJ2K 字节范围使用 64k 初始检索，然后是剩余数据

# 交错性能

注意时间不包括加载解码器的时间，这可能需要一秒钟或更长时间，但仅在首次渲染时出现。这些时间对两种类型都相似。

| 类型             | 大小  | 网络  | 首次渲染     | 完全加载   |
| ---------------- | ----- | ----- | ------------ | ---------- |
| JLS              | 30 M  | 4g    | 2265 毫秒    | 8106 毫秒  |
| JLS 缩略图       | 3.6 M | 4g    | 1028 毫秒    | 8455 毫秒  |
| HTJ2K            | 33 M  | 4g    | 2503 毫秒    | 8817 毫秒  |
| HTJ2K 字节范围   | 11.1M | 4g    | 1002 毫秒    | 8813 毫秒  |
| JLS              | 30 M  | 本地  | 1322 毫秒    | 1487 毫秒  |
| JLS 缩略图       | 3.6 M | 本地  | 1084 毫秒    | 1679 毫秒  |
| HTJ2K            | 33 M  | 本地  | 1253 毫秒    | 1736 毫秒  |
| HTJ2K 字节范围   | 11.1M | 本地  | 1359 毫秒    | 1964 毫秒  |

HTJ2K 字节范围比直接 JLS 略慢，但可以对支持 HTJ2K 和字节范围请求的任何 DICOMweb 服务器完成。

- 4g 速度 - 下行 30 mbit/s，上行 5 mbit/s，延迟 10 毫秒
- JLS 和 HTJ2K 的完全加载时间与基线非渐进加载时间本质上相同
- 完整大小图像为 512x512
- 降低分辨率图像为 128x128，并有损压缩

# 配置

请参阅 stackProgressive 示例了解堆栈详细信息。

需要通过为 imageId 或默认的 `stack` 元数据注册元数据作为 `IRetrieveConfiguration` 值来为渐进流配置堆栈视口。此值包含要运行的阶段，以及每个阶段的检索配置。具体来说，`single` retrieveType 的检索配置中需要设置 `streaming` 值。

检索配置有两个部分，阶段和检索选项（此外，它可以完全替换检索器为自定义的）。阶段用于选择要检索的图像 ID，并提供要使用的检索类型。然后，检索选项将检索类型映射到要使用的实际选项。这允许多个阶段为不同的目的使用相同的检索类型。

用于堆栈渐进渲染（定义在 `sequentialRetrieveConfiguration` 中）的两种检索类型是 `singleFast` 和 `singleFinal`。这允许为快速初始请求和最终无损请求进行不同的请求。示例 `stackProgressive` 展示了几种可能的配置，这些配置演示了如何通过字节范围检索在多次请求中加载不同的 URL 路径或图像的不同部分。