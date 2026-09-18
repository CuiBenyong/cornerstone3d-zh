---
id: documentation
title: 撰写文档
description: 为 Cornerstone3D 撰写和更新文档的指引，包括在本地运行文档服务器的命令、首次运行因 example.md 缺失而失败的解决办法，以及侧边栏不显示这类常见问题的排查。
keywords:
  - 撰写文档
  - 本地运行文档
  - yarn docs:dev
  - 侧边栏不显示
upstream: https://www.cornerstonejs.org/docs/contribute/documentation
---

# 撰写文档 {#writing-documentation}

我们强烈建议你在提交每个 Pull Request 时都问自己这两个问题：

- 这次改动是否也需要改文档？
- 这是一个新特性吗？如果是，它是否需要被写进文档？

如果答案是「是」，那就建议把它写进文档。

## 运行文档站点 {#running-documentation-page}

要运行文档，需要执行：

```sh
cd packages/docs/

yarn run start
```

这会占用 `3000` 端口并启动文档服务器。随后访问
`http://localhost:3000` 就能看到文档页面。

:::note Important
第一次运行文档服务器时，很可能会因为找不到 `example.md` 文件而失败。
这是因为 `example.md` 是在构建时生成的，并不存在于仓库中。
解决办法是：第一次运行时用 `yarn docs:dev`，它会先构建再启动文档服务器。
之后就可以直接用 `yarn docs` 启动文档服务器了。
:::

## 你可能遇到的问题 {#potential-problems-you-may-encounter}

### 侧边栏没有显示出来 {#side-bar-not-showing-up}

说明你的 Markdown 文件里有 bug，很可能是 Markdown 语法的用法有问题。
