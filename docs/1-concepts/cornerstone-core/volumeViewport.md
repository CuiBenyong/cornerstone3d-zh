---
id: volumeViewport
title: 体数据视口
description: 体数据视口（Volume Viewport）是用于渲染体数据的专用视口，具备多平面重建（MPR）能力，支持对三维医学影像数据集做正交与斜切重建。官方该页尚在撰写中，本页给出可用的替代阅读入口。
keywords:
  - 体数据视口
  - Volume Viewport
  - MPR
  - 多平面重建
  - 斜切重建
upstream: https://www.cornerstonejs.org/docs/concepts/cornerstone-core/volumeViewport
---

# 体数据视口 {#volume-viewport}

体数据视口是用于渲染体数据的专用视口，具备多平面重建（MPR）能力，
支持对三维医学影像数据集做正交与斜切方向的重建视图。

:::note 官方该页尚在撰写中

官方英文文档这一页目前只有一句「This documentation is under development」，
正文尚未撰写。等上游补全后，本页会同步更新。

在此之前，体数据视口的相关内容可以从这几处了解：

- [视口](./viewports.md) —— 视口的整体概念与各类视口的对比
- [体数据](./volumes.md) —— 体数据本身的数据结构
- [渲染体数据](../../3-tutorials/basic-volume.md) —— 在多个方位上显示同一份体数据的上手示例
- [通用视口](./generic-viewport/index.md) —— 5.x 起，平面二维浏览推荐使用
  `PLANAR_NEXT`，它同时覆盖堆栈类与体数据切面类数据

:::
