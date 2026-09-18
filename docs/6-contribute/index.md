---
id: contribute-index
title: 参与贡献
description: 为 Cornerstone3D 做贡献的相关文档：如何提报缺陷与提交 PR、如何撰写文档、如何在本地把多个包链接起来联调，以及 Karma 与 Playwright 两套测试的运行方式。
keywords:
  - Cornerstone3D 贡献
  - Pull Request
  - 本地联调
  - Karma 测试
  - Playwright 测试
---

import DocCardList from '@theme/DocCardList';
import {useCurrentSidebarCategory} from '@docusaurus/theme-common';

# 参与贡献

这一章面向想给 **Cornerstone3D 官方项目**（英文上游）贡献代码或文档的人。

- [如何贡献](./pull-request.md) —— 提报缺陷、提交 PR、以及更新依赖时的注意事项
- [撰写文档](./documentation.md) —— 在本地运行文档站点
- [本地链接](./linking.md) —— 把本地的各个包链接起来联调
- [Karma 测试](./karma-tests.md) —— 单元测试
- [Playwright 测试](./playwright-tests.md) —— 端到端与视觉回归测试

:::note 想给这份中文翻译做贡献？

上面这些讲的是官方英文仓库的流程。如果你想改进**这份中文翻译**——
修正译文、统一术语、补充过时内容——请到
[翻译仓库](https://github.com/CuiBenyong/cornerstone3d-zh) 提 Issue 或 PR。
术语请以[术语对照表](../glossary.md)为准。

:::

<DocCardList items={useCurrentSidebarCategory().items}/>
