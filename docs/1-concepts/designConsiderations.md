---
id: design-considerations
title: 高层设计考量
description: Cornerstone3D 在 cornerstone.js 的接口基础上做了扩展与更新，以更好地支持体绘制、三维感知的工具和 PET 影像。本文概述渲染、影像加载、元数据提供者、工具这四类接口的定位，以及 tools 库与旧版 cornerstone-tools 的事件冲突问题。
keywords:
  - 设计考量
  - "@cornerstonejs/core"
  - "@cornerstonejs/tools"
  - vtk.js
  - cornerstone-tools 冲突
upstream: https://www.cornerstonejs.org/docs/concepts/design-considerations
---

## 高层设计考量 {#high-level-design-considerations}

这些库在 `cornerstone.js` 所提供接口的基础上做了扩展与更新，
以便更好地支持体绘制、具备三维感知能力的工具，以及 PET 影像。
这些接口与功能大体可归为以下几类：

- 渲染 / 渲染器（Rendering / Renderer）
- 影像加载 / 影像加载器（Image Loading / Image Loader）
- 元数据提供者（Metadata Provider）
- 工具（Tools）

`@cornerstonejs/core` 是一个构建在 `vtk.js` 之上的「渲染」库，
它沿用了 `cornerstone` 既有的管道来与影像加载器和元数据提供者集成。

本仓库中的 `@cornerstonejs/tools` 是一个「工具」库，
初始化之后它会监听 `@cornerstonejs/core` 派发的自定义事件。
请注意：它的事件命名与处理方式与 `cornerstone-tools` 库有重叠。
如果你尝试同时使用 `cornerstone-tools`，很可能会遇到问题。
由于这确实是一种可能的使用场景，遇到问题请不要犹豫，
欢迎提报并提出可能的解决方案。
