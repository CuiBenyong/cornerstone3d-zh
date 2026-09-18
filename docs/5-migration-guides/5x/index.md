---
id: index
title: 5.0 迁移指南
description: 从 Cornerstone3D 4.x 升级到 5.x 的迁移指南。介绍新增的共享工具包 @cornerstonejs/utils、重新设计的元数据模块与 NATURALIZED 基础状态、元数据提供者的缓存机制、读穿式共享缓存，以及 imageId 从按帧到规范基础 imageId 的映射变化。
keywords:
  - Cornerstone3D 5.0 迁移
  - Cornerstone3D 4.x 升级
  - "@cornerstonejs/utils"
  - NATURALIZED
  - addMetaData
  - 元数据缓存
  - FRAME_IMAGE_IDS
upstream: https://www.cornerstonejs.org/docs/migration-guides/5x/
---

import DocCardList from '@theme/DocCardList';
import {useCurrentSidebarCategory} from '@docusaurus/theme-common';

# 5.0 迁移指南 {#50-migration-guides}

这里是从 Cornerstone3D 4.x 迁移到 5.x 的说明。

## 共享工具包（`@cornerstonejs/utils`） {#shared-utilities-cornerstonejsutils}

5.x 引入了 `@cornerstonejs/utils`，用于放置共享辅助代码（例如一些小的数学工具
和通用日志功能）。在过渡期内，这些能力同时也会从其他 Cornerstone3D 包中暴露出来。

- **目前是可选的：** 你不需要第一天就改动 import。只要那些 re-export 还在，
  就可以继续通过原有的包入口使用同样的辅助函数。
- **未来方向：** 随着时间推移，**`@cornerstonejs/utils` 会成为这些共享工具
  唯一的发布位置**。新代码和渐进式重构可以优先从 `@cornerstonejs/utils` 引入，
  这样就与它们最终的归属保持一致了。

## 元数据模块 {#metadata-module}

在 5.x 中，元数据模块被设计为一个共享的处理层，让核心行为只实现一次并被复用，
而不是在 DICOMweb 专用代码、OHIF 专用流程、JSON 摄入路径以及其他模块专属集成中
各写一遍（那样往往会产生多个实现，各自带着不同的缺陷）。

### 当前 CS3D 中可选的元数据模块特性 {#optional-metadata-module-features-in-current-cs3d}

当前 CS3D 版本保持既有的元数据流程可用，同时引入了一些可以逐步采用的可选特性：

- 用于元数据查找的带类型 getter。
- `addMetadata` 提供者，用于向缓存中添加信息、或等待异步结果被加入。
- 清晰的元数据清理机制，可移除特定改动，也可清空全部缓存数据。
- 直接针对某一种元数据类型注册的提供者，使解析可以尽早短路返回。
- 在各元数据提供者与元数据类型之间共用的缓存。
- Part10、DICOMweb、由 imageId 派生的值，以及其他缓存的元数据输出共用同一套缓存。
- 为显示集（display set）、序列级、检查级结果等新的元数据类型预留了机制。

## 元数据提供者的缓存更新 {#metadata-provider-caching-updates}

在 5.x 中，元数据提供者是检索管线里的一等扩展点。不再需要每个调用方手动转换并写入
元数据，提供者可以对源载荷做归一化、与其他提供者组合，并依赖共享的缓存行为
获得一致的查找结果。

- 当数据需要参数或外部提供的值时，使用 add 路径的元数据摄入方式。
  例如 NATURALIZED 数据是从二进制 Part 10 或 DICOMweb 元数据格式计算得来的：
  - DICOMweb JSON 载荷用
    `metaData.addMetaData(MetadataModules.NATURALIZED, imageId, { dicomwebJson })`。
  - 异步 Part10 摄入用
    `metaData.addMetaData(MetadataModules.NATURALIZED, imageId, { part10Buffer })`
    （可以是 `ArrayBuffer`、`Uint8Array` 或一个解析函数）。
