---
id: tutorials
title: 教程
description: Cornerstone3D 上手教程合集。从渲染一组堆栈影像和体数据开始，依次实现操作工具、标注工具与分割工具，以及视频影像的渲染。每篇都给出可直接运行的完整代码。
keywords:
  - Cornerstone3D 教程
  - Cornerstone3D 上手
  - 渲染堆栈影像
  - 渲染体数据
  - 标注工具教程
  - 分割工具教程
---

import DocCardList from '@theme/DocCardList';
import {useCurrentSidebarCategory} from '@docusaurus/theme-common';

# 教程

这一章是面向动手实践的。每篇教程都聚焦「怎么做」，而不是「是什么」——
概念性的解释放在[核心概念](../1-concepts/index.md)一章。

建议从[介绍](./intro.md)读起，它说明了所有教程共同依赖的那部分准备代码
（加载器、元数据提供者、库初始化），以及如何在本地把教程跑起来。
之后的教程都跳过了这些样板代码，让你专注在当篇要学的内容上。

推荐顺序：

1. [介绍](./intro.md) —— 教程的运行方式与共同前提
2. [渲染一组堆栈影像](./basic-stack.md) —— 最小的可运行例子
3. [渲染体数据](./basic-volume.md) —— 同一份数据在多个方位上显示
4. [操作工具](./basic-manipulation-tool.md) —— 缩放、平移、窗宽窗位
5. [标注工具](./basic-annotation-tool.md) —— 在影像上做测量
6. [分割工具](./basic-segmentation-tools.md) —— 绘制和编辑分割
7. [渲染视频影像](./basic-video.md) —— 超声等动态影像
8. [示例](./examples.md) —— 在线示例与本地运行方式

<DocCardList items={useCurrentSidebarCategory().items}/>
