---
id: index
title: 4.0 迁移指南
description: 从 Cornerstone3D 3.x 升级到 4.x 的迁移指南合集，涵盖相机视野不再留白、动态体数据 API、beforeSend 改为异步、工具统一使用 label 字段、Node.js 20 要求，以及渲染引擎视口访问器的变更。
keywords:
  - Cornerstone3D 4.0 迁移
  - 4.x 升级
  - useLegacyCameraFOV
  - Node.js 20
---

import DocCardList from '@theme/DocCardList';
import {useCurrentSidebarCategory} from '@docusaurus/theme-common';

# 4.0 迁移指南 {#40-migration-guides}

这里是 4.0 版本的各项迁移指南。

<DocCardList items={useCurrentSidebarCategory().items.filter(item => item.docId !== 'migration-guides/4x/index')}/>