- 帧 / 基础 imageId 的映射以及派生缓存的失效，现在由元数据层负责；
  请不要再用 `setCacheData` 直接做按帧传播。

### 新的元数据处理方式（及向后兼容） {#new-metadata-handling-and-backwards-compatibility}

- 在 5.x 中，**NATURALIZED 元数据是 DICOM 影像数据的基础状态**。
  其他元数据模块（例如 `INSTANCE` 以及各类派生模块查找）预期都从这个规范化的
  naturalized 状态解析得出，而不是从各数据源专有的转换代码里得出。
- 数据源应当迁移为通过 naturalized 的 add 处理器
  （`{ dicomwebJson }` 和 `{ part10Buffer }`）提供元数据，
  而不是自己在源侧做转换生成 instance / natural 对象。
- 5.x 新增：元数据摄入通过 add 路径的带类型提供者请求完成，
  调用方可以把源数据作为选项传入（`{ dicomwebJson }` 或 `{ part10Buffer }`），
  由提供者链负责 naturalize 和缓存。
- 既有用法仍然有效：如果你的应用已经通过旧的提供者链
  （`addProvider` / 以前的 `metaData.get(...)` 流程）解析元数据，
  那套行为在你迁移期间会继续得到支持。
- 推荐的迁移路径：把 NATURALIZED 的写入改为调用 `metaData.addMetaData(...)`，
  并从应用代码中移除自定义的帧 / 基础 imageId 传播逻辑。
- 这项迁移在你采用新的元数据处理路径之前都是可选的；过渡期内旧流程继续受支持。
- 为什么这件事重要：共享的 naturalize 过程让 DICOMweb、Part10 以及其他摄入路径
  表现一致，也有助于消除那些因为存在多个略有差异的转换实现而反复出现的缺陷。

### Naturalized 处理器 {#naturalized-handlers}

`registerNaturalizedHandlers()` 现在把 NATURALIZED 处理器注册为可组合的
读取与添加提供者链：

- **基础 imageId 查询过滤器：** 一个共享的 `baseImageIdQueryFilter` 可以接入
  带类型的提供者链，并以高优先级注册给 `NATURALIZED`，
  这样按帧的 imageId 会先在规范的基础 imageId 上解析。
- **同步 naturalize 处理器（add 路径）：** 当调用方提供 `{ dicomwebJson }` 时，
  该处理器把 DICOMweb 风格的元数据 naturalize 为 NATURALIZED 输出。
- **异步 Part10 处理器（add 路径）：** 接受 `{ part10Buffer }`
  （`ArrayBuffer`、`Uint8Array` 或解析函数），解析为 NATURALIZED 并提交到共享缓存。
- **与缓存的交互：** 由于基础影像过滤排在缓存提供者之前，
  NATURALIZED 的缓存键保持规范化，下游的带类型模块可以依赖一致的查找结果。

推荐用法：

- 从 DICOMweb 元数据做同步 naturalize：
  `metaData.addMetaData(MetadataModules.NATURALIZED, imageId, { dicomwebJson })`。
- 从 Part10 载荷做异步 naturalize：
  `metaData.addMetaData(MetadataModules.NATURALIZED, imageId, { part10Buffer })`。

### 5.x 中的标准缓存行为 {#standard-cache-behavior-in-5x}

5.x 的元数据缓存是一个新的共享层，可以被不同的元数据提供者和类型复用。
它把缓存填充、进行中请求的去重以及查询键的一致性都集中起来，
让提供者的实现可以专注于各数据源特有的查找逻辑。

- 标准缓存现在是「读穿式」（read-through）缓存：获取元数据时会作为副作用填充缓存。
- `metaData.get(type, imageId, options)` 会解析各提供者，
  缓存提供者则把成功的结果按 `(type, imageId)` 键存下来。
