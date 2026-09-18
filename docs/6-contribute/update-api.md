---
id: update-api
title: API 更新
description: Cornerstone3D 用 api-extractor 从代码库中提取公共 API，并在每个 PR 上与基础分支做比对。如果你有意改动了公共 API，需要运行 yarn run build:update-api 更新 API 摘要文件并一并提交。
keywords:
  - api-extractor
  - 公共 API
  - build:update-api
  - API 摘要
---

# API 更新

我们采用 [api-extractor](https://api-extractor.com/) 从代码库中提取公共 API。
保持 API 一致是让我们这套库易于使用、也易于在其上构建的关键；
因此对每个 Pull Request，我们都会提取该 PR 的 API，
并与基础分支的 API 做比对。

如果你无意间改动了库的公共 API，我们在 GitHub 上的一项检查会发现它，
并以报错的形式通知你。

如果这次 API 改动是有意的，你需要运行 `yarn run build:update-api` 来更新 API。
这会生成一组新的 API 摘要文件（位于 `common/reviews/api/*`），
你需要把它们与你的改动一起添加并提交，这样报错就会消除。

:::note 本页在官方文档中已不存在

这一页是本中文文档保留的历史内容：官方英文文档已经把对应页面移除了，
`contribute` 分区现在只有「如何贡献」「撰写文档」「本地链接」
「Karma 测试」「Playwright 测试」这几页。

上面描述的 api-extractor 流程在仓库中可能仍然有效，因此暂时保留本页供参考；
但它不再与上游文档同步，请以仓库中的实际脚本和 CI 配置为准。

:::
