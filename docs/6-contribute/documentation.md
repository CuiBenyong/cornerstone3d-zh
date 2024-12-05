---
id: documentation
title: 撰写文档
---

# 撰写文档

我们强烈建议您在提交每个拉取请求（Pull Request）时问自己以下几个问题：

- 此更改是否也需要更改文档？
- 这是一个新功能吗？如果是，它是否需要被记录？

如果答案是肯定的，建议对其进行记录。

## 运行文档页面

要运行文档，您需要执行

```sh
cd packages/docs/

yarn run start
```

这将打开端口 `3000` 并启动文档服务器。然后你可以访问 `http://localhost:3000` 查看文档页面。

:::note 重要
第一次运行文档服务器可能会失败，并抱怨找不到 `example.md` 文件。这是因为 `example.md` 文件是在构建时创建的，并未在仓库中提供。要解决此问题，您可以首次运行 `yarn docs:dev` 来构建并运行文档服务器。第一次之后，您只需运行 `yarn docs` 即可运行文档服务器。
:::

## 您可能会遇到的潜在问题

### 侧边栏未显示

您的 markdown 文件中存在错误，可能是您使用 markdown 语法的方式不正确。