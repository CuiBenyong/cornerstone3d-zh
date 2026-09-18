---
id: getting-started
title: 快速开始
description: Cornerstone3D 中文文档的入门章节。从这里了解项目范围与边界、相关库的关系、各包的安装方式，以及在 React、Vue、Angular 等框架中的接入配置。
keywords:
  - Cornerstone3D 入门
  - Cornerstone3D 快速开始
  - Cornerstone3D 安装
  - 医学影像开发
---

import DocCardList from '@theme/DocCardList';
import {useCurrentSidebarCategory} from '@docusaurus/theme-common';

# 快速开始

这一章介绍开始使用 Cornerstone3D 之前需要了解的背景信息。

如果你是第一次接触这个库，建议按下面的顺序读：

1. **[概述](./overview.md)** —— 先看这个库能做什么。渲染、影像操作、标注、分割、
   视口同步这几块能力各是什么样子，本页都有说明和动图。
2. **[项目范围](./scope.md)** —— 搞清边界。这一点很重要：Cornerstone3D **不负责**
   影像加载和 DICOM 元数据解析，这两件事要通过注册加载器和元数据提供者来接入。
   不少上手时的困惑都源于没弄清这条边界。
3. **[相关库](./related-libraries.md)** —— 它与旧版 cornerstone、vtk.js、OHIF Viewer
   分别是什么关系。
4. **[安装](./installation.md)** —— npm / yarn / pnpm 的安装命令。
5. **[React、Vue、Angular 等框架](./vue-angular-react-vite.md)** —— 实际接入时的打包配置。
   Vite 和 Webpack 的配置差异、编解码器 WASM 文件的定位方式都在这里。

装好之后，可以到[教程](../3-tutorials/index.md)一章从渲染第一组影像开始动手。

<DocCardList items={useCurrentSidebarCategory().items}/>
