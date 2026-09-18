---
id: static-wado
title: 静态 DICOMweb
description: 用 Static DICOMweb 实现渐进式加载的说明，涵盖标准与非标准两类配置选项。官方该页目前是一段残缺内容，本页给出可用的替代阅读入口。
keywords:
  - Static DICOMweb
  - 静态 DICOMweb
  - 渐进式加载
  - mkdicomweb
upstream: https://www.cornerstonejs.org/docs/concepts/progressive-loading/static-wado
---

# 静态 DICOMweb {#static-dicom-web}

本页介绍标准与非标准两类配置选项，以及如何在
[Static DICOMweb](https://github.com/RadicalImaging/Static-DICOMWeb)
仓库中把它搭建起来——主要作为一个示例参考。

:::note 官方该页内容残缺

官方英文文档这一页目前只有一个不完整的句子片段，开头就是半句话，
显然是上游内容缺失或被截断了。等上游补全后，本页会同步更新。

在此之前，与 Static DICOMweb 相关的实用内容可以从这几处了解：

- [编码](./encoding.md) —— 其中给出了用 `mkdicomweb` 创建部分分辨率影像的
  实际命令，正是基于 Static DICOMweb 仓库
- [服务端要求](./requirements.md) —— HTJ2K RPCL、流式响应与字节范围请求的要求
- [Static DICOMweb 仓库](https://github.com/RadicalImaging/Static-DICOMWeb) 本身

:::
