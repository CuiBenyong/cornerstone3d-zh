---
id: index
title: 渐进式加载
description: 渐进式加载器同时支持堆栈影像和体数据。对堆栈影像，它可以先加载较小或有损的版本；对体数据，除了较小 / 有损版本之外，还能加载完全交错的版本来加快加载过程。
keywords:
  - 渐进式加载
  - Progressive Loading
  - HTJ2K
  - 有损编码
  - 交错加载
upstream: https://www.cornerstonejs.org/docs/concepts/progressive-loading/
---

import DocCardList from '@theme/DocCardList';
import {useCurrentSidebarCategory} from '@docusaurus/theme-common';

# 渐进式加载 {#progressive-loading}

我们为堆栈影像和体数据都新增了渐进式加载器。对堆栈影像，
渐进式加载器可以先加载一个较小或有损的影像；对体数据，
则既可以加载较小 / 有损的影像，也可以加载完全交错的版本，
以此加快加载过程。

<DocCardList items={useCurrentSidebarCategory().items}/>
