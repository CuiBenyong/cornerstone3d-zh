---
id: index
title: Cornerstone 核心概念
description: Cornerstone3D 核心包（@cornerstonejs/core）的概念总览。它不只是一个渲染库，还负责影像的 GPU 与 CPU 渲染、数据与元数据的缓存、影像与体数据加载器的框架，以及元数据 API 支持。
keywords:
  - "@cornerstonejs/core"
  - Cornerstone 核心
  - 渲染引擎
  - 影像加载器
  - 元数据提供者
  - 缓存
upstream: https://www.cornerstonejs.org/docs/concepts/cornerstone-core/
---

import DocCardList from '@theme/DocCardList';
import {useCurrentSidebarCategory} from '@docusaurus/theme-common';

# 核心概念介绍 {#core-introduction}

本节介绍 `Cornerstone3D`（`@cornerstonejs/core`）中的核心概念。
`Cornerstone3D` 不只是一个「渲染」库，它还负责：

- 影像的渲染（GPU 与 CPU 两种方式）
- 数据与元数据的缓存
- 为影像 / 体数据加载器 API 提供框架
- 提供元数据 API 支持

本节的目的是对 `Cornerstone3D` 的核心概念做一个整体梳理。

<DocCardList items={useCurrentSidebarCategory().items}/>