- 异步查找会在进行中被去重，解析完成后再提交到缓存。
- 对大多数模块，请避免手动调用 `setCacheData(...)`；
  优先使用基于提供者的查找加自动缓存。
- 源元数据缓存（NATURALIZED 以及 DICOMweb / Part10 处理器这类摄入输入）
  应当以基础 imageId 为键，而派生的按帧缓存则以帧 imageId 为键。

### 新增一种缓存类型 {#adding-a-new-cache-type}

- 在注册提供者时调用 `addCacheForType('yourType')`，为你的模块 / 类型注册一个缓存。
- 然后为该类型注册一个或多个带类型的提供者；返回值会自动按查询键缓存。
- 让提供者逻辑只负责「可信来源的检索」，把存储和复用交给缓存层。

### 可写缓存的摄入路径 {#writable-cache-ingestion-path}

- 优先使用 add 路径摄入（`metaData.addMetaData(...)`），
  而不是直接调用可写缓存的 setter。
- 用 `addWritableCacheForType(type)` 注册可写行为
  （目前的设计意图是用于 `NATURALIZED`），让 add 路径的摄入一致地写入共享缓存。
- 用 `addCacheForType(type, { secondaryOf: ... })` 注册派生缓存，
  使它在基础缓存类型变化时被失效。
- 这样写入行为集中在提供者里，同时读取仍然保留带类型提供者的缓存行为。

### imageId 映射的变化（新旧对比） {#imageid-mapping-changes-old-vs-new}

- 以前的行为：
  - 帧 / 基础 imageId 的转换知识分散在各个调用点，导致映射不一致，
    也不保证唯一。
  - 源元数据有时被按帧写入，而不是写在一个规范的基础 imageId 上。
- 元数据 5.x 的行为：
  - NATURALIZED / 源元数据只规范化到基础 imageId。
  - `INSTANCE` 元数据是按帧的，以帧 imageId（含帧选择器）为索引。
  - 一个 `FRAME_IMAGE_IDS` 带类型提供者暴露由「规范基础 imageId + NATURALIZED 元数据」
    生成的帧相关 imageId。
  - `FRAME_IMAGE_IDS` 现在的解析顺序是：先查缓存，再走基于 NATURALIZED 的生成。
  - 如果 NATURALIZED 不可用，`FRAME_IMAGE_IDS` 解析为 `null`。
  - 如果 NATURALIZED 中没有光度解释（photometric interpretation），
    `FRAME_IMAGE_IDS` 返回一个只包含基础 imageId 的 `Set<string>`。
  - 如果 NATURALIZED 定义了 `NumberOfFrames`，则为 `1..NumberOfFrames` 生成帧 id，
    包含两种形式：
    - DICOMweb 路径形式（`/instances/{sopUID}/frames/{frameNo}`）
    - 查询参数形式（`?frame={frameNo}` 或 `&frame={frameNo}`）
  - 帧 imageId 到基础 imageId 的归一化由两个过滤器负责：
    一个处理 `/frames/{frameNo}`，另一个处理 `[?&]frame={frameNo}`。
  - 可复用的生成器 `generateFrameImageIdsFromNaturalized(baseImageId, naturalized)`
    已导出，供需要同样展开行为的非元数据调用方使用。
  - 一个缓存提供者位于帧 / 基础过滤器之前，
    使归一化后的基础查找与帧 imageId 展开结果都能被复用。
- 迁移建议：
  - 继续使用 `convertMultiframeImageIds(...)` 生成帧 imageId。
  - 存取 NATURALIZED / 源元数据时使用规范的基础 imageId。
  - 通过 `INSTANCE` 或派生模块、使用帧 imageId 来解析按帧的元数据，
    并依赖提供者过滤器完成 `frame <-> base` 的归一化。

<DocCardList items={useCurrentSidebarCategory().items.filter(item => item.docId !== 'migration-guides/5x/index')}/>
