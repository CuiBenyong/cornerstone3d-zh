---
id: index
title: 通用视口
description: 通用视口（Generic Viewport）是 Cornerstone3D 5.x 引入的视口架构，把原先 StackViewport 与 VolumeViewport 各自独立的加载、相机、显示与叠加路径统一为一套数据流。本文说明它的职责划分、源数据与叠加数据的绑定模型、渲染路径与显示状态的拆分方式。
keywords:
  - 通用视口
  - Generic Viewport
  - Cornerstone3D 5.x
  - PlanarViewport
  - 渲染路径
  - 视口架构
upstream: https://www.cornerstonejs.org/docs/concepts/cornerstone-core/generic-viewport/
---

import DocCardList from '@theme/DocCardList';
import {useCurrentSidebarCategory} from '@docusaurus/theme-common';

# 通用视口

通用视口（Generic Viewport）是对旧有视口体系的一次整理。在此之前，`StackViewport`、
`VolumeViewport`、CPU 渲染、VTK 影像渲染、VTK 体数据渲染和分割叠加层是彼此分开的几套实现；
通用视口把它们收敛到一组更小的概念上，渲染能力不变，变的是职责归属。

旧模型是能用的，但职责边界不够清晰。堆栈视口和体数据视口各自有一套加载路径、相机路径、
显示路径、actor 路径和叠加路径。CPU 堆栈影像渲染、GPU 影像渲染、GPU 体数据渲染、
体数据切面渲染这几件事解决的问题相似，实现却分散在不同地方。随着功能不断增加，
行为被摊到了视口类、mapper 辅助函数、同步器、分割显示工具和兼容代码里。

这让一些常见流程变得比它本应有的样子更麻烦：

- 一张堆栈影像和一个体数据切面可以表示同一个平面，却要走不同的视口 API。
- 融合叠加层必须知道底层视口到底是堆栈类、体数据类、CPU 支撑还是 VTK 支撑的。
- 分割标签图对影像 actor、体数据 actor 和专用叠加渲染器各有一条独立路径。
- 相机字段同时承担两种角色：面向用户的导航状态，以及渲染器指令。职责因此含混不清。
- 新增一种渲染模式，要改动的视口行为比渲染器真正需要的多。

## 变化是什么

新的结构是这样的：

```text
logical data id
  -> DataProvider
  -> RenderPath
  -> ViewportDataBinding
  -> viewState + DataPresentation
  -> renderer command
```

各部分的职责：视口负责导航与绑定顺序；数据提供者负责逻辑数据查找；
渲染路径只负责某一种数据形态的运行时实现，以及渲染路径内部的判断；
一个绑定负责视口中的一份已挂载数据集。

对平面影像而言，现在一个 `PlanarViewport` 就能显示堆栈类数据、体数据切面数据、
CPU 影像数据、VTK 影像数据和 VTK 体数据切面数据，且都通过同一套清晰的 API。
渲染路径由数据集形态、方位、渲染配置和分割切面渲染需求推断得出，
不再需要应用代码传入，也不再硬编码在某个独立的堆栈或体数据视口类里。

## 源数据与叠加数据

每一份已挂载的数据集都有一个绑定角色：

- `source`（源数据）是决定当前视图的活动数据集。
- `overlay`（叠加数据）绘制在同一视图中，与源数据对齐。

`setDisplaySets()` 默认把第一项作为源数据，其余作为叠加数据。
`addDisplaySet()` 可以在之后显式追加一个叠加数据。这一套绑定模型取代了旧代码里
大量「堆栈 / 体数据 / actor 叠加」的分支判断。

## 渲染路径

渲染路径就是具体的渲染实现。平面类的渲染路径包括 CPU 影像、CPU 体数据切面、
VTK 影像和 VTK 体数据切面这几条。视频、ECG、WSI 和 3D 视口沿用同样的控制器模式，
但各自提供自己的渲染路径和状态模型。

这里有一条重要规则：渲染路径不拥有视口导航。它们从视口接收状态，
再把状态投射为特定渲染器的指令。

## 显示状态的拆分

通用视口把「显示」拆成了两类：

- **视图显示状态（View presentation）**：平移、缩放、旋转、翻转和显示区域。
  Direct Next 视口通过 `viewportProjection` 读写这部分状态。
- **数据显示状态（Data presentation）**：某一份已挂载数据集的 VOI、不透明度、
  颜色映射表、混合模式、插值方式和可见性。

正是这个拆分让 CT 源数据和 PET 叠加数据能共用同一个视图，
同时各自保留独立的 VOI、颜色和不透明度。

## 相机概述

干净的通用视口倾向于使用语义化状态，而不是持久保存 VTK 风格的相机字段。
对平面、视频、ECG 和 WSI 视口来说，视口状态才是唯一可信来源，
运行时相机、画布变换、媒体变换、信号变换或 OpenLayers 视图都由它推导得出。
3D Next 视口以运行时相机为准，但同样接入投影服务。

旧的相机 API 仍可通过临时兼容适配器使用；需要注意的是，这些适配器并不是
Next 架构的长期 API，其中的旧版辅助函数预计会在后续某个破坏性版本中移除。
完整的相机契约见相机页面。

<DocCardList items={useCurrentSidebarCategory().items}/>
