---
id: how-to-guides
title: 操作指南
description: Cornerstone3D 的进阶操作指南合集：接入自定义影像加载器、自定义元数据提供者、编写自定义工具、自定义体数据加载顺序，以及库的初始化与日志配置。
keywords:
  - Cornerstone3D 操作指南
  - 自定义影像加载器
  - 自定义元数据提供者
  - 自定义工具
  - 配置
---

import DocCardList from '@theme/DocCardList';
import {useCurrentSidebarCategory} from '@docusaurus/theme-common';

# 操作指南

这一章面向具体任务。与[核心概念](../1-concepts/index.md)讲「是什么」、
[教程](../3-tutorials/index.md)讲「怎么上手」不同，
这里讲的是在实际项目中把某件事接进来该怎么做。

- [配置](./configuration.md) —— `init` 配置与日志（loglevel）的使用
- [自定义影像加载器](./custom-imageLoader.md) —— 接入自有的 PACS 或影像来源
- [自定义元数据提供者](./custom-metadata-provider.md) —— 补充库所需的非像素元数据
- [自定义工具](./custom-tools.md) —— 基于 `BaseTool` / `AnnotationTool` 写新工具
- [自定义体数据加载顺序](./custom-volume-loading-order.md) —— 重排或交错影像请求

<DocCardList items={useCurrentSidebarCategory().items}/>
