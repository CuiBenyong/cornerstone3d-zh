---
id: update-api
title: API 更新
---

# API 更新

我们采用了 [api-extractor](https://api-extractor.com/) 工具从代码库中提取公共 API。
拥有一致的 API 是使我们的库易于使用和构建的关键；因此，对于每个拉取请求（PR），我们提取 PR 的 API 并将其与基础分支的 API 进行比较。

如果您无意中更改了库的公共 API，我们在 Github 中的一个检查会捕捉到它并通过错误通知您。

如果对 API 的更改是有意的，您需要运行 `yarn run build:update-api` 来更新 API。
这将创建一组新的 API 摘要文件（位于 `common/reviews/api/*`），您需要将它们与您的更改一起添加并提交，以便修复错误。