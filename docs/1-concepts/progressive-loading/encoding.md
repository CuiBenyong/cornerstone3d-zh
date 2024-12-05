---
id: encoding
title: 编码
---

## 部分分辨率的类型

部分分辨率图像有几种类型：

- `lossy` 图像是原始分辨率/位深，但经过有损编码
- `thumbnail` 图像是降低分辨率的图像
- `byte range` 图像是全分辨率图像的前缀，后面是检索其余数据。这仅适用于像以分辨率优先顺序编码的HTJ2K图像。

## 创建部分分辨率图像

[静态 DICOMweb](https://github.com/RadicalImaging/Static-DICOMWeb) 仓库被增强以添加创建部分分辨率图像的功能，并支持字节范围请求。下面是一些 Ct 数据集的示例命令：

```bash
# 默认创建 HTJ2K 并将 HTJ2K 有损图像写入 .../lossy/
mkdicomweb create -t jhc --recompress true --alternate jhc --alternate-name lossy d:\src\viewer-testdata\dcm\Juno
# 创建 JLS 和 JLS 缩略图版本
mkdicomweb create -t jhc --recompress true --alternate jls --alternate-name jls /src/viewer-testdata/dcm/Juno
mkdicomweb create -t jhc --recompress true --alternate jls --alternate-name jlsThumbnail --alternate-thumbnail /src/viewer-testdata/dcm/Juno
# 创建 HTJ2K 无损和缩略图版本（通常当顶部项目已经是无损时不需要）
mkdicomweb create -t jhc --recompress true --alternate jhcLossless --alternate-name htj2k  /src/viewer-testdata/dcm/Juno
mkdicomweb create -t jhc --recompress true --alternate jhc --alternate-name htj2kThumbnail --alternate-thumbnail /src/viewer-testdata/dcm/Juno
```

可以使用任何其他工具创建多部分/相关封装数据，也可以使用接受头或参数来使用标准 DICOMweb 服务器。

请注意，这些数据路径通常是正常的 DICOMweb 路径，其中 `/frames/` 被替换为其他名称。