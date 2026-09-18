---
id: index
title: Cornerstone 元数据
description: "@cornerstonejs/metadata 是当前 Cornerstone3D 的规范元数据层，集中处理元数据摄入、带类型的提供者解析与共享缓存行为。本文说明该包的职责、推荐引入路径、两种提供者模式、NATURALIZED 基础状态、缓存与 imageId 模型，以及各包之间的边界。"
keywords:
  - "@cornerstonejs/metadata"
  - 元数据模块
  - addTypedProvider
  - addMetaData
  - NATURALIZED
  - registerDefaultProviders
  - FRAME_IMAGE_IDS
upstream: https://www.cornerstonejs.org/docs/concepts/cornerstone-metadata/
---

# 元数据模块 {#metadata-module}

`@cornerstonejs/metadata` 是当前 Cornerstone3D 的规范元数据层。
它把元数据摄入、带类型的提供者解析和共享缓存行为集中起来，
这样应用就不必重复实现各数据源专有的元数据转换逻辑。

## 该包当前的职责 {#current-package-role}

- 负责元数据提供者的注册，以及带类型提供者的编排。
- 把源元数据归一化为 core / tools 所使用的通用模块输出。
- 在源元数据类型与派生元数据类型之间提供元数据缓存的协调。
- 暴露用于标签映射、normalized 对象处理和元数据组织流程的工具函数。

## 引入路径的建议 {#import-path-guidance}

- 推荐：从 `@cornerstonejs/metadata` 引入元数据 API。
- 旧版兼容：`@cornerstonejs/core` 目前仍通过 `core/src/metaData.ts`
  重新导出元数据 API，但这条路径已废弃。

## 提供者模型 {#provider-model}

该模块支持两种互补的提供者模式：

- **通用提供者链**（`addProvider`）：按优先级排序的提供者，优先级最高的排在最前。
- **带类型的提供者链**（`addTypedProvider`）：按类型组合提供者，
  并在通用链中通过一个带类型的提供者桥接进来。

这使得应用可以一边保留旧的提供者集成，一边逐步采用带类型的提供者。

## Add 路径摄入与 NATURALIZED {#add-path-ingestion-and-naturalized}

当前的元数据改动通过 add 路径增加了显式的摄入处理器：

- `metaData.addMetaData(type, query, options)` 会路由到带类型的 `typeAdd` 提供者。
- `NATURALIZED` 是 DICOM 源数据的规范基础元数据状态。
- 调用方可以提供源载荷（例如 DICOMweb JSON 或 Part10 数据），
  由元数据层统一完成 naturalize 和缓存。

## 缓存与 imageId 模型（当前行为） {#cache-and-imageid-model-current-behavior}

- 共享的带类型缓存支持读穿（read-through）以及进行中请求的去重。
- 源元数据（尤其是 `NATURALIZED`）应当以规范的基础 imageId 为键。
- 派生的按帧模块则在帧 imageId 上解析。
- 帧 / 基础的归一化以及帧影像的展开，由元数据提供者
  （包括 `FRAME_IMAGE_IDS`）负责，而不再散落在各个调用点。

## 初始化与提供者注册 {#initialization-and-provider-registration}

`registerDefaultProviders()` 会接好默认的带类型提供者栈及相关辅助函数。
如果应用启动流程重置或重新初始化了提供者链，
那么必须在 init 之后重新注册所需的提供者。

在从旧代码路径迁移时这一点尤其重要——旧代码里提供者只注册一次，
并依赖持久的全局状态。

## 显示集 {#display-sets}

元数据层还负责把一个序列的各个实例组织成**显示集**（display set）——
也就是视口渲染的单位——通过与框架无关的拆分规则完成，
并以数据形态的 `IDisplaySet` 暴露出来。由于这是个大话题
（拆分管线、驱动视口、缓存、拆分规则模型和数据模型），它有独立的一页：

- **[显示集](./display-sets.md)** —— `splitImageIdsBySplitRules` →
  `createDisplaySetFromGroup` → 通过 `setDisplaySets` 驱动视口 /
  通过 `registerDisplaySetMetadata` 缓存，拆分规则模型
  （含 DWI 的完整示例），以及 `IDisplaySet` 的属性与模块增强模式。

## 各包之间的边界 {#package-boundaries}

- `@cornerstonejs/metadata`：元数据摄入、提供者链、normalized 模块解析、
  元数据专属的缓存编排。
- `@cornerstonejs/core`：渲染 / 运行时原语，以及面向渲染的缓存与加载器。
- `@cornerstonejs/dicom-image-loader`：获取 / 解码管线，
  以及把源数据交接给元数据层。
- adapters：在已解析的元数据与工具 / 分割表示形式之间做转换。

## 相关文档 {#related-docs}

- [元数据提供者](../cornerstone-core/metadataProvider.md)
- [自定义元数据提供者](../../4-how-to-guides/custom-metadata-provider.md)
- [5.x 迁移指南](../../5-migration-guides/5x/index.md)
