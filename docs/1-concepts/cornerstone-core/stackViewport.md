---
id: stackViewport
title: 堆栈视口
description: 堆栈视口（Stack Viewport）是用于渲染和浏览二维影像堆栈的专用视口，支持滚动切片、平移缩放，以及对单张影像的独立调节。官方该页尚在撰写中，本页给出可用的替代阅读入口。
keywords:
  - 堆栈视口
  - Stack Viewport
  - setStack
  - 二维影像浏览
upstream: https://www.cornerstonejs.org/docs/concepts/cornerstone-core/stackViewport
---

# 堆栈视口 {#stack-viewport}

堆栈视口是用于渲染和浏览二维影像堆栈的专用视口，支持滚动切换切片、
平移与缩放，以及对单张影像的独立调节。

:::note 官方该页尚在撰写中

官方英文文档这一页目前只有一句「This documentation is under development」，
正文尚未撰写。等上游补全后，本页会同步更新。

在此之前，堆栈视口的相关内容可以从这几处了解：

- [视口](./viewports.md) —— 视口的整体概念，其中包含堆栈视口与体数据视口的对比
- [渲染一组堆栈影像](../../3-tutorials/basic-stack.md) —— 可直接运行的上手示例
- [通用视口](./generic-viewport/index.md) —— 5.x 起，平面二维浏览推荐使用
  `PLANAR_NEXT`，它同时覆盖堆栈类与体数据切面类数据

:::
