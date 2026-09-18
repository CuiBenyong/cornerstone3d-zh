---
id: migration-guides
title: 迁移指南
description: Cornerstone3D 各主版本之间的迁移指南索引。涵盖从旧版 Cornerstone 迁移到 3D、1.x 到 2.x 的完整破坏性变更，以及 3.x、4.x、5.x 各版本的升级说明。
keywords:
  - Cornerstone3D 迁移指南
  - 破坏性变更
  - 版本升级
  - legacy to 3D
  - 2.x 迁移
  - 5.x 迁移
---

import DocCardList from '@theme/DocCardList';
import {useCurrentSidebarCategory} from '@docusaurus/theme-common';

# 迁移指南

这一章汇总了各版本之间的升级说明。**按版本跨度**选择你需要的那一份：

| 你的起点 | 看这里 |
| --- | --- |
| 旧版 Cornerstone（cornerstone-core / cornerstone-tools） | [从旧版迁移到 3D](./legacy-to-3d.md) |
| 1.x | [2.0 迁移指南](./2x/1-general.md) |
| 2.x | [3.0 迁移指南](./3x/1-polyseg.md) |
| 3.x | [4.0 迁移指南](./4x/index.md) |
| 4.x | [5.0 迁移指南](./5x/index.md) |

如果要跨多个大版本升级（例如从 2.x 直接升到 5.x），
请按顺序依次阅读中间各版本的指南——破坏性变更是累积的。

:::tip 先读这一篇

2.x 是架构变动最大的一次（分割从「绑定工具组的工具」改为一等数据结构，
并引入了 VoxelManager）。如果你要从 1.x 升级，
建议先读[前行之路](./intro.md)了解这次架构调整的动机，再动手改代码。

:::

<DocCardList items={useCurrentSidebarCategory().items}/>
