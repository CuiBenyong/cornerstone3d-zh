---
id: encoding
title: 编码
description: 部分分辨率影像分为有损、缩略图和字节范围三种类型。本文说明这三类的区别，并给出用 Static DICOMweb 的 mkdicomweb 命令创建 HTJ2K、JLS 及其缩略图版本的实际示例。
keywords:
  - 部分分辨率
  - HTJ2K
  - JLS
  - mkdicomweb
  - 缩略图
  - 字节范围
upstream: https://www.cornerstonejs.org/docs/concepts/progressive-loading/encoding
---

## 部分分辨率的类型 {#types-of-partial-resolution}

部分分辨率影像有以下几种类型：

- `lossy`（有损）影像：分辨率和位深与原始一致，但采用有损编码。
- `thumbnail`（缩略图）影像：分辨率被降低的影像。
- `byte range`（字节范围）影像：先取完整分辨率数据的前缀部分，
  之后再取剩余数据。这只适用于像 HTJ2K 这类按「分辨率优先」顺序编码的影像。

## 创建部分分辨率影像 {#creating-partial-resolution-images}

[Static DICOMweb](https://github.com/RadicalImaging/Static-DICOMWeb)
仓库已经增强，具备了创建部分分辨率影像、以及响应字节范围请求的能力。
下面是针对某个 CT 数据集的一些示例命令：

```bash
# 默认创建 HTJ2K，并把 HTJ2K 有损版本写到 .../lossy/
mkdicomweb create -t jhc --recompress true --alternate jhc --alternate-name lossy d:\src\viewer-testdata\dcm\Juno
# 创建 JLS 版本以及 JLS 缩略图版本
mkdicomweb create -t jhc --recompress true --alternate jls --alternate-name jls /src/viewer-testdata/dcm/Juno
mkdicomweb create -t jhc --recompress true --alternate jls --alternate-name jlsThumbnail --alternate-thumbnail /src/viewer-testdata/dcm/Juno
# 创建 HTJ2K 无损版本以及缩略图版本
#（当最上层那一份本身已经是无损时，一般并不需要这一步）
mkdicomweb create -t jhc --recompress true --alternate jhcLossless --alternate-name htj2k  /src/viewer-testdata/dcm/Juno
mkdicomweb create -t jhc --recompress true --alternate jhc --alternate-name htj2kThumbnail --alternate-thumbnail /src/viewer-testdata/dcm/Juno
```

任何其他能创建 multipart/related 封装数据的工具都可以使用；
对标准 DICOMweb 服务器，也可以改用 accept 头或参数来达到目的。

注意这些数据的路径，一般来说就是常规的 DICOMweb 路径，
只是把其中的 `/frames/` 换成了别的名字。
